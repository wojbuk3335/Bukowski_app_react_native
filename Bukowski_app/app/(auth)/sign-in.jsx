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
          router.replace("/home"); // Redirect to home screen
        } else {
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
    <SafeAreaView className="bg-black h-full">
      <ScrollView>
        <View
          className="w-full flex justify-center h-full px-4 my-6"
          style={{
            minHeight: Dimensions.get("window").height - 100,
          }}
        >


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
            secureTextEntry={true} // Explicitly enable secure text entry
          />

          <CustomButton
            title="Zologuj się"
            handlePress={submit}
            containerStyles="mt-7 mb-4"
            isLoading={isLoading} // Use global isLoading state
          />
            
          <Image
            source={bukowskiLogo} // Use the imported image
            resizeMode="contain"
            className="w-[190px] h-[54px] mt-4"
            style={{ alignSelf: "center", marginBottom: 20 }} // Center the image and add spacing
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
