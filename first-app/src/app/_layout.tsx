import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Toast, { InfoToast } from "react-native-toast-message";
import "../../global.css";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CartProvider>
        <WishlistProvider>
          <Stack screenOptions={{ headerShown: false }} />

          <Toast
            config={{
              info: (props) => (
                <InfoToast
                  {...props}
                  touchableContainerProps={{
                    accessibilityRole: "alert",
                    accessibilityLiveRegion: "assertive",
                  }}
                />
              ),
            }}
          />
        </WishlistProvider>
      </CartProvider>
    </GestureHandlerRootView>
  );
}
