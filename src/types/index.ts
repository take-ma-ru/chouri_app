// ============================================================
// 型定義 - Kitchen Note
// ============================================================

/** アイテム種別: 食材 or 調味料 */
export type ItemType = 'food' | 'seasoning';

/** 食材カテゴリ */
export type IngredientCategory = '野菜' | '肉' | '魚' | '乳製品' | 'その他';

/** 調味料カテゴリ */
export type SeasoningCategory = '塩・砂糖' | '醤油・みりん' | 'スパイス' | 'ソース・ドレッシング' | 'その他調味料';

/** 食材 */
export interface Ingredient {
  id: string;
  name: string;
  itemType: ItemType;
  category: IngredientCategory | SeasoningCategory;
  memo?: string;
  createdAt: number;
}

/** 調理器具 */
export type CookingTool = 'フライパン' | '鍋' | '電子レンジ';

/** 調理器具情報 */
export interface CookingToolInfo {
  key: CookingTool;
  emoji: string;
  description: string;
}

/** レシピ提案 */
export interface RecipeSuggestion {
  id: string;
  name: string;
  emoji: string;
  cookingTime: number; // 分
  difficulty: '簡単' | '普通' | '難しい';
  tool: CookingTool;
  ingredients: RecipeIngredient[];
  steps: RecipeStep[];
}

/** レシピで使う食材 */
export interface RecipeIngredient {
  name: string;
  amount: string;
  isOwned: boolean; // 手持ちかどうか
  itemType: 'food' | 'seasoning'; // 食材 or 調味料
}

/** 調理手順 */
export interface RecipeStep {
  stepNumber: number;
  description: string;
  tip?: string;
}

/** 買い物リストアイテム */
export interface ShoppingItem {
  id: string;
  name: string;
  itemType?: ItemType;
  category: IngredientCategory | SeasoningCategory;
  checked: boolean;
  addedAt: number;
  fromIngredientId?: string; // 食材管理から追加された場合
}

// ============================================================
// ナビゲーション型
// ============================================================
export type RootStackParamList = {
  ApiSetup: undefined;
  Home: undefined;
  IngredientList: undefined;
  AddIngredient: { editIngredient?: Ingredient; defaultItemType?: ItemType };
  IngredientSelect: undefined;
  CookingToolSelect: { selectedIngredientIds: string[] };
  RecipeSuggest: { selectedIngredientIds: string[]; selectedTool: CookingTool };
  RecipeDetail: { recipe: RecipeSuggestion };
  ShoppingList: undefined;
};
