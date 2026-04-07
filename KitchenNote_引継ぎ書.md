# KitchenNote プロジェクト 引継ぎ書

**作成日**: 2026-04-07
**プロジェクト名**: Kitchen Note（キッチンノート）
**状態**: ✅ 調味料機能・レシピ改善 完了

---

## 📋 これまでの作業内容

### 1. Expo SDK 54 マイグレーション完了（前回）
- **旧環境**: `/Users/wonder/Claude Code/KitchenNote/`（SDK 50→54のバージョン不一致でエラー多発）
- **新環境**: `/Users/wonder/Claude Code/KitchenNoteV2/`（クリーン環境で再構築）

### 2. 調味料機能の追加（今回）
✅ **Expo Go で Android で動作確認済み**

---

## 🗂️ プロジェクト構成

```
/Users/wonder/Claude Code/KitchenNoteV2/
├── src/
│   ├── types/
│   │   └── index.ts                      ← 型定義（ItemType・SeasoningCategory追加済み）
│   ├── navigation/
│   │   └── AppNavigator.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx                ← 食材・調味料の件数を分けて表示
│   │   ├── ingredients/
│   │   │   ├── IngredientListScreen.tsx  ← 食材／調味料タブ切り替え対応済み
│   │   │   └── AddIngredientScreen.tsx   ← 食材／調味料の種別選択対応済み
│   │   ├── cooking/
│   │   │   ├── IngredientSelectScreen.tsx ← 食材のみ表示（調味料を除外済み）
│   │   │   ├── CookingToolSelectScreen.tsx
│   │   │   ├── RecipeSuggestScreen.tsx   ← 登録調味料をレシピ提案に反映
│   │   │   └── RecipeDetailScreen.tsx    ← 手持ち調味料／未登録調味料を区別表示
│   │   └── shopping/
│   │       └── ShoppingListScreen.tsx
│   ├── store/
│   │   ├── ingredientStore.ts            ← itemType対応・getByItemType追加
│   │   └── shoppingStore.ts
│   └── utils/
│       └── recipeGenerator.ts            ← レシピ18件・ランダム化対応
├── App.tsx
├── app.json
├── KitchenNote_引継ぎ書.md               ← このファイル
└── package.json
```

---

## 🔧 型定義の変更点（src/types/index.ts）

```typescript
/** アイテム種別 */
export type ItemType = 'food' | 'seasoning';

/** 食材カテゴリ */
export type IngredientCategory = '野菜' | '肉' | '魚' | '乳製品' | 'その他';

/** 調味料カテゴリ */
export type SeasoningCategory = '塩・砂糖' | '醤油・みりん' | 'スパイス' | 'ソース・ドレッシング' | 'その他調味料';

/** 食材（食材と調味料を兼ねる） */
export interface Ingredient {
  id: string;
  name: string;
  itemType: ItemType;          // ← 追加
  category: IngredientCategory | SeasoningCategory;
  memo?: string;
  createdAt: number;
}

/** レシピで使う食材 */
export interface RecipeIngredient {
  name: string;
  amount: string;
  isOwned: boolean;
  itemType: 'food' | 'seasoning';  // ← 追加
}
```

---

## 🍳 レシピデータベース（src/utils/recipeGenerator.ts）

各調理器具につき **6件** のレシピを収録（計18件）。

| 調理器具 | レシピ |
|----------|--------|
| フライパン | 照り焼き・塩炒め・卵とじ丼・オムレツ・バター炒め・ポン酢炒め |
| 鍋 | 肉じゃが・中華スープ・スープカレー・豚汁・ミルクスープ・和風スープ |
| 電子レンジ | 茶碗蒸し・蒸し鶏・麻婆風・じゃがバター・豚バラ蒸し・コーンスープ風 |

**レシピ提案ロジック**:
- 選んだ食材の「必要食材」マッチ数でスコアリング
- 同スコアはランダム順で表示
- 6件表示し終えたら最初に戻る（ループ）
- 登録済み調味料は `isOwned: true` でマーク

---

## 📦 インストール済み依存パッケージ

```json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.1.0",
    "@react-navigation/native": "^6.1.9",
    "@react-navigation/native-stack": "^6.9.17",
    "expo": "~54.0.0",
    "expo-status-bar": "~2.2.0",
    "react": "18.3.1",
    "react-native": "0.76.7",
    "react-native-safe-area-context": "4.12.0",
    "react-native-screens": "~4.4.0",
    "zustand": "^4.5.1"
  }
}
```

---

## 🚀 アプリ起動方法

```bash
cd "/Users/wonder/Claude Code/KitchenNoteV2"
npx expo start
```

起動後、Android の Expo Go アプリで QR コードをスキャン。

---

## 🎯 次のタスク候補

### 「レシピ提案をAI（Gemini API）に置き換える」

**背景**: 現在はローカルの固定レシピ18件から提案しているが、種類が限られる。
Gemini APIには**無料枠**があり、アプリからAPIを呼び出してレシピを動的に生成できる。

**実装予定箇所**:
- `src/utils/recipeGenerator.ts` — API呼び出しに置き換え（構造はすでにAPI想定で設計済み）
- `src/screens/cooking/RecipeSuggestScreen.tsx` — ローディング表示はすでに実装済み

**実装の流れ（予定）**:
1. Gemini API キーを取得（Google AI Studio で無料取得可能）
2. `expo-constants` や `.env` でAPIキーを管理
3. `fetch()` で Gemini API に食材・調味料リストを送信
4. レスポンスをパースして `RecipeSuggestion[]` 型に変換
5. エラー時はローカルレシピにフォールバック

**参考プロンプト例（Gemini への送信内容）**:
```
以下の食材と調味料で作れる料理を3つ提案してください。
【食材】鶏むね肉、キャベツ、卵
【調味料】醤油、みりん、塩
【調理器具】フライパン
以下のJSON形式で返してください：...
```

---

## 📝 注意事項

- **AsyncStorage**: 食材・調味料データは端末に自動保存。手動保存不要。
- **ホットリロード**: `npx expo start` 起動中はコード保存で自動反映。
- **itemType必須**: 新しく食材/調味料を追加する際は必ず `itemType: 'food'` または `'seasoning'` をセットすること。
- **TypeScript チェック**: 変更後は `npx tsc --noEmit` でエラーがないか確認する。

---

**次のセッション開始時**:
上記「次のタスク候補」の Gemini API 連携から着手してください！
