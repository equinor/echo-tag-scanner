---
name: dependabot-defender
description: 'Reference templates and commands for the Dependabot Defender agent. Use when generating session tracking files, PR summaries, per-alert output, override risk assessments, or listing open Dependabot alerts.'
---

# Dependabot Defender — Reference & Templates

Use this skill file when you need templates, command references, or detailed procedures. The agent file has the workflow and rules — this file has the details.

## Repository Setup

This repository is the single npm package `@equinor/echo-camera-web`. Its `package.json` and `package-lock.json` are at the repository root; there are no separate npm projects, Nx workspace, or per-project `.npmrc` files. Run npm commands from the repository root and check the effective npm configuration rather than assuming a release-age policy is declared in this repository.

The package is an Echo module integrated into EchopediaWeb. Its `peerDependencies` in the root `package.json` are part of the host integration contract. Review compatibility before changing them, and do not silently change their ranges or pinned versions while fixing an alert.

## gh Commands

### Fetch Single Alert

```bash
gh api repos/equinor/echo-tag-scanner/dependabot/alerts/{NUMBER} -q '{
  state: .state,
  summary: .security_advisory.summary,
  severity: .security_advisory.severity,
  cvss: .security_advisory.cvss.score,
  cve: .security_advisory.cve_id,
  vulnerable_range: .security_vulnerability.vulnerable_version_range,
  first_patched: .security_vulnerability.first_patched_version.identifier,
  package: .dependency.package.name,
  manifest_path: .dependency.manifest_path,
  scope: .dependency.scope,
  relationship: .dependency.relationship
}'
```

### Fetch Multiple Alerts at Once

When you have several alert numbers for the same package, fetch them in one call:

```bash
for n in 535 534 533 532; do
  echo "--- Alert #$n ---"
  gh api repos/equinor/echo-tag-scanner/dependabot/alerts/$n -q '{
    summary: .security_advisory.summary,
    severity: .security_advisory.severity,
    package: .dependency.package.name,
    manifest_path: .dependency.manifest_path,
    scope: .dependency.scope,
    vulnerable_range: .security_vulnerability.vulnerable_version_range,
    first_patched: .security_vulnerability.first_patched_version.identifier
  }'
done
```

### Actual Scope vs Dependabot Scope

**Do NOT trust Dependabot's `dependency.scope` field for reporting.** It reflects the dependency type within the _parent_ package, not necessarily this module. Trace the full `npm ls` path to a root dependency and check whether it is in `dependencies`, `devDependencies`, or `peerDependencies`. This module's build dependencies are in `devDependencies`, while its Echo/React host integration is declared in `peerDependencies`; report production impact based on the actual dependency path and build/runtime usage, not the label alone.

### Check Parent Dependency Ranges

```bash
npm view {parent-package}@{version} dependencies.{vulnerable-package}
```

## Override Breaking-Risk Checklist

Before adding an npm override, check these online:

1. **Changelog** — `npm view <pkg> repository.url` → open GitHub releases. Look for breaking changes between current and target version.
2. **Version jump** — Patch-only = very safe. Cross-minor = usually safe (still check changelog). Cross-major = high risk (must justify).
3. **Parent constraints** — `npm view <parent-package> dependencies` → does the parent's range include the override target? If not, breakage is likely.
4. **npm page** — Check `https://www.npmjs.com/package/<pkg>` for download trends and recent regression reports.

Report findings to user: e.g., "Minor bump, no breaking changes, parent accepts ^1.0.0 — low risk."

**Non-patch overrides require investigation:**

- **Cross-major or cross-minor**: Check release notes, changelog, and migration guide. Report ALL breaking changes to the user — explain which may affect us and what should be tested in the app. Do not assume it's safe. Example: "Cross-major (v6→v7) — breaking changes: (1) Node.js 20+ minimum (verify it matches our build environment), (2) removed `serialize()` option X — verify our build tooling does not use it."
- **Patch-only** (e.g., 6.3.1→6.3.4): No justification needed
- Include findings in both the per-alert output AND the PR summary Fix column

