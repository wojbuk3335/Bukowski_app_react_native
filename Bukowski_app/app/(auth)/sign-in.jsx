import { useEffect, useState, useContext } from "react";
import { Link, useNavigation, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, ScrollView, Dimensions, Alert, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { images } from "../../constants";
import CustomButton from "../../components/CustomButton";
import FormField from "../../components/FormField";
import { GlobalStateContext } from "../../context/GlobalState";
import bukowskiLogo from "./bukowski.png"; // Import the image

const SignIn = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const navigation = useNavigation();
  const { setUser, bukowski_login, isLoading, user } = useContext(GlobalStateContext); // Access global state

  useEffect(() => {
    const checkUserInStorage = async () => {
      try {
        const userData = await AsyncStorage.getItem("user");
        if (userData) {
          setUser(JSON.parse(userData)); // Restore user data to global state
          router.replace("/home") // Redirect to home screen
        }
      } catch (error) {
        console.error("Failed to retrieve user data from storage:", error);
      }
    };

    checkUserInStorage();
  }, []);

  const submit = async () => {
    try {
      const response = await bukowski_login(form.email, form.password, navigation);
      setUser(response); // Update global state with user data
      router.replace("/home") // Redirect to home screen
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <SafeAreaView className="bg-primary h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >
          <Image
            source={bukowskiLogo} // Use the imported image
            resizeMode="contain"
            className="w-[190px] h-[54px]"
            style={{ alignSelf: "center" }} // Center the image horizontally
          />

          <Text className="text-2xl font-semibold text-white mt-10 font-psemibold text-center">
            Zaloguj się do aplikacji
          </Text>

          <FormField
            title="Email"
            value={form.email}
            handleChangeText={(e) => setForm({ ...form, email: e.trim() })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Hasło"
            value={form.password}
            handleChangeText={(e) => setForm({ ...form, password: e.trim() })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Zologuj się"
            handlePress={submit}
            containerStyles="mt-7"
            isLoading={isLoading} // Use global isLoading state
          />
{/* 
          <View className="flex justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Nie masz jeszcze konta?
            </Text>
            <Link
              href="/sign-up"
              className="text-lg font-psemibold text-secondary"
            >
              Signup
            </Link>
          </View> */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
