# 2026-02-18-online-minimum-line-phase3-logistics-conflict-permission

## online-minimum-line check result
- [x] Added logistics write conflict guard (`getById -> updatedAt` compare before save)
- [x] Added permission split points (`canRead/canWrite/canDelete`) at command boundaries
- [x] Kept scope in logistics daily boundary only (no full-page mass refactor)
- [x] Kept commonization by introducing isolated permissions module (`hooks/logistics/permissions.ts`)
- [x] L0: `npm.cmd run build`
- [x] smoke: `npm.cmd run test:smoke:routes`
- [ ] L2: `npm.cmd run check:qa:reuse-build`
  - reason: skipped by user request for speed
- [x] Synced docs: DECISIONS / MIGRATION_STATUS / result / checklist-result

## notes
- This step is the minimum online safety line for logistics only.
- Office/Issue/Action will reuse the same pattern during renewal batches.
