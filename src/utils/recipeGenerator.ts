import { RecipeSuggestion, CookingTool, Ingredient } from '../types';

/**
 * 食材と調理器具に基づいてレシピを生成するモジュール
 * 実際のプロダクトではAI APIを呼び出す
 * ここではローカルのレシピデータベースからマッチングする
 */

interface RecipeTemplate {
  name: string;
  emoji: string;
  cookingTime: number;
  difficulty: '簡単' | '普通' | '難しい';
  tool: CookingTool;
  requiredIngredients: string[];
  optionalIngredients: string[];
  seasonings: { name: string; amount: string }[];
  steps: { description: string; tip?: string }[];
}

const RECIPE_DATABASE: RecipeTemplate[] = [
  // フライパン料理
  {
    name: '鶏むね肉の照り焼き',
    emoji: '🍗',
    cookingTime: 20,
    difficulty: '簡単',
    tool: 'フライパン',
    requiredIngredients: ['鶏むね肉'],
    optionalIngredients: ['玉ねぎ', 'キャベツ'],
    seasonings: [
      { name: '醤油', amount: '大さじ2' },
      { name: 'みりん', amount: '大さじ2' },
      { name: '砂糖', amount: '大さじ1' },
      { name: 'サラダ油', amount: '大さじ1' },
    ],
    steps: [
      { description: '鶏むね肉200gを観音開きにし、塩・こしょう少々をふる', tip: '厚みを均等にすると火が通りやすい' },
      { description: 'フライパンに油を熱し、中火で鶏肉を皮目から焼く（約5分）' },
      { description: '裏返してふたをし、弱火で5分蒸し焼きにする' },
      { description: '醤油・みりん・砂糖を合わせたタレを加え、強火でからめる', tip: 'タレが焦げないよう注意' },
      { description: '食べやすい大きさに切って盛り付ける' },
    ],
  },
  {
    name: 'キャベツと豚肉の塩炒め',
    emoji: '🥬',
    cookingTime: 15,
    difficulty: '簡単',
    tool: 'フライパン',
    requiredIngredients: ['豚バラ肉', 'キャベツ'],
    optionalIngredients: ['玉ねぎ', 'にんにく'],
    seasonings: [
      { name: '塩', amount: '小さじ1/2' },
      { name: 'こしょう', amount: '少々' },
      { name: 'ごま油', amount: '小さじ1' },
      { name: 'サラダ油', amount: '大さじ1' },
    ],
    steps: [
      { description: '豚バラ肉150gを3cm幅に切り、キャベツ1/4個を食べやすい大きさに切る' },
      { description: 'フライパンに油を熱し、豚肉を炒める（約3分）' },
      { description: 'キャベツを加えて強火で炒める（約3分）', tip: 'キャベツは少し歯ごたえが残る程度がベスト' },
      { description: '塩・こしょうで味を調え、ごま油を回しかけて完成' },
    ],
  },
  {
    name: '卵とじ丼',
    emoji: '🥚',
    cookingTime: 15,
    difficulty: '簡単',
    tool: 'フライパン',
    requiredIngredients: ['卵', '玉ねぎ'],
    optionalIngredients: ['鶏むね肉', '豚バラ肉'],
    seasonings: [
      { name: '醤油', amount: '大さじ2' },
      { name: 'みりん', amount: '大さじ2' },
      { name: 'だし汁', amount: '150ml' },
      { name: '砂糖', amount: '小さじ1' },
    ],
    steps: [
      { description: '玉ねぎ1/2個を薄切り、鶏むね肉100gを一口大に切る' },
      { description: 'フライパンにだし汁・醤油・みりん・砂糖を入れ沸騰させる' },
      { description: '玉ねぎと鶏肉を加え、中火で5分煮る' },
      { description: '溶き卵2個を回し入れ、半熟になったら火を止める', tip: 'ふたをすると均一に火が入る' },
      { description: 'ご飯の上に盛り付けて完成' },
    ],
  },
  // 鍋料理
  {
    name: 'じゃがいもと豚肉の肉じゃが',
    emoji: '🥔',
    cookingTime: 35,
    difficulty: '普通',
    tool: '鍋',
    requiredIngredients: ['じゃがいも', '豚バラ肉'],
    optionalIngredients: ['玉ねぎ', 'にんじん'],
    seasonings: [
      { name: '醤油', amount: '大さじ3' },
      { name: 'みりん', amount: '大さじ3' },
      { name: '砂糖', amount: '大さじ1.5' },
      { name: 'だし汁', amount: '300ml' },
    ],
    steps: [
      { description: 'じゃがいも3個を一口大、玉ねぎ1個を8等分のくし形に切る。豚バラ肉150gを3cm幅に切る' },
      { description: '鍋に油を熱し豚肉を炒め、じゃがいも・玉ねぎを加えて炒める（約3分）' },
      { description: 'だし汁を加えて強火で沸騰させ、アクを取る' },
      { description: '醤油・みりん・砂糖を加え、落としぶたをして中火で15分煮る', tip: '落としぶたがない場合はアルミホイルで代用可' },
      { description: '煮汁が少なくなったら完成。盛り付けて食べる' },
    ],
  },
  {
    name: '豆腐と卵の中華スープ',
    emoji: '🍜',
    cookingTime: 20,
    difficulty: '簡単',
    tool: '鍋',
    requiredIngredients: ['豆腐', '卵'],
    optionalIngredients: ['玉ねぎ', 'キャベツ'],
    seasonings: [
      { name: '鶏がらスープの素', amount: '小さじ2' },
      { name: '醤油', amount: '大さじ1' },
      { name: '塩', amount: '少々' },
      { name: 'ごま油', amount: '小さじ1' },
      { name: '水', amount: '600ml' },
    ],
    steps: [
      { description: '豆腐1丁を2cm角に切る。卵2個を溶いておく' },
      { description: '鍋に水と鶏がらスープの素を入れて沸騰させる' },
      { description: '豆腐を加え、中火で3分煮る' },
      { description: '醤油・塩で味を調え、溶き卵を細く回し入れる', tip: 'かき混ぜながら入れると細かい卵になる' },
      { description: 'ごま油を加えて完成。お好みで刻みねぎをトッピング' },
    ],
  },
  {
    name: '鶏むね肉と野菜のスープカレー',
    emoji: '🍛',
    cookingTime: 45,
    difficulty: '普通',
    tool: '鍋',
    requiredIngredients: ['鶏むね肉', '玉ねぎ'],
    optionalIngredients: ['じゃがいも', 'キャベツ'],
    seasonings: [
      { name: 'カレー粉', amount: '大さじ2' },
      { name: '醤油', amount: '大さじ1' },
      { name: 'トマト缶', amount: '1/2缶' },
      { name: 'コンソメ', amount: '2個' },
      { name: '水', amount: '500ml' },
    ],
    steps: [
      { description: '鶏むね肉300gを一口大に切り、塩・こしょうをふる。玉ねぎ1個を粗みじんに切る' },
      { description: '鍋に油を熱し玉ねぎを飴色になるまで炒める（約10分）', tip: '弱火でじっくり炒めると甘みが出る' },
      { description: 'カレー粉を加えて香りが出るまで炒める（約2分）' },
      { description: '鶏肉・トマト缶・水・コンソメを加えて20分煮る' },
      { description: '醤油で味を調えて完成。ご飯と一緒に盛り付ける' },
    ],
  },
  // フライパン追加レシピ
  {
    name: '玉ねぎと卵のふわふわオムレツ',
    emoji: '🍳',
    cookingTime: 10,
    difficulty: '簡単',
    tool: 'フライパン',
    requiredIngredients: ['卵', '玉ねぎ'],
    optionalIngredients: ['牛乳'],
    seasonings: [
      { name: '塩', amount: '少々' },
      { name: 'こしょう', amount: '少々' },
      { name: 'サラダ油', amount: '大さじ1' },
    ],
    steps: [
      { description: '玉ねぎ1/4個を薄切りにし、フライパンで軽く炒めてしんなりさせる' },
      { description: '卵3個を溶き、塩・こしょう・牛乳大さじ1を加えてよく混ぜる' },
      { description: 'フライパンに油を熱し、卵液を流し入れて大きくかき混ぜる', tip: '半熟のうちに形を整えると◎' },
      { description: 'フライパンの端に寄せて形を整え、皿に盛り付ける' },
    ],
  },
  {
    name: 'じゃがいもとキャベツのバター炒め',
    emoji: '🥔',
    cookingTime: 15,
    difficulty: '簡単',
    tool: 'フライパン',
    requiredIngredients: ['じゃがいも', 'キャベツ'],
    optionalIngredients: ['玉ねぎ'],
    seasonings: [
      { name: '塩', amount: '小さじ1/3' },
      { name: 'こしょう', amount: '少々' },
      { name: '醤油', amount: '小さじ1' },
    ],
    steps: [
      { description: 'じゃがいも2個を薄切り、キャベツ1/4個を一口大に切る' },
      { description: 'じゃがいもを電子レンジ600Wで3分加熱して火を通しておく' },
      { description: 'フライパンにバター（なければサラダ油）を熱し、じゃがいもとキャベツを炒める' },
      { description: '塩・こしょう・醤油で味を調えて完成' },
    ],
  },
  {
    name: '豚バラとキャベツのポン酢炒め',
    emoji: '🥬',
    cookingTime: 12,
    difficulty: '簡単',
    tool: 'フライパン',
    requiredIngredients: ['豚バラ肉', 'キャベツ'],
    optionalIngredients: ['玉ねぎ'],
    seasonings: [
      { name: 'ポン酢', amount: '大さじ2' },
      { name: 'ごま油', amount: '小さじ1' },
      { name: 'サラダ油', amount: '大さじ1' },
    ],
    steps: [
      { description: '豚バラ肉120gを3cm幅に切り、キャベツ1/4個を大きめにちぎる' },
      { description: 'フライパンに油を熱し、豚肉を炒める（約3分）' },
      { description: 'キャベツを加えてさっと炒め、ポン酢を回しかける', tip: 'ポン酢は最後に加えると風味が飛びにくい' },
      { description: 'ごま油を加えてひと混ぜし、完成' },
    ],
  },
  // 鍋追加レシピ
  {
    name: '豚汁',
    emoji: '🍵',
    cookingTime: 25,
    difficulty: '簡単',
    tool: '鍋',
    requiredIngredients: ['豚バラ肉', 'じゃがいも'],
    optionalIngredients: ['玉ねぎ', '豆腐'],
    seasonings: [
      { name: '味噌', amount: '大さじ3' },
      { name: 'だし汁', amount: '600ml' },
      { name: 'ごま油', amount: '小さじ1' },
    ],
    steps: [
      { description: '豚バラ肉100gを3cm幅に、じゃがいも2個・玉ねぎ1/2個を一口大に切る' },
      { description: '鍋にごま油を熱し、豚肉を炒め、じゃがいも・玉ねぎを加えて炒める' },
      { description: 'だし汁を加えて中火で10分煮る' },
      { description: '火を弱めて味噌を溶かし入れ、ひと煮立ちしたら完成', tip: '沸騰後に味噌を入れると風味が保たれる' },
    ],
  },
  {
    name: 'キャベツと豚肉のミルクスープ',
    emoji: '🥛',
    cookingTime: 20,
    difficulty: '簡単',
    tool: '鍋',
    requiredIngredients: ['キャベツ', '牛乳'],
    optionalIngredients: ['玉ねぎ', '豚バラ肉'],
    seasonings: [
      { name: 'コンソメ', amount: '2個' },
      { name: '塩', amount: '少々' },
      { name: 'こしょう', amount: '少々' },
      { name: '水', amount: '400ml' },
    ],
    steps: [
      { description: 'キャベツ1/4個をざく切り、玉ねぎ1/2個を薄切りにする' },
      { description: '鍋に水とコンソメを入れて沸騰させ、野菜を加えて5分煮る' },
      { description: '牛乳200mlを加えて弱火で5分煮る', tip: '沸騰させると分離するので弱火で' },
      { description: '塩・こしょうで味を調えて完成' },
    ],
  },
  {
    name: '卵と豆腐の和風スープ',
    emoji: '🥣',
    cookingTime: 15,
    difficulty: '簡単',
    tool: '鍋',
    requiredIngredients: ['卵', '豆腐'],
    optionalIngredients: ['玉ねぎ'],
    seasonings: [
      { name: 'だし汁', amount: '500ml' },
      { name: '醤油', amount: '大さじ1.5' },
      { name: 'みりん', amount: '大さじ1' },
      { name: '塩', amount: '少々' },
    ],
    steps: [
      { description: '豆腐1/2丁を2cm角に切り、卵2個を溶いておく' },
      { description: '鍋にだし汁を入れて沸騰させ、醤油・みりんを加える' },
      { description: '豆腐を加えて2分煮る' },
      { description: '溶き卵を細く回し入れ、やさしくかき混ぜて完成', tip: '卵は少しずつ入れると綺麗な花びら状になる' },
    ],
  },
  // 電子レンジ料理
  {
    name: '電子レンジで簡単茶碗蒸し',
    emoji: '🥣',
    cookingTime: 15,
    difficulty: '簡単',
    tool: '電子レンジ',
    requiredIngredients: ['卵'],
    optionalIngredients: ['豆腐', '鶏むね肉'],
    seasonings: [
      { name: 'だし汁', amount: '200ml' },
      { name: '醤油', amount: '小さじ1' },
      { name: '塩', amount: '少々' },
      { name: 'みりん', amount: '小さじ1' },
    ],
    steps: [
      { description: '卵2個を溶き、だし汁・醤油・みりん・塩と混ぜて漉す', tip: 'よく漉すと滑らかな仕上がりになる' },
      { description: '耐熱容器に具材（好みで鶏肉・えびなど）を入れ、卵液を流し入れる' },
      { description: 'ラップをふんわりかけて電子レンジ600Wで2分加熱' },
      { description: '取り出して様子を確認し、固まっていなければ30秒ずつ追加加熱', tip: '加熱しすぎるとスが入るので注意' },
      { description: 'ゆずの皮や三つ葉を飾って完成' },
    ],
  },
  {
    name: 'レンジで蒸し鶏とキャベツ',
    emoji: '🫕',
    cookingTime: 12,
    difficulty: '簡単',
    tool: '電子レンジ',
    requiredIngredients: ['鶏むね肉', 'キャベツ'],
    optionalIngredients: ['玉ねぎ'],
    seasonings: [
      { name: '塩', amount: '小さじ1/3' },
      { name: 'こしょう', amount: '少々' },
      { name: '酒', amount: '大さじ1' },
      { name: 'ごま油', amount: '大さじ1' },
      { name: '醤油', amount: '大さじ1' },
    ],
    steps: [
      { description: '鶏むね肉1枚（約250g）をそぎ切りにし、塩・こしょう・酒をもみ込む' },
      { description: '耐熱容器にキャベツ1/4個を敷き、鶏肉を並べる' },
      { description: 'ラップをかけて電子レンジ600Wで4分加熱' },
      { description: '取り出してひっくり返し、さらに2分加熱する', tip: '中まで火が通っているか確認する' },
      { description: 'ごま油・醤油を混ぜたタレをかけて完成' },
    ],
  },
  {
    name: '豆腐の麻婆風レンジ蒸し',
    emoji: '🌶️',
    cookingTime: 10,
    difficulty: '簡単',
    tool: '電子レンジ',
    requiredIngredients: ['豆腐'],
    optionalIngredients: ['豚バラ肉'],
    seasonings: [
      { name: '醤油', amount: '大さじ1.5' },
      { name: '豆板醤', amount: '小さじ1' },
      { name: '鶏がらスープの素', amount: '小さじ1' },
      { name: '片栗粉', amount: '小さじ1' },
      { name: '水', amount: '50ml' },
    ],
    steps: [
      { description: '豆腐1丁をキッチンペーパーで包み、電子レンジ600Wで2分加熱して水切りする' },
      { description: '豆腐を2cm角に切り、耐熱容器に入れる' },
      { description: '調味料（醤油・豆板醤・鶏がらスープの素・水）を混ぜて豆腐にかける' },
      { description: 'ラップをかけて電子レンジで3分加熱' },
      { description: '水溶き片栗粉を加えてよく混ぜ、さらに30秒加熱してとろみをつける' },
    ],
  },
  // 電子レンジ追加レシピ
  {
    name: 'レンジでじゃがバター',
    emoji: '🧈',
    cookingTime: 8,
    difficulty: '簡単',
    tool: '電子レンジ',
    requiredIngredients: ['じゃがいも'],
    optionalIngredients: [],
    seasonings: [
      { name: '塩', amount: '少々' },
      { name: 'こしょう', amount: '少々' },
    ],
    steps: [
      { description: 'じゃがいも2個をよく洗い、濡らしたキッチンペーパーで包む' },
      { description: 'ラップでさらに包み、電子レンジ600Wで5分加熱する', tip: '竹串がすっと通ればOK' },
      { description: '取り出して切り込みを入れ、好みでバター（なければ塩だけ）をのせる' },
      { description: '塩・こしょうをふって完成' },
    ],
  },
  {
    name: 'レンジで豚バラともやしの蒸し物',
    emoji: '🥩',
    cookingTime: 8,
    difficulty: '簡単',
    tool: '電子レンジ',
    requiredIngredients: ['豚バラ肉'],
    optionalIngredients: ['キャベツ', '玉ねぎ'],
    seasonings: [
      { name: '塩', amount: '少々' },
      { name: '醤油', amount: '大さじ1' },
      { name: 'ごま油', amount: '小さじ1' },
    ],
    steps: [
      { description: '豚バラ肉120gを耐熱皿に並べ、塩をふる' },
      { description: '千切りにしたキャベツや玉ねぎを豚肉の上に重ねる' },
      { description: 'ラップをかけて電子レンジ600Wで4分加熱する' },
      { description: '醤油とごま油を混ぜたタレをかけて完成', tip: '蒸し汁ごとタレをかけると旨みが増す' },
    ],
  },
  {
    name: 'レンジでコーンスープ風',
    emoji: '🥛',
    cookingTime: 8,
    difficulty: '簡単',
    tool: '電子レンジ',
    requiredIngredients: ['牛乳', '玉ねぎ'],
    optionalIngredients: ['じゃがいも'],
    seasonings: [
      { name: 'コンソメ', amount: '1個' },
      { name: '塩', amount: '少々' },
      { name: 'こしょう', amount: '少々' },
    ],
    steps: [
      { description: '玉ねぎ1/2個をみじん切りにし、耐熱容器に入れてラップをかけ、レンジで2分加熱する' },
      { description: '牛乳250mlとコンソメを加えてよく混ぜる' },
      { description: 'ラップをかけずにレンジで2分加熱し、取り出してよく混ぜる', tip: '吹きこぼれ注意：深めの容器を使う' },
      { description: '塩・こしょうで味を調えて完成' },
    ],
  },
];

