export default function LoginModal({ onLogin, onClose }) {
  return (
    <div className="modal-backdrop center" onClick={onClose}>
      <div className="login-card" onClick={(e) => e.stopPropagation()}>
        <p className="section-title" style={{ marginBottom: 4 }}>로그인이 필요해요</p>
        <p>냉장고 담기, 레시피, 요리완료는 회원 전용 기능이에요</p>
        <button className="login-btn kakao" onClick={onLogin}>카카오로 시작하기</button>
        <button className="login-btn google" onClick={onLogin}>구글로 시작하기</button>
      </div>
    </div>
  );
}
