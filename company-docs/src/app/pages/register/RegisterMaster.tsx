import { Link } from "react-router-dom";

export default function RegisterMaster() {
  return (
    <div className="subMenuWrap">
      <div className="subMenuGrid">
        <Link to="/register/master/partner" className="subMenuBtn">
          <div className="subMenuTitle">거래처 등록</div>
          <ul className="subMenuList">
            <li>주소</li>
            <li>담당자/차량 연결</li>
            <li>초기 단가(원/Kg)</li>
          </ul>
        </Link>

        <Link to="/register/master/vehicle" className="subMenuBtn">
          <div className="subMenuTitle">차량 등록</div>
          <ul className="subMenuList">
            <li>차량번호</li>
            <li>운송사/기사 연락처</li>
          </ul>
        </Link>

        <Link to="/register/master/vendor" className="subMenuBtn">
          <div className="subMenuTitle">정비/서비스 업체 등록</div>
          <ul className="subMenuList">
            <li>기계/전기/통신/소모품/정비/기타</li>
            <li>지역/연락처</li>
          </ul>
        </Link>

        <Link to="/register/master/agency" className="subMenuBtn">
          <div className="subMenuTitle">관계기관 등록</div>
          <ul className="subMenuList">
            <li>업무범위(항목별 설명)</li>
            <li>지역/연락처</li>
          </ul>
        </Link>

        <Link to="/register/master/employee" className="subMenuBtn">
          <div className="subMenuTitle">직원 등록</div>
          <ul className="subMenuList">
            <li>이름/지부/연락처</li>
            <li>직무(자유기입)</li>
          </ul>
        </Link>

        <Link to="/register/master/equipment" className="subMenuBtn">
          <div className="subMenuTitle">설비 등록</div>
          <ul className="subMenuList">
            <li>설비 기본정보</li>
            <li>점검 주기(선택+자유)</li>
            <li>소모품 추가(소모품 등록에 자동 반영)</li>
          </ul>
        </Link>

        <Link to="/register/master/consumable" className="subMenuBtn">
          <div className="subMenuTitle">소모품 등록</div>
          <ul className="subMenuList">
            <li>설비 연계해서 등록</li>
            <li>설비에서 추가된 소모품도 여기 목록에 쌓임</li>
          </ul>
        </Link>
      </div>
    </div>
  );
}