/**
 * 食材と調理器具に基づいてレシピを提案する
 * @param ingredients 手持ちの食材
 * @param tool 調理器具
 * @param excludeRecipeIds 除外するレシピID（再提案時に使用）
 * @returns 3つのレシピ提案
 */
export function generateRecipes(
  ingredients: Ingredient[],
  tool: CookingTool,
  excludeRecipeIds: string[] = [],
  ownedSeasoningNames: string[] = [],
): RecipeSuggestion[] {
  const ingredientNames = ingredients.map(i => i.name);

  // 器具でフィルタリング
  const toolRecipes = RECIPE_DATABASE.filter(r => r.tool === tool);

  // マッチスコアを計算（手持ち食材との一致度）
  const scored = toolRecipes.map(recipe => {
    const requiredMatches = recipe.requiredIngredients.filter(ri =>
      ingredientNames.some(in_ => in_.includes(ri) || ri.includes(in_))
    ).length;
    const optionalMatches = recipe.optionalIngredients.filter(ri =>
      ingredientNames.some(in_ => in_.includes(ri) || ri.includes(in_))
    ).length;
    const score = requiredMatches * 3 + optionalMatches;
    return { recipe, score, requiredMatches };
  });

  // 要求食材が1つ以上マッチするものを優先、スコア順＋ランダムシャッフルでソート
  const matched = scored
    .filter(s => !excludeRecipeIds.includes(s.recipe.name))
    .map(s => ({ ...s, rand: Math.random() })) // ランダム要素を付与
    .sort((a, b) => {
      if (b.requiredMatches !== a.requiredMatches) return b.requiredMatches - a.requiredMatches;
      if (b.score !== a.score) return b.score - a.score;
      return a.rand - b.rand; // スコアが同じ場合はランダム順
    });

  // マッチしなかったものも含めて、指定器具のレシピを最大3つ返す
  const matchedNames = new Set(matched.map(s => s.recipe.name));
  const result = matched.length >= 3 ? matched.slice(0, 3) : [
    ...matched,
    ...scored
      .filter(s => !matchedNames.has(s.recipe.name) && !excludeRecipeIds.includes(s.recipe.name))
      .map(s => ({ ...s, rand: Math.random() }))
      .sort((a, b) => a.rand - b.rand)
      .slice(0, 3 - matched.length),
  ].slice(0, 3);

  return result.map(({ recipe }): RecipeSuggestion => {
    const allIngredients = [
      ...recipe.requiredIngredients.map(name => ({
        name,
        amount: '適量',
        isOwned: ingredientNames.some(in_ => in_.includes(name) || name.includes(in_)),
        itemType: 'food' as const,
      })),
      ...recipe.optionalIngredients.map(name => ({
        name,
        amount: '適量',
        isOwned: ingredientNames.some(in_ => in_.includes(name) || name.includes(in_)),
        itemType: 'food' as const,
      })),
      ...recipe.seasonings.map(s => ({
        name: s.name,
        amount: s.amount,
        isOwned: ownedSeasoningNames.some(
          own => own.includes(s.name) || s.name.includes(own)
        ),
        itemType: 'seasoning' as const,
      })),
    ];

    return {
      id: recipe.name,
      name: recipe.name,
      emoji: recipe.emoji,
      cookingTime: recipe.cookingTime,
      difficulty: recipe.difficulty,
      tool: recipe.tool,
      ingredients: allIngredients,
      steps: recipe.steps.map((s, i) => ({
        stepNumber: i + 1,
        description: s.description,
        tip: s.tip,
      })),
    };
  });
}
