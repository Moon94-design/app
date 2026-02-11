import MenuPage from "@app2/components/MenuPage";

export default function HomeMainPage() {
  const items = [
    {
      title: "엑셀등록",
      to: "/excel",
      lines: ["거래처 일괄 등록", "계량현황 일괄 등록", "기타 기준정보 일괄 등록"],
    },
    {
      title: "등록",
      to: "/register",
      lines: ["기준정보 등록", "일일기록 등록"],
    },
    {
      title: "관리",
      to: "/manage",
      lines: ["기준정보 관리", "일일기록 관리"],
    },
    {
      title: "조회",
      to: "/browse",
      lines: ["검색 / 리스트 / 리포트", "인쇄(PDF 저장은 인쇄 창)"],
    },
  ];

  return (
    <MenuPage title="홈" description="이동할 작업 영역을 선택하세요." items={items} />
  );
}
