import React, { useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import { GlobalStateContext } from '../../context/GlobalState'; // Import global state context
import { router } from 'expo-router'; // Import router for navigation

const Home = () => {
  const { user, logout } = useContext(GlobalStateContext); // Access global state

  const handleLogout = async () => {
    await logout(); // Call the logout function to clear user data
    router.replace("/"); // Redirect to the main page (index.jsx)
  };

  return (
    <>
      <SafeAreaView className="px-4 my-6 bg-primary h-full">
        <View style={styles.container}>
          <Button title="Logout" onPress={handleLogout} color="#FF6347" />
          <Text style={styles.text}>Welcome, {user?.token}</Text>
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
    marginBottom: 10,
  },
});
