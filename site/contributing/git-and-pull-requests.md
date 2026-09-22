---
title: Git and pull requests
description: Git workflow and pull request conventions
---

# Git and pull requests

The multi-repository layout plus squash merges makes some ordinary-looking commands destructive. This guide covers the gotchas and how to avoid them.

## The layout

edtech4good consists of independent repositories, each with its own remote. A change spanning repos requires a branch, a commit and a pull request per repository. Nothing in the tooling enforces merge order.

**Practical consequences:**

- Use the same branch name across all affected repositories so the set is findable.
- If one piece of a multi-repo change merges ahead of the others, a feature may become unreachable. The joi validator may reject unknown keys before the request leaves the browser, so the client-side validator can block a request the server would happily accept.
- State the merge order explicitly when opening PRs. Nothing in the tooling enforces it.

## Merge conventions

Most edtech4good repositories squash merge pull requests into main, with history recorded as `Title (#N)`.

## Before opening a pull request

Check that your local `main` branch is not ahead of `origin/main`:

```bash
git rev-list --count origin/main..main
```

If this is not 0, stop. Your branch sits on commits the remote has never seen, and they will appear in your PR under your title. Push `main` first after checking with whoever owns those commits.

### Recheck before merging

After a PR has been open for a while, the base branch may move under you. Immediately before merging, check that the PR includes only your work:

```bash
gh pr view <n> --json commits,files
```

If it lists commits or files that are not yours, the base moved under you. Rebase onto current `origin/main` first.

## Stacked pull requests

Stacking is appropriate when work has real ordering: schema, then the fix that needs it, then the docs. Each PR targets its parent.

### Do not delete the base of an open PR

**Do not `gh pr merge --delete-branch` a PR that is the base of another PR.**

GitHub closes the child PR instead of retargeting it. A closed PR whose base branch no longer exists cannot be reopened. The work is not lost (the head branches survive), but the PR, its review and its history are gone.

**Do this instead:**

1. Merge the parent without `--delete-branch`.
2. Confirm the child is still open.
3. Retarget it (see below).
4. Delete branches only once the whole stack has landed.

### Squash merge breaks rebasing

Squashing collapses the parent's commits into one new commit on `main`. The child branch still holds the parent's original commits. Rebasing replays them against main's squashed version, which may drop them as empty or create conflicts with intermediate states.

**The reliable approach: reset and cherry-pick only what is new**

After the parent merges, on your child branch:

```bash
git reset --hard origin/main
git cherry-pick <child-only-commits>
git push --force-with-lease origin <child-branch>
```

Check the diff size. If it looks like the parent's work is in there too, you cherry-picked too much.

Always use `--force-with-lease` only on your own unmerged branch, and ask before force-pushing anyone else's work.

### Retargeting a PR base

`gh pr edit --base main` fails in this organization with a deprecated GraphQL error and does not change the base. Use REST instead:

```bash
gh api -X PATCH repos/edtech4good/<repo>/pulls/<n> -f base=main --jq '.base.ref'
```

The `--jq` flag prints the base back so you can verify the change took.

## Verify a merge by content, not by status

"Merged" is not "correct". After merging, confirm the work is actually on main:

```bash
git fetch origin
git show origin/main --stat --oneline | head
git ls-tree -r origin/main --name-only | grep <expected-file>
```

Grep is case-sensitive. A lowercase filename will not match a capitalized pattern, and it will look exactly like a missing file. Check the tree before raising an alarm.

## PR descriptions

The diff shows what changed. The description carries what a reviewer cannot recover: why this shape over alternatives, what was ruled out and why, and what was deliberately left undone.
