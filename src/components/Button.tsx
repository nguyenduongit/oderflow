// src/components/common/Button.tsx
import React from 'react';
// THÊM StyleProp và ViewStyle VÀO IMPORT
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, StyleProp } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  // SỬA LẠI KIỂU DỮ LIỆU CỦA STYLE
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function Button({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  isLoading = false,
  style,
  textStyle,
}: Props) {
  // Logic bên trong không đổi, nó đã xử lý mảng style đúng cách
  const buttonStyles = [styles.button, styles[variant], disabled || isLoading ? styles.disabled : {}, style];
  const textStyles = [styles.text, styles[`${variant}Text`], textStyle];

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={disabled || isLoading}>
      {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={textStyles}>{title}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  primary: {
    backgroundColor: '#3B82F6', // Blue
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: '#6B7280', // Gray
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  danger: {
    backgroundColor: '#EF4444', // Red
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.6,
  },
});