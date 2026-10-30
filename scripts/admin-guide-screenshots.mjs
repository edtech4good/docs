#!/usr/bin/env node
/**
 * Takes the screenshots used by the admin guide (site/admin-guide/*.md) from a
 * local admin, so they can be taken again after a screen changes.
 *
 * Usage:
 *   GUIDE_PASSWORD=... node scripts/admin-guide-screenshots.mjs
 *
 * What it needs running (see "Local development" for how to start them):
 *   - the central API, the student API and the admin UI, all built from the
 *     versions named on the guide pages and wired together, so that Publish and
 *     Sync really reach the student API;
 *   - a throwaway database seeded with one fixture organisation that has one
 *     school, one class and one published or publishable curriculum with at
 *     least one lesson, and no real names anywhere. Never point this at a real
 *     deployment. It only runs against localhost (see below);
 *   - two staff accounts with the same password: an Organisation Admin of the
 *     fixture organisation, and a platform (Super Admin) account that has no
 *     organisation;
 *   - a private list of words that must never appear in a picture, kept outside
 *     this repository (GUIDE_BANNED_FILE and/or GUIDE_BANNED, below).
 *
 * What it changes in the database, and leaves changed:
 *   - it publishes the curriculum if that is not already published;
 *   - it saves the first lesson once, unchanged, which settles the points stored
 *     beside it (a lesson save recomputes them).
 * It also renames that lesson for a moment to photograph the change summary and
 * then renames it back; if the rename back fails the script fails loudly and
 * says so. The refused sheet it uploads adds nothing, and the Sync Students
 * confirmation is cancelled, not run.
 *
 * It uses `playwright-core` and an installed Chromium; it installs nothing.
 *
 * Environment (all optional except GUIDE_PASSWORD):
 *   GUIDE_PASSWORD     the password of the accounts below
 *   GUIDE_BANNED_FILE  path to a file of words or regular expressions, one per line (at least one of this
 *                      and GUIDE_BANNED is required; the script refuses to run without a list)
 *   GUIDE_BANNED       the same, as a comma-separated list
 *   ADMIN_URL          the admin UI              (http://localhost:4241)
 *   API_URL            the central API           (http://localhost:3016)
 *   ORG_ADMIN_EMAIL    an Organisation Admin     (org.admin@example.org)
 *   PLATFORM_EMAIL     a platform account        (platform.operator@example.org)
 *   ORG_NAME           the fixture organisation  (Example Network)
 *   SCHOOL_NAME        its school                (Example Primary School)
 *   CLASS_NAME         its class                 (Class 4A)
 *   CURRICULUM_NAME    its curriculum            (Sample Curriculum)
 *   PLAYWRIGHT_CORE    path to the playwright-core package (resolved normally if unset)
 *   CHROMIUM_PATH      path to a Chromium or Chrome executable
 *   OUT_DIR            where the PNGs go         (site/public/admin-guide)
 *
 * Before each picture it checks that the page text contains none of the words on
 * the private list or the few generic ones below, and stops if one does. Look at
 * every image yourself as well.
 */
import { createRequire } from 'node:module';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, statSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const env = process.env;
const cfg = {
  password: env.GUIDE_PASSWORD,
  admin: (env.ADMIN_URL ?? 'http://localhost:4241').replace(/\/$/, ''),
  api: (env.API_URL ?? 'http://localhost:3016').replace(/\/$/, ''),
  orgAdmin: env.ORG_ADMIN_EMAIL ?? 'org.admin@example.org',
  platform: env.PLATFORM_EMAIL ?? 'platform.operator@example.org',
  org: env.ORG_NAME ?? 'Example Network',
  school: env.SCHOOL_NAME ?? 'Example Primary School',
  klass: env.CLASS_NAME ?? 'Class 4A',
  curriculum: env.CURRICULUM_NAME ?? 'Sample Curriculum',
  out: resolve(env.OUT_DIR ?? join(here, '..', 'site', 'public', 'admin-guide')),
  chromium:
    env.CHROMIUM_PATH ??
    `${env.HOME}/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing`,
};
if (!cfg.password) {
  console.error('Set GUIDE_PASSWORD (the password of the guide accounts).');
  process.exit(2);
}

