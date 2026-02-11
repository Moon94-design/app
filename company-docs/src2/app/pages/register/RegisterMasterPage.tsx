import MenuPage from "@app2/components/MenuPage";

export default function RegisterMasterPage() {
  const items = [
    {
      title: "거래처 등록",
      to: "/register/master/partner",
      lines: ["주소", "담당자/차량 연결", "초기 단가(원/Kg)"],
    },
    {
      title: "차량 등록",
      to: "/register/master/vehicle",
      lines: ["차량번호", "운송사/기사 연락처"],
    },
    {
      title: "서비스 업체 등록",
      to: "/register/master/vendor",
      lines: ["기계/전기/통신/소모품/정비/기타", "지역/연락처"],
    },
    {
      title: "관계 기관 등록",
      to: "/register/master/agency",
      lines: ["업무범위(항목별 설명)", "지역/연락처"],
    },
    {
      title: "직원 등록",
      to: "/register/master/employee",
      lines: ["이름/지부/연락처", "직무(자유기입)"],
    },
    {
      title: "설비 등록",
      to: "/register/master/equipment",
      lines: ["설비 기본정보", "점검 주기(선택+자유)", "소모품 추가(소모품 등록에 자동 반영)"],
    },
    {
      title: "소모품 등록",
      to: "/register/master/consumable",
      lines: ["설비 연계해서 등록", "설비에서 추가된 소모품도 여기 목록에 쌓임"],
    },
  ];

  return (
    <MenuPage title="기준정보 등록" description="등록할 기준정보를 선택하세요." items={items} />
  );
}
