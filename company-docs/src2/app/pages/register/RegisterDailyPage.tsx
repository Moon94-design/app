import MenuPage from "@app2/components/MenuPage";

export default function RegisterDailyPage() {
  const items = [
    {
      title: "유통 기록",
      to: "/register/daily/logistics",
      lines: ["거래처/차량/단가/수량", "저장 → 단가 이벤트 자동 누적"],
    },
    {
      title: "사무 기록",
      to: "/register/daily/office",
      lines: ["지부 필수", "복수 업무 입력", "관계기관/지원사업은 하단 체크"],
    },
    {
      title: "생산 기록",
      to: "/register/daily/production",
      lines: ["생산수량: 자루", "주간/오후/야간 + 자유입력", "불량/이상 → 고장 이벤트 저장"],
    },
    {
      title: "이슈 기록",
      to: "/register/daily/issue",
      lines: ["품질/설비/안전 분류", "직원/설비 연계", "태그 기능 포함"],
    },
    {
      title: "조치 기록",
      to: "/register/daily/action",
      lines: ["이슈 연계", "정비업체/비용", "태그 기능 포함"],
    },
    {
      title: "회계 기록",
      lines: ["다음 단계"],
      disabled: true,
    },
  ];

  return (
    <MenuPage title="일일기록 등록" description="등록할 기록 유형을 선택하세요." items={items} />
  );
}
