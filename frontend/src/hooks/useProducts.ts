import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWithAuth } from '@/lib/api';

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
  videos: string[];
  createdAt: string;
  updatedAt: string;
}

export const useProducts = () => {
  return useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => fetchWithAuth('/products')
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => fetchWithAuth('/products', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });
};

export const useGetProductById = (id: string) => {
  return useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => fetchWithAuth(`/products/${id}`),
    enabled: !!id,
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string } & Partial<Product>) => 
      fetchWithAuth(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    }
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => fetchWithAuth(`/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });
};
