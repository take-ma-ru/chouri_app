/**
 * RecipeSuggestScreen
 * Gemini API でレシピを動的生成する。
 * APIキー無効時はエラー表示＋設定画面へ誘導。
 * ネットワークエラー等はローカルレシピにフォールバック。
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, RecipeSuggestion } from '../../types';
import { useIngredientStore } from '../../store/ingredientStore';
import { useApiKeyStore } from '../../store/apiKeyStore';
import { generateRecipes } from '../../utils/recipeGenerator';
import {
  generateRecipesWithGemini,
  GeminiApiError,
} from '../../utils/geminiRecipeGenerator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecipeSuggest'>;
type RoutePropType = RouteProp<RootStackParamList, 'RecipeSuggest'>;

const DIFFICULTY_COLORS = {
  '簡単': '#2D9B6F',
  '普通': '#E67E22',
  '難しい': '#E74C3C',
};

type ErrorState =
  | { type: 'auth'; message: string }
  | { type: 'rateLimit'; message: string }
  | { type: 'fallback'; message: string }
  | null;

const RecipeSuggestScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { selectedIngredientIds, selectedTool } = route.params;
  const { ingredients } = useIngredientStore();
  const { apiKey } = useApiKeyStore();

  const [recipes, setRecipes] = useState<RecipeSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [shownRecipeNames, setShownRecipeNames] = useState<string[]>([]);
  const [errorState, setErrorState] = useState<ErrorState>(null);
  const [isAiGenerated, setIsAiGenerated] = useState(false);

  const selectedIngredients = ingredients.filter(i =>
    selectedIngredientIds.includes(i.id),
  );

  // 登録済み調味料
  const ownedSeasonings = ingredients.filter(i => i.itemType === 'seasoning');
  const ownedSeasoningNames = ownedSeasonings.map(i => i.name);

  const loadRecipes = async (resetShown = false) => {
    setIsLoading(true);
    setErrorState(null);

    const excludeNames = resetShown ? [] : shownRecipeNames;

    // ── Gemini API 経由 ──
    if (apiKey) {
      try {
        const suggested = await generateRecipesWithGemini(
          selectedIngredients,
          ownedSeasonings,
          selectedTool,
          apiKey,
          excludeNames,
        );
        setRecipes(suggested);
        setShownRecipeNames(prev =>
          resetShown
            ? suggested.map(r => r.name)
            : [...prev, ...suggested.map(r => r.name)],
        );
        setIsAiGenerated(true);
        setIsLoading(false);
        return;
      } catch (e) {
        if (e instanceof GeminiApiError) {
          if (e.isAuthError) {
            // APIキー無効 → エラー表示してフォールバックしない
            setErrorState({ type: 'auth', message: 'APIキーが無効です。設定画面で確認してください。' });
            setIsLoading(false);
            return;
          }
          if (e.isRateLimitError) {
            // レート制限はハードエラーにせず、ローカルにフォールバック
            setErrorState({ type: 'fallback', message: 'APIの一時的な利用制限に達したため、ローカルレシピを表示しています。少し待ってから再試行してください。' });
          } else {
            // その他GeminiApiError → ローカルにフォールバック
            setErrorState({ type: 'fallback', message: 'AI提案に失敗したため、ローカルレシピを表示しています。' });
          }
        } else {
          // GeminiApiError以外（ネットワーク障害等）→ ローカルにフォールバック
          setErrorState({ type: 'fallback', message: 'AI提案に失敗したため、ローカルレシピを表示しています。' });
        }
      }
    }

    // ── ローカルレシピ ──
    const excludeIds = resetShown ? [] : shownRecipeNames;
    let suggested = generateRecipes(
      selectedIngredients,
      selectedTool,
      excludeIds,
      ownedSeasoningNames,
    );
    if (suggested.length === 0) {
      suggested = generateRecipes(
        selectedIngredients,
        selectedTool,
        [],
        ownedSeasoningNames,
      );
      setShownRecipeNames(suggested.map(r => r.name));
    } else {
      setShownRecipeNames(prev =>
        resetShown
          ? suggested.map(r => r.name)
          : [...prev, ...suggested.map(r => r.name)],
      );
    }
    setRecipes(suggested);
    setIsAiGenerated(false);
    setIsLoading(false);
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  // ── エラー画面 ──
  if (!isLoading && errorState?.type === 'auth') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>🔑</Text>
          <Text style={styles.errorTitle}>APIキーが無効です</Text>
          <Text style={styles.errorMessage}>{errorState.message}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => navigation.navigate('ApiSetup')}
          >
            <Text style={styles.errorButtonText}>⚙️ APIキーを再設定する</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorBackButtonText}>← 戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!isLoading && errorState?.type === 'rateLimit') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⏳</Text>
          <Text style={styles.errorTitle}>利用制限に達しました</Text>
          <Text style={styles.errorMessage}>{errorState.message}</Text>
          <TouchableOpacity
            style={styles.errorButton}
            onPress={() => loadRecipes(false)}
          >
            <Text style={styles.errorButtonText}>🔄 再試行する</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.errorBackButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.errorBackButtonText}>← 戻る</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ── レシピカード ──
  const renderRecipeCard = ({ item, index }: { item: RecipeSuggestion; index: number }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('RecipeDetail', { recipe: item })}
      activeOpacity={0.88}
    >
      <View style={styles.recipeThumbnail}>
        <Text style={styles.recipeEmoji}>{item.emoji}</Text>
        <View style={styles.recipeIndexBadge}>
          <Text style={styles.recipeIndexText}>{index + 1}</Text>
        </View>
      </View>

      <View style={styles.recipeInfo}>
        <Text style={styles.recipeName}>{item.name}</Text>
        <View style={styles.recipeMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaIcon}>⏱️</Text>
            <Text style={styles.metaText}>{item.cookingTime}分</Text>
          </View>
          <View
            style={[
              styles.difficultyBadge,
              { backgroundColor: DIFFICULTY_COLORS[item.difficulty] + '22' },
            ]}
          >
            <Text
              style={[
                styles.difficultyText,
                { color: DIFFICULTY_COLORS[item.difficulty] },
              ]}
            >
              {item.difficulty}
            </Text>
          </View>
        </View>

        <View style={styles.ingredientsMatch}>
          {item.ingredients
            .filter(ing => ing.isOwned)
            .slice(0, 3)
            .map(ing => (
              <View key={ing.name} style={styles.ingredientChip}>
                <Text style={styles.ingredientChipText}>✓ {ing.name}</Text>
              </View>
            ))}
        </View>
      </View>

      <Text style={styles.arrowIcon}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ステップインジケーター */}
      <View style={styles.stepIndicator}>
        {[1, 2, 3].map((step, i) => (
          <React.Fragment key={step}>
            <View style={[styles.stepDot, styles.stepDotDone]}>
              {step < 3 ? (
                <Text style={styles.stepDotText}>✓</Text>
              ) : (
                <Text style={styles.stepDotText}>3</Text>
              )}
            </View>
            {i < 2 && <View style={[styles.stepLine, styles.stepLineDone]} />}
          </React.Fragment>
        ))}
      </View>

      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{selectedTool}で作れる料理 🍽️</Text>
        <View style={styles.headerSubRow}>
          <Text style={styles.headerSubtitle}>
            {selectedIngredients.length}種類の食材から{' '}
            {isLoading ? '...' : `${recipes.length}品`}提案
          </Text>
          {!isLoading && (
            <View style={[styles.sourceBadge, isAiGenerated ? styles.sourceBadgeAi : styles.sourceBadgeLocal]}>
              <Text style={[styles.sourceBadgeText, isAiGenerated ? styles.sourceBadgeTextAi : styles.sourceBadgeTextLocal]}>
                {isAiGenerated ? '✨ AI提案' : '📚 ローカル'}
              </Text>
            </View>
          )}
        </View>
        {/* フォールバック通知 */}
        {!isLoading && errorState?.type === 'fallback' && (
          <View style={styles.fallbackNotice}>
            <Text style={styles.fallbackNoticeText}>⚠️ {errorState.message}</Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2D9B6F" />
          <Text style={styles.loadingText}>
            {apiKey ? '🤖 AIが料理を考えています...' : '料理を考えています...'}
          </Text>
        </View>
      ) : (
        <>
          <FlatList
            data={recipes}
            keyExtractor={item => item.id}
            renderItem={renderRecipeCard}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />

          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => loadRecipes()}
              activeOpacity={0.85}
            >
              <Text style={styles.retryButtonText}>🔄 別の3つを提案</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },

  // ステップインジケーター
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: '#2D9B6F',
  },
  stepDotText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#DDD',
  },
  stepLineDone: {
    backgroundColor: '#2D9B6F',
  },

  // ヘッダー
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  sourceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  sourceBadgeAi: {
    backgroundColor: '#EEF0FE',
  },
  sourceBadgeLocal: {
    backgroundColor: '#F0F0F0',
  },
  sourceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  sourceBadgeTextAi: {
    color: '#5B6BD5',
  },
  sourceBadgeTextLocal: {
    color: '#888',
  },

  // フォールバック通知
  fallbackNotice: {
    backgroundColor: '#FFF8E7',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F0A500',
  },
  fallbackNoticeText: {
    fontSize: 12,
    color: '#7A5500',
    lineHeight: 18,
  },

  // ローディング
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
  },

  // エラー画面
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  errorEmoji: {
    fontSize: 56,
    marginBottom: 4,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  errorButton: {
    backgroundColor: '#2D9B6F',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 28,
    width: '100%',
    alignItems: 'center',
  },
  errorButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorBackButton: {
    paddingVertical: 12,
  },
  errorBackButtonText: {
    color: '#888',
    fontSize: 15,
  },

  // レシピリスト
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 14,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  recipeThumbnail: {
    width: 72,
    height: 72,
    borderRadius: 14,
    backgroundColor: '#F0FAF5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  recipeEmoji: {
    fontSize: 36,
  },
  recipeIndexBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#2D9B6F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recipeIndexText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  recipeInfo: {
    flex: 1,
    marginLeft: 14,
    gap: 6,
  },
  recipeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ingredientsMatch: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  ingredientChip: {
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ingredientChipText: {
    fontSize: 11,
    color: '#2D9B6F',
    fontWeight: '500',
  },
  arrowIcon: {
    fontSize: 24,
    color: '#CCC',
    marginLeft: 8,
  },

  // ボトムバー
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 42,
    backgroundColor: '#F8FAF9',
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  retryButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D9B6F',
  },
  retryButtonText: {
    color: '#2D9B6F',
    fontSize: 15,
    fontWeight: 'bold',
  },
});

export default RecipeSuggestScreen;
