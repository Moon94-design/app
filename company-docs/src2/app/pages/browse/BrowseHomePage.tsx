import MenuPage from "@app2/components/MenuPage";

export default function BrowseHomePage() {
  const items = [
    {
      title: "기준정보 조회",
      to: "/browse/master",
      lines: ["거래처/차량 등", "검색/상세"],
    },
    {
      title: "일일기록 조회",
      to: "/browse/daily",
      lines: ["유통/생산/사무/회계", "검색/리스트"],
    },
    {
      title: "단가 조회",
      to: "/browse/price",
      lines: ["전체 최저/최고/평균", "월별 변동폭", "거래처별 이벤트"],
    },
    {
      title: "물량/자금 추세",
      to: "/browse/weighing-trend",
      lines: ["최근 30일 물량 추세", "매입/매출 금액 흐름", "일별 순현금흐름"],
    },
  ];

  return (
    <MenuPage title="조회" description="조회할 데이터 유형을 선택하세요." items={items} />
  );
}
