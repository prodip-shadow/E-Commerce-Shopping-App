import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants";
import { HeaderProps } from "../../constants/types";

export default function Header({
  title,
  showBack,
  showSearch,
  showMenu,
  showCart,
  showLogo,
}: HeaderProps) {
  const router = useRouter();
  const { itemCount } = { itemCount: 6 };

  return (
    <View className="flex-row items-center justify-between px-4 py-3 bg-white">
      {/* Left Side: Back / Menu */}
      <View className="flex-row items-center min-w-[40px] justify-start">
        {showBack && (
          <TouchableOpacity onPress={() => router.back()} className="p-1 mr-2">
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {showMenu && (
          <TouchableOpacity className="p-1">
            <Ionicons name="menu-outline" size={26} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Center: Logo or Title */}
      <View className="flex-1 items-center justify-center px-2">
        {showLogo ? (
          <Image
            source={require("../../assets/logo.png")}
            style={{ width: 120, height: 26 }}
            resizeMode="contain"
          />
        ) : (
          title ? (
            <Text className="text-xl font-bold text-primary text-center">
              {title}
            </Text>
          ) : null
        )}
      </View>

      {/* Right Side: Search / Cart */}
      <View className="flex-row items-center min-w-[40px] justify-end gap-3">
        {showSearch && (
          <TouchableOpacity className="p-1">
            <Ionicons name="search-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}

        {showCart && (
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/cart")}
            className="p-1"
          >
            <View className="relative">
              <Ionicons name="bag-outline" size={24} color={COLORS.primary} />
              <View className="absolute -top-1 -right-1 bg-red-800 w-4 h-4  rounded-full items-center justify-center">
                <Text className="text-white text-[10px] font-bold">
                    {itemCount}
                  </Text>
                </View>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
