import React from "react";
import QRScanner from "../QRScanner";
import { GlobalStateContext } from "../../context/GlobalState";
import { useFocusEffect, useIsFocused } from "@react-navigation/native";

export default function App() {
  const { stateData, user, sizes, colors, goods } = React.useContext(GlobalStateContext);
  const isFocused = useIsFocused(); // Check if the tab is focused

  useFocusEffect(
    React.useCallback(() => {
      if (isFocused) {
        return () => {}; // Cleanup logic if needed
      }
    }, [isFocused])
  );

  return (
    <QRScanner
      stateData={stateData}
      user={user}
      sizes={sizes}
      colors={colors}
      goods={goods}
      isActive={isFocused} // Pass isFocused to QRScanner
    />
  );
}