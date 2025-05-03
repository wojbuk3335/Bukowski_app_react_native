import React from "react";
import { View, Text, StyleSheet } from "react-native";

const WriteOff = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Write-Off Screen</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#161622", // Match the app's theme
  },
  text: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default WriteOff;