import React, { useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import { GlobalStateContext } from '../../context/GlobalState';

const Profile = () => {
  const { logout } = useContext(GlobalStateContext); // Access logout function

  const handleLogout = async () => {
    await logout(); // Call the logout function
    console.log("User logged out successfully"); // Debug log
  };

  return (
    <>
      <SafeAreaView className="px-4 my-6 bg-primary h-full">
        <View style={styles.container}>
          <Text style={styles.text}>Profile Screen</Text>
          <Button title="Log Out" onPress={logout} color="#FF0000" /> 
        </View>
      </SafeAreaView>
    </>
  );
};

export default Profile;

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
