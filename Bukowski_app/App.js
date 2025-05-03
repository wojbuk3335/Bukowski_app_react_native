import React from "react";
import { MenuProvider } from "react-native-popup-menu"; // Import MenuProvider
import { GlobalStateProvider } from "./context/GlobalState"; // Import GlobalStateProvider
import { router } from "expo-router"; // Import router

export default function App() {
    return (
        <MenuProvider> {/* Ensure MenuProvider wraps the entire app */}
            <GlobalStateProvider>
                <router /> {/* Render the app's navigation */}
            </GlobalStateProvider>
        </MenuProvider>
    );
}
