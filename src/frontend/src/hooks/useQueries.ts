import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Product, backendInterface } from "../backend.d";
import { useActor } from "./useActor";

// Cast actor to the updated interface that includes stock fields
function getActor(actor: unknown): backendInterface | null {
  if (!actor) return null;
  return actor as backendInterface;
}

export function useGetAllProducts() {
  const { actor: rawActor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const actor = getActor(rawActor);
      if (!actor) return [];
      return actor.getAllProducts();
    },
    enabled: !!rawActor && !isFetching,
  });
}

export function useGetAllCategories() {
  const { actor: rawActor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async (): Promise<string[]> => {
      const actor = getActor(rawActor);
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!rawActor && !isFetching,
  });
}

export function useGetCart() {
  const { actor: rawActor, isFetching } = useActor();
  return useQuery<Product[]>({
    queryKey: ["cart"],
    queryFn: async (): Promise<Product[]> => {
      const actor = getActor(rawActor);
      if (!actor) return [];
      return actor.getCart();
    },
    enabled: !!rawActor && !isFetching,
  });
}

export function useAddToCart() {
  const { actor: rawActor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      const actor = getActor(rawActor);
      if (!actor) throw new Error("Not connected");
      await actor.addToCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useRemoveFromCart() {
  const { actor: rawActor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (productId: bigint) => {
      const actor = getActor(rawActor);
      if (!actor) throw new Error("Not connected");
      await actor.removeFromCart(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function useClearCart() {
  const { actor: rawActor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const actor = getActor(rawActor);
      if (!actor) throw new Error("Not connected");
      await actor.clearCart();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
}

export function usePlaceOrder() {
  const { actor: rawActor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const actor = getActor(rawActor);
      if (!actor) throw new Error("Not connected");
      await actor.placeOrder();
    },
    onSuccess: () => {
      // placeOrder clears the cart and deducts stock
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAddProduct() {
  const { actor: rawActor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      name: string;
      description: string;
      price: bigint;
      category: string;
      imageUrl: string;
      stock: bigint;
    }) => {
      const actor = getActor(rawActor);
      if (!actor) throw new Error("Not connected");
      return actor.addProduct(
        args.name,
        args.description,
        args.price,
        args.category,
        args.imageUrl,
        args.stock,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useUpdateProduct() {
  const { actor: rawActor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      category: string;
      imageUrl: string;
      stock: bigint;
    }) => {
      const actor = getActor(rawActor);
      if (!actor) throw new Error("Not connected");
      return actor.updateProduct(
        args.id,
        args.name,
        args.description,
        args.price,
        args.category,
        args.imageUrl,
        args.stock,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const { actor: rawActor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      const actor = getActor(rawActor);
      if (!actor) throw new Error("Not connected");
      await actor.deleteProduct(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useAddCategory() {
  const { actor: rawActor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const actor = getActor(rawActor);
      if (!actor) throw new Error("Not connected");
      await actor.addCategory(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const { actor: rawActor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const actor = getActor(rawActor);
      if (!actor) throw new Error("Not connected");
      await actor.deleteCategory(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
