import React, { useContext } from 'react';
import { StyleSheet, Text, View, SafeAreaView, Button } from 'react-native';
import { GlobalStateContext } from '../../context/GlobalState';

const Profile = () => {
  const { logout, user } = useContext(GlobalStateContext); // Access logout function

  const handleLogout = async () => {
    await logout(); // Call the logout function
    console.log("User logged out successfully"); // Debug log
  };

  return (
    <>
      <SafeAreaView className="px-4 my-6 bg-black h-full">
        <View style={styles.container}>
          {/* <Text style={styles.text}>Profile Screen</Text> */}
          {/* Display user details */}
          {user && (
            <View style={styles.userDetails}>
              {Object.entries(user)
                .map(([key, value]) => (
                  <Text key={key} style={styles.userDetailText}>
                    <Text style={{ fontWeight: 'bold' }}>{key}:</Text> {String(value)}
                  </Text>
              ))}
            </View>
          )}
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
  userDetails: {
    marginVertical: 20,
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
  },
  userDetailText: {
    color: 'white',
    fontSize: 14,
    marginBottom: 4,
  },
});
