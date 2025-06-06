import { StatusBar } from "expo-status-bar";
import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import EvilIcons from "@expo/vector-icons/FontAwesome";

import { icons } from "../../constants";

const TabIcon = ({ icon, color, name, focused, customIcon }) => {
  return (
    <View
      className="flex items-center justify-center gap-2 w-20 pt-4"
      style={{ height: 60 }} // Ensures enough height for the icon and text
    >
      {customIcon ? (
        <Ionicons
          name={customIcon}
          size={29}
          color={color}
          style={{ marginBottom: 0 }} // Reduced margin for consistent spacing
        />
      ) : (
        <Image
          source={icon}
          resizeMode="contain"
          tintColor={color}
          className="w-6 h-6 mb-1"
        />
      )}
      <Text
        className={`${focused ? "font-psemibold" : "font-pregular"} text-xs`}
        style={{ color: color, textAlign: "center" }} // Ensures text alignment
      >
        {name}
      </Text>
    </View>
  );
};

const TabLayout = () => {
  return (
    <>
      <Tabs
        options={{ headerShown: false }}
        screenOptions={{
          tabBarActiveTintColor: "#0d6efd", // Zmieniono kolor aktywnego przycisku
          tabBarInactiveTintColor: "#CDCDE0",
          tabBarShowLabel: false,
          tabBarStyle: {
            backgroundColor: "black",
            borderTopWidth: 1,
            borderTopColor: "#232533",
            height: 84,
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name="Sprzedaż"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="writeoff"
          options={{
            title: "Odpisać",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                customIcon="arrow-forward-circle" // Ionicons arrow icon
                color={color}
                name="Odpisać"
                focused={focused}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: "Search",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.bookmark}
                color={color}
                name="Szukaj"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="create"
          options={{
            title: "Create",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.plus}
                color={color}
                name="Dodaj"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: "Profile",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.profile}
                color={color}
                name="Profil"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      <StatusBar backgroundColor="#161622" style="light" />
    </>
  );
};

export default TabLayout;
