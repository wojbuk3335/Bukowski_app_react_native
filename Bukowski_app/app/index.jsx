import { StatusBar } from "expo-status-bar";
import { router, Link } from "expo-router";
import { View, Text, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "../constants";
import CustomButton from "../components/CustomButton";

import  images2 from "../constants/images";
import bukowskiImage from "./bukowski.png"; // Poprawny import obrazu z tego samego folderu
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
            source={bukowskiImage} // Użycie poprawnie zaimportowanego obrazu
            className="w-[230px] h-[84px] mt-5"
            resizeMode="contain"
          />

          <View className="relative mt-5">

          </View>

          <CustomButton
            title="Logowanie"
            handlePress={() => router.push("/sign-in")}
            containerStyles="w-full mt-7 "
          />
          <Link href="/home" style={{}}>go home</Link>
        </View>
      </ScrollView>

      <StatusBar backgroundColor="#161622" style="light" />
    </SafeAreaView>
  );
};

export default Welcome;



