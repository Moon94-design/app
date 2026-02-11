import MenuPage from "@app2/components/MenuPage";

export default function ManageMasterPage() {
  const items = [
    {
      title: "거래처 관리",
      to: "/manage/master/partner",
      lines: ["거래처 목록 조회/수정", "상태 관리", "일괄 수정"],
    },
    {
      title: "차량 관리",
      to: "/manage/master/vehicle",
      lines: ["차량 목록 조회/수정/삭제", "보류 처리", "엑셀 업로드 연계"],
    },
    {
      title: "서비스 업체 관리",
      to: "/manage/master/vendor",
      lines: ["서비스 업체 목록 조회/수정/삭제"],
    },
    {
      title: "관계 기관 관리",
      to: "/manage/master/agency",
      lines: ["관계 기관 목록 조회/수정/삭제"],
    },
    {
      title: "직원 관리",
      to: "/manage/master/employee",
      lines: ["직원 목록 조회/수정/삭제"],
    },
    {
      title: "설비 관리",
      to: "/manage/master/equipment",
      lines: ["설비 목록 조회/수정/삭제"],
    },
    {
      title: "소모품 관리",
      to: "/manage/master/consumable",
      lines: ["소모품 목록 조회/수정/삭제"],
    },
  ];

  return (
    <MenuPage title="기준정보 관리" description="관리할 기준정보를 선택하세요." items={items} />
  );
}
