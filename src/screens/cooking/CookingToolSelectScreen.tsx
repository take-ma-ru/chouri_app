import React, { useState } from 'react';
import {View,
  Text,
  TouchableOpacity,
  StyleSheet} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, CookingTool, CookingToolInfo } from '../../types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CookingToolSelect'>;
type RoutePropType = RouteProp<RootStackParamList, 'CookingToolSelect'>;

const COOKING_TOOLS: CookingToolInfo[] = [
  {
    key: 'フライパン',
    emoji: '🍳',
    description: '炒め物・焼き物・オムレツ等',
  },
  {
    key: '鍋',
    emoji: '🍲',
    description: '煮物・スープ・鍋物・カレー等',
  },
  {
    key: '電子レンジ',
    emoji: '📦',
    description: '蒸し料理・温め・簡単調理等',
  },
];

const TOOL_COLORS: Record<CookingTool, string> = {
  'フライパン': '#E67E22',
  '鍋': '#2D9B6F',
  '電子レンジ': '#2980B9',
};

const CookingToolSelectScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { selectedIngredientIds } = route.params;

  const [selectedTool, setSelectedTool] = useState<CookingTool | null>(null);

  const handleNext = () => {
    if (!selectedTool) return;
    navigation.navigate('RecipeSuggest', {
      selectedIngredientIds,
      selectedTool,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* ステップインジケーター */}
      <View style={styles.stepIndicator}>
        <View style={[styles.stepDot, styles.stepDotDone]}>
          <Text style={styles.stepDotText}>✓</Text>
        </View>
        <View style={[styles.stepLine, styles.stepLineDone]} />
        <View style={styles.stepDot}>
          <Text style={styles.stepDotText}>2</Text>
        </View>
        <View style={styles.stepLine} />
        <View style={[styles.stepDot, styles.stepDotInactive]}>
          <Text style={[styles.stepDotText, styles.stepDotTextInactive]}>3</Text>
        </View>
      </View>

      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>調理器具を選んでください</Text>
        <Text style={styles.headerSubtitle}>今日使える器具はどれですか？</Text>
      </View>

      {/* 器具ボタン */}
      <View style={styles.toolsContainer}>
        {COOKING_TOOLS.map(tool => {
          const isSelected = selectedTool === tool.key;
          const color = TOOL_COLORS[tool.key];
          return (
            <TouchableOpacity
              key={tool.key}
              style={[
                styles.toolCard,
                isSelected && { borderColor: color, backgroundColor: color + '12' },
              ]}
              onPress={() => setSelectedTool(tool.key)}
              activeOpacity={0.85}
            >
              <View style={[styles.emojiContainer, { backgroundColor: color + '22' }]}>
                <Text style={styles.toolEmoji}>{tool.emoji}</Text>
              </View>
              <View style={styles.toolInfo}>
                <Text style={[styles.toolName, isSelected && { color }]}>{tool.key}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </View>
              <View style={[styles.radioOuter, isSelected && { borderColor: color }]}>
                {isSelected && <View style={[styles.radioInner, { backgroundColor: color }]} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* 次へボタン */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedTool ? { backgroundColor: TOOL_COLORS[selectedTool] } : styles.nextButtonDisabled,
          ]}
          onPress={handleNext}
          disabled={!selectedTool}
          activeOpacity={0.85}
        >
          <Text style={styles.nextButtonText}>
            料理を提案してもらう →
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
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D9B6F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotDone: {
    backgroundColor: '#2D9B6F',
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
  stepLineDone: {
    backgroundColor: '#2D9B6F',
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
  },
  toolsContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  toolCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toolEmoji: {
    fontSize: 28,
  },
  toolInfo: {
    marginLeft: 16,
    flex: 1,
  },
  toolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  toolDescription: {
    fontSize: 13,
    color: '#888',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
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
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
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

export default CookingToolSelectScreen;
