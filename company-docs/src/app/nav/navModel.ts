export type Crumb = { label: string; to: string };
export type QuickTab = { label: string; to: string };

function isPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

export function getBreadcrumb(pathname: string): Crumb[] {
  // 가장 구체 경로부터 매칭
  const map: Array<{ path: string; crumbs: Crumb[] }> = [
    { path: "/register/master/partner", crumbs: [
      { label: "등록", to: "/register" },
      { label: "기준정보 등록", to: "/register/master" },
      { label: "거래처 등록", to: "/register/master/partner" },
    ]},
    { path: "/register/master/vehicle", crumbs: [
      { label: "등록", to: "/register" },
      { label: "기준정보 등록", to: "/register/master" },
      { label: "차량 등록", to: "/register/master/vehicle" },
    ]},
    { path: "/register/master/vendor", crumbs: [
      { label: "등록", to: "/register" },
      { label: "기준정보 등록", to: "/register/master" },
      { label: "정비/서비스 업체 등록", to: "/register/master/vendor" },
    ]},
    { path: "/register/master/agency", crumbs: [
      { label: "등록", to: "/register" },
      { label: "기준정보 등록", to: "/register/master" },
      { label: "관계기관 등록", to: "/register/master/agency" },
    ]},
    { path: "/register/master", crumbs: [
      { label: "등록", to: "/register" },
      { label: "기준정보 등록", to: "/register/master" },
    ]},
    { path: "/register/daily/logistics", crumbs: [
      { label: "등록", to: "/register" },
      { label: "일일기록 등록", to: "/register/daily" },
      { label: "유통 기록", to: "/register/daily/logistics" },
    ]},
    { path: "/register/daily", crumbs: [
      { label: "등록", to: "/register" },
      { label: "일일기록 등록", to: "/register/daily" },
    ]},
    { path: "/register", crumbs: [
      { label: "등록", to: "/register" },
    ]},

    { path: "/browse/price", crumbs: [
      { label: "조회", to: "/browse" },
      { label: "단가 조회", to: "/browse/price" },
    ]},
    { path: "/browse/master", crumbs: [
      { label: "조회", to: "/browse" },
      { label: "기준정보 조회", to: "/browse/master" },
    ]},
    { path: "/browse/daily", crumbs: [
      { label: "조회", to: "/browse" },
      { label: "일일기록 조회", to: "/browse/daily" },
    ]},
    { path: "/browse", crumbs: [
      { label: "조회", to: "/browse" },
    ]},

    { path: "/manage/master", crumbs: [
      { label: "관리", to: "/manage" },
      { label: "기준정보 관리", to: "/manage/master" },
    ]},
    { path: "/manage/daily", crumbs: [
      { label: "관리", to: "/manage" },
      { label: "일일기록 관리", to: "/manage/daily" },
    ]},
    { path: "/manage", crumbs: [
      { label: "관리", to: "/manage" },
    ]},

    { path: "/", crumbs: [
      { label: "홈", to: "/" },
    ]},
  ];

  for (const r of map) {
    if (pathname === r.path) return r.crumbs;
  }

  // prefix fallback
  for (const r of map) {
    if (isPrefix(pathname, r.path)) return r.crumbs;
  }

  return [{ label: "홈", to: "/" }];
}

export function getQuickTabs(pathname: string): QuickTab[] {
  // “현재 위치에서 이동 탭” (등록/관리/조회 각각에 맞는 탭)
  if (isPrefix(pathname, "/register/master")) {
    return [
      { label: "거래처", to: "/register/master/partner" },
      { label: "차량", to: "/register/master/vehicle" },
      { label: "서비스", to: "/register/master/vendor" },
      { label: "관계기관", to: "/register/master/agency" },
    ];
  }

  if (isPrefix(pathname, "/register/daily")) {
    return [
      { label: "유통", to: "/register/daily/logistics" },
      // 다음에 생산/사무/회계 추가되면 여기만 늘리면 됨
    ];
  }

  if (isPrefix(pathname, "/browse")) {
    return [
      { label: "기준정보", to: "/browse/master" },
      { label: "일일기록", to: "/browse/daily" },
      { label: "단가", to: "/browse/price" },
    ];
  }

  if (isPrefix(pathname, "/manage")) {
    return [
      { label: "기준정보", to: "/manage/master" },
      { label: "일일기록", to: "/manage/daily" },
    ];
  }

  return [];
}
