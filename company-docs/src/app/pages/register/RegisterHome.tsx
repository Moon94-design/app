import { Link } from "react-router-dom";

export default function RegisterHome() {
  return (
    <div className="subMenuWrap">
      <div className="subMenuGrid">
        <Link to="/register/master" className="subMenuBtn">
          <div className="subMenuTitle">기준정보 등록</div>
          <ul className="subMenuList">
            <li>거래처</li>
            <li>차량/운송 리소스</li>
            <li>품목/단가</li>
            <li>설비/라인/코드북</li>
          </ul>
        </Link>

        <Link to="/register/daily" className="subMenuBtn">
          <div className="subMenuTitle">일일기록 등록</div>
          <ul className="subMenuList">
            <li>생산</li>
            <li>유통(입고/출고/재고)</li>
            <li>사무</li>
            <li>회계</li>
          </ul>
        </Link>
      </div>
    </div>
  );
}