// Only ever a local stack: this script publishes and saves.
const isLocalHost = (url) => {
  try {
    const h = new URL(url).hostname;
    return h === 'localhost' || h === '127.0.0.1' || h === '[::1]' || h === '::1' || h.endsWith('.localhost');
  } catch {
    return false;
  }
};
for (const [name, url] of [['ADMIN_URL', cfg.admin], ['API_URL', cfg.api]]) {
  if (!isLocalHost(url)) {
    console.error(`${name} must point at localhost, 127.0.0.1, [::1] or *.localhost (got ${url}). Refusing to run.`);
    process.exit(2);
  }
}

/** Words that must never appear on a page that is photographed: the private list, plus a few generic ones. */
const fromFile = env.GUIDE_BANNED_FILE
  ? readFileSync(env.GUIDE_BANNED_FILE, 'utf8').split('\n')
  : [];
const fromList = env.GUIDE_BANNED ? env.GUIDE_BANNED.split(',') : [];
const privateTerms = [...fromFile, ...fromList].map((t) => t.trim()).filter(Boolean);
if (privateTerms.length === 0) {
  console.error('Set GUIDE_BANNED_FILE (a file, one word or regular expression per line) and/or GUIDE_BANNED (a comma list). Refusing to run without a list of words to keep out of the pictures.');
  process.exit(2);
}
const BANNED = [...privateTerms.map((t) => new RegExp(t, 'i')), /\buat\b/i, /superadmin/i, /demo\./i];
const require = createRequire(import.meta.url);
const { chromium } = require(env.PLAYWRIGHT_CORE ?? 'playwright-core');

const MAX_BYTES = 150 * 1024;

mkdirSync(cfg.out, { recursive: true });
const made = [];

async function assertClean(page, label) {
  const text = await page.evaluate(() => `${document.title}\n${document.body.innerText}`);
  for (const re of BANNED) {
    const hit = text.match(re);
    if (hit) throw new Error(`Refusing to photograph "${label}": the page contains "${hit[0]}" (${re}).`);
  }
}

async function shot(page, name, label, clip) {
  await assertClean(page, label);
  const file = join(cfg.out, name);
  await page.screenshot({ path: file, clip, type: 'png' });
  const bytes = statSync(file).size;
  made.push({ name, bytes });
  console.log(`${name}  ${(bytes / 1024).toFixed(0)} KB  ${bytes > MAX_BYTES ? 'TOO BIG' : 'ok'}`);
}

/** The bounding box of an element, padded and kept inside the viewport. */
async function boxOf(page, locator, pad = 12) {
  const b = await locator.boundingBox();
  const vp = page.viewportSize();
  const x = Math.max(0, b.x - pad);
  const y = Math.max(0, b.y - pad);
  return {
    x,
    y,
    width: Math.min(vp.width - x, b.width + 2 * pad),
    height: Math.min(vp.height - y, b.height + 2 * pad),
  };
}

async function newSession(browser) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 });
  return { context, page: await context.newPage() };
}

async function signIn(page, email) {
  await page.goto(`${cfg.admin}/auth/login`);
  await page.fill('#signin-email', email);
  await page.fill('#signin-password', cfg.password);
  await page.click('button.submit');
  await page.waitForURL(/\/dashboard\//);
  await page.waitForTimeout(1200);
}

/** Closes any notices so the next picture does not carry them. */
const clearNotices = (page) =>
  page.evaluate(() => document.querySelectorAll('.ant-notification-notice-close').forEach((x) => x.click()));

/** Picks an option in an ng-zorro select that sits in a form item with this label. */
async function pick(page, label, optionText) {
  const item = page.locator('nz-form-item', { has: page.locator('nz-form-label', { hasText: label }) });
  await item.locator('nz-select').click();
  await page.locator('.ant-select-item-option', { hasText: optionText }).first().click();
}

/** The access token of the signed-in session, to call the API from inside the page. */
const tokenOf = (page) =>
  page.evaluate(() => {
    const s = sessionStorage;
    return `${s.getItem('lms_access_alg')}.${s.getItem('lms_access_payload')}.${s.getItem('lms_access_hash')}`;
  });

async function api(page, method, path, body) {
  const token = await tokenOf(page);
  return page.evaluate(
    async ({ base, method, path, body, token }) => {
      const r = await fetch(base + path, {
        method,
        headers: { 'content-type': 'application/json', authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      return { status: r.status, body: await r.json().catch(() => null) };
    },
    { base: cfg.api, method, path, body, token },
  );
}

const browser = await chromium.launch({ executablePath: cfg.chromium });
const scratch = mkdtempSync(join(tmpdir(), 'admin-guide-'));
let renamed = null; // { page, lessonid, original, body } while a lesson is renamed

try {
  // ---- 1. Sign-in page, and the "session ended" notice -------------------------------------------------------------
  {
    const { context, page } = await newSession(browser);
    await page.goto(`${cfg.admin}/auth/login`);
    await page.waitForSelector('#signin-email');
    await page.waitForTimeout(600);
    await shot(page, 'sign-in.png', 'sign-in page', { x: 740, y: 110, width: 470, height: 580 });
    await context.close();
  }
  {
    // The same account signs in twice; the first session then loses its token (one session per account).
    const first = await newSession(browser);
    await signIn(first.page, cfg.orgAdmin);
    const second = await newSession(browser);
    await signIn(second.page, cfg.orgAdmin);
    await first.page.goto(`${cfg.admin}/student/index`);
    await first.page.waitForURL(/\/auth\/login/);
    await first.page.locator('.ant-notification-notice', { hasText: 'Your session ended' }).waitFor();
    await first.page.waitForTimeout(1200); // let the notice finish sliding in
    await shot(first.page, 'session-ended.png', 'session ended', { x: 640, y: 0, width: 640, height: 700 });
    await second.context.close();
    await first.context.close();
  }

  // ---- 2. The organisation's own staff -----------------------------------------------------------------------------
  const org = await newSession(browser);
  const page = org.page;
  await signIn(page, cfg.orgAdmin);

  await shot(page, 'home-menu.png', 'home and menu', { x: 0, y: 0, width: 290, height: 800 });

  // Learners list and the Upload Users dialog
  await page.goto(`${cfg.admin}/student/index`);
  await page.getByText(/Total\s*:\s*[1-9]/).waitFor();
  await page.waitForTimeout(600);
  await shot(page, 'learners-list.png', 'learners list', { x: 272, y: 20, width: 1008, height: 730 });

  await page.getByRole('button', { name: 'Upload Users' }).click();
  await pick(page, 'School', cfg.school);
  await page.locator('nz-form-item', { has: page.locator('nz-form-label', { hasText: 'Curriculum' }) }).locator('nz-select').click();
  await page.locator('.ant-select-item-option', { hasText: cfg.curriculum }).first().click();
  await page.keyboard.press('Escape');
  await pick(page, 'Class', cfg.klass);
  await page.waitForTimeout(400);
  await shot(page, 'upload-dialog.png', 'upload dialog', await boxOf(page, page.locator('.ant-modal-content'), 16));

  // A refused sheet: a username with a dot in it. Nothing is added.
  const bad = join(scratch, 'refused.csv');
  writeFileSync(
    bad,
    [
      'studentfirstname,studentlastname,familyname,mothername,fathername,dateofbirth,dateofjoin,genderid,wg_seeing,wg_hearing,wg_walking,wg_remembering,wg_selfcare,wg_communicating,contact,city,country,state,schoolusername,schooluserpasswordhash,type,is_teacher_acc',
      'Sample,Learner 4,,,,01-01-2015,30-10-2026,1,,,,,,,,Sample City,Cambodia,Sample State,sample.learner4,Pass1234,offline,',
    ].join('\n') + '\n',
  );
  await page.locator('.ant-modal input[type=file]').setInputFiles(bad);
  await page.locator('.ant-notification-notice', { hasText: 'alpha-numeric' }).waitFor();
  await page.waitForTimeout(700); // let the notice finish sliding in
  await page.keyboard.press('Escape'); // a refused sheet leaves the dialog open
  await page.waitForTimeout(500);
  await shot(page, 'upload-refused.png', 'refused upload', { x: 272, y: 20, width: 1008, height: 400 });
  await clearNotices(page);
  await rmSync(bad, { force: true });

  // Saving a lesson also recomputes the points stored beside it, which counts as a change to other rows. Save the first
  // lesson once, unchanged, now, so that the change summary photographed below shows the one rename and nothing else.
  const lessons = await api(page, 'POST', '/lesson', { pageindex: 0, pagesize: 10 });
  const first = lessons.body?.data?.data?.[0];
  if (!first) throw new Error('The fixture needs at least one lesson.');
  const detail = (await api(page, 'GET', `/lesson/${first.lessonid}`)).body?.data;
  const body = {
    lessonname: detail.lessonname,
    lessondescription: detail.lessondescription ?? '',
    lessonorder: detail.lessonorder,
    total_points: detail.total_points,
    levelid: detail.levelid,
    passing_points: detail.passing_points,
  };
  const normalised = await api(page, 'PUT', `/lesson/${first.lessonid}`, body);
  if (normalised.status !== 200) throw new Error(`Could not save the lesson (${normalised.status}).`);

  // The curriculum list, made sure it is published first
  await page.goto(`${cfg.admin}/curriculum/index`);
  const row = page.locator('tr', { hasText: cfg.curriculum });
  await row.locator('[data-testid=publish-row]').waitFor();
  await row
    .locator('[data-testid^=state-]')
    .filter({ hasText: /Never published|Published|Changed since publish|Retired|Can't be published/ })
    .waitFor();
  await page.waitForTimeout(800);
  const stateText = await row.locator('[data-testid^=state-]').innerText();
  if (!/^Published /.test(stateText)) {
    await row.locator('[data-testid=publish-row]').click();
    await page.locator('[data-testid=confirm-publish]').waitFor();
    await page.waitForTimeout(800);
    await page.locator('[data-testid=confirm-publish]').click();
    await page.locator('.ant-notification-notice').first().waitFor();
    await clearNotices(page);
    await page.waitForTimeout(800);
  }
  await shot(page, 'curriculum-list.png', 'curriculum list', { x: 272, y: 20, width: 1008, height: 330 });

  // The change summary: rename one lesson, photograph the panel, put the name back.
  renamed = { page, lessonid: first.lessonid, body };
  const put = await api(page, 'PUT', `/lesson/${first.lessonid}`, { ...body, lessonname: `${detail.lessonname} (edited)`.slice(0, 50) });
  if (put.status !== 200) throw new Error(`Could not rename the lesson (${put.status}).`);
  await page.reload();
  await page.locator('[data-testid=publish-row]').first().waitFor();
  await page.locator('[data-testid^=state-]', { hasText: 'Changed since publish' }).waitFor();
  await page.locator('[data-testid=publish-row]').first().click();
  await page.locator('[data-testid=publish-total]').waitFor();
  await page.waitForTimeout(700);
  await shot(page, 'publish-changes.png', 'publish panel', { x: 704, y: 16, width: 560, height: 290 });
  await page.locator('[data-testid=cancel-publish]').click();
  const restored = await api(page, 'PUT', `/lesson/${first.lessonid}`, renamed.body);
  if (restored.status < 200 || restored.status > 299) {
    throw new Error(`Could not rename the lesson back (${restored.status}); the finally block will try again.`);
  }
  renamed = null;
  await org.context.close();

  // ---- 3. A platform account acting as the organisation ------------------------------------------------------------
  const plat = await newSession(browser);
  const pp = plat.page;
  await signIn(pp, cfg.platform);

  // The switcher
  await pp.locator('.org-chip').first().click();
  await pp.locator('.row', { hasText: cfg.org }).waitFor();
  await pp.waitForTimeout(400);
  await shot(pp, 'org-switcher.png', 'organisation switcher', { x: 0, y: 70, width: 400, height: 290 });
  await pp.locator('.row', { hasText: cfg.org }).click();
  await pp.waitForTimeout(1800);

  // Sync Students, with the confirmation open (it is cancelled, not run)
  await pp.goto(`${cfg.admin}/school/index`);
  const schoolRow = pp.locator('tr', { hasText: cfg.school });
  await schoolRow.getByText('Sync Students').waitFor();
  await pp.waitForTimeout(500);
  await schoolRow.getByText('Sync Students').click();
  await pp.locator('.ant-popover').waitFor();
  await pp.waitForTimeout(400);
  await shot(pp, 'sync-students.png', 'schools list with Sync Students', { x: 272, y: 20, width: 1008, height: 330 });
  await pp.locator('.ant-popover button', { hasText: 'Cancel' }).click();
  await plat.context.close();
} catch (err) {
  console.error(String(err?.stack ?? err));
  process.exitCode = 1;
} finally {
  // If a failure left the lesson renamed, put it back.
  if (renamed) {
    try {
      await api(renamed.page, 'PUT', `/lesson/${renamed.lessonid}`, renamed.body);
    } catch {
      console.error('Could not restore the renamed lesson; rename it back by hand.');
    }
  }
  rmSync(scratch, { recursive: true, force: true });
  await browser.close();
}

const big = made.filter((m) => m.bytes > MAX_BYTES);
if (big.length) {
  console.error(`Over ${MAX_BYTES / 1024} KB: ${big.map((m) => m.name).join(', ')}`);
  process.exitCode = 1;
}
console.log(`${made.length} images in ${cfg.out}`);
