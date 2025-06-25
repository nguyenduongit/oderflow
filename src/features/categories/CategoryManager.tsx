// src/features/categories/CategoryManager.tsx

import React from 'react';
import { View, StyleSheet, Text, FlatList, TextInput, TouchableOpacity, } from 'react-native';
import type { MenuCategoryWithItems } from '@/types';
import Button from '@/components/Button';
import { Trash2 } from 'lucide-react-native';

// Định nghĩa các props mà component này sẽ nhận từ cha (màn hình)
interface CategoryManagerProps {
  menus: MenuCategoryWithItems[];
  newCategoryName: string;
  setNewCategoryName: (name: string) => void;
  onAddCategory: () => void;
  onDeleteCategory: (category: MenuCategoryWithItems) => void;
  isAdding: boolean;
}

export default function CategoryManager({
  menus,
  newCategoryName,
  setNewCategoryName,
  onAddCategory,
  onDeleteCategory,
  isAdding,
}: CategoryManagerProps) {
  return (
    <View style={styles.container}>
      <FlatList
        data={menus}
        style={styles.list}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <View>
              <Text style={styles.listItemTitle}>{item.name}</Text>
              <Text style={styles.listItemDescription}>{item.menu_items.length} món</Text>
            </View>
            <TouchableOpacity onPress={() => onDeleteCategory(item)} style={styles.deleteButton}>
              <Trash2 color="#EF4444" size={20} />
            </TouchableOpacity>
          </View>
        )}
        ListHeaderComponent={
          <Text style={styles.listHeader}>Các danh mục hiện có</Text>
        }
        ItemSeparatorComponent={() => <View style={styles.divider} />}
        ListEmptyComponent={
          <View style={styles.center}><Text>Chưa có danh mục nào.</Text></View>
        }
      />
      <View style={styles.formContainer}>
        <TextInput
          placeholder='Tên danh mục mới...'
          value={newCategoryName}
          onChangeText={setNewCategoryName}
          style={styles.input}
          editable={!isAdding}
        />
        <Button
          title="Thêm"
          onPress={onAddCategory}
          isLoading={isAdding}
          style={{ paddingVertical: 12, paddingHorizontal: 20 }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'space-between', backgroundColor: '#F9FAFB' },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    list: { flex: 1 },
    listHeader: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        fontSize: 14,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
    },
    listItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: 'white',
    },
    listItemTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
    listItemDescription: {
        fontSize: 14,
        color: '#6B7280',
        marginTop: 2,
    },
    deleteButton: {
        padding: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#F3F4F6',
    },
    formContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        backgroundColor: 'white',
    },
    input: {
        flex: 1,
        marginRight: 12,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: 'white'
    },
});