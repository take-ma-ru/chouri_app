import React, { useState } from 'react';
import {View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useShoppingStore } from '../../store/shoppingStore';
import { useIngredientStore } from '../../store/ingredientStore';
import { ShoppingItem } from '../../types';

const ShoppingListScreen: React.FC = () => {
  const { items, toggleCheck, removeItem, clearChecked, addManual, getUncheckedItems, getCheckedItems } = useShoppingStore();
  const { addIngredient } = useIngredientStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');

  const uncheckedItems = getUncheckedItems();
  const checkedItems = getCheckedItems();

  const handleMoveToStock = (item: ShoppingItem) => {
    Alert.alert(
      '在庫に戻す',
      `「${item.name}」を食材管理に戻しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '在庫に戻す',
          onPress: async () => {
            await addIngredient({ name: item.name, itemType: item.itemType ?? 'food', category: item.category });
            await removeItem(item.id);
          },
        },
      ],
    );
  };

  const handleClearChecked = () => {
    if (checkedItems.length === 0) return;
    Alert.alert(
      '完了済みを削除',
      `チェック済みの${checkedItems.length}件を削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除する',
          style: 'destructive',
          onPress: () => clearChecked(),
        },
      ],
    );
  };

  const handleAddManual = async () => {
    if (!newItemName.trim()) return;
    await addManual(newItemName.trim());
    setNewItemName('');
    setShowAddModal(false);
  };

  const renderUncheckedItem = ({ item }: { item: ShoppingItem }) => (
    <View style={styles.shoppingItemCard}>
      <TouchableOpacity
        style={styles.checkArea}
        onPress={() => toggleCheck(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxUnchecked}>
          <Text style={styles.checkboxEmpty}></Text>
        </View>
      </TouchableOpacity>
      <Text style={styles.itemName}>{item.name}</Text>
      <Text style={styles.itemCategory}>{item.category}</Text>
    </View>
  );

  const renderCheckedItem = ({ item }: { item: ShoppingItem }) => (
    <View style={[styles.shoppingItemCard, styles.shoppingItemChecked]}>
      <TouchableOpacity
        style={styles.checkArea}
        onPress={() => toggleCheck(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.checkboxChecked}>
          <Text style={styles.checkmark}>✓</Text>
        </View>
      </TouchableOpacity>
      <Text style={[styles.itemName, styles.itemNameChecked]}>{item.name}</Text>
      <TouchableOpacity
        style={styles.moveToStockButton}
        onPress={() => handleMoveToStock(item)}
        activeOpacity={0.8}
      >
        <Text style={styles.moveToStockButtonText}>在庫に戻す</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダーアクション */}
      <View style={styles.headerActions}>
        <Text style={styles.headerStat}>
          残り <Text style={styles.headerStatHighlight}>{uncheckedItems.length}</Text> 件
        </Text>
        {checkedItems.length > 0 && (
          <TouchableOpacity onPress={handleClearChecked}>
            <Text style={styles.clearButton}>完了済みを削除</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={[]}
        keyExtractor={() => 'main'}
        renderItem={null}
        ListHeaderComponent={
          <>
            {/* 未購入アイテム */}
            {uncheckedItems.length > 0 && (
              <>
                <Text style={styles.listSectionTitle}>購入予定</Text>
                {uncheckedItems.map(item => (
                  <View key={item.id}>{renderUncheckedItem({ item })}</View>
                ))}
              </>
            )}

            {/* 購入済みアイテム */}
            {checkedItems.length > 0 && (
              <>
                <Text style={[styles.listSectionTitle, { marginTop: 16 }]}>購入済み ✓</Text>
                {checkedItems.map(item => (
                  <View key={item.id}>{renderCheckedItem({ item })}</View>
                ))}
              </>
            )}

            {/* 空の状態 */}
            {items.length === 0 && (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>🛒</Text>
                <Text style={styles.emptyText}>買い物リストは空です</Text>
                <Text style={styles.emptySubText}>
                  食材管理で「なくなった」ボタンを押すと自動で追加されます
                </Text>
              </View>
            )}
          </>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* 追加ボタン */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowAddModal(true)}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>＋</Text>
      </TouchableOpacity>

      {/* 手動追加モーダル */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowAddModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalBackdrop}
            onPress={() => setShowAddModal(false)}
            activeOpacity={1}
          />
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>食材を追加</Text>
            <TextInput
              style={styles.modalInput}
              value={newItemName}
              onChangeText={setNewItemName}
              placeholder="食材名を入力（例：にんじん）"
              placeholderTextColor="#BBB"
              autoFocus
              returnKeyType="done"
              onSubmitEditing={handleAddManual}
            />
            <TouchableOpacity
              style={[styles.modalAddButton, !newItemName.trim() && styles.modalAddButtonDisabled]}
              onPress={handleAddManual}
              disabled={!newItemName.trim()}
              activeOpacity={0.85}
            >
              <Text style={styles.modalAddButtonText}>リストに追加</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAF9',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#EEE',
  },
  headerStat: {
    fontSize: 14,
    color: '#666',
  },
  headerStatHighlight: {
    color: '#2D9B6F',
    fontWeight: 'bold',
    fontSize: 16,
  },
  clearButton: {
    fontSize: 13,
    color: '#E74C3C',
    fontWeight: '500',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    marginLeft: 4,
  },
  shoppingItemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },
  shoppingItemChecked: {
    opacity: 0.7,
  },
  checkArea: {
    padding: 4,
    marginRight: 12,
  },
  checkboxUnchecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxEmpty: {
    fontSize: 0,
  },
  checkboxChecked: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2D9B6F',
    borderWidth: 2,
    borderColor: '#2D9B6F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  itemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  itemNameChecked: {
    textDecorationLine: 'line-through',
    color: '#AAA',
  },
  itemCategory: {
    fontSize: 12,
    color: '#AAA',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  moveToStockButton: {
    backgroundColor: '#E8F7F1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  moveToStockButtonText: {
    fontSize: 12,
    color: '#2D9B6F',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyEmoji: {
    fontSize: 52,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#555',
  },
  emptySubText: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#2980B9',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2980B9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 28,
    color: '#fff',
    lineHeight: 32,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#DDD',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
  },
  modalAddButton: {
    backgroundColor: '#2980B9',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    shadowColor: '#2980B9',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  modalAddButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  modalAddButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShoppingListScreen;
