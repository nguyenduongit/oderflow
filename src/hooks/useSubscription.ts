// src/hooks/useSubscription.ts
import { useQuery } from '@tanstack/react-query';
import { useRestaurant } from './useRestaurant';
import { getActiveSubscription } from '@/services/apiSubscription';

export function useSubscription() {
  const { restaurant } = useRestaurant();

  const { data: subscription, isLoading } = useQuery({
    queryKey: ['subscription', restaurant?.id],
    queryFn: () => getActiveSubscription(restaurant!.id),
    enabled: !!restaurant,
  });

  return { subscription, isLoading };
}