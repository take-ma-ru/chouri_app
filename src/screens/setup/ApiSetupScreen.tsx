/**
 * ApiSetupScreen — ガイド付きAPIキー設定画面
 * 初回起動時（キー未設定）に表示。スマホ操作初心者を想定した UI。
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types';
import { useApiKeyStore } from '../../store/apiKeyStore';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ApiSetup'>;

const GOOGLE_AI_STUDIO_URL = 'https://aistudio.google.com/apikey';

const ApiSetupScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { saveApiKey, apiKey } = useApiKeyStore();

  const [inputKey, setInputKey] = useState(apiKey ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState(false);

  const isFromSettings = apiKey !== null; // すでにキーがある → 再設定モード

  const handleOpenAiStudio = async () => {
    const canOpen = await Linking.canOpenURL(GOOGLE_AI_STUDIO_URL);
    if (canOpen) {
      await Linking.openURL(GOOGLE_AI_STUDIO_URL);
    } else {
      Alert.alert('エラー', 'ブラウザを開けませんでした。\nhttps://aistudio.google.com/apikey をブラウザで開いてください。');
    }
  };

  const handleSave = async () => {
    const trimmed = inputKey.trim();
    if (!trimmed) {
      Alert.alert('入力エラー', 'APIキーを入力してください。');
      return;
    }
    if (trimmed.length < 20) {
      Alert.alert('入力エラー', 'APIキーが短すぎます。正しくコピーされているか確認してください。');
      return;
    }

    setIsSaving(true);
    try {
      await saveApiKey(trimmed);

      Alert.alert(
        '✅ 設定完了！',
        'APIキーを保存しました。さっそくレシピを提案してもらいましょう！',
        [
          {
            text: 'はじめる',
            onPress: () => {
              if (isFromSettings) {
                // 再設定の場合は前の画面へ戻る
                navigation.goBack();
              } else {
                // 初回設定の場合はホーム画面へリセット（戻れないようにする）
                navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
              }
            },
          },
        ],
      );
    } catch {
      Alert.alert('エラー', 'APIキーの保存に失敗しました。もう一度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ヘッダー */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🔑</Text>
            <Text style={styles.headerTitle}>
              {isFromSettings ? 'APIキーを再設定' : 'AIレシピ提案の準備'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {isFromSettings
                ? '新しいAPIキーを入力して保存してください。'
                : 'Google AI Studio で無料のAPIキーを取得して入力するだけで、AIがレシピを提案してくれます。'}
            </Text>
          </View>

          {/* ステップガイド（初回のみ表示） */}
          {!isFromSettings && (
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsTitle}>📖 取得手順</Text>

              <StepCard
                step={1}
                title="Google AI Studio を開く"
                description="下のボタンをタップして、Google AI Studio をブラウザで開いてください。Googleアカウントでログインします。"
                action={
                  <TouchableOpacity
                    style={styles.linkButton}
                    onPress={handleOpenAiStudio}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.linkButtonText}>🌐 Google AI Studio を開く</Text>
                  </TouchableOpacity>
                }
              />

              <StepCard
                step={2}
                title="APIキーを作成・コピー"
                description={'「Create API key」（日本語では「APIキーを作成」）をタップし、表示された文字列（AIzaで始まる長い文字）を全部コピーしてください。'}
              />

              <StepCard
                step={3}
                title="このアプリに貼り付ける"
                description="下の入力欄を長押しして「貼り付け」を選び、コピーした文字列を貼り付けてください。"
              />
            </View>
          )}

          {/* APIキー入力フォーム */}
          <View style={styles.inputSection}>
            <Text style={styles.inputLabel}>APIキーを入力</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.textInput}
                value={inputKey}
                onChangeText={setInputKey}
                placeholder="AIzaSy... をここに貼り付け"
                placeholderTextColor="#AABCB4"
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry={!isKeyVisible}
                multiline={false}
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setIsKeyVisible(v => !v)}
              >
                <Text style={styles.eyeIcon}>{isKeyVisible ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.inputHint}>
              🔒 キーはこの端末内にのみ保存されます。外部に送信することはありません。
            </Text>
          </View>

          {/* 保存ボタン */}
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            activeOpacity={0.85}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>✅ 設定を保存する</Text>
            )}
          </TouchableOpacity>

          {/* スキップ（すでにキーがある場合は戻るボタン） */}
          {isFromSettings && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>キャンセル</Text>
            </TouchableOpacity>
          )}

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// ---------- ステップカードコンポーネント ----------

interface StepCardProps {
  step: number;
  title: string;
  description: string;
  action?: React.ReactNode;
}

const StepCard: React.FC<StepCardProps> = ({ step, title, description, action }) => (
  <View style={styles.stepCard}>
    <View style={styles.stepBadge}>
      <Text style={styles.stepBadgeText}>{step}</Text>
    </View>
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>{title}</Text>
      <Text style={styles.stepDescription}>{description}</Text>
      {action && <View style={styles.stepAction}>{action}</View>}
    </View>
  </View>
);

// ---------- スタイル ----------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  // ヘッダー
  header: {
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  headerEmoji: {
    fontSize: 52,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A3A2F',
    textAlign: 'center',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#5A7A6E',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ステップ群
  stepsContainer: {
    marginBottom: 24,
  },
  stepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1A3A2F',
    marginBottom: 14,
  },
  stepCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    alignItems: 'flex-start',
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2D9B6F',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
    flexShrink: 0,
  },
  stepBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A3A2F',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#5A7A6E',
    lineHeight: 20,
  },
  stepAction: {
    marginTop: 12,
  },

  // Google AI Studio リンクボタン
  linkButton: {
    backgroundColor: '#E8F5EF',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#2D9B6F',
  },
  linkButtonText: {
    color: '#2D9B6F',
    fontWeight: 'bold',
    fontSize: 14,
  },

  // 入力フォーム
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1A3A2F',
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#2D9B6F',
    paddingHorizontal: 14,
    shadowColor: '#2D9B6F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A3A2F',
    paddingVertical: 16,
    letterSpacing: 0.5,
  },
  eyeButton: {
    paddingLeft: 10,
    paddingVertical: 16,
  },
  eyeIcon: {
    fontSize: 20,
  },
  inputHint: {
    fontSize: 12,
    color: '#7A9A8E',
    marginTop: 8,
    lineHeight: 18,
  },

  // 保存ボタン
  saveButton: {
    backgroundColor: '#2D9B6F',
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    shadowColor: '#2D9B6F',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 12,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },

  // キャンセルボタン
  cancelButton: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7A9A8E',
    fontSize: 15,
  },

  bottomPadding: {
    height: 40,
  },
});

export default ApiSetupScreen;
