import { Link } from "react-router-dom";

export default function BrowseHome() {
  return (
    <div className="subMenuWrap">
      <div className="subMenuGrid">
        <Link to="/browse/master" className="subMenuBtn">
          <div className="subMenuTitle">기준정보 조회</div>
          <ul className="subMenuList">
            <li>거래처/차량 등</li>
            <li>검색/상세</li>
          </ul>
        </Link>

        <Link to="/browse/daily" className="subMenuBtn">
          <div className="subMenuTitle">일일기록 조회</div>
          <ul className="subMenuList">
            <li>유통/생산/사무/회계</li>
            <li>검색/리스트</li>
          </ul>
        </Link>

        <Link to="/browse/price" className="subMenuBtn">
          <div className="subMenuTitle">단가 조회</div>
          <ul className="subMenuList">
            <li>전체 최저/최고/평균</li>
            <li>월별 변동폭</li>
            <li>거래처별 이벤트</li>
          </ul>
        </Link>

        <Link to="/browse/weighing-trend" className="subMenuBtn">
          <div className="subMenuTitle">물량/자금 추세</div>
          <ul className="subMenuList">
            <li>최근 30일 물량 추세</li>
            <li>매입/매출 금액 흐름</li>
            <li>일별 순현금흐름</li>
          </ul>
        </Link>
      </div>
    </div>
  );
}