### Targeted Overrides (CRITICAL)

**Never use a blanket override** like `"axios": "1.15.0"` — this overrides ALL axios instances, including ones that aren't vulnerable or that may not be compatible with `1.15.0`.

**Instead, override only the specific vulnerable version ranges** found via `npm ls`. Use the `<package>@<current-version-range>` syntax:

```json
{
  "overrides": {
    "axios@1.12": "1.15.0",
    "axios@1.13": "1.15.0",
    "axios@1.14": "1.15.0"
  }
}
```

This targets only the 1.12.x, 1.13.x, and 1.14.x instances that are actually vulnerable, leaving any already-safe instances untouched.

**How to determine which ranges to override:**

1. Run `npm ls <package-name>` to see all resolved versions
2. Compare each version against `security_vulnerability.vulnerable_version_range` from the alert
3. Only override versions that fall within the vulnerable range
4. Use the minor version as the key (e.g., `axios@1.12`, `axios@1.13`) to target all patches within that minor

**Scoped (nested) overrides** — when you need to override a package only under a specific parent, use nested syntax:

```json
{
  "overrides": {
    "parent-package": {
      "vulnerable-pkg": "1.5.0"
    }
  }
}
```

Use this when different parents need different override targets, or when only one dependency path is affected.

### Scoped Security Minimum

After a lockfile-only fix of a transitive package (`npm update <package>`), record the patched version as a minimum under each parent that pulls it in:

```json
{
  "overrides": {
    "ts-jest": {
      "handlebars@4": "^4.7.10"
    }
  }
}
```

- Why: the parent's range still admits the vulnerable version, so a lockfile reverted in a merge installs it again without a warning. With the minimum, `npm ci` fails with `EUSAGE ... does not satisfy`.
- Use `^<patched>`, a floor. Never an exact pin, so that later fixes still install.
- Key it as `<package>@<major>`. If the parent later moves to another major, the override stops applying instead of forcing the old major on it (npm reports that as `overridden`, not as an error).
- Nest it under the parent. Never add a top-level entry; other dependency paths stay unaffected. Works when the parent is also a direct dependency.
- Add the scoped minimum under the affected parent in the root `package.json`; this repository has one package and one lockfile.
- `npm install` must not change any resolved version.
- Remove it when the parent's declared range itself excludes every vulnerable version (`npm view <parent>@<installed> dependencies.<package>`).

## Stale Override Check

At the start of every session, check if existing overrides in `package.json` are still needed:

```bash
# 1. Read current overrides from package.json
node -e "const p = require('./package.json'); console.log(JSON.stringify(p.overrides || {}, null, 2))"

# 2. For each override, check if the parent now pulls in a safe version natively
# Remove the override temporarily, run npm ls, and check
```

For each override in the root `package.json`:

1. Check if the parent package has been updated to pull in a safe version natively
2. If so, remove the override — it's no longer needed
3. Run `npm ls <package>` after removal to confirm the resolved version is still safe

Report removed stale overrides to the user and include them in the PR summary.

Quick classification from lockfile data (no install needed): an override is **dead** when no installed version matches its key range, **inert** when its target version is not installed, **active** otherwise. Compare root `package.json` overrides against package entries under `packages["node_modules/..."]` in `package-lock.json`. Removing dead/inert overrides must leave the lockfile byte-identical after `npm install` — that is the proof they were no-ops.

Scoped security minimums are not dead or inert. Keep each one while the parent's declared range still admits a vulnerable version (see "Scoped Security Minimum").

- An override without a version key (`"parent": { "pkg": "7.4.6" }`, `"pkg@1.14": "1.20.0"`) looks dead in the lockfile because only the target is installed. Classify it against the parent's declared range in the `HEAD` lockfile (`git show HEAD:package-lock.json`), never against the installed version. If the range admits a vulnerable version, it is active.
- A plain `"pkg": { … }` rule shadows a `"pkg@x.y": …` rule for the same package. Put the version replacement and the nested floors in one rule: `"axios@1.14": { ".": "1.20.0", "follow-redirects@1": "^1.16.2" }`.
- When `npm install` keeps a nested entry that the override now marks `invalid`, delete only that `node_modules/<parent>/node_modules/<pkg>` key from `package-lock.json`, then run `npm install` again.

