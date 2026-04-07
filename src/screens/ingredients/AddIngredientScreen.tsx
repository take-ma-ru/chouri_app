import React, { useState } from 'react';
import {View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, IngredientCategory, SeasoningCategory, ItemType } from '../../types';
import { useIngredientStore } from '../../store/ingredientStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'AddIngredient'>;
type RoutePropType = RouteProp<RootStackParamList, 'AddIngredient'>;

const FOOD_CATEGORIES: IngredientCategory[] = ['野菜', '肉', '魚', '乳製品', 'その他'];
const FOOD_EMOJIS: Record<IngredientCategory, string> = {
  '野菜': '🥦',
  '肉': '🥩',
  '魚': '🐟',
  '乳製品': '🥛',
  'その他': '🫙',
};
const FOOD_COLORS: Record<IngredientCategory, string> = {
  '野菜': '#2D9B6F',
  '肉': '#E74C3C',
  '魚': '#2980B9',
  '乳製品': '#F39C12',
  'その他': '#8E44AD',
};

const SEASONING_CATEGORIES: SeasoningCategory[] = ['塩・砂糖', '醤油・みりん', 'スパイス', 'ソース・ドレッシング', 'その他調味料'];
const SEASONING_EMOJIS: Record<SeasoningCategory, string> = {
  '塩・砂糖': '🧂',
  '醤油・みりん': '🍶',
  'スパイス': '🌶️',
  'ソース・ドレッシング': '🫙',
  'その他調味料': '✨',
};
const SEASONING_COLORS: Record<SeasoningCategory, string> = {
  '塩・砂糖': '#E67E22',
  '醤油・みりん': '#C0392B',
  'スパイス': '#8E44AD',
  'ソース・ドレッシング': '#27AE60',
  'その他調味料': '#2C3E50',
};

const AddIngredientScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const editIngredient = route.params?.editIngredient;
  const defaultItemType = route.params?.defaultItemType ?? 'food';

  const initialItemType: ItemType = editIngredient?.itemType ?? defaultItemType;
  const initialCategory: IngredientCategory | SeasoningCategory =
    editIngredient?.category ?? (initialItemType === 'food' ? '野菜' : '塩・砂糖');

  const [itemType, setItemType] = useState<ItemType>(initialItemType);
  const [name, setName] = useState(editIngredient?.name ?? '');
  const [category, setCategory] = useState<IngredientCategory | SeasoningCategory>(initialCategory);
  const [memo, setMemo] = useState(editIngredient?.memo ?? '');

  const { addIngredient, updateIngredient } = useIngredientStore();

  const handleSwitchItemType = (type: ItemType) => {
    setItemType(type);
    setCategory(type === 'food' ? '野菜' : '塩・砂糖');
  };

  const handleSave = async () => {
    if (!name.trim()) {
      const label = itemType === 'food' ? '食材名' : '調味料名';
      Alert.alert('エラー', `${label}を入力してください`);
      return;
    }

    if (editIngredient) {
      await updateIngredient(editIngredient.id, {
        name: name.trim(),
        itemType,
        category,
        memo: memo.trim(),
      });
    } else {
      await addIngredient({
        name: name.trim(),
        itemType,
        category,
        memo: memo.trim(),
      });
    }
    navigation.goBack();
  };

  const currentCategories = itemType === 'food' ? FOOD_CATEGORIES : SEASONING_CATEGORIES;
  const currentEmojis = itemType === 'food'
    ? (cat: string) => FOOD_EMOJIS[cat as IngredientCategory]
    : (cat: string) => SEASONING_EMOJIS[cat as SeasoningCategory];
  const currentColors = itemType === 'food'
    ? (cat: string) => FOOD_COLORS[cat as IngredientCategory]
    : (cat: string) => SEASONING_COLORS[cat as SeasoningCategory];

  const accentColor = itemType === 'food' ? '#2D9B6F' : '#E67E22';

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* 食材 / 調味料 切り替え（新規追加時のみ表示） */}
          {!editIngredient && (
            <View style={styles.section}>
              <Text style={styles.label}>種類</Text>
              <View style={styles.typeToggleContainer}>
                <TouchableOpacity
                  style={[styles.typeToggleButton, itemType === 'food' && { backgroundColor: '#2D9B6F', borderColor: '#2D9B6F' }]}
                  onPress={() => handleSwitchItemType('food')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typeToggleText, itemType === 'food' && styles.typeToggleTextActive]}>
                    🥗 食材
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeToggleButton, itemType === 'seasoning' && { backgroundColor: '#E67E22', borderColor: '#E67E22' }]}
                  onPress={() => handleSwitchItemType('seasoning')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.typeToggleText, itemType === 'seasoning' && styles.typeToggleTextActive]}>
                    🧂 調味料
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* 名前入力 */}
          <View style={styles.section}>
            <Text style={styles.label}>
              {itemType === 'food' ? '食材名' : '調味料名'}{' '}
              <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.textInput, { borderColor: name.trim() ? accentColor : '#E0E0E0' }]}
              value={name}
              onChangeText={setName}
              placeholder={itemType === 'food' ? '例：鶏むね肉、キャベツ、卵' : '例：醤油、塩、カレー粉'}
              placeholderTextColor="#BBBBBB"
              autoFocus={!editIngredient}
              returnKeyType="next"
            />
          </View>

          {/* カテゴリ選択 */}
          <View style={styles.section}>
            <Text style={styles.label}>カテゴリ</Text>
            <View style={styles.categoryGrid}>
              {currentCategories.map(cat => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && {
                      backgroundColor: currentColors(cat),
                      borderColor: currentColors(cat),
                    },
                  ]}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryEmoji}>{currentEmojis(cat)}</Text>
                  <Text style={[styles.categoryButtonText, category === cat && styles.categoryButtonTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* メモ */}
          <View style={styles.section}>
            <Text style={styles.label}>数量・メモ（任意）</Text>
            <TextInput
              style={styles.textInput}
              value={memo}
              onChangeText={setMemo}
              placeholder={itemType === 'food' ? '例：2個、冷凍中、賞味期限3/20' : '例：残り少ない、大さじ3程度'}
              placeholderTextColor="#BBBBBB"
              returnKeyType="done"
            />
          </View>

          {/* 保存ボタン */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              { backgroundColor: accentColor, shadowColor: accentColor },
              !name.trim() && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={!name.trim()}
          >
            <Text style={styles.saveButtonText}>
              {editIngredient
                ? '更新する'
                : itemType === 'food' ? '食材を追加' : '調味料を追加'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  scrollContent: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
  },
  required: {
    color: '#E74C3C',
  },
  typeToggleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  typeToggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  typeToggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#555',
  },
  typeToggleTextActive: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#DDD',
    backgroundColor: '#fff',
  },
  categoryEmoji: {
    fontSize: 18,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  categoryButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  saveButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonDisabled: {
    backgroundColor: '#BBBBBB',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});

export default AddIngredientScreen;
