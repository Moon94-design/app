import { Link } from "react-router-dom";

export default function ManageHome() {
  return (
    <div className="subMenuWrap">
      <div className="subMenuGrid">
        <Link to="/manage/master" className="subMenuBtn">
          <div className="subMenuTitle">기준정보 관리</div>
          <ul className="subMenuList">
            <li>레코드 수정</li>
            <li>변경 이력/버전</li>
            <li>비활성/정리</li>
          </ul>
        </Link>

        <Link to="/manage/daily" className="subMenuBtn">
          <div className="subMenuTitle">일일기록 관리</div>
          <ul className="subMenuList">
            <li>작성/수정</li>
            <li>보내기(버전 생성)</li>
            <li>상태 변경(처리중/완료)</li>
          </ul>
        </Link>
      </div>
    </div>
  );
}