## Peer Dependency Compatibility

The root `package.json` is the only package manifest. When a fix updates a package that is also declared in `peerDependencies`, verify that the installed development version remains compatible with that peer range. Treat peer-range changes as a host-compatibility change: justify and report them rather than syncing pins across nonexistent workspace packages.

## Alert Re-check

After Phase 1, compare every open alert against the lockfile named in its `manifest_path`:

```bash
gh api repos/equinor/echo-tag-scanner/dependabot/alerts --paginate --slurp > /tmp/alert-pages.json
```

For each open alert, collect every matching `packages["node_modules/.../<package>"]` version in the root lockfile and test it with `semver.satisfies(version, range.replace(/,\s*/g, ' '))` — GitHub ranges use `, ` as AND, which `semver` does not parse. Alerts with no matching version are resolved by the bumps; the rest go through Steps 1–5.

## Version Target Selection

For each candidate bump:

1. Check the effective npm configuration and applicable repository/organization guidance for a release-age minimum; do not assume one is declared in a repository `.npmrc`. If a minimum is configured, use `npm view <pkg> time --json` to choose the newest stable version whose `"<version>"` date meets it.
2. `npm view <pkg>@<version> deprecated` — skip the version if this prints anything (deprecated releases include broken minors and accidental publishes).
3. If the target crosses a major: read the release notes and migration guide for every major in between, list each breaking change, and decide whether it affects this module or its host integration (search imports, configs, and peer ranges). Apply the major only when none does; otherwise take the newest release on the current major and record the major as a follow-up with the blocking change named.
4. Record package, from → to, publication date, dep/dev scope, and the breaking-change assessment for majors in the session file.

## Dismiss Command

```bash
gh api --method PATCH repos/equinor/echo-tag-scanner/dependabot/alerts/{ALERT_NUMBER} \
  -f state=dismissed \
  -f dismissed_reason=tolerable_risk \
  -f dismissed_comment="<detailed justification why fix is impossible>"
```

## Per-Alert Output Template

Present this after resolving each alert:

```
### Alert #{number} — {package}
- **CVE**: {CVE ID}
- **Summary**: {one-line description}
- **Dependabot severity**: {critical/high/medium/low}
- **Effective risk**: {Critical/High/Medium/Low/Informational}
- **Dependabot scope**: {dev/runtime}
- **Actual scope**: {dev/runtime — determined via npm ls, not Dependabot}
- **Ships to production?**: {Yes/No}
- **Fix applied**: {be precise — see examples below}
- **Safety note** (for cross-major bumps): {why this major version jump is safe for us}
- **Link**: https://github.com/equinor/echo-tag-scanner/security/dependabot/{number}

**Fix description examples** (be accurate about what changed):
- `Ran npm install — existing overrides in package.json were stale in lockfile` (lockfile-only)
- `Ran npm update handlebars (4.7.9 → 4.7.10, lockfile) and added scoped minimum "ts-jest": { "handlebars@4": "^4.7.10" }`
- `Added targeted override serialize-javascript@6 → 7.0.5. Cross-major; reviewed the release notes and confirmed the listed breaking changes do not affect this module.`
- `Updated parent-pkg from 2.1.0 to 2.3.0 (minor bump, resolves transitive vuln)`
- `Removed unused dev dependency unused-pkg`
- NEVER say "Regenerated lockfile" when you ran `npm install` to fix stale entries
```

## Session Tracking File Template

Create at `docs/dependabot-session.md` on the first alert — **before any changes**. Write audit snapshots immediately. Delete before committing.

