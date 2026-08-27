import { INGREDIENTS } from './data.js';

const API_BASE = 'https://recipe-server-aagb.onrender.com';

function extractMainIngredients(text) {
  // 재료 표기가 자유 서술형이라 쉼표/괄호/공백 등으로 토큰을 나눠 확인한다.
  // "무"처럼 한 글자짜리 이름은 "무염버터"처럼 무관한 단어에 우연히 포함될 수 있어
  // 토큰과 완전히 같을 때만 인정하고, 두 글자 이상은 부분 포함(예: "연두부" ⊃ "두부")까지 인정한다.
  const tokens = text.split(/[\s,()·|/]+/);
  const found = [];
  for (const ing of INGREDIENTS) {
    const matched = ing.name.length === 1
      ? tokens.some((t) => t === ing.name)
      : tokens.some((t) => t.includes(ing.name));
    if (matched && !found.includes(ing.id)) {
      found.push(ing.id);
    }
  }
  return found;
}

// 식약처 "조리식품의 레시피 DB"를 백엔드(server/) 프록시를 통해 불러온다.
// 재료 텍스트는 자유 서술형이라, 우리 재료마스터(INGREDIENTS)에 있는 이름이
// 문장에 포함되는지로 mainIngredients를 추정한다 (PRD 7.3의 매칭 한계 참고).
// 인식된 재료가 2개 미만이면 일치율 계산이 무의미해 목록에서 제외한다.
export async function fetchExternalRecipes(end = 50) {
  try {
    const res = await fetch(`${API_BASE}/api/recipes?start=1&end=${end}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return [];
    const rows = await res.json();
    return rows
      .map((r) => ({
        id: `mfds-${r.id}`,
        name: r.name,
        emoji: '🍽️',
        imageUrl: r.imageUrl || null,
        mainIngredients: extractMainIngredients(r.ingredientsText),
        steps: r.steps.join('\n'),
      }))
      .filter((r) => r.mainIngredients.length >= 2);
  } catch {
    return [];
  }
}
