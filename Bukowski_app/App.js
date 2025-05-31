import React from "react";
import { MenuProvider } from "react-native-popup-menu"; // Import MenuProvider
import { GlobalStateProvider } from "./context/GlobalState"; // Import GlobalStateProvider
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import { NavigationContainer } from "@react-navigation/native"; // Import NavigationContainer
import RootLayout from "./RootLayout"; // Import RootLayout

const App = () => {
  return (
    <MenuProvider> {/* Ensure MenuProvider wraps the entire app */}
      <GlobalStateProvider> {/* Wrap the app with GlobalStateProvider */}
        <AuthProvider> {/* Wrap the app with AuthProvider */}
          <NavigationContainer>
            <RootLayout /> {/* Render the root layout */}
          </NavigationContainer>
        </AuthProvider>
      </GlobalStateProvider>
    </MenuProvider>
  );
};

export default App;
