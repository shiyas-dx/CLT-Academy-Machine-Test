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
    onMutate: async ({ productId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);
      queryClient.setQueryData(['cart'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.map((item: any) => 
            item.product?._id === productId 
              ? { ...item, quantity } 
              : item
          )
        };
      });
      return { previousCart };
    },
    onError: (err, variables, context: any) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => 
      fetchWithAuth(`/cart/${productId}`, { method: 'DELETE' }),
    onMutate: async (productId) => {
      await queryClient.cancelQueries({ queryKey: ['cart'] });
      const previousCart = queryClient.getQueryData(['cart']);
      queryClient.setQueryData(['cart'], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: old.items.filter((item: any) => item.product?._id !== productId)
        };
      });
      return { previousCart };
    },
    onError: (err, productId, context: any) => {
      if (context?.previousCart) {
        queryClient.setQueryData(['cart'], context.previousCart);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    }
  });
};
