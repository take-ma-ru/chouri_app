import React, { useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useIngredientStore } from '../store/ingredientStore';
import { useShoppingStore } from '../store/shoppingStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { loadIngredients, ingredients } = useIngredientStore();
  const { loadItems, getUncheckedItems } = useShoppingStore();

  useEffect(() => {
    loadIngredients();
    loadItems();
  }, []);

  const uncheckedCount = getUncheckedItems().length;
  const foodCount = ingredients.filter(i => i.itemType === 'food').length;
  const seasoningCount = ingredients.filter(i => i.itemType === 'seasoning').length;

  const menuItems = [
    {
      id: 'ingredients',
      emoji: '🥗',
      title: '食材管理',
      subtitle: `食材 ${foodCount} 種類・調味料 ${seasoningCount} 種類`,
      color: '#2D9B6F',
      bgColor: '#E8F7F1',
      onPress: () => navigation.navigate('IngredientList'),
    },
    {
      id: 'cooking',
      emoji: '👨‍🍳',
      title: '調理',
      subtitle: '今ある食材から料理を提案',
      color: '#E67E22',
      bgColor: '#FEF5EC',
      onPress: () => navigation.navigate('IngredientSelect'),
    },
    {
      id: 'shopping',
      emoji: '🛒',
      title: 'お買い物',
      subtitle: uncheckedCount > 0 ? `${uncheckedCount} 件のリストがあります` : 'リストは空です',
      color: '#2980B9',
      bgColor: '#EAF4FB',
      onPress: () => navigation.navigate('ShoppingList'),
      badge: uncheckedCount > 0 ? uncheckedCount : undefined,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="#2D9B6F" />

      {/* ヘッダーエリア */}
      <View style={styles.headerArea}>
        <Text style={styles.welcomeText}>今日は何を作りますか？</Text>
        <Text style={styles.dateText}>
          {new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })}
        </Text>
      </View>

      {/* メニューカード */}
      <View style={styles.menuContainer}>
        {menuItems.map(item => (
          <TouchableOpacity
            key={item.id}
            style={[styles.menuCard, { backgroundColor: item.bgColor }]}
            onPress={item.onPress}
            activeOpacity={0.85}
          >
            <View style={styles.menuCardLeft}>
              <View style={[styles.emojiContainer, { backgroundColor: item.color + '22' }]}>
                <Text style={styles.menuEmoji}>{item.emoji}</Text>
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuTitle, { color: item.color }]}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <View style={styles.menuCardRight}>
              {item.badge !== undefined && (
                <View style={[styles.badge, { backgroundColor: item.color }]}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Text style={[styles.arrowIcon, { color: item.color }]}>›</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* フッターメッセージ */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>食材を無駄なく、毎日の献立をもっと楽しく</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  headerArea: {
    backgroundColor: '#2D9B6F',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 28,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  menuContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 14,
  },
  menuCard: {
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  menuCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emojiContainer: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: {
    fontSize: 26,
  },
  menuTextContainer: {
    marginLeft: 14,
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 3,
  },
  menuSubtitle: {
    fontSize: 13,
    color: '#888',
  },
  menuCardRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  arrowIcon: {
    fontSize: 28,
    fontWeight: '300',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#aaa',
  },
});

export default HomeScreen;
