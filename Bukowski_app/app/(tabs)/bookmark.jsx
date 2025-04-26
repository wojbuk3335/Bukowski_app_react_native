import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { GlobalStateContext } from "../../context/GlobalState"; // Import global state context

const Bookmark = () => {
  const { stateData } = React.useContext(GlobalStateContext); // Access global state

  return (
    <>
      <SafeAreaView className="px-4 my-6 bg-primary h-full">
        <View style={styles.container}>
          {stateData === null ? (
            <Text style={styles.text}>Loading data...</Text> // Show loading message
          ) : stateData.length > 0 ? (
            stateData.map((item, index) => (
              <Text key={index} style={styles.text}>
                {item.fullName} - {item.barcode} - {item.size} - {item.symbol}
              </Text>
            ))
          ) : (
            <Text style={styles.text}>No data available</Text> // Show if stateData is empty
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default Bookmark;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    marginBottom: 10,
  },
});