```markdown
# Dependabot Session — {date}

## Audit Snapshot — Before

### npm audit

{paste full npm audit output here}

## Phase 1 — Version updates

{applied bumps with from → to and publication date; bumps reverted and why; packages deferred for host-compatibility review; config changes forced by a bump}

## Alert re-check after Phase 1

{resolved by bumps: alert numbers; still vulnerable: alert numbers → per-alert steps}

## Fixes Applied

| #   | Package | Dependabot Severity | Dependabot Scope | Actual Scope | Our Rating | Fix                                                                                                  | Link            |
| --- | ------- | ------------------- | ---------------- | ------------ | ---------- | ---------------------------------------------------------------------------------------------------- | --------------- |
| 536 | axios   | critical            | dev              | dev          | Low        | Ran `npm install` — existing scoped overrides (axios@1.12/1.13/1.14 → 1.15.0) were stale in lockfile | /dependabot/536 |

## Audit Snapshot — After

_Fill this in after all fixes are applied:_

### npm audit

{paste full npm audit output here}

```

## PR Summary Template

Generate a copy-pasteable code block with one alert table for this repository.

```markdown
## Summary

{Brief description — packages updated, overrides added, packages removed.}
{Note if any runtime packages were touched, or if all fixes are dev-only.}

## Fixes

| Alert | Package | Dependabot Severity | Dependabot Scope | Actual Scope | Our Rating | Fix | Link |
| ----- | ------- | ------------------- | ---------------- | ------------ | ---------- | --- | ---- |
| [#{n}](https://github.com/equinor/echo-tag-scanner/security/dependabot/{n}) | {pkg} | {sev} | {dev/runtime} | {dev/runtime} | {rating} | {what was done} | [Alert #{n}](https://github.com/equinor/echo-tag-scanner/security/dependabot/{n}) |

### Audit Summary

| Metric | Before | After |
| ------ | ------ | ----- |
| `npm audit` vulnerabilities | {X} | {Y} |

## How to test

- Run `npm ci` in the repo root to verify the lockfile installs cleanly
- Run `npm run build` — the module build should succeed
- Run `npm start` — the local dev server should start at `https://localhost:3000`
- Run `npm run lint` — ESLint should pass
- Verify `npm ls {package}` shows patched versions
- Run `npm audit` — no new warnings introduced
- Run `npm ls` — check for invalid or missing dependencies
```

## Package → Feature Mappings

When runtime packages are changed, tell the user which features to test:

| Package                           | Feature area                                           |
| --------------------------------- | ------------------------------------------------------ |
| `@equinor/echo-base`               | Shared Echo foundation, errors, and event handling    |
| `@equinor/echo-search`            | Tag matching, validated scan results, tag sync/search  |
| `@equinor/echo-components`        | Tag result UI, context menu, and Echo dialogs          |
| `@equinor/echo-framework`         | Setting the active tag in the host application         |
| `@equinor/echo-core`              | Echo module API and module integration                 |
| `@equinor/echo-utils`             | Camera/device utilities and async hooks                |
| `@equinor/eds-core-react`         | Buttons, dialogs, progress indicators, notifications   |
| `@equinor/eds-icons`              | Icons in camera controls and result UI                 |
| `react`, `react-dom`               | Rendering and interactions across the module          |
| `styled-components`               | Module layout and component styling                    |

For packages not in this table, search codebase imports to find affected features.

For **build tooling** (including `@equinor/echo-cli` and webpack) → verify `npm run build` and `npm start`.
This repository currently has no test script; do not report a test suite as run unless one has been added. For **dev-only transitive deps** with patch/minor bumps, build and lint checks are appropriate.

## List All Open Alerts (Sorted by Severity)

```bash
gh api repos/equinor/echo-tag-scanner/dependabot/alerts --paginate -q '
  [.[] | select(.state=="open")]
  | sort_by(
      if .security_vulnerability.severity == "critical" then 0
      elif .security_vulnerability.severity == "high" then 1
      elif .security_vulnerability.severity == "medium" then 2
      else 3 end
    )
  | group_by(.dependency.package.name)
  | .[]
  | {package: .[0].dependency.package.name, severity: .[0].security_vulnerability.severity, manifest_paths: [.[].dependency.manifest_path] | unique, count: length, alerts: [.[].number]}
' 2>&1
```
