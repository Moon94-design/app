import { Link } from "react-router-dom";

export default function RegisterDaily() {
  return (
    <div className="subMenuWrap">
      <div className="subMenuGrid">
        <Link to="/register/daily/logistics" className="subMenuBtn">
          <div className="subMenuTitle">유통 기록</div>
          <ul className="subMenuList">
            <li>거래처/차량/단가/수량</li>
            <li>저장 → 단가 이벤트 자동 누적</li>
          </ul>
        </Link>

        <Link to="/register/daily/office" className="subMenuBtn">
          <div className="subMenuTitle">사무 기록</div>
          <ul className="subMenuList">
            <li>지부 필수</li>
            <li>복수 업무 입력</li>
            <li>관계기관/지원사업은 하단 체크</li>
          </ul>
        </Link>

        <Link to="/register/daily/production" className="subMenuBtn">
          <div className="subMenuTitle">생산 기록</div>
          <ul className="subMenuList">
            <li>생산수량: 자루</li>
            <li>주간/오후/야간 + 자유입력</li>
            <li>불량/이상 → 고장 이벤트 저장</li>
          </ul>
        </Link>

        <div className="subMenuBtn" style={{ opacity: 0.55 }}>
          <div className="subMenuTitle">회계 기록</div>
          <ul className="subMenuList"><li>다음 단계</li></ul>
        </div>
      </div>
    </div>
  );
}
