import { StatusBar } from "expo-status-bar";
import { router } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import bukowskiLogo from "./bukowski.png"; // Correctly import the logo image

import CustomButton from "../components/CustomButton";

const Welcome = () => {
  return (
    <SafeAreaView className="bg-black h-full">
      <ScrollView
        contentContainerStyle={{
          height: "100%",
        }}
      >
        <View className="w-full flex justify-center items-center h-full px-4">
          <Image
            source={bukowskiLogo} // Use the imported image
            resizeMode="contain"
            className="w-[190px] h-[54px]"
            style={{ alignSelf: "center" }} // Center the image horizontally
          />
          <CustomButton
            title="Logowanie"
            handlePress={() => router.push("/(auth)/sign-in")}
            containerStyles="w-full mt-7"
          />
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default Welcome;



