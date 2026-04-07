/**
 * Gemini API を使ったレシピ生成ユーティリティ
 * ユーザー自身のAPIキー（BYOK）で呼び出す
 */

import { RecipeSuggestion, CookingTool, Ingredient } from '../types';

// gemini-2.5-flash: 無料枠が余裕あり・高性能
const GEMINI_API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// ---------- エラークラス ----------

export class GeminiApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    /** 401/403/400(API_KEY_INVALID) → true */
    public readonly isAuthError: boolean = false,
    /** 429 → true */
    public readonly isRateLimitError: boolean = false,
  ) {
    super(message);
    this.name = 'GeminiApiError';
  }
}

// ---------- メイン関数 ----------

/**
 * Gemini API でレシピを3品提案する
 * @param selectedIngredients ユーザーが選んだ食材
 * @param ownedSeasonings 登録済み調味料リスト
 * @param tool 調理器具
 * @param apiKey ユーザーの Gemini API キー
 * @param excludeRecipeNames 除外するレシピ名（再提案時）
 */
export async function generateRecipesWithGemini(
  selectedIngredients: Ingredient[],
  ownedSeasonings: Ingredient[],
  tool: CookingTool,
  apiKey: string,
  excludeRecipeNames: string[] = [],
): Promise<RecipeSuggestion[]> {
  const foods = selectedIngredients.map(i => i.name);
  const seasonings = ownedSeasonings.map(i => i.name);

  const excludeText =
    excludeRecipeNames.length > 0
      ? `\n【除外する料理名（この料理は提案しないこと）】${excludeRecipeNames.join('、')}`
      : '';

  const prompt = `あなたは家庭料理のアシスタントです。以下の材料と調理器具で作れる料理を3品提案してください。

【手持ち食材】${foods.length > 0 ? foods.join('、') : 'なし'}
【手持ち調味料】${seasonings.length > 0 ? seasonings.join('、') : '基本調味料のみ（塩・こしょう・醤油程度）'}
【調理器具】${tool}${excludeText}

以下のJSON配列のみで回答してください（説明文・前置き・コードブロックは不要）：
[
  {
    "id": "recipe_1",
    "name": "料理名",
    "emoji": "料理に合う絵文字1つ",
    "cookingTime": 20,
    "difficulty": "簡単",
    "tool": "${tool}",
    "ingredients": [
      {"name": "食材名", "amount": "分量", "isOwned": true, "itemType": "food"},
      {"name": "調味料名", "amount": "大さじ1", "isOwned": true, "itemType": "seasoning"}
    ],
    "steps": [
      {"stepNumber": 1, "description": "手順の説明", "tip": null}
    ]
  }
]

ルール：
- difficulty は必ず "簡単"、"普通"、"難しい" のいずれか
- isOwned は手持ちリストにある場合 true、ない場合 false
- cookingTime は整数（分）
- id は "recipe_1"、"recipe_2"、"recipe_3" とする
- 全3品を必ず返す
- tipが特にない場合は null`;

  let response: Response;
  try {
    response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.85,
        },
      }),
    });
  } catch (networkError) {
    throw new GeminiApiError('ネットワークエラーが発生しました。接続を確認してください。');
  }

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '');
    // API キー無効判定
    const isAuth =
      response.status === 401 ||
      response.status === 403 ||
      (response.status === 400 && errorBody.includes('API_KEY'));
    const isRateLimit = response.status === 429;
    throw new GeminiApiError(
      `APIエラー (${response.status})`,
      response.status,
      isAuth,
      isRateLimit,
    );
  }

  const data = await response.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new GeminiApiError('APIからの応答が空でした');
  }

  // JSON 抽出（念のためマークダウン記法を除去）
  let cleanText = text.trim();
  const codeBlockMatch = cleanText.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) cleanText = codeBlockMatch[1].trim();
  const arrayMatch = cleanText.match(/\[[\s\S]*\]/);
  if (arrayMatch) cleanText = arrayMatch[0];

  let raw: any[];
  try {
    raw = JSON.parse(cleanText);
  } catch {
    throw new GeminiApiError('APIレスポンスのJSON解析に失敗しました');
  }

  // 正規化（型が崩れていても安全に処理）
  return raw.slice(0, 3).map((r, index): RecipeSuggestion => ({
    id: typeof r.id === 'string' ? r.id : `gemini_${Date.now()}_${index}`,
    name: typeof r.name === 'string' ? r.name : '料理名不明',
    emoji: typeof r.emoji === 'string' ? r.emoji : '🍽️',
    cookingTime: typeof r.cookingTime === 'number' ? Math.round(r.cookingTime) : 20,
    difficulty: (['簡単', '普通', '難しい'] as const).includes(r.difficulty)
      ? r.difficulty
      : '普通',
    tool: tool,
    ingredients: Array.isArray(r.ingredients)
      ? r.ingredients.map((ing: any) => ({
          name: typeof ing.name === 'string' ? ing.name : '',
          amount: typeof ing.amount === 'string' ? ing.amount : '適量',
          isOwned: Boolean(ing.isOwned),
          itemType: ing.itemType === 'seasoning' ? ('seasoning' as const) : ('food' as const),
        }))
      : [],
    steps: Array.isArray(r.steps)
      ? r.steps.map((s: any, i: number) => ({
          stepNumber: typeof s.stepNumber === 'number' ? s.stepNumber : i + 1,
          description: typeof s.description === 'string' ? s.description : '',
          tip: s.tip != null && typeof s.tip === 'string' ? s.tip : undefined,
        }))
      : [],
  }));
}
