import { useMemo, useState } from 'react';
import { INGREDIENTS } from '../data.js';

export default function Home({ isLoggedIn, onAddToCart, onAddToFridge, requireLogin }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return INGREDIENTS;
    return INGREDIENTS.filter((i) => i.name.includes(q));
  }, [query]);

  const suggestions = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return INGREDIENTS.filter((i) => i.name.startsWith(q)).slice(0, 5);
  }, [query]);

  return (
    <div className="page">
      <div className="search-bar-wrap">
        <input
          className="search-input"
          placeholder="🔍 재료 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {suggestions.length > 0 && query && (
          <div className="autocomplete">
            {suggestions.map((s) => (
              <div key={s.id} className="autocomplete-item" onClick={() => setQuery(s.name)}>
                {s.name}
              </div>
            ))}
          </div>
        )}
      </div>

      <h1 className="page-title">재료 검색</h1>

      {results.length === 0 && (
        <div className="empty-state">
          <div className="emoji">🔍</div>
          검색 결과가 없어요
        </div>
      )}

      {results.map((item) => (
        <div className="card" key={item.id}>
          <div
            className="card-thumb"
            style={item.imageUrl ? { backgroundImage: `url(${item.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            {!item.imageUrl && item.emoji}
          </div>
          <div className="card-info">
            <p className="card-title">{item.name}</p>
            <p className="card-sub">{item.unit} · {item.price.toLocaleString()}원</p>
          </div>
          <div className="btn-row">
            <button className="btn btn-outline" onClick={() => onAddToCart(item.id)}>장바구니</button>
            <button
              className="btn btn-primary"
              onClick={() => (isLoggedIn ? onAddToFridge(item.id) : requireLogin())}
            >
              냉장고
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
