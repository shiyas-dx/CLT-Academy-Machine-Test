import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';

export const useCart = () => {
  return useQuery({
    queryKey: ['cart'],
    queryFn: () => fetchWithAuth('/cart')
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => 
      fetchWithAuth('/cart', { 
        method: 'POST', 
        body: JSON.stringify({ productId, quantity: 1 }) 
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] })
  });
};

export const useUpdateCartQuantity = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, quantity }: { productId: string; quantity: number }) => 
      fetchWithAuth(`/cart/${productId}`, { 
        method: 'PUT', 
        body: JSON.stringify({ quantity }) 
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] })
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => 
      fetchWithAuth(`/cart/${productId}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cart'] })
  });
};
