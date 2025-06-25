// src/components/common/Card.tsx
import React from 'react';
// THÊM StyleProp VÀO IMPORT
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';

interface Props {
  children: React.ReactNode;
  // SỬA KIỂU DỮ LIỆU CỦA STYLE
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, style }: Props) {
  // Logic bên trong không đổi, nó đã xử lý mảng style đúng cách
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.20,
    shadowRadius: 1.41,
    elevation: 2,
  },
});