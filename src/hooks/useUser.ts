// src/hooks/useUser.ts
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/apiAuth';

export function useUser() {
  const { data: user, isLoading } = useQuery({
    // Khóa cache cho thông tin người dùng
    queryKey: ['user'],
    // Hàm để lấy dữ liệu
    queryFn: getCurrentUser,
  });

  return {
    user,
    isLoading,
    // Trả về true nếu có user và user đã được xác thực
    isAuthenticated: user?.role === 'authenticated',
  };
}