import React from "react";
import QRScanner from "../QRScanner";
import { GlobalStateContext } from "../../context/GlobalState"; // Import GlobalStateContext

export default function App() {
  const { stateData, user, sizes, colors, goods } = React.useContext(GlobalStateContext); // Access all data from context

  return (
    <QRScanner
      stateData={stateData}
      user={user}
      sizes={sizes}
      colors={colors}
      goods={goods}
    /> // Pass all data as props
  );
}