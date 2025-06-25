// src/hooks/useRestaurant.ts
import { useQuery } from '@tanstack/react-query';
import { getRestaurantByOwner } from '@/services/apiRestaurants';

export function useRestaurant() {
    const { data: restaurant, isLoading, error } = useQuery({
        queryKey: ['restaurant'],
        queryFn: getRestaurantByOwner,
    });

    return { restaurant, isLoading, error };
}