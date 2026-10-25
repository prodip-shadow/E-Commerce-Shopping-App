import { dummyUser } from "@/assets/assets";
import Header from "@/components/Header";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../../../constants";

export default function Profile() {
  const { user } = { user: dummyUser };
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top"]}>
      <Header title="Profile" />
      <ScrollView
        className="flex-1 p-4"
        contentContainerStyle={
          !user
            ? { flex: 1, justifyContent: "center", alignItems: "center" }
            : { padding: 16 }
        }
      >
        {!user ? (
          // Guest user view
          <View className="items-center w-full">
            <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center mb-6">
              <Ionicons name="person" size={40} color={COLORS.secondary} />
            </View>
            <Text className="text-primary font-bold text-xl mb-2">
              Guest User
            </Text>
            <Text className="text-secondary text-base mb-8 text-center w-3/4 px-4">
              Log in to view your profile, orders,and address.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/sign-in")}
              className="bg-primary w-3/5 py-3 rounded-full items-center shadow-lg "
            >
              <Text className="text-white font-bold text-lg">
                Login / Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Profile Info */}
            <View className="items-center mb-8">
              <View className="mb-3">
                <Image
                  source={{ uri: user.imageUrl }}
                  className="size-20 border-2 border-white shadow-sm rounded-full"
                />
              </View>
              <Text className="text-xl font-bold text-primary">
                {user.firstName + " " + user.lastName}
              </Text>
              <Text className="text-secondary text-sm">
                {user.emailAddresses[0].emailAddress}
              </Text>


          {/* Admin pannel button if user is admin */}
          {
            user.publicMetadata?.role==='admin' && (
              <TouchableOpacity onPress={()=>router.push('/admin')} className="mt-4 bg-primary px-6 py-2 rounded-full">
                <Text className="text-white font-bold">Admin Pannel</Text>
              </TouchableOpacity>
            )
          }


            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
