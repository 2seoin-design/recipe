import { useMemo, useState } from 'react';
import { INGREDIENTS } from '../data.js';

const byId = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

export default function Cart({ cart, setCart, isLoggedIn, requireLogin, onCheckout }) {
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    return cart
      .map((c) => ({ ...c, info: byId[c.id] }))
      .filter((c) => c.info && c.info.name.includes(query.trim()))
      .sort((a, b) => a.info.name.localeCompare(b.info.name, 'ko'));
  }, [cart, query]);

  const changeQty = (id, delta) => {
    setCart((prev) => {
      const next = prev
        .map((c) => (c.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0);
      return next;
    });
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      requireLogin();
      return;
    }
    onCheckout();
  };

  return (
    <div className="page" style={{ paddingBottom: 96 }}>
      <div className="search-bar-wrap">
        <input
          className="search-input"
          placeholder="🔍 장바구니 안에서 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <h1 className="page-title">장바구니</h1>

      {rows.length === 0 && (
        <div className="empty-state">
          <div className="emoji">🛒</div>
          장바구니가 비어있어요
        </div>
      )}

      {rows.map((row) => (
        <div className="card" key={row.id}>
          <div
            className="card-thumb"
            style={row.info.imageUrl ? { backgroundImage: `url(${row.info.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            {!row.info.imageUrl && row.info.emoji}
          </div>
          <div className="card-info">
            <p className="card-title">{row.info.name}</p>
            <p className="card-sub">{row.info.unit} · {row.info.price.toLocaleString()}원</p>
          </div>
          <div className="stepper">
            <button onClick={() => changeQty(row.id, -1)}>-</button>
            <span>{row.qty}</span>
            <button onClick={() => changeQty(row.id, 1)}>+</button>
          </div>
        </div>
      ))}

      <div className="cta-bar">
        <button className="btn btn-primary btn-full" disabled={cart.length === 0} onClick={handleCheckout}>
          구매완료
        </button>
      </div>
    </div>
  );
}
