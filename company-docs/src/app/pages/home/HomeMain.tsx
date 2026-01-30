import { Link } from "react-router-dom";

export default function HomeMain() {
  return (
    <div className="subMenuWrap">
      <div className="subMenuGrid">
        <Link to="/register" className="subMenuBtn">
          <div className="subMenuTitle">등록</div>
          <ul className="subMenuList">
            <li>기준정보 등록</li>
            <li>일일기록 등록</li>
          </ul>
        </Link>

        <Link to="/manage" className="subMenuBtn">
          <div className="subMenuTitle">관리</div>
          <ul className="subMenuList">
            <li>기준정보 관리</li>
            <li>일일기록 관리</li>
          </ul>
        </Link>

        <Link to="/browse" className="subMenuBtn">
          <div className="subMenuTitle">조회</div>
          <ul className="subMenuList">
            <li>검색 / 리스트 / 리포트</li>
            <li>인쇄(PDF 저장은 인쇄 창)</li>
          </ul>
        </Link>
      </div>
    </div>
  );
}
