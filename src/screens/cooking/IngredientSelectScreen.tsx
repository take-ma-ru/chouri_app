import React, { useState } from 'react';
import {View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, Ingredient, IngredientCategory, SeasoningCategory } from '../../types';
import { useIngredientStore } from '../../store/ingredientStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'IngredientSelect'>;

const CATEGORY_EMOJIS: Record<IngredientCategory | SeasoningCategory, string> = {
  '野菜': '🥦',
  '肉': '🥩',
  '魚': '🐟',
  '乳製品': '🥛',
  'その他': '🫙',
  '塩・砂糖': '🧂',
  '醤油・みりん': '🍶',
  'スパイス': '🌶️',
  'ソース・ドレッシング': '🫙',
  'その他調味料': '✨',
};

const IngredientSelectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { ingredients: allIngredients } = useIngredientStore();
  // 料理提案には「食材」だけを使う（調味料は除外）
  const ingredients = allIngredients.filter(i => i.itemType === 'food');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedIds(next);
  };

  const handleNext = () => {
    if (selectedIds.size === 0) {
      Alert.alert('食材を選んでください', '使いたい食材を少なくとも1つ選択してください');
      return;
    }
    navigation.navigate('CookingToolSelect', {
      selectedIngredientIds: Array.from(selectedIds),
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === ingredients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(ingredients.map(i => i.id)));
    }
  };

  const renderItem = ({ item }: { item: Ingredient }) => {
    const isSelected = selectedIds.has(item.id);
    return (
      <TouchableOpacity
        style={[styles.ingredientCard, isSelected && styles.ingredientCardSelected]}
        onPress={() => toggleSelect(item.id)}
        activeOpacity={0.8}
      >
        <View style={styles.ingredientLeft}>
          <Text style={styles.categoryEmoji}>{CATEGORY_EMOJIS[item.category]}</Text>
          <View>
            <Text style={[styles.ingredientName, isSelected && styles.ingredientNameSelected]}>
              {item.name}
            </Text>
            {item.memo ? (
              <Text style={styles.ingredientMemo}>{item.memo}</Text>
            ) : null}
          </View>
        </View>
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  if (ingredients.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🥗</Text>
          <Text style={styles.emptyText}>食材が登録されていません</Text>
          <Text style={styles.emptySubText}>まず「食材管理」から食材を追加しましょう</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* ステップインジケーター */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepDot}>
          <Text style={styles.stepDotText}>1</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, styles.stepDotInactive]}>
          <Text style={[styles.stepDotText, styles.stepDotTextInactive]}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, styles.stepDotInactive]}>
          <Text style={[styles.stepDotText, styles.stepDotTextInactive]}>3</Text>
        </View>
      </View>

      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>使いたい食材を選んでください</Text>
        <TouchableOpacity onPress={handleSelectAll}>
          <Text style={styles.selectAllText}>
            {selectedIds.size === ingredients.length ? 'すべて解除' : 'すべて選択'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.selectedCount}>
        {selectedIds.size} 種類を選択中
      </Text>

      {/* 食材リスト */}
      <FlatList
        data={ingredients}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* 次へボタン */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.nextButton, selectedIds.size === 0 && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={selectedIds.size === 0}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            {selectedIds.size}種類を選択して次へ →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 0,
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D9B6F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotInactive: {
    backgroundColor: '#DDD',
  },
  stepDotText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  stepDotTextInactive: {
    color: '#999',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#DDD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    flex: 1,
  },
  selectAllText: {
    fontSize: 13,
    color: '#2D9B6F',
    fontWeight: '600',
  },
  selectedCount: {
    paddingHorizontal: 18,
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 8,
  },
  ingredientCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  ingredientCardSelected: {
    borderColor: '#2D9B6F',
    backgroundColor: '#F0FAF5',
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  categoryEmoji: {
    fontSize: 22,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  ingredientNameSelected: {
    color: '#2D9B6F',
    fontWeight: '600',
  },
  ingredientMemo: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#DDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#2D9B6F',
    borderColor: '#2D9B6F',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEmoji: {
    fontSize: 52,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
    marginBottom: 6,
  },
  emptySubText: {
    fontSize: 14,
    color: '#999',
  },
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
  nextButton: {
    backgroundColor: '#2D9B6F',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#2D9B6F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default IngredientSelectScreen;
