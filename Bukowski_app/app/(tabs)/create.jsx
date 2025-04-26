import React from "react";
import QRScanner from "../QRScanner";
import { GlobalStateContext } from "../../context/GlobalState"; // Import GlobalStateContext

export default function App() {
  const { stateData } = React.useContext(GlobalStateContext); // Access stateData from context
   const { user } = React.useContext(GlobalStateContext); // Access global state

  return <QRScanner stateData={stateData}  user={user}/>; // Pass stateData as props
}