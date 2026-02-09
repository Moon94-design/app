# Copilot Instructions (app)

> **Start → DOCS_GUIDE → main_rule → check STATUS → do the work → verify GATES → update STATUS → record result**

## Language
- Always respond in Korean (casual tone) unless the user uses English.
- 파일명/경로 표기를 제외하고는 한국어로 작성.

## Docs loading integrity rule (must follow)
When starting any new task or after context loss, ensure the full DOCS_GUIDE is loaded without omission.

Target file:
- /workspaces/app/company-docs/src2/docs/DOCS_GUIDE.md

Mandatory behavior:
1) You may skip re-reading DOCS_GUIDE ONLY if you can verify BOTH:
   - (A) the complete DOCS_GUIDE content is already present in the current conversation context, with no missing parts
   - (B) the total line count in the context matches the current file’s line count exactly
2) If (A) or (B) is unknown, cannot be verified, or does not match, you MUST re-read DOCS_GUIDE from start to finish.
3) While re-reading, you may skip a section ONLY if you can verify that the section’s full text is already present in context (no partial recall). If uncertain, re-read that section.
4) Do not claim “already read / already in context” without a line-count match check.

Workflow expectation:
- First, get DOCS_GUIDE line count from the file.
- Compare with the DOCS_GUIDE content currently in context.
- If mismatch: re-read the entire DOCS_GUIDE.

## Debugging rule (always)
- Separate **runtime bugs** (white screen/crash/infinite loop) from **editor diagnostics** (TS red squiggles).
- Fix **runtime bugs first** using runtime evidence (browser console + `npm run dev` + `npm run build`).
- Do not change import conventions (e.g., adding `.tsx` extensions) unless build fails or there is clear proof it fixes the runtime issue.
- React.lazy: never create `lazy(loader)` inside render/map; create it once (module scope) and only render it.

## Project overview
- Vite + React 19 app lives in [company-docs/](../company-docs).
- Migration in progress: src2 is SSOT, src is legacy. See [company-docs/src2/docs/](../company-docs/src2/docs).

## Architecture and conventions (must follow)
- Entry point is [company-docs/src2/app/main.tsx](../company-docs/src2/app/main.tsx).
- Global Suspense and ErrorBoundary live only in [company-docs/src2/app/App.tsx](../company-docs/src2/app/App.tsx).
- Routing SSOT is [company-docs/src2/app/nav/navConfig.ts](../company-docs/src2/app/nav/navConfig.ts).
  - NavItem uses loader only; component fields are forbidden.
  - loader signature: () => Promise<{ default: React.ComponentType<any> }>.
- React.lazy(loader) is applied only in [company-docs/src2/app/routes/routes.tsx](../company-docs/src2/app/routes/routes.tsx).
- @legacy imports are allowed only under src2/app; never under src2/kernel.
- Do not change route paths; only swap loader targets during migration.

## Aliases
- @app2 -> src2/app
- @kernel -> src2/kernel
- @legacy -> src

## Kernel and data rules
- localStorage direct access is forbidden; use repo + storage adapters.
- Storage keys must be defined in src2/kernel/repo/keys.ts.
- UI must use domain repos (src2/kernel/repo/domain/*), not impl/*.

## CSS rules
- Global reset is imported in main.tsx: @legacy/index.css.
- Shell styles live in [company-docs/src2/app/shell/shell.css](../company-docs/src2/app/shell/shell.css).

## Developer workflow
- Dev server: `npm run dev` (from company-docs).
- Build gate: `npm run build`.
- Lint: `npm run lint`.

## Docs workflow (SSOT)
- Always start with [company-docs/src2/docs/DOCS_GUIDE.md](../company-docs/src2/docs/DOCS_GUIDE.md).
- Rules: [company-docs/src2/docs/rule/main_rule.md](../company-docs/src2/docs/rule/main_rule.md).
- Status: [company-docs/src2/docs/rule/MIGRATION_STATUS.md](../company-docs/src2/docs/rule/MIGRATION_STATUS.md).
- Gates: [company-docs/src2/docs/rule/GATES_CHECKLIST.md](../company-docs/src2/docs/rule/GATES_CHECKLIST.md).
- After any code or doc change, add a result file under company-docs/src2/docs/result/{topic}/NNN-title.md.
- 결과 파일에는 간단한 의견과 다음 진행 질문을 포함.

## Always (quick audit)
- 런타임 문제부터 해결(콘솔/dev/build). TS 빨간줄은 빌드 실패가 아니라면 후순위.
- 키 유니온이 있으면 `string` 금지. `DraftKey` 등 강타입 사용.
- 계약 sync/async 일관성 유지 + 가벼운 가드레일(키 prefix 검증 등) 추가.
- draft 연결 화면에는 "초기화" 버튼을 작성 페이지 오른쪽 위에 배치.
