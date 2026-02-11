import MenuPage from "@app2/components/MenuPage";

export default function ManageHomePage() {
  const items = [
    {
      title: "기준정보 관리",
      to: "/manage/master",
      lines: ["레코드 수정", "변경 이력/버전", "비활성/정리"],
    },
    {
      title: "일일기록 관리",
      to: "/manage/daily",
      lines: ["작성/수정", "보내기(버전 생성)", "상태 변경(처리중/완료)"],
    },
  ];

  return (
    <MenuPage title="관리" description="관리할 영역을 선택하세요." items={items} />
  );
}
