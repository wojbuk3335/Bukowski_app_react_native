import React, { useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';
import { GlobalStateContext } from '../../context/GlobalState'; // Import global state context

const Home = () => {
  const { user } = useContext(GlobalStateContext); // Access global state

  console.log("Current User in Global State:", user); // Debug log

  return (
    <>
      <SafeAreaView className="px-4 my-6 bg-primary h-full">
        <View style={styles.container}>
          <Text style={styles.text}>Welcome to the Home Screen</Text>
          {user ? (
            <Text style={styles.text}>Logged in as: {user.role}</Text> // Display user email
          ) : (
            <Text style={styles.text}>No user logged in</Text> // Fallback message
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: 'white',
    fontSize: 16,
  },
});
