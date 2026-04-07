/**
 * AppNavigator
 * 起動時に AsyncStorage の Gemini APIキーをチェックし、
 * 未設定なら ApiSetupScreen を、設定済みなら Home を initialRoute にする。
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApiKeyStore } from '../store/apiKeyStore';

import HomeScreen from '../screens/HomeScreen';
import IngredientListScreen from '../screens/ingredients/IngredientListScreen';
import AddIngredientScreen from '../screens/ingredients/AddIngredientScreen';
import IngredientSelectScreen from '../screens/cooking/IngredientSelectScreen';
import CookingToolSelectScreen from '../screens/cooking/CookingToolSelectScreen';
import RecipeSuggestScreen from '../screens/cooking/RecipeSuggestScreen';
import RecipeDetailScreen from '../screens/cooking/RecipeDetailScreen';
import ShoppingListScreen from '../screens/shopping/ShoppingListScreen';
import ApiSetupScreen from '../screens/setup/ApiSetupScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const { apiKey, isLoaded, loadApiKey } = useApiKeyStore();

  // 起動時に AsyncStorage からキーを読み込む
  useEffect(() => {
    loadApiKey();
  }, []);

  // 読み込み中はスプラッシュ代わりのローディング表示
  if (!isLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#F8FAF9', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#2D9B6F" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        // キーがあれば Home、なければ設定画面を初期表示
        initialRouteName={apiKey ? 'Home' : 'ApiSetup'}
        screenOptions={{
          headerStyle: { backgroundColor: '#2D9B6F' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold', fontSize: 18 },
          contentStyle: { backgroundColor: '#F8FAF9' },
        }}
      >
        {/* APIキー設定画面（初回 & 再設定） */}
        <Stack.Screen
          name="ApiSetup"
          component={ApiSetupScreen}
          options={{ title: '🔑 APIキーの設定', headerTitleAlign: 'center' }}
        />

        {/* ホーム画面（右上に設定ボタンを表示） */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            title: '🥦 Kitchen Note',
            headerTitleAlign: 'center',
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('ApiSetup')}
                style={{ paddingHorizontal: 8 }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={{ color: '#fff', fontSize: 22 }}>⚙️</Text>
              </TouchableOpacity>
            ),
          })}
        />

        <Stack.Screen
          name="IngredientList"
          component={IngredientListScreen}
          options={{ title: '食材管理', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="AddIngredient"
          component={AddIngredientScreen}
          options={({ route }) => ({
            title: route.params?.editIngredient ? '食材を編集' : '食材を追加',
            headerTitleAlign: 'center',
          })}
        />
        <Stack.Screen
          name="IngredientSelect"
          component={IngredientSelectScreen}
          options={{ title: '食材を選ぶ（STEP 1）', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="CookingToolSelect"
          component={CookingToolSelectScreen}
          options={{ title: '調理器具を選ぶ（STEP 2）', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="RecipeSuggest"
          component={RecipeSuggestScreen}
          options={{ title: '料理の提案（STEP 3）', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="RecipeDetail"
          component={RecipeDetailScreen}
          options={{ title: '詳細レシピ', headerTitleAlign: 'center' }}
        />
        <Stack.Screen
          name="ShoppingList"
          component={ShoppingListScreen}
          options={{ title: 'お買い物リスト', headerTitleAlign: 'center' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
