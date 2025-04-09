import React from 'react';
import { Text, View, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView for safe area handling
import { GlobalStateContext } from "../../context/GlobalState"; // Import global state context


const Home = () => {
  const { user } = React.useContext(GlobalStateContext); // Access global state
  return (
    <>
      <SafeAreaView className="bg-primary">
        <FlatList
          data={[{ id: 1 }, { id: 2 }, { id: 3 }]}
          keyExtractor={(item) => item.id.toString()} // Corrected keyExtractor
          renderItem={({ item }) => (
            <Text className="text-3xl text-white">{item.id}</Text>
          )}
          ListHeaderComponent={() => {
            return ( // Explicitly returning JSX
              <View className="my-6 px-4 space-y-6">
                <View className="justify-between items-start flex-row mb-6">
                  <View>
                    <Text className="font-pmedium text-sm text-gray-100">Welcome Back</Text>
                    <Text className="font-psemibold text-l text-white">
                      {user?.email}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      </SafeAreaView>
    </>
  );
};

export default Home;