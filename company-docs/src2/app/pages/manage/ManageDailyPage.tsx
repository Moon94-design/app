import MenuPage from "@app2/components/MenuPage";

export default function ManageDailyPage() {
  const items = [
    {
      title: "유통기록 관리",
      to: "/manage/daily/logistics",
      lines: ["계량현황에서 자동 생성된 일자별 유통기록 조회/수정"],
    },
    {
      title: "생산기록 관리",
      to: "/manage/daily/production",
      lines: ["생산일지 문서(legacy 포함) 조회/삭제"],
    },
    {
      title: "이슈 관리",
      to: "/manage/daily/issue",
      lines: ["이슈 문서 조회/삭제"],
    },
    {
      title: "조치 관리",
      to: "/manage/daily/action",
      lines: ["조치 문서 조회/삭제"],
    },
  ];

  return (
    <MenuPage title="일일기록 관리" description="관리할 일일기록을 선택하세요." items={items} />
  );
}
