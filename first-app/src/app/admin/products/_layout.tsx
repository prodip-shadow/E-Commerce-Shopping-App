import { Stack } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../../../constants";

function renderSubHeader({ navigation, options }: { navigation: { goBack: () => void }; options: { title?: string } }) {
    return (
        <View className="bg-white h-12 px-4 flex-row items-center">
            <TouchableOpacity onPress={() => navigation.goBack()} className="mr-3">
                <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text className="text-lg font-bold text-primary">
                {options.title}
            </Text>
        </View>
    );
}

export default function ProductsLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: "#fff" },
                headerTintColor: COLORS.primary,
                headerTitleStyle: { fontWeight: "bold" },
                headerShadowVisible: false,
            }}
        >
            <Stack.Screen name="index" options={{ title: "Manage Products", headerShown: false }} />
            <Stack.Screen
                name="add"
                options={{
                    title: "Add Product",
                    header: renderSubHeader,
                }}
            />
            <Stack.Screen
                name="edit/[id]"
                options={{
                    title: "Edit Product",
                    header: renderSubHeader,
                }}
            />
        </Stack>
    );
}
