import MenuPage from "@app2/components/MenuPage";

export default function RegisterHomePage() {
  const items = [
    {
      title: "기준정보 등록",
      to: "/register/master",
      lines: ["거래처", "차량/운송 리소스", "품목/단가", "설비/라인/코드북"],
    },
    {
      title: "일일기록 등록",
      to: "/register/daily",
      lines: ["생산", "유통(입고/출고/재고)", "사무", "회계"],
    },
  ];

  return (
    <MenuPage title="등록" description="등록할 작업 유형을 선택하세요." items={items} />
  );
}
