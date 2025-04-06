import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';

const Bookmark = () => {
  return (
    <>
      <SafeAreaView className="px-4 my-6 bg-primary h-full">
        <View style={styles.container}>
          <Text style={styles.text}>Bookmark Screen</Text>
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
  },
});
