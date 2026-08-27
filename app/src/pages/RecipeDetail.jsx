import { useMemo, useState } from 'react';
import { INGREDIENTS } from '../data.js';

const byId = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

export default function RecipeDetail({ recipeId, recipes, fridge, setFridge, favorites, toggleFavorite, onBack }) {
  const recipe = recipes.find((r) => r.id === recipeId);
  const fridgeIds = useMemo(() => new Set(fridge.map((f) => f.id)), [fridge]);
  const [showSheet, setShowSheet] = useState(false);
  const [choices, setChoices] = useState({});

  if (!recipe) return null;

  const usedIngredients = recipe.mainIngredients.filter((id) => fridgeIds.has(id));
  const allChosen = usedIngredients.every((id) => choices[id]);

  const openSheet = () => {
    setChoices({});
    setShowSheet(true);
  };

  const applySheet = () => {
    setFridge((prev) => {
      let next = [...prev];
      usedIngredients.forEach((id) => {
        const choice = choices[id];
        if (choice === 'consume') {
          next = next.filter((f) => f.id !== id);
        } else if (choice === 'modify') {
          next = next
            .map((f) => (f.id === id ? { ...f, qty: f.qty - 1 } : f))
            .filter((f) => f.qty > 0);
        }
      });
      return next;
    });
    setShowSheet(false);
  };

  return (
    <div className="page" style={{ paddingBottom: 96 }}>
      <div
        className="detail-hero"
        style={recipe.imageUrl ? { backgroundImage: `url(${recipe.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
      >
        {!recipe.imageUrl && recipe.emoji}
      </div>

      <div className="sticky-ingredient-bar">
        {recipe.mainIngredients.map((id) => (
          <span key={id} className={`chip ${fridgeIds.has(id) ? 'active' : 'missing'}`}>
            {byId[id].emoji} {byId[id].name}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
        <h1 className="page-title" style={{ margin: 0 }}>{recipe.name}</h1>
        <button
          onClick={() => toggleFavorite(recipe.id)}
          style={{ background: 'none', border: 'none', fontSize: 26, cursor: 'pointer', color: 'var(--mint-500)' }}
        >
          {favorites.includes(recipe.id) ? '★' : '☆'}
        </button>
      </div>

      <div className="detail-body">{recipe.steps}</div>

      <div className="cta-bar">
        <button className="btn btn-primary btn-full" onClick={openSheet}>요리완료</button>
      </div>

      {showSheet && (
        <div className="modal-backdrop" onClick={() => setShowSheet(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <p className="sheet-title">재료를 수정하시겠습니까?</p>
            {usedIngredients.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--ink-500)', fontSize: 14 }}>
                냉장고에 있는 사용 재료가 없어요
              </p>
            )}
            {usedIngredients.map((id) => (
              <div className="sheet-row" key={id}>
                <span className="card-title" style={{ margin: 0 }}>{byId[id].emoji} {byId[id].name}</span>
                <div className="segmented">
                  <button
                    className={choices[id] === 'modify' ? 'chosen' : ''}
                    onClick={() => setChoices((c) => ({ ...c, [id]: 'modify' }))}
                  >
                    용량 수정
                  </button>
                  <button
                    className={choices[id] === 'consume' ? 'chosen' : ''}
                    onClick={() => setChoices((c) => ({ ...c, [id]: 'consume' }))}
                  >
                    소진
                  </button>
                </div>
              </div>
            ))}
            <button
              className="btn btn-primary btn-full"
              style={{ marginTop: 16 }}
              disabled={usedIngredients.length > 0 && !allChosen}
              onClick={applySheet}
            >
              완료
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
