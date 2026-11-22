import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Product, WishlistContextType } from "../constants/types";
import { useAuth } from "@clerk/expo";
import api from "@/constants/api";
import Toast from "react-native-toast-message";

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { getToken, isSignedIn } = useAuth();
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const latestSeqRef = useRef<Record<string, number>>({});

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await api.get("/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && data.data) {
        setWishlist(data.data.products || []);
      }
    } catch (error: any) {
      console.log("Wishlist API Error:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (product: Product) => {
    if (!isSignedIn) {
      Toast.show({
        type: "error",
        text1: "Please sign in to save items to your wishlist.",
      });
      return;
    }

    const prevWishlist = wishlist;
    const seq = (latestSeqRef.current[product._id] || 0) + 1;
    latestSeqRef.current[product._id] = seq;

    setWishlist((prev) => {
      const exists = prev.some((p) => p._id === product._id);
      if (exists) {
        return prev.filter((p) => p._id !== product._id);
      }
      return [...prev, product];
    });

    try {
      const token = await getToken();
      const { data } = await api.post(
        "/wishlist/toggle",
        { productId: product._id },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (latestSeqRef.current[product._id] === seq && data.success && data.data) {
        setWishlist(data.data.products || []);
      }
    } catch (error: any) {
      if (latestSeqRef.current[product._id] === seq) {
        setWishlist(prevWishlist);
        console.log("Error toggling wishlist:", error.message);
        Toast.show({
          type: "error",
          text1: error.response?.data?.message || "Failed to update wishlist",
        });
      }
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((p) => p._id === productId);
  };

  useEffect(() => {
    if (isSignedIn) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isSignedIn]);

  return (
    <WishlistContext.Provider
      value={{ wishlist, loading, isInWishlist, toggleWishlist }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error("useWishlist must be used within the wishlistProvider");
  }
  return context;
}
