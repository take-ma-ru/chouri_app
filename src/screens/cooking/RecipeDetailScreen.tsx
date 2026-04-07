import React from 'react';
import {View,
  Text,
  StyleSheet,
  ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../../types';

type RoutePropType = RouteProp<RootStackParamList, 'RecipeDetail'>;

const DIFFICULTY_COLORS = {
  '簡単': '#2D9B6F',
  '普通': '#E67E22',
  '難しい': '#E74C3C',
};

const RecipeDetailScreen: React.FC = () => {
  const route = useRoute<RoutePropType>();
  const { recipe } = route.params;

  const ownedIngredients = recipe.ingredients.filter(i => i.itemType === 'food' && i.isOwned);
  const missingIngredients = recipe.ingredients.filter(i => i.itemType === 'food' && !i.isOwned);
  const ownedSeasonings = recipe.ingredients.filter(i => i.itemType === 'seasoning' && i.isOwned);
  const missingSeasonings = recipe.ingredients.filter(i => i.itemType === 'seasoning' && !i.isOwned);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ヒーローエリア */}
        <View style={styles.hero}>
          <Text style={styles.heroEmoji}>{recipe.emoji}</Text>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <View style={styles.metaRow}>
            <View style={styles.metaBadge}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaText}>{recipe.cookingTime}分</Text>
            </View>
            <View style={[
              styles.metaBadge,
              { backgroundColor: DIFFICULTY_COLORS[recipe.difficulty] + '22' },
            ]}>
              <Text style={[styles.metaText, { color: DIFFICULTY_COLORS[recipe.difficulty] }]}>
                {recipe.difficulty}
              </Text>
            </View>
            <View style={styles.metaBadge}>
              <Text style={styles.metaIcon}>🍳</Text>
              <Text style={styles.metaText}>{recipe.tool}</Text>
            </View>
          </View>
        </View>

        {/* 食材セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🥗 食材・調味料</Text>

          {ownedIngredients.length > 0 && (
            <>
              <Text style={styles.subSectionTitle}>手持ちの食材</Text>
              {ownedIngredients.map(ing => (
                <View key={ing.name} style={styles.ingredientRow}>
                  <View style={styles.ingredientBulletOwned}>
                    <Text style={styles.ingredientBulletText}>✓</Text>
                  </View>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                </View>
              ))}
            </>
          )}

          {missingIngredients.length > 0 && (
            <>
              <Text style={styles.subSectionTitle}>必要な食材（未所持）</Text>
              {missingIngredients.map(ing => (
                <View key={ing.name} style={styles.ingredientRow}>
                  <View style={styles.ingredientBullet}>
                    <Text style={styles.ingredientBulletDot}>•</Text>
                  </View>
                  <Text style={[styles.ingredientName, styles.ingredientMissing]}>{ing.name}</Text>
                  <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                </View>
              ))}
            </>
          )}

          {ownedSeasonings.length > 0 && (
            <>
              <Text style={styles.subSectionTitle}>手持ちの調味料</Text>
              {ownedSeasonings.map(ing => (
                <View key={ing.name} style={styles.ingredientRow}>
                  <View style={styles.ingredientBulletOwned}>
                    <Text style={styles.ingredientBulletText}>✓</Text>
                  </View>
                  <Text style={styles.ingredientName}>{ing.name}</Text>
                  <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                </View>
              ))}
            </>
          )}

          {missingSeasonings.length > 0 && (
            <>
              <Text style={styles.subSectionTitle}>必要な調味料（未登録）</Text>
              {missingSeasonings.map(ing => (
                <View key={ing.name} style={styles.ingredientRow}>
                  <View style={styles.ingredientBulletMissing}>
                    <Text style={styles.ingredientBulletMissingText}>!</Text>
                  </View>
                  <Text style={[styles.ingredientName, styles.ingredientMissing]}>{ing.name}</Text>
                  <Text style={styles.ingredientAmount}>{ing.amount}</Text>
                </View>
              ))}
            </>
          )}
        </View>

        {/* 手順セクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 調理手順</Text>
          {recipe.steps.map(step => (
            <View key={step.stepNumber} style={styles.stepCard}>
              <View style={styles.stepHeader}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>STEP {step.stepNumber}</Text>
                </View>
              </View>
              <Text style={styles.stepDescription}>{step.description}</Text>
              {step.tip && (
                <View style={styles.tipContainer}>
                  <Text style={styles.tipIcon}>💡</Text>
                  <Text style={styles.tipText}>{step.tip}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  hero: {
    backgroundColor: '#2D9B6F',
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  heroEmoji: {
    fontSize: 64,
  },
  recipeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  metaIcon: {
    fontSize: 13,
  },
  metaText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '500',
  },
  section: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginTop: 6,
    marginBottom: 4,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  ingredientBullet: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientBulletDot: {
    fontSize: 16,
    color: '#CCC',
  },
  ingredientBulletOwned: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E8F7F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientBulletMissing: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FDE9E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientBulletMissingText: {
    fontSize: 13,
    color: '#E74C3C',
    fontWeight: 'bold',
  },
  ingredientMissing: {
    color: '#AAA',
  },
  ingredientBulletText: {
    fontSize: 13,
    color: '#2D9B6F',
    fontWeight: 'bold',
  },
  ingredientName: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    marginLeft: 10,
  },
  ingredientAmount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  stepCard: {
    backgroundColor: '#F8FAF9',
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumberBadge: {
    backgroundColor: '#2D9B6F',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  stepDescription: {
    fontSize: 15,
    color: '#333',
    lineHeight: 22,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFDE7',
    borderRadius: 8,
    padding: 10,
    gap: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#F39C12',
  },
  tipIcon: {
    fontSize: 14,
  },
  tipText: {
    flex: 1,
    fontSize: 13,
    color: '#7D6608',
    lineHeight: 18,
  },
});

export default RecipeDetailScreen;
