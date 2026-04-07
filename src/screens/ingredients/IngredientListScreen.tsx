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
import { RootStackParamList, Ingredient, IngredientCategory, SeasoningCategory, ItemType } from '../../types';
import { useIngredientStore } from '../../store/ingredientStore';
import { useShoppingStore } from '../../store/shoppingStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'IngredientList'>;

const FOOD_CATEGORIES: IngredientCategory[] = ['野菜', '肉', '魚', '乳製品', 'その他'];
const FOOD_EMOJIS: Record<IngredientCategory, string> = {
  '野菜': '🥦',
  '肉': '🥩',
  '魚': '🐟',
  '乳製品': '🥛',
  'その他': '🫙',
};

const SEASONING_CATEGORIES: SeasoningCategory[] = ['塩・砂糖', '醤油・みりん', 'スパイス', 'ソース・ドレッシング', 'その他調味料'];
const SEASONING_EMOJIS: Record<SeasoningCategory, string> = {
  '塩・砂糖': '🧂',
  '醤油・みりん': '🍶',
  'スパイス': '🌶️',
  'ソース・ドレッシング': '🫙',
  'その他調味料': '✨',
};

const IngredientListScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [itemType, setItemType] = useState<ItemType>('food');
  const [activeCategory, setActiveCategory] = useState<IngredientCategory | SeasoningCategory | 'すべて'>('すべて');
  const { ingredients, removeIngredient } = useIngredientStore();
  const { addFromIngredient } = useShoppingStore();

  // 食材 or 調味料で絞り込み
  const typeFiltered = ingredients.filter(i => i.itemType === itemType);

  // さらにカテゴリで絞り込み
  const displayedIngredients = activeCategory === 'すべて'
    ? typeFiltered
    : typeFiltered.filter(i => i.category === activeCategory);

  const currentCategories = itemType === 'food' ? FOOD_CATEGORIES : SEASONING_CATEGORIES;
  const currentEmojis = itemType === 'food'
    ? (cat: IngredientCategory | SeasoningCategory) => FOOD_EMOJIS[cat as IngredientCategory]
    : (cat: IngredientCategory | SeasoningCategory) => SEASONING_EMOJIS[cat as SeasoningCategory];

  const handleSwitchType = (type: ItemType) => {
    setItemType(type);
    setActiveCategory('すべて');
  };

  const handleRemove = (ingredient: Ingredient) => {
    const label = itemType === 'food' ? '食材' : '調味料';
    Alert.alert(
      'なくなりましたか？',
      `「${ingredient.name}」をリストから削除し、お買い物リストに追加します。`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: 'はい',
          style: 'destructive',
          onPress: async () => {
            await addFromIngredient(ingredient);
            await removeIngredient(ingredient.id);
          },
        },
      ],
    );
  };

  const renderIngredientCard = ({ item }: { item: Ingredient }) => (
    <View style={styles.ingredientCard}>
      <View style={styles.ingredientLeft}>
        <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(item.category) }]}>
          <Text style={styles.categoryBadgeText}>{currentEmojis(item.category)}</Text>
        </View>
        <View style={styles.ingredientInfo}>
          <Text style={styles.ingredientName}>{item.name}</Text>
          {item.memo ? <Text style={styles.ingredientMemo}>{item.memo}</Text> : null}
          <Text style={styles.categoryLabel}>{item.category}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item)}
        activeOpacity={0.7}
      >
        <Text style={styles.removeButtonText}>なくなった</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 食材 / 調味料 切り替えトグル */}
      <View style={styles.typeToggleContainer}>
        <TouchableOpacity
          style={[styles.typeToggleButton, itemType === 'food' && styles.typeToggleButtonActive]}
          onPress={() => handleSwitchType('food')}
          activeOpacity={0.8}
        >
          <Text style={[styles.typeToggleText, itemType === 'food' && styles.typeToggleTextActive]}>
            🥗 食材
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeToggleButton, itemType === 'seasoning' && styles.typeToggleSeasoningActive]}
          onPress={() => handleSwitchType('seasoning')}
          activeOpacity={0.8}
        >
          <Text style={[styles.typeToggleText, itemType === 'seasoning' && styles.typeToggleTextActive]}>
            🧂 調味料
          </Text>
        </TouchableOpacity>
      </View>

      {/* カテゴリタブ */}
      <View style={styles.tabContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['すべて', ...currentCategories]}
          keyExtractor={item => item}
          contentContainerStyle={styles.tabList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.tab,
                activeCategory === item && (itemType === 'food' ? styles.tabActive : styles.tabSeasoningActive),
              ]}
              onPress={() => setActiveCategory(item as any)}
            >
              <Text style={[styles.tabText, activeCategory === item && styles.tabTextActive]}>
                {item !== 'すべて' ? `${currentEmojis(item as any)} ` : ''}{item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* 件数表示 */}
      <View style={styles.countBar}>
        <Text style={styles.countText}>
          {displayedIngredients.length} 種類の{itemType === 'food' ? '食材' : '調味料'}
        </Text>
      </View>

      {/* リスト */}
      {displayedIngredients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>{itemType === 'food' ? '🛒' : '🧂'}</Text>
          <Text style={styles.emptyText}>{itemType === 'food' ? '食材' : '調味料'}がありません</Text>
          <Text style={styles.emptySubText}>右下の「＋」から追加しましょう</Text>
        </View>
      ) : (
        <FlatList
          data={displayedIngredients}
          keyExtractor={item => item.id}
          renderItem={renderIngredientCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 追加ボタン（FAB） */}
      <TouchableOpacity
        style={[styles.fab, itemType === 'seasoning' && styles.fabSeasoning]}
        onPress={() => navigation.navigate('AddIngredient', { defaultItemType: itemType })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const getCategoryColor = (category: IngredientCategory | SeasoningCategory) => {
  const colors: Record<string, string> = {
    // 食材
    '野菜': '#E8F7EE',
    '肉': '#FDE9E9',
    '魚': '#E9F0FD',
    '乳製品': '#FEF9E7',
    'その他': '#F4ECF7',
    // 調味料
    '塩・砂糖': '#FFF3E0',
    '醤油・みりん': '#FBE9E7',
    'スパイス': '#FCE4EC',
    'ソース・ドレッシング': '#E8F5E9',
    'その他調味料': '#EDE7F6',
  };
  return colors[category] ?? '#F0F0F0';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  typeToggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  typeToggleButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
  },
  typeToggleButtonActive: {
    backgroundColor: '#2D9B6F',
  },
  typeToggleSeasoningActive: {
    backgroundColor: '#E67E22',
  },
  typeToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  typeToggleTextActive: {
    color: '#fff',
  },
  tabContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  tabList: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
  },
  tabActive: {
    backgroundColor: '#2D9B6F',
  },
  tabSeasoningActive: {
    backgroundColor: '#E67E22',
  },
  tabText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  countBar: {
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  countText: {
    fontSize: 13,
    color: '#888',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 100,
    gap: 10,
  },
  ingredientCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ingredientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadgeText: {
    fontSize: 20,
  },
  ingredientInfo: {
    marginLeft: 12,
    flex: 1,
  },
  ingredientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  ingredientMemo: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  categoryLabel: {
    fontSize: 11,
    color: '#AAA',
    marginTop: 2,
  },
  removeButton: {
    backgroundColor: '#FDE9E9',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  removeButtonText: {
    fontSize: 12,
    color: '#E74C3C',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 80,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2D9B6F',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2D9B6F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabSeasoning: {
    backgroundColor: '#E67E22',
    shadowColor: '#E67E22',
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
  },
});

export default IngredientListScreen;
