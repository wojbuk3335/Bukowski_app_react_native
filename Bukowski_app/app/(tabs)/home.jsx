import React, { useState } from 'react';
import { Text, View, FlatList, TouchableOpacity, Modal, Pressable, RefreshControl, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView for safe area handling
import { GlobalStateContext } from "../../context/GlobalState"; // Import global state context
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect

const Home = () => {
  const { user, logout } = React.useContext(GlobalStateContext); // Access global state and logout function
  console.log('User:', user); // Log the user object
  const [salesData, setSalesData] = useState([]); // State to store API data
  const [filteredData, setFilteredData] = useState([]); // State to store filtered data
  const [totals, setTotals] = useState({ cash: {}, card: {} }); // State to store aggregated totals
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [selectedItem, setSelectedItem] = useState(null); // State for selected item
  const [refreshing, setRefreshing] = useState(false); // State for refresh control
  const [editModalVisible, setEditModalVisible] = useState(false); // State for edit modal visibility
  const [editData, setEditData] = useState(null); // State to store data for editing

  const fetchSalesData = async () => {
    try {
      const response = await fetch('https://bukowskiapp.pl/api/sales/get-all-sales');
      const data = await response.json();
      setSalesData(data); // Update state with API data

      // Filter data based on user's sellingPoint
      const filtered = data.filter(item => item.sellingPoint === user?.sellingPoint);
      setFilteredData(filtered); // Update state with filtered data

      // Calculate totals grouped by currency
      const currencyTotals = { cash: {}, card: {} };
      filtered.forEach((item) => {
        item.cash?.forEach(({ price, currency }) => {
          currencyTotals.cash[currency] = (currencyTotals.cash[currency] || 0) + price;
        });
        item.card?.forEach(({ price, currency }) => {
          currencyTotals.card[currency] = (currencyTotals.card[currency] || 0) + price;
        });
      });
      setTotals(currencyTotals); // Update totals state
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  const fetchItemData = async (id) => {
    try {
      const response = await fetch(`https://bukowskiapp.pl/api/sales/${id}`);
      if (!response.ok) {
        throw new Error("Failed to fetch item data.");
      }
      const data = await response.json();
      setEditData(data); // Set the fetched data for editing
      setEditModalVisible(true); // Show the edit modal
    } catch (error) {
      console.error("Error fetching item data:", error.message);
    }
  };

  const updateItem = async () => {
    try {
      if (editData?._id) {
        const response = await fetch(
          `https://bukowskiapp.pl/api/sales/update-sales/${editData._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(editData), // Send updated data
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update the item.");
        }
        console.log("Updated item:", editData._id);
        setFilteredData((prev) =>
          prev.map((item) => (item._id === editData._id ? editData : item))
        ); // Update the item in the list
        setEditModalVisible(false); // Close the edit modal
      } else {
        console.error("No valid ID found for the item to update.");
      }
    } catch (error) {
      console.error("Error updating item:", error.message);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSalesData(); // Fetch data when the tab is focused
    }, [user?.sellingPoint])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSalesData(); // Fetch data on pull-to-refresh
    setRefreshing(false);
  };

  return (
    <>
      <SafeAreaView className="bg-black h-full flex-1">
        <FlatList
          data={filteredData} // Use filtered data
          keyExtractor={(item, index) => item?._id?.toString() || index.toString()} // Handle missing or undefined id
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} /> // Add RefreshControl
          }
          renderItem={({ item, index }) => (
            <View className="mb-4 px-4 py-2 flex-row items-center bg-blue-800 rounded-lg">
              <Text className="text-[10px] text-gray-300">{index + 1}.</Text>
              <Text className="text-[10px] text-white flex-1 ml-2">
                {item.fullName} {item.size} ({item.from})
              </Text>
              <Text className="text-[10px] text-gray-300 mr-4">
                {item.cash?.length > 0 ? `${item.cash[0].price} ${item.cash[0].currency}` : '-'}
              </Text>
              <Text className="text-[10px] text-gray-300 mr-4">
                {item.card?.length > 0 ? `${item.card[0].price} ${item.card[0].currency}` : '-'}
              </Text>
              <TouchableOpacity onPress={() => { setSelectedItem(item); setModalVisible(true); }}>
                <Text className="text-[28px] text-white">⋮</Text>
              </TouchableOpacity>
            </View>
          )}
          ListHeaderComponent={() => {
            return (
              <View className="my-6 px-4 space-y-6">
                <View className="flex-row justify-between items-center mb-6">
                  <Text className="font-pmedium text-sm text-gray-100">
                    Zalogowany jako: <Text style={{ fontWeight: 'bold' }}>{user?.email}</Text>
                  </Text>
                  <TouchableOpacity
                    onPress={() => logout()} // Call the logout function
                    className="bg-[#0d6efd] px-4 py-2 rounded-lg" // Updated background color
                  >
                    <Text className="text-sm text-white font-bold">Wyloguj</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row items-center px-4">
                  <Text className="text-[10px] text-gray-300">Lp</Text>
                  <Text className="text-[10px] text-gray-300 flex-1 ml-2">Produkt</Text>
                  <Text className="text-[10px] text-gray-300 mr-4">Gotówka</Text>
                  <Text className="text-[10px] text-gray-300">Karta</Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={() => {
            return (
              <View className="mt-6 px-4">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[10px] text-gray-300 font-bold">Suma:</Text>
                  <View className="flex-row">
                    <Text className="text-[10px] text-gray-300 mr-4">Gotówki:</Text>
                    {Object.entries(totals.cash || {}).map(([currency, total]) => (
                      <Text key={`cash-${currency}`} className="text-[10px] text-white mr-2">
                        {total} {currency}
                      </Text>
                    ))}
                  </View>
                </View>
                <View className="flex-row justify-end">
                  <Text className="text-[10px] text-gray-300 mr-4">Na kartę:</Text>
                  {Object.entries(totals.card || {}).map(([currency, total]) => (
                    <Text key={`card-${currency}`} className="text-[10px] text-white mr-2">
                      {total} {currency}
                    </Text>
                  ))}
                </View>
              </View>
            );
          }}
          contentContainerStyle={{ paddingBottom: 20 }} // Add padding to avoid clipping at the bottom
        />
        {/* Edit Modal */}
        <Modal
          transparent={true}
          visible={editModalVisible}
          animationType="fade"
          onRequestClose={() => setEditModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View
              className="w-3/4 rounded-lg shadow-lg"
              style={{
                backgroundColor: "black",
                borderWidth: 1,
                borderColor: "white",
              }}
            >
              <View
                className="p-4 rounded-t-lg"
                style={{
                  backgroundColor: "black",
                }}
              >
                <Text className="text-lg font-bold text-white text-center">Edytuj Produkt</Text>
              </View>
              <View className="p-6">
                <TextInput
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  value={editData?.fullName || ""}
                  onChangeText={(text) =>
                    setEditData((prev) => ({ ...prev, fullName: text }))
                  }
                  placeholder="Nazwa produktu"
                />
                <TextInput
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  value={editData?.size || ""}
                  onChangeText={(text) =>
                    setEditData((prev) => ({ ...prev, size: text }))
                  }
                  placeholder="Rozmiar"
                />
                <TextInput
                  style={{
                    backgroundColor: "white",
                    color: "black",
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  value={editData?.from || ""}
                  onChangeText={(text) =>
                    setEditData((prev) => ({ ...prev, from: text }))
                  }
                  placeholder="Źródło"
                />
                <Pressable
                  onPress={updateItem}
                  style={{
                    backgroundColor: "#0d6efd",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Zapisz</Text>
                </Pressable>
                <Pressable
                  onPress={() => setEditModalVisible(false)}
                  style={{
                    backgroundColor: "#6c757d",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Anuluj</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
        {/* Options Modal */}
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <View
              className="w-3/4 rounded-lg shadow-lg"
              style={{
                backgroundColor: "black",
                borderWidth: 1,
                borderColor: "white",
              }}
            >
              <View
                className="p-4 rounded-t-lg"
                style={{
                  backgroundColor: "black",
                }}
              >
                <Text className="text-lg font-bold text-white text-center">Opcje</Text>
              </View>
              <View className="p-6">
                <Pressable
                  onPress={() => {
                    if (selectedItem?._id) {
                      fetchItemData(selectedItem._id); // Fetch data and open edit modal
                      setModalVisible(false); // Close options modal
                    }
                  }}
                  style={{
                    backgroundColor: "#0d6efd",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Edytuj</Text>
                </Pressable>
                <Pressable
                  onPress={() => {
                    if (selectedItem?._id) {
                      Alert.alert(
                        "Potwierdzenie usunięcia",
                        "Czy na pewno chcesz usunąć kurtkę? Kurtka wróci automatycznie do stanu, z którego została sprzedana.",
                        [
                          {
                            text: "Anuluj",
                            style: "cancel",
                          },
                          {
                            text: "Usuń",
                            style: "destructive",
                            onPress: async () => {
                              try {
                                const response = await fetch(
                                  `https://bukowskiapp.pl/api/sales/delete-sale/${selectedItem._id}`,
                                  { method: "DELETE" }
                                );
                                if (!response.ok) {
                                  throw new Error("Failed to delete the sale.");
                                }
                                console.log("Deleted item:", selectedItem._id);
                                setFilteredData((prev) =>
                                  prev.filter((item) => item._id !== selectedItem._id)
                                ); // Remove the item from the list
                                setModalVisible(false); // Close the modal
                              } catch (error) {
                                console.error("Error deleting item:", error.message);
                              }
                            },
                          },
                        ]
                      );
                    } else {
                      console.error("No valid ID found for the selected item.");
                    }
                  }}
                  style={{
                    backgroundColor: "#dc3545", // Bootstrap danger color
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Usuń</Text>
                </Pressable>
                <Pressable
                  onPress={() => { console.log('Zwrot', selectedItem); setModalVisible(false); }}
                  style={{
                    backgroundColor: "#198754", // Bootstrap success color
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Zwrot</Text>
                </Pressable>
              </View>
              <View
                className="p-4 rounded-b-lg flex-row justify-end"
                style={{
                  backgroundColor: "black", // Set footer background to black
                }}
              >
                <Pressable
                  onPress={() => setModalVisible(false)}
                  style={{
                    backgroundColor: "#0d6efd", // Set button background to #0d6efd
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Zamknij</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </>
  );
};

export default Home;