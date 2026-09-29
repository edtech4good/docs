---
title: Classroom to cloud sync
description: How offline classroom activity on a local Raspberry Pi is moved to the central cloud via a teacher's mobile device.
---

# Classroom to cloud sync

This document describes **one subsystem only**: how **offline classroom activity** (student progress, grades-related progress, access logs, etc.) recorded on the **local Pi API** is moved to the **central LMS API** using a **ZIP file** carried on a **teacher's mobile device**.

It is written for **code review and comparison** with another LMS that also uses a Raspberry Pi edge node. For the full multi-repo map, see the [architecture documentation](/architecture/).

**Status:** the central API's import side (`PUT /log/import`, section 6) is off by default — it only runs when a deployment sets `LOG_IMPORT_ENABLED`. Nothing in the current apps calls it: the native teacher app that drove this flow is retired, and the current Expo learner app does not implement the upload step. The rest of this page still documents the protocol both APIs implement, for the reasons above.

---

## 1. What problem this solves

- Students use the app **against the Pi** on a classroom LAN (offline from central).
- Progress is stored in the **Pi MySQL** database.
- Operators need the **same class of data** in the **central cloud** for reporting and single source of truth.
- The chosen pattern is **batch export / import via ZIP**, initiated by a **teacher**, not continuous replication from the Pi to the cloud.

---

## 2. End-to-end flow (summary)

| Step | Actor | System | Action |
|------|--------|--------|--------|
| 1 | Teacher | Pi (`edtech-lms-rpi-api`) | `GET /export/log` with Pi JWT → HTTP response is a ZIP |
| 2 | Mobile app | Device storage | Save body as **`studentlog.zip`** |
| 3 | Teacher | Central (`edtech-lms-api`) | `PUT /log/import` with LMS JWT → multipart field **`importfile`** = that ZIP |
| 4 | Central | MySQL + S3 | Parse ZIP, upsert progress tables, archive ZIP to S3, record sync row |

---

## 3. What data is in the ZIP (semantic scope)

The Pi builds **`log.ini`** as JSON (UTF-8) from **`LogBusiness.exportlog()`** in `edtech-lms-rpi-api`. It aggregates roughly the **last six months** of:

- **`studentprogress`** and nested **`studentprogressquestions`** (quiz/session style outcomes)
- **`rpiuseraccess`** (login/access)
- **`studentactives`**
- **`studentlearningprogress`**
- **`studentgradesprogress`**
- **`studentlevelsprogress`**
- **`studentlessonsprogress`**
- **`studentpoints`**
- **`studentappusages`**

The JSON is wrapped in a structure consumed by the central importer as **`Istudentprogress`** (`log.access`, `log.result`, `log.progress`, etc.). See the [Pi log.business.ts](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/src/business/log.business.ts) (`exportlog`) and [central log.business.ts](https://github.com/edtech4good/edtech-lms-api/blob/main/src/business/log.business.ts) (`importstudentsprogress`).

**Important distinction:** This path moves **activity and progress** that already exists on the Pi. It is **not** the primary mechanism for **creating student roster records on the cloud from the Pi**. Roster-style sync from cloud **to** the Pi uses other endpoints (e.g. central `POST /sync/cloud/.../students` and Pi `PUT /import/students`).

---

## 4. Pi API: export

**Repository:** `edtech-lms-rpi-api`  
**Route:** `GET /export/log`  
**Controller:** [src/modules/export/export.controller.ts](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/src/modules/export/export.controller.ts)  
**Guard:** `AccessGuard(TokenType.ACCESS)`: expects a valid **Pi** access JWT.

**ZIP contents:**

1. **`log.ini`**, `JSON.stringify(LogBusiness.exportlog())` (see section 3).
2. **Optional:** files from the Pi log directory on disk whose names include **`RPI-API-error`** or **`RPI-API-info`**, added as additional zip entries (plain text).

**Response headers:** `Content-Type: application/zip`; `Content-Disposition` attachment with a date/time based filename.

---

## 5. Mobile app: transport and UX

The native Android teacher app that implemented this flow is retired and its repository is archived. This page documents the protocol it defined, which the two APIs still implement. The current Expo learner app does not implement teacher upload.

### 5.1 Two base URLs

The app configured two HTTP client base URLs:

| Field | Typical use |
|--------|-------------|
| Pi base URL | Pi classroom API |
| Upload base URL | Central LMS API |

### 5.2 Client operations

- Pi: `GET export/log` with `Authorization: Bearer <token>`
- Cloud: `PUT log/import` with `Authorization: Bearer <token>` and a multipart part (field name **`importfile`** in the multipart implementation)

### 5.3 Teacher UI

- **Download** (when launched in Pi-oriented mode): calls Pi `export/log`, writes **`studentlog.zip`** to external storage (path depends on device storage settings, SD card path or a subdirectory under external storage).
- **Upload** (when launched in online-oriented mode): reads **`studentlog.zip`**, builds multipart upload to the upload base URL's `log/import`.

The teacher screen also chained behavior unrelated to log sync: after a successful cloud log upload it may call **`GET sync`** on the central API to refresh **`syncData.zip`** (curriculum), and after Pi log download it may **`PUT import/master`** on the Pi if the Pi connection check passes. Those are **curriculum / master** paths, not the log pipeline. `PUT import/master` accepts a teacher token only when the Pi runs with `RPI_OFFLINE=true` (or `"offline": true` in `FORTYKAPIRPICONFIG`); otherwise only central's `SERVER_SYNC_KEY` can call it.

### 5.4 The Pi connection check

In the retired client this check was a **string equality** comparison between the configured Pi base URL and a placeholder URL, not a network probe. **Treat this as build- or environment-specific** when comparing to another LMS client; the intended idea is to branch "classroom / Pi mode" vs "online only" for optional chaining.

### 5.5 Authentication note

Both Pi download and cloud upload use the same stored access token. Your deployment must ensure that token is valid for **both** hosts, or that login flows align so the correct token is used per base URL. This is a common integration point when comparing another LMS.

---

## 6. Central LMS API: import

**Repository:** `edtech-lms-api`  
**Route:** `PUT /log/import`  
**Controller:** [src/modules/log/log.controller.ts](https://github.com/edtech4good/edtech-lms-api/blob/main/src/modules/log/log.controller.ts)  
**Guards:** `AccessGuard(TokenType.ACCESS)` and `CheckPermissionsGuard` (RBAC).

**Availability:** off unless the deployment sets `LOG_IMPORT_ENABLED` (`true`/`1`); when off, the route 404s before auth or upload parsing runs.

**Multipart:** field name **`importfile`** (ZIP buffer).

**Query:** optional **`offline`** (boolean), forwarded into sync activity recording.

### 6.1 Unzip and validation rules

Uses `unzipper` to iterate entries:

- Path exactly **`log.ini`** → parse JSON → `LogBusiness.importstudentsprogress(logdata)`.
- Path **contains `RPI-API`** → `createstudentaccesslogfiles` (metadata in `logfiles`).
- **Any other entry** → `400 BadRequestException` ("invalid file inside zip-file").

The code calls `file.buffer("<value in code>")` when reading entries (unzipper password parameter). Pi-generated zips are not encrypted; this is effectively part of the **contract** of the current implementation.

### 6.2 Database writes

**Class:** [src/business/log.business.ts](https://github.com/edtech4good/edtech-lms-api/blob/main/src/business/log.business.ts), `importstudentsprogress`:

- Upserts **access** (`importaccesslog`)
- Upserts **result** rows and related **progress questions** (`importprogresslog`, `importprogressquestionlog`)
- Upserts **progress** aggregates (`importstudentprogresslog`) across the nested progress tables

All use Sequelize **`bulkCreate`** with **`updateOnDuplicate`** for idempotent merges.

### 6.3 Side effects

- **`recordSyncActivity`:** inserts into **`syncs`** (ties to teacher `schooluserid`, filename, offline flag).
- **`uploadZipFileToAWSS3`:** stores the **entire** uploaded ZIP in S3 and records **`logfiles`** with `type: 2`.

Work runs inside a **DB transaction**; failure rolls back and returns an error response.

---

## 7. Operational characteristics (for comparison)

| Topic | This system |
|--------|-------------|
| **Coupling** | Strong contract on ZIP layout and `log.ini` JSON shape |
| **Latency** | Batch only; no real-time sync |
| **Initiator** | Human teacher + mobile app |
| **Conflict strategy** | Upsert by duplicate keys in Sequelize models, not CRDT |
| **Audit** | `syncs` row + S3 copy of ZIP + optional RPI-API file metadata |
| **Time window** | Pi export ~6 months of data (see `subMonths` in Pi `exportlog`) |

---

## 8. Checklist: compare another LMS + Pi

Use this when reviewing a different stack against this design.

1. **Edge export**. Does the Pi (or edge) expose a single **downloadable artifact** (ZIP or other) that bundles all required tables?
2. **Schema mapping**. Is the payload **one JSON blob** or multiple files? Does it separate **roster** vs **progress**?
3. **Auth**. Separate tokens for edge vs cloud, or shared? How does the mobile app store them?
4. **Import semantics**. Full replace vs upsert vs append? How are duplicates keyed?
5. **Size limits**. Time window, max ZIP size, timeouts (mobile uses default HTTP for download; extended client for large Pi uploads elsewhere).
6. **Failure handling**. Partial import, rollback, idempotent retries if the teacher uploads twice?
7. **Observability**. Central **sync records**, **raw archive** (S3 here), correlation IDs?
8. **Curriculum vs logs**. Is curriculum sync **separate** (this repo: `GET /sync`, `PUT /import/master`) to avoid mixing with log ZIPs?

---

## 9. Primary source files (quick index)

| Area | Path |
|------|------|
| Pi export | [edtech-lms-rpi-api/src/modules/export/export.controller.ts](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/src/modules/export/export.controller.ts) |
| Pi log aggregation | [edtech-lms-rpi-api/src/business/log.business.ts](https://github.com/edtech4good/edtech-lms-rpi-api/blob/main/src/business/log.business.ts) (`exportlog`) |
| Central import | [edtech-lms-api/src/modules/log/log.controller.ts](https://github.com/edtech4good/edtech-lms-api/blob/main/src/modules/log/log.controller.ts) |
| Central merge | [edtech-lms-api/src/business/log.business.ts](https://github.com/edtech4good/edtech-lms-api/blob/main/src/business/log.business.ts) (`importstudentsprogress`, related methods) |

---

## 10. Implementation code examples

The blocks below are **copied from the repos** as of the line ranges shown. If line numbers drift after edits, search by symbol or route name in the listed paths.

### 10.1 Pi API, `GET /export/log` (build ZIP)

**edtech-lms-rpi-api/src/modules/export/export.controller.ts**

```ts
  @Get("log")
  @UseGuards(AccessGuard(TokenType.ACCESS))
  @HttpCode(HttpStatus.OK)
  async exportlog(
    @Response({ passthrough: true }) res: any,
    @User() user: Token
  ): Promise<any> {
    const log = await new LogBusiness().exportlog();
    const zip = new AdmZip();
    zip.addFile("log.ini", Buffer.from(JSON.stringify(log || []), "utf8"));
    // add file from log
    const files = fs.readdirSync(LOGDIR);
    files.forEach(file => {
      try {
        if(file.includes('RPI-API-error') || file.includes('RPI-API-info')) {
          const data = fs.readFileSync(LOGDIR +'/' + file, 'utf8'); // synchronous
          zip.addFile(file, Buffer.from(data.toString(), "utf8"));
        }
      } catch (e) {
        throw new InternalServerErrorException("Error read file");
      }
    });
    res.set({
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="log-${new Date().toLocaleDateString()}-${new Date().toLocaleTimeString()}.zip"`,
    });
    Logger.info(`<${user.schoolusername}> export log`, {logaccesstype: LOGTYPE.EXPORTLOG, userid: user.schooluserid});
    return new StreamableFile(zip.toBuffer());
  }
```

### 10.2 Pi API, `LogBusiness.exportlog()` (shape of `log.ini` JSON)

Six-month window via `subMonths`; nests `studentprogressquestions` under each `studentprogress` row; bundles progress tables under `log.progress`.

**edtech-lms-rpi-api/src/business/log.business.ts**

```ts
    exportlog = async () => {
        const limitdate = subMonths(new Date(), 6);
        const sp = (
            await studentprogress.findAll({
                where: {
                    starttime: { [Op.gt]: limitdate },
                },
            })
        ).map((x) => ({
            ...x.get({ plain: true }),
        }));
        const spqo = await studentprogressquestions.findAll({
            where: {
                studentprogressid: {
                    [Op.in]: sp.map((x) => x.studentprogressid),
                },
            },
        });
        const spq = spqo.map((x) => x.get({ plain: true }));
        const gspq = groupBy(spq, 'studentprogressid');
        const sa = await rpiuseraccess.findAll({
            where: {
                logintime: { [Op.gt]: limitdate },
            },
        });
        const stactives = (await studentactives.findAll({
            where: {
                created_at: { [Op.gt]: limitdate },
            }
        })).map((x) => ({
            ...x.get({ plain: true }),
        }));
        const stlp = (await studentlearningprogress.findAll({
            where: {
                lastupdated: { [Op.gt]: limitdate },
            }
        })).map((x) => ({
            ...x.get({ plain: true }),
        }));
        const stgp = (await studentgradesprogress.findAll({
            where: {
                lastupdated: { [Op.gt]: limitdate },
            }
        })).map((x) => ({
            ...x.get({ plain: true }),
        }));
        const stlvp = (await studentlevelsprogress.findAll({
            where: {
                lastupdated: { [Op.gt]: limitdate },
            }
        })).map((x) => ({
            ...x.get({ plain: true }),
        }));
        const stlsp = (await studentlessonsprogress.findAll({
            where: {
                lastupdated: { [Op.gt]: limitdate },
            }
        })).map((x) => ({
            ...x.get({ plain: true }),
        }));
        const stpoints = (await studentpoints.findAll({
            where: {
                created_at: { [Op.gt]: limitdate },
            }
        })).map((x) => ({
            ...x.get({ plain: true }),
        }));
        const stpusages = (await studentappusages.findAll({
            where: {
                created_at: { [Op.gt]: limitdate },
            }
        })).map((x) => ({
            ...x.get({ plain: true }),
        }));
        return {
            log: {
                result: sp.map((x) => ({
                    ...x,
                    studentprogressquestions: gspq[x.studentprogressid],
                })),
                progress: {
                    studentactives: stactives,
                    studentlearningprogress: stlp,
                    studentgradesprogress: stgp,
                    studentlevelsprogress: stlvp,
                    studentlessonsprogress: stlsp,
                    studentpoints: stpoints,
                    studentappusages: stpusages,
                },
                access: sa.map((x) => x.get({ plain: true })),
            },
        };
    };
```

### 10.3 Central LMS. TypeScript contract for parsed `log.ini`

**edtech-lms-api/src/business/log.business.ts**

```ts
export interface studentprogresslog {
  studentactives: Array<studentactives>;
  studentlearningprogress: Array<studentlearningprogress>;
  studentgradesprogress: Array<studentgradesprogress>;
  studentlevelsprogress: Array<studentlevelsprogress>;
  studentlessonsprogress: Array<studentlessonsprogress>;
  studentpoints: Array<studentpoints>;
  studentappusages: Array<studentappusages>;
}

export interface Istudentprogress {
  log?: {
    access?: any;
    result?: any;
    progress?: studentprogresslog;
  };
}
```

`importstudentsprogress` **requires** all of `log.access`, `log.result`, and `log.progress` to be present (truthy) before it writes anything:

**edtech-lms-api/src/business/log.business.ts**

```ts
  importstudentsprogress = async(logdata: Istudentprogress) => {
    if (
      logdata &&
      logdata.log &&
      logdata.log?.access &&
      logdata.log?.result &&
      logdata.log?.progress
    ) {
      if (logdata.log.access && logdata.log.access.length > 0) {
        /* await logbusiness.clearuseraccesslogs(
          logdata.log.access.map((x: any) => x.useraccessid)
        );*/
        await this.importaccesslog(logdata.log.access);
      }
      if (logdata.log.result && logdata.log.result.length > 0) {
        /*await logbusiness.clearstudentprogresslogs(
          logdata.log.result.map((x: any) => x.studentprogressid)
        );*/
        await this.importprogresslog(logdata.log.result);

        await this.importprogressquestionlog(
          logdata.log.result
            .map((x: any) => x.studentprogressquestions || [])
            .flat()
        );
      }
      if (logdata.log.progress) {
        await this.importstudentprogresslog(logdata.log.progress);
      }
    }
    return;
  }
```

Example upsert configuration (access + main progress row + nested question rows):

**edtech-lms-api/src/business/log.business.ts**

```ts
  importaccesslog = (access: Array<rpiuseraccess>) =>
    rpiuseraccess.bulkCreate(access, {
      transaction: this._transaction,
      updateOnDuplicate: ["userid", "logintime", "ipaddress", "logouttime", "timespent", "status"],
    });
  importprogresslog = (progress: Array<studentprogress>) =>
    studentprogress.bulkCreate(progress, {
      transaction: this._transaction,
      updateOnDuplicate: [
        "studentid",
        "ispass",
        "studentprogressreferenceid",
        "starttime",
        "endtime",
        "progresstype",
        "marks",
        "points",
        "resultpercentage",
        "fullpoints",
        "scores"
      ],
    });
```

### 10.4 Central LMS, `PUT /log/import` (unzip, import, S3, transaction)

**edtech-lms-api/src/modules/log/log.controller.ts**

```ts
  @UseInterceptors(FileInterceptor("importfile"))
  // @RequirePermissions(Permission.UPDATE_IMPORT, Permission.CREATE_IMPORT)
  @UseGuards(AccessGuard(TokenType.ACCESS), CheckPermissionsGuard)
  @ApiQuery({ name: "offline", required: false, type: Boolean })
  @HttpCode(HttpStatus.OK)
  @ApiConsumes("multipart/form-data")
  async create(
    @UploadedFile() zipfile: Express.Multer.File,
    @User() user: LmsUserToken,
    @Query("offline") offline: boolean = false
  ): Promise<ResponseBoolean> {
    const directory = await Open.buffer(zipfile.buffer);
    if (directory.files.length > 0) {
      const tnx = await dbinstance.getdbinstance().transaction();
      const logbusiness = new LogBusiness(tnx);
      const zipAWSS3filename = `logupload-${new Date().getTime()}.zip`;
      await logbusiness.recordSyncActivity(user, zipAWSS3filename, offline);
      try {
        const parentfileid = uuidv4();
        for await (const file of directory.files) {
          if(file.path === 'log.ini') {
            const logdata: Istudentprogress = JSON.parse(
              (await file.buffer("<value in code>")).toString()
            );
            await logbusiness.importstudentsprogress(logdata);
          } else if(file.path.includes('RPI-API')) {
            await logbusiness.createstudentaccesslogfiles(file, parentfileid);
          } else {
            throw new BadRequestException('There is invalid file inside zip-file');
          }
        }
        await logbusiness.uploadZipFileToAWSS3(zipfile, zipAWSS3filename, parentfileid);
        await tnx.commit();
        return {
          error: false,
          data: true,
        };
      } catch (e: any) {
        tnx.rollback();
        throw new BadRequestException(
          {
            error: true,
            errormessage: e,
          },
          "Invalid File"
        );
      }
    }
    throw new BadRequestException({
      error: true,
      errormessage: "Invalid file (Zip-file is empty)",
    });
  }
```

### 10.5 Central LMS, sync row + S3 archive

**edtech-lms-api/src/business/log.business.ts**

```ts
  recordSyncActivity = async (user: LmsUserToken, filename: string, offlineonline: boolean) => {
    if(!user.schooluserid) throw new BadRequestException('Please login as a teacher!');
    const teacher = await schoolusers.findOne({
      where: { schooluserid: user.schooluserid}
    });
    if(!teacher) throw new BadRequestException('Teacher does not exist!');
    await syncs.create({
      syncid: uuidv4(),
      filename,
      type: 1,
      offlineonline,
      created_by: teacher.schooluserid
    }, { transaction: this._transaction})
    return;
  }
```

**edtech-lms-api/src/business/log.business.ts**

```ts
  uploadZipFileToAWSS3 = async (file: Express.Multer.File, customFilename: string, uuid: string) => {
    const s3meta = await AWSService.uploadS3(
      customFilename,
      file.buffer
    );
    return await logfiles.create({
      logfileid: uuid,
      logfilemeta: s3meta,
      logfilename: customFilename,
      type: 2
    }, {transaction: this._transaction})
  }
```

### 10.6 The retired Android client

The app configured two base URLs: one for the Pi classroom API (`GET export/log`) and one for the central LMS API (`PUT log/import`, and `GET sync` for curriculum). In Pi-connected mode the teacher screen showed a download button that called `GET export/log` against the Pi and saved the response as **`studentlog.zip`** on device storage; in online mode it showed an upload button that read that same file and sent it as a multipart `PUT log/import` to the central API with the form field name **`importfile`**.

Each direction could chain an optional second request depending on the Pi connection check described in 5.4: after a successful download, the app could follow with `PUT import/master` against the Pi; after a successful upload, it could follow with `GET sync` against the central API to refresh curriculum data. Which button the screen showed, and which optional request it chained, depended on a mode flag set at launch and on whether the Pi base URL was configured, rather than on separate app builds.
