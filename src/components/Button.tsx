// src/components/common/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View, ViewStyle, TextStyle, StyleProp } from 'react-native';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  // THÊM PROP MỚI: cho phép truyền vào một component icon
  icon?: React.ReactElement;
}

export default function Button({
  title,
  onPress,
  disabled = false,
  variant = 'primary',
  isLoading = false,
  style,
  textStyle,
  icon, // Nhận icon từ props
}: Props) {
  const buttonStyles = [styles.button, styles[variant], disabled || isLoading ? styles.disabled : {}, style];
  const textStyles = [styles.text, styles[`${variant}Text`], textStyle];

  return (
    <TouchableOpacity style={buttonStyles} onPress={onPress} disabled={disabled || isLoading}>
      {isLoading ? (
        <ActivityIndicator color="#FFFFFF" />
      ) : (
        // THAY ĐỔI Ở ĐÂY: Render cả icon và text
        <>
          {icon && <View style={styles.iconWrapper}>{icon}</View>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16, // Giảm padding ngang một chút để có chỗ cho icon
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row', // Quan trọng: để icon và text nằm cạnh nhau
  },
  iconWrapper: {
    marginRight: 8, // Tạo khoảng cách giữa icon và text
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    lineHeight: 20, // Giúp căn chỉnh text và icon dễ hơn
  },
  primary: {
    backgroundColor: '#3B82F6',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  dangerText: {
    color: '#FFFFFF',
  },
  disabled: {
    opacity: 0.6,
  },
});