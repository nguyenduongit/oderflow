// src/services/apiAuth.ts
import { supabase } from '@/lib/supabase';
import type { SignupCredentials, LoginCredentials } from '@/types';

// Hàm đăng ký
export async function signup({ fullName, email, password }: SignupCredentials) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        fullName,
      }
    }
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

// Hàm đăng nhập
export async function login({ email, password }: LoginCredentials) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }
  return data;
}

// Hàm lấy thông tin user hiện tại
export async function getCurrentUser() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data, error } = await supabase.auth.getUser();

  if (error) {
    throw new Error(error.message);
  }
  return data?.user;
}

// Hàm đăng xuất
export async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
}