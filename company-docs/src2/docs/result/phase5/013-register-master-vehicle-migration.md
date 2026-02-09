# 기준등록 차량 페이지 이관 (/register/master/vehicle)

> 작성일: 2026-02-09
> 주제: Factory 방식으로 partner 다음 기준등록 페이지(vehicle) src2 이관

---

## 변경 요약
- `/register/master/vehicle`를 `@legacy`에서 `@app2`로 loader 교체.
- 페이지를 얇은 조립 구조로 신규 생성하고, sections/hooks로 분리.
- vehicle 도메인 최소 정본 세트(schema/repo/draft key/utils)를 kernel에 추가.

## 코드 변경
- nav:
  - `src2/app/nav/navConfig.ts`
    - `/register/master/vehicle` loader -> `@app2/pages/vehicle/VehicleRegisterPage`

- page:
  - `src2/app/pages/vehicle/VehicleRegisterPage.tsx`
  - `src2/app/pages/vehicle/sections/VehicleFormSection.tsx`
  - `src2/app/pages/vehicle/sections/VehicleRecentList.tsx`
  - `src2/app/pages/vehicle/hooks/useVehicleRegisterPage.ts`

- kernel:
  - `src2/kernel/schema/vehicle/vehicleTypes.ts`
  - `src2/kernel/schema/vehicle/index.ts`
  - `src2/kernel/schema/index.ts` (vehicle export 추가)
  - `src2/kernel/repo/domain/vehicleRepo.ts`
  - `src2/kernel/repo/keys.ts` (`vehicle` key 추가)
  - `src2/kernel/repo/index.ts` (vehicle repo export 추가)
  - `src2/kernel/draft/draftKeys.ts` (`vehicleRegister` key 추가)
  - `src2/kernel/utils/phone.ts`
  - `src2/kernel/utils/index.ts` (phone util export 추가)

## 문서 변경
- `src2/docs/rule/MIGRATION_STATUS.md`
  - `/register/master/vehicle` 상태를 `MIGRATED`로 갱신.
- `src2/docs/roadmap/phase5/work-order-register-master-vehicle.md` 신규 작성.

## 게이트 확인
- `npm run build` 성공.
- `npm run dev` 직접 URL/새로고침 확인은 아직 미실행(수동확인 필요).

다음 질문: 다음 기준등록 대상을 `/register/master/vendor`로 바로 이어갈까?

## 추가 운영 메모(채팅 지연/포트 점유)
- `.vscode/settings.json`에 성능용 제외 규칙 추가:
  - `files.watcherExclude`, `search.exclude`, `files.exclude`
  - 대용량 산출물/압축파일/node_modules/dist 감시 최소화
- 터미널 탭을 닫아도 `vite` 프로세스가 백그라운드로 남아 포트(5173/5174)를 유지할 수 있음을 확인.
- 남아 있던 `vite` 프로세스를 종료했고, 현재 5173/5174 리스닝 없음.

## 후속 게이트 확인
- `/register/master/vehicle` 직접 URL 요청 200 확인.
- 재요청(새로고침 대체) 200 확인.
- Router 중복 경고 0은 브라우저 콘솔 수동확인 필요.
