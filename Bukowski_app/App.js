import React from "react";
import { MenuProvider } from "react-native-popup-menu"; // Import MenuProvider
import { GlobalStateProvider } from "./context/GlobalState"; // Import GlobalStateProvider
import { router } from "expo-router"; // Import router
import RootLayout from "./navigation/RootLayout"; // Ensure the path is correct

export default function App() {
    return (
        <MenuProvider> {/* Ensure MenuProvider wraps the entire app */}
            <GlobalStateProvider>
                <RootLayout /> {/* Render the app's navigation */}
            </GlobalStateProvider>
        </MenuProvider>
    );
}
