// src/screens/(auth)/AuthScreen.tsx

import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, TextInput, TouchableOpacity, SafeAreaView,  } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { login, signup } from '@/services/apiAuth';
import type { LoginCredentials, SignupCredentials } from '@/types';
import Button from '@/components/Button'; // Sử dụng Button tùy chỉnh

// --- Component Form Đăng nhập ---
const LoginForm = ({ onLogin, isPending }: { onLogin: (data: LoginCredentials) => void, isPending: boolean }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.formContainer}>
      <TextInput
        placeholder='Email'
        keyboardType='email-address'
        autoCapitalize='none'
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        editable={!isPending}
      />
      <TextInput
        placeholder='Mật khẩu'
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        editable={!isPending}
      />
      <Button
        title="Đăng nhập"
        onPress={() => onLogin({ email, password })}
        isLoading={isPending}
        style={styles.button}
      />
    </View>
  );
};

// --- Component Form Đăng ký ---
const SignUpForm = ({ onSignup, isPending }: { onSignup: (data: SignupCredentials) => void, isPending: boolean }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <View style={styles.formContainer}>
      <TextInput
        placeholder='Họ và Tên'
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        editable={!isPending}
      />
      <TextInput
        placeholder='Email'
        keyboardType='email-address'
        autoCapitalize='none'
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        editable={!isPending}
      />
      <TextInput
        placeholder='Mật khẩu (ít nhất 6 ký tự)'
        secureTextEntry
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        editable={!isPending}
      />
      <Button
        title="Tạo tài khoản"
        onPress={() => onSignup({ fullName, email, password })}
        isLoading={isPending}
        style={styles.button}
      />
    </View>
  );
};

// --- Màn hình chính ---
export default function AuthScreen() {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const queryClient = useQueryClient();

  const { mutate: loginMutation, isPending: isLoggingIn } = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      // Khi đăng nhập thành công, ta cập nhật cache của user
      if (data && data.user) {
        queryClient.setQueryData(['user'], data.user);
      }
    },
    onError: (err: Error) => {
      Alert.alert('Lỗi Đăng nhập', err.message);
    },
  });

  const { mutate: signupMutation, isPending: isSigningUp } = useMutation({
    mutationFn: signup,
    onSuccess: () => {
      Alert.alert('Thành công', 'Tài khoản đã được tạo. Vui lòng đăng nhập.');
      setActiveTab('login'); // Chuyển sang tab đăng nhập
    },
    onError: (err: Error) => {
       Alert.alert('Lỗi Đăng ký', err.message);
    },
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
            <Text style={styles.title}>OrderFlow</Text>
            <Text style={styles.subtitle}>Quản lý nhà hàng của bạn</Text>
        </View>

        {/* Custom Tab Switcher */}
        <View style={styles.tabSwitcher}>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'login' && styles.activeTabButton]}
                onPress={() => setActiveTab('login')}
            >
                <Text style={[styles.tabText, activeTab === 'login' && styles.activeTabText]}>Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tabButton, activeTab === 'signup' && styles.activeTabButton]}
                onPress={() => setActiveTab('signup')}
            >
                <Text style={[styles.tabText, activeTab === 'signup' && styles.activeTabText]}>Đăng ký</Text>
            </TouchableOpacity>
        </View>

        {/* Hiển thị form tương ứng */}
        {activeTab === 'login'
            ? <LoginForm onLogin={loginMutation} isPending={isLoggingIn} />
            : <SignUpForm onSignup={signupMutation} isPending={isSigningUp} />
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  tabSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 4,
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  activeTabText: {
    color: '#111827',
  },
  formContainer: {
    width: '100%',
  },
  input: {
    height: 48,
    borderColor: '#D1D5DB',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  button: {
    marginTop: 16,
  }
});