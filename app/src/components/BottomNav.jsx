const ITEMS = [
  { id: 'home', icon: '🔍', label: '홈' },
  { id: 'cart', icon: '🛒', label: '장바구니' },
  { id: 'fridge', icon: '🧊', label: '냉장고' },
];

export default function BottomNav({ page, onNavigate, counts = {} }) {
  return (
    <nav className="bottom-nav">
      {ITEMS.map((item) => {
        const count = counts[item.id] || 0;
        return (
          <button
            key={item.id}
            className={`bottom-nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="icon-wrap">
              <span className="icon">{item.icon}</span>
              {count > 0 && <span className="nav-badge">{count > 99 ? '99+' : count}</span>}
            </span>
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}
