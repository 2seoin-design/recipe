import { useMemo, useState } from 'react';
import { INGREDIENTS } from '../data.js';
import { dDay } from '../storage.js';

const byId = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));
const MATCH_THRESHOLD = 0.7;
const PAGE_SIZE = 10;

export default function Fridge({ fridge, recipes, favorites, toggleFavorite, onOpenRecipe }) {
  const [query, setQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const fridgeIds = useMemo(() => new Set(fridge.map((f) => f.id)), [fridge]);

  const rows = useMemo(() => {
    return fridge
      .map((f) => ({ ...f, info: byId[f.id] }))
      .filter((f) => f.info && f.info.name.includes(query.trim()))
      .sort((a, b) => (b.cartCount || 0) - (a.cartCount || 0));
  }, [fridge, query]);

  const recommended = useMemo(() => {
    return recipes.map((r) => {
      const have = r.mainIngredients.filter((id) => fridgeIds.has(id));
      const match = have.length / r.mainIngredients.length;
      return { ...r, match, missing: r.mainIngredients.length - have.length };
    })
      .filter((r) => r.match >= MATCH_THRESHOLD)
      .sort((a, b) => b.match - a.match);
  }, [recipes, fridgeIds]);

  return (
    <div className="page fridge-page" style={{ margin: '-16px', padding: '16px 16px 88px' }}>
      <div className="search-bar-wrap">
        <input
          className="search-input"
          placeholder="🔍 냉장고 안에서 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <h1 className="page-title">나만의 냉장고</h1>

      {rows.length === 0 && (
        <div className="empty-state">
          <div className="emoji">🧊</div>
          냉장고가 비어있어요
        </div>
      )}

      {rows.map((row) => {
        const days = dDay(row.addedAt, row.info.shelfLifeDays);
        const urgent = days <= 2;
        return (
          <div className="fridge-row" key={row.id}>
            <div className="fridge-row-top">
              <span className="card-title" style={{ margin: 0 }}>{row.info.emoji} {row.info.name}</span>
              <span className={urgent ? 'badge badge-danger' : 'badge'}>
                {urgent && '⚠ '}D-{days}
              </span>
            </div>
            {urgent && <p className="fridge-warning">⚠ 재료가 상할수도 있어요!</p>}
          </div>
        );
      })}

      <hr style={{ border: 'none', borderTop: '1px solid var(--babyblue-400)', margin: '24px 0 16px' }} />
      <h2 className="section-title">냉장고로 만들 수 있는 레시피</h2>

      {recommended.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">🍳</div>
          추천 레시피가 없습니다
        </div>
      ) : (
        <>
          <div className="recipe-grid">
            {recommended.slice(0, visibleCount).map((r) => (
              <button className="recipe-card" key={r.id} onClick={() => onOpenRecipe(r.id)}>
                <div
                  className="recipe-card-image"
                  style={r.imageUrl ? { backgroundImage: `url(${r.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
                >
                  {!r.imageUrl && r.emoji}
                  <span className="badge badge-match recipe-card-match">
                    일치율 {Math.round(r.match * 100)}%
                  </span>
                  <button
                    className="recipe-card-fav"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(r.id);
                    }}
                  >
                    {favorites.includes(r.id) ? '★' : '☆'}
                  </button>
                </div>
                <div className="recipe-card-body">
                  <p className="recipe-card-name">{r.name}</p>
                  <p className="recipe-card-caption">
                    {r.missing > 0 ? `부족한 재료 ${r.missing}개` : '바로 만들 수 있어요'}
                  </p>
                </div>
              </button>
            ))}
          </div>
          {visibleCount < recommended.length && (
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <button className="btn btn-outline" onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}>
                레시피 더보기
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
