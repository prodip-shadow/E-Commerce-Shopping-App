import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Product } from "../constants/types";
import { useAuth } from "@clerk/expo";
import api from "@/constants/api";
import Toast from "react-native-toast-message";

export type CartItem = {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  size: string;
  price: number;
};

type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, size: string) => Promise<void>;
  removeFromCart: (itemId: string, size: string) => Promise<void>;
  updateQuantity: (
    itemId: string,
    quantity: number,
    size: string,
  ) => Promise<void>;
  clearCart: () => Promise<void>;
  cartTotal: number;
  itemCount: number;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pendingTimersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>(
    {},
  );
  const latestSeqRef = useRef<Record<string, number>>({});
  const rollbackItemsRef = useRef<Record<string, CartItem[]>>({});

  const cartTotal = useMemo(
    () =>
      cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems],
  );

  const applyServerCart = (serverCart: any) => {
    const mappedItems: CartItem[] = (serverCart?.items || []).map(
      (item: any) => ({
        id: item._id,
        productId: item.product._id,
        product: item.product,
        quantity: item.quantity,
        size: item.size,
        price: item.price,
      }),
    );
    setCartItems(mappedItems);
  };

  const fetchCart = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.get("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.data) {
        applyServerCart(data.data);
      }
    } catch (error: any) {
      console.log("Cart API Error:", error.message);
      console.log("Status:", error.response?.status);
      console.log("Backend Response:", error.response?.data);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (product: Product, size: string) => {
    if (!isSignedIn) {
      return Toast.show({
        type: "error",
        text1: "Please sign in to add items to your cart.",
      });
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.post(
        "/cart/add",
        {
          productId: product._id,
          quantity: 1,
          size,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (data.success && data.data) {
        applyServerCart(data.data);
      }
    } catch (error: any) {
      console.log("Error adding to cart:", error.message);
      Toast.show({
        type: "error",
        text1: "Error adding to cart",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (productId: string, size: string) => {
    if (!isSignedIn) {
      return;
    }

    const key = `${productId}:${size}`;
    if (pendingTimersRef.current[key]) {
      clearTimeout(pendingTimersRef.current[key]);
      delete pendingTimersRef.current[key];
    }
    latestSeqRef.current[key] = (latestSeqRef.current[key] || 0) + 1;

    const prevItems = cartItems;
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.productId === productId && item.size === size),
      ),
    );

    try {
      const token = await getToken();
      const { data } = await api.delete(
        `/cart/item/${productId}?size=${encodeURIComponent(size)}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (data.success && data.data) {
        applyServerCart(data.data);
      }
    } catch (error: any) {
      setCartItems(prevItems);
      console.log("Error removing from cart:", error.message);
    }
  };

  const updateQuantity = async (
    productId: string,
    quantity: number,
    size: string = "M",
  ) => {
    if (!isSignedIn || quantity < 1) {
      return;
    }

    const currentItem = cartItems.find(
      (item) => item.productId === productId && item.size === size,
    );
    if (
      currentItem?.product?.stock !== undefined &&
      quantity > currentItem.product.stock
    ) {
      Toast.show({
        type: "error",
        text1: "Insufficient stock for the requested quantity",
      });
      return;
    }

    const key = `${productId}:${size}`;
    if (!rollbackItemsRef.current[key]) {
      rollbackItemsRef.current[key] = cartItems;
    }

    const seq = (latestSeqRef.current[key] || 0) + 1;
    latestSeqRef.current[key] = seq;

    setCartItems((prev) =>
      prev.map((item) =>
        item.productId === productId && item.size === size
          ? { ...item, quantity }
          : item,
      ),
    );

    if (pendingTimersRef.current[key]) {
      clearTimeout(pendingTimersRef.current[key]);
    }

    pendingTimersRef.current[key] = setTimeout(async () => {
      delete pendingTimersRef.current[key];
      try {
        const token = await getToken();
        const { data } = await api.put(
          `/cart/item/${productId}`,
          { quantity, size },
          { headers: { Authorization: `Bearer ${token}` } },
        );

        if (latestSeqRef.current[key] === seq) {
          delete rollbackItemsRef.current[key];
          if (data.success && data.data) {
            applyServerCart(data.data);
          }
        }
      } catch (error: any) {
        if (latestSeqRef.current[key] === seq) {
          const rollback = rollbackItemsRef.current[key];
          delete rollbackItemsRef.current[key];
          if (rollback) {
            setCartItems(rollback);
          }
          console.log("Failed to update cart item:", error.message);
          Toast.show({
            type: "error",
            text1: error.response?.data?.message || "Failed to update quantity",
          });
        }
      }
    }, 300);
  };

  const clearCart = async () => {
    if (!isSignedIn) {
      return;
    }

    try {
      setIsLoading(true);
      const token = await getToken();
      const { data } = await api.delete("/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setCartItems([]);
      }
    } catch (error: any) {
      console.log("Failed to clear cart:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  useEffect(() => {
    if (isSignedIn) {
      fetchCart();
    } else {
      setCartItems([]);
    }
  }, [isSignedIn]);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        itemCount,
        isLoading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within the CartProvider");
  }
  return context;
}
