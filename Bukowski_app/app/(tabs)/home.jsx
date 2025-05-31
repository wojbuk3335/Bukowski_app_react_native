import React, { useState, useContext, useEffect } from 'react';
import { Text, View, FlatList, TouchableOpacity, Modal, Pressable, RefreshControl, Alert, TextInput, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Import SafeAreaView for safe area handling
import { GlobalStateContext } from "../../context/GlobalState"; // Import global state context
import { useFocusEffect } from '@react-navigation/native'; // Import useFocusEffect
import { Picker } from '@react-native-picker/picker'; // Import Picker for dropdown

const Home = () => {
  const { user, logout } = React.useContext(GlobalStateContext); // Access global state and logout function
  const { stateData } = useContext(GlobalStateContext); // Access state data from global context
  const [salesData, setSalesData] = useState([]); // State to store API data
  const [filteredData, setFilteredData] = useState([]); // State to store filtered data
  const [totals, setTotals] = useState({ cash: {}, card: {} }); // State to store aggregated totals
  const [modalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [selectedItem, setSelectedItem] = useState(null); // State for selected item
  const [refreshing, setRefreshing] = useState(false); // State for refresh control
  const [editModalVisible, setEditModalVisible] = useState(false); // State for edit modal visibility
  const [editData, setEditData] = useState(null); // State to store data for editing
  const [otherAccountsData, setOtherAccountsData] = useState([]); // State for sales on other accounts
  const [transferredItems, setTransferredItems] = useState([]); // State for transferred items
  const [receivedItems, setReceivedItems] = useState([]); // State for items transferred to this account
  const [editFromModalVisible, setEditFromModalVisible] = useState(false); // State for new modal visibility
  const [newFromValue, setNewFromValue] = useState(""); // State for the new 'from' value
  const [symbolSelectionVisible, setSymbolSelectionVisible] = useState(false); // State for symbol selection visibility
  const [selectedSymbol, setSelectedSymbol] = useState(""); // State for selected symbol
  const [cashPriceCurrencyPairs, setCashPriceCurrencyPairs] = useState([{ price: "", currency: "PLN" }]); // State for cash payment
  const [cardPriceCurrencyPairs, setCardPriceCurrencyPairs] = useState([{ price: "", currency: "PLN" }]); // State for card payment
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false); // State for currency modal
  const [currentCurrencyPairIndex, setCurrentCurrencyPairIndex] = useState(null); // Track the index of the pair being edited
  const [currentCurrencyType, setCurrentCurrencyType] = useState(""); // "cash" or "card"
  const availableCurrencies = ["PLN", "HUF", "GBP", "ILS", "USD", "EUR", "CAN"]; // Available currencies

  const fetchSalesData = async () => {
    try {
      const response = await fetch('https://bukowskiapp.pl/api/sales/get-all-sales');
      const data = await response.json();
      setSalesData(data); // Update state with API data

      // Filter data based on user's sellingPoint and current date
      const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
      const filtered = data.filter(
        item => item.sellingPoint === user?.sellingPoint && item.date?.startsWith(today)
      );
      setFilteredData(filtered); // Update state with filtered data

      const otherAccounts = data.filter(
        item => item.sellingPoint !== user?.sellingPoint && item.from === user?.symbol && item.date?.startsWith(today)
      );
      setOtherAccountsData(otherAccounts); // Update state with other accounts data

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

      // Map cash and card fields to ensure proper structure and handle null/undefined prices
      setCashPriceCurrencyPairs(
        data.cash?.map(({ price, currency }) => ({ price: price ? price.toString() : "", currency })) || [{ price: "", currency: "PLN" }]
      );
      setCardPriceCurrencyPairs(
        data.card?.map(({ price, currency }) => ({ price: price ? price.toString() : "", currency })) || [{ price: "", currency: "PLN" }]
      );

      setEditModalVisible(true); // Show the edit modal
    } catch (error) {
      console.error("Error fetching item data:", error.message);
    }
  };

  const updateItem = async () => {
    try {
      if (editData?._id) {
        const updatedData = {
          ...editData,
          cash: cashPriceCurrencyPairs.map(({ price, currency }) => ({ price: parseFloat(price) || 0, currency })),
          card: cardPriceCurrencyPairs.map(({ price, currency }) => ({ price: parseFloat(price) || 0, currency })),
        };

        const response = await fetch(
          `https://bukowskiapp.pl/api/sales/update-sales/${editData._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData), // Send updated data
          }
        );

        if (!response.ok) {
          throw new Error("Failed to update the item.");
        }

        const updatedItem = await response.json(); // Fetch the updated item from the server

        setFilteredData((prev) =>
          prev.map((item) => (item._id === updatedItem._id ? updatedItem : item))
        ); // Update the item in the list
        setEditModalVisible(false); // Close the edit modal
      } else {
        console.error("No valid ID found for the item to update.");
      }
    } catch (error) {
      console.error("Error updating item:", error.message);
    }
  };

  // Recalculate totals dynamically whenever filteredData changes
  useEffect(() => {
    const newTotals = { cash: {}, card: {} };
    filteredData.forEach((item) => {
      item.cash?.forEach(({ price, currency }) => {
        newTotals.cash[currency] = (newTotals.cash[currency] || 0) + price;
      });
      item.card?.forEach(({ price, currency }) => {
        newTotals.card[currency] = (newTotals.card[currency] || 0) + price;
      });
    });
    setTotals(newTotals); // Update totals state
  }, [filteredData]);

  const fetchTransferredItems = async () => {
    try {
      const response = await fetch("https://bukowskiapp.pl/api/transfer");
      const data = await response.json();
      setTransferredItems(data.filter((item) => item.transfer_from === user.symbol)); // Filter items by transfer_from
    } catch (error) {
      console.error("Error fetching transferred items:", error);
    }
  };

  const fetchReceivedItems = async () => {
    try {
      const response = await fetch("https://bukowskiapp.pl/api/transfer");
      const data = await response.json();
      setReceivedItems(data.filter((item) => item.transfer_to === user.symbol)); // Filter items by transfer_to
    } catch (error) {
      console.error("Error fetching received items:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchSalesData(); // Fetch sales data when the tab is focused
      if (user?.symbol) { // Ensure user exists before fetching items
        fetchTransferredItems(); // Fetch transferred items when the tab is focused
        fetchReceivedItems(); // Fetch received items when the tab is focused
      }
    }, [user?.symbol]) // Refetch when the user's symbol changes
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchSalesData(); // Fetch data on pull-to-refresh
    setRefreshing(false);
  };

  const updateFromField = async () => {
    try {
      if (selectedItem?._id) {
        const updatedItem = { ...selectedItem, from: newFromValue }; // Update the 'from' field
        const response = await fetch(
          `https://bukowskiapp.pl/api/sales/update-sales/${selectedItem._id}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedItem),
          }
        );
        if (!response.ok) {
          throw new Error("Failed to update the 'from' field.");
        }
        setFilteredData((prev) =>
          prev.map((item) => (item._id === selectedItem._id ? updatedItem : item))
        ); // Update the item in the list
        setEditFromModalVisible(false); // Close the modal
      } else {
        console.error("No valid ID found for the selected item.");
      }
    } catch (error) {
      console.error("Error updating 'from' field:", error.message);
    }
  };

  const handleAddCashPair = () => {
    setCashPriceCurrencyPairs([...cashPriceCurrencyPairs, { price: "", currency: "PLN" }]);
  };

  const handleRemoveCashPair = (index) => {
    if (cashPriceCurrencyPairs.length > 1) {
      const updatedPairs = cashPriceCurrencyPairs.filter((_, i) => i !== index);
      setCashPriceCurrencyPairs(updatedPairs);
    }
  };

  const handleCashPairChange = (index, field, value) => {
    const updatedPairs = [...cashPriceCurrencyPairs];
    updatedPairs[index][field] = value;
    setCashPriceCurrencyPairs(updatedPairs);
  };

  const handleAddCardPair = () => {
    setCardPriceCurrencyPairs([...cardPriceCurrencyPairs, { price: "", currency: "PLN" }]);
  };

  const handleRemoveCardPair = (index) => {
    if (cardPriceCurrencyPairs.length > 1) {
      const updatedPairs = cardPriceCurrencyPairs.filter((_, i) => i !== index);
      setCardPriceCurrencyPairs(updatedPairs);
    }
  };

  const handleCardPairChange = (index, field, value) => {
    const updatedPairs = [...cardPriceCurrencyPairs];
    updatedPairs[index][field] = value;
    setCardPriceCurrencyPairs(updatedPairs);
  };

  const openCurrencyModal = (index, type) => {
    setCurrentCurrencyPairIndex(index);
    setCurrentCurrencyType(type);
    setCurrencyModalVisible(true);
  };

  const selectCurrencyFromModal = (currency) => {
    if (currentCurrencyType === "cash") {
      handleCashPairChange(currentCurrencyPairIndex, "currency", currency);
    } else if (currentCurrencyType === "card") {
      handleCardPairChange(currentCurrencyPairIndex, "currency", currency);
    }
    setCurrencyModalVisible(false);
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
            <View style={styles.item}>
              <Text
                style={[
                  styles.itemTextLeft,
                  {
                    fontSize: item.fullName.length + item.size.length > 20 ? 10 : 12, // Adjust font size based on combined text length
                    fontWeight: "bold", // Make the font bold
                  },
                ]}
              >
                {index + 1}. {item.fullName} {item.size} ({item.from}){" "}
                {[...(item.cash || []), ...(item.card || [])].map(({ price, currency }, index) => (
                  <Text
                    key={`payment-${index}`}
                    style={{
                      color: index < (item.cash?.length || 0) ? "white" : "red", // White for cash, red for card
                    }}
                  >
                    {price} {currency}{index < (item.cash?.length || 0) + (item.card?.length || 0) - 1 ? " + " : ""}
                  </Text>
                ))}
              </Text>
              <TouchableOpacity onPress={() => { setSelectedItem(item); setModalVisible(true); }} style={styles.dotsButton}>
                <Text style={styles.dotsText}>⋮</Text>
              </TouchableOpacity>
            </View>
          )}
          ListHeaderComponent={() => {
            return (
              <View className="my-6 px-4 space-y-6">
                <View className="flex-row justify-between items-center mb-6">
                  <View>
                    <Text className="font-pmedium text-sm text-gray-100">
                      Zalogowany jako: <Text style={{ fontWeight: 'bold' }}>{user?.email}</Text>
                    </Text>
                    <Text className="font-pmedium text-sm text-gray-100">
                      {new Date().toLocaleDateString('pl-PL', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                      })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => logout()} // Call the logout function
                    className="bg-[#0d6efd] px-4 py-2 rounded-lg" // Updated background color
                  >
                    <Text className="text-sm text-white font-bold">Wyloguj</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row items-center justify-center">
                  <Text className="text-gray-300 text-sm font-bold mr-2 ">Sprzedaż:</Text>
                </View>
              </View>
            );
          }}
          ListFooterComponent={() => {
            return (
              <View className="mt-6">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-[13px] text-gray-300 font-bold">Suma:</Text>
                  <View className="flex-row">
                    <Text className="text-[13px] text-gray-300 mr-4">Gotówki:</Text>
                    {Object.entries(totals.cash || {}).map(([currency, total]) => (
                      <Text key={`cash-${currency}`} className="text-[10px] text-white mr-2">
                        {total} {currency}
                      </Text>
                    ))}
                  </View>
                </View>
                <View className="flex-row justify-end">
                  <Text className="text-[13px] text-gray-300 mr-4">Na kartę:</Text>
                  {Object.entries(totals.card || {}).map(([currency, total]) => (
                    <Text key={`card-${currency}`} className="text-[10px] text-white mr-2">
                      {total} {currency}
                    </Text>
                  ))}
                </View>
                {/* Section for sales on other accounts */}
                {otherAccountsData.length > 0 && (
                  <View className="mt-6">
                    <Text className="text-[13px] text-gray-300 font-bold mb-2">Sprzedano na innych kontach:</Text>
                    {otherAccountsData.map((item, index) => (
                      <View key={item._id || index} className="mb-4 px-4 py-2 flex-row items-center rounded-lg" style={{ backgroundColor: "rgb(13, 110, 253)" }}>
                        <Text className="text-[13px] text-gray-300 flex-1 font-bold">{index + 1}. {item.fullName} {item.size}</Text>
                        <Text className="text-[13px] text-white">
                          {item.symbol || "Brak informacji o miejscu sprzedaży"}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                {/* Section for transferred items */}
                {transferredItems.length > 0 && (
                  <View className="mt-6">
                    <Text className="text-[13px] text-gray-300 font-bold mb-2">Odpisać ze stanu:</Text>
                    {transferredItems.map((item, index) => (
                      <View
                        key={item.productId || index}
                        style={styles.transferredItem} // Apply blue background for transferred items
                      >
                        <Text style={styles.transferredItemTextLeft}>
                          {index + 1}. {item.fullName} {item.size}
                        </Text>
                        <Text style={styles.transferredItemTextRight}>
                          Przepisano do: {item.transfer_to}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
                {/* Section for received items */}
                {receivedItems.length > 0 && (
                  <View className="mt-6">
                    <Text className="text-[13px] text-gray-300 font-bold mb-2">Dopisano na to konto:</Text>
                    {receivedItems.map((item, index) => (
                      <View
                        key={item.productId || index}
                        style={styles.receivedItem} // Apply yellow background for received items
                      >
                        <Text style={styles.receivedItemTextLeft}>
                          {index + 1}. {item.fullName} {item.size}
                        </Text>
                        <Text style={styles.receivedItemTextRight}>
                          Przesłano z: {item.transfer_from}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
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
              <ScrollView className="p-6">
                {/* Existing Modal Content */}
                <TextInput
                  style={{
                    backgroundColor: "grey",
                    color: "black",
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  value={editData?.fullName || ""}
                  editable={false}
                  placeholder="Nazwa produktu"
                />
                <TextInput
                  style={{
                    backgroundColor: "grey",
                    color: "black",
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                  value={editData?.size || ""}
                  editable={false}
                  placeholder="Rozmiar"
                />
                <TouchableOpacity
                  onPress={() => {
                    const matchingSymbols = stateData
                      ?.filter((item) => item.barcode === editData?.barcode)
                      ?.map((item) => item.symbol) || [];
                    if (matchingSymbols.length > 0) {
                      setSymbolSelectionVisible(true);
                    } else {
                      Alert.alert("Brak symboli", "Nie znaleziono symboli dla tego produktu.");
                    }
                  }}
                  style={{
                    backgroundColor: "black",
                    borderColor: "white",
                    borderWidth: 1,
                    padding: 10,
                    borderRadius: 5,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ color: "white" }}>{editData?.from || "Wybierz symbol"}</Text>
                </TouchableOpacity>

                {/* Cash Payment Section */}
                <Text style={{ fontSize: 16, marginBottom: 10, textAlign: "center", color: "white" }}>Płatność gotówką</Text>
                <View style={{ width: "100%", borderWidth: 1, borderColor: "white", padding: 20 }}>
                  {cashPriceCurrencyPairs.map((pair, index) => (
                    <View key={`cash-${index}`} style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                      <TextInput
                        style={{
                          flex: 1,
                          height: 40,
                          borderColor: "white",
                          borderWidth: 1,
                          borderRadius: 5,
                          paddingHorizontal: 10,
                          color: "white",
                          backgroundColor: "black",
                          marginRight: 10,
                        }}
                        value={pair.price}
                        onChangeText={(value) => {
                          const numericValue = value.replace(/[^0-9.]/g, "");
                          handleCashPairChange(index, "price", numericValue);
                        }}
                        placeholder="Wpisz kwotę"
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          height: 40,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "black",
                          borderColor: "white",
                          borderWidth: 1,
                          borderRadius: 5,
                        }}
                        onPress={() => openCurrencyModal(index, "cash")}
                      >
                        <Text style={{ color: "white" }}>{pair.currency}</Text>
                      </TouchableOpacity>
                      {index > 0 && (
                        <TouchableOpacity
                          style={{
                            marginLeft: 10,
                            paddingVertical: 5,
                            paddingHorizontal: 10,
                            backgroundColor: "red",
                            borderRadius: 5,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          onPress={() => handleRemoveCashPair(index)}
                        >
                          <Text style={{ color: "white" }}>Usuń</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  <Pressable style={{ marginTop: 10, padding: 10, backgroundColor: "rgb(13, 110, 253)", borderRadius: 5, alignItems: "center" }} onPress={handleAddCashPair}>
                    <Text style={{ color: "white", fontSize: 16 }}>Dodaj parę</Text>
                  </Pressable>
                </View>

                {/* Card Payment Section */}
                <Text style={{ fontSize: 16, marginBottom: 10, marginTop: 20, textAlign: "center", color: "white" }}>Płatność kartą</Text>
                <View style={{ width: "100%", borderWidth: 1, borderColor: "white", padding: 20 }}>
                  {cardPriceCurrencyPairs.map((pair, index) => (
                    <View key={`card-${index}`} style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
                      <TextInput
                        style={{
                          flex: 1,
                          height: 40,
                          borderColor: "white",
                          borderWidth: 1,
                          borderRadius: 5,
                          paddingHorizontal: 10,
                          color: "white",
                          backgroundColor: "black",
                          marginRight: 10,
                        }}
                        value={pair.price}
                        onChangeText={(value) => {
                          const numericValue = value.replace(/[^0-9.]/g, "");
                          handleCardPairChange(index, "price", numericValue);
                        }}
                        placeholder="Wpisz kwotę"
                        keyboardType="numeric"
                      />
                      <TouchableOpacity
                        style={{
                          flex: 1,
                          height: 40,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "black",
                          borderColor: "white",
                          borderWidth: 1,
                          borderRadius: 5,
                        }}
                        onPress={() => openCurrencyModal(index, "card")}
                      >
                        <Text style={{ color: "white" }}>{pair.currency}</Text>
                      </TouchableOpacity>
                      {index > 0 && (
                        <TouchableOpacity
                          style={{
                            marginLeft: 10,
                            paddingVertical: 5,
                            paddingHorizontal: 10,
                            backgroundColor: "red",
                            borderRadius: 5,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                          onPress={() => handleRemoveCardPair(index)}
                        >
                          <Text style={{ color: "white" }}>Usuń</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  ))}
                  <Pressable style={{ marginTop: 10, padding: 10, backgroundColor: "rgb(13, 110, 253)", borderRadius: 5, alignItems: "center" }} onPress={handleAddCardPair}>
                    <Text style={{ color: "white", fontSize: 16 }}>Dodaj parę</Text>
                  </Pressable>
                </View>

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
              </ScrollView>
            </View>
          </View>
        </Modal>
        {/* Edit From Modal */}
        <Modal
          transparent={true}
          visible={editFromModalVisible}
          animationType="fade"
          onRequestClose={() => setEditFromModalVisible(false)}
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
                <Text className="text-lg font-bold text-white text-center">Edytuj Miejsce</Text>
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
                  value={newFromValue}
                  onChangeText={(text) => setNewFromValue(text)} // Update the new 'from' value
                  placeholder="Wprowadź nowe miejsce"
                />
                <Pressable
                  onPress={updateFromField}
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
                  onPress={() => setEditFromModalVisible(false)}
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
        {/* Symbol Selection Modal */}
        <Modal
          transparent={true}
          visible={symbolSelectionVisible}
          animationType="slide"
          onRequestClose={() => setSymbolSelectionVisible(false)}
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
                <Text className="text-lg font-bold text-white text-center">Wybierz Symbol</Text>
              </View>
              <ScrollView className="p-6">
                {stateData
                  ?.filter((item) => item.barcode === editData?.barcode)
                  ?.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setEditData((prev) => ({ ...prev, from: item.symbol })); // Update 'from' field
                        setSymbolSelectionVisible(false); // Close modal
                      }}
                      style={{
                        backgroundColor: "#0d6efd",
                        paddingVertical: 10,
                        paddingHorizontal: 20,
                        borderRadius: 5,
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>{item.symbol}</Text>
                    </TouchableOpacity>
                  ))}
                <TouchableOpacity
                  onPress={() => setSymbolSelectionVisible(false)}
                  style={{
                    backgroundColor: "#6c757d",
                    paddingVertical: 10,
                    paddingHorizontal: 20,
                    borderRadius: 5,
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Anuluj</Text>
                </TouchableOpacity>
              </ScrollView>
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
        {/* Currency Modal */}
        {currencyModalVisible && (
          <Modal
            transparent={true}
            animationType="slide"
            visible={currencyModalVisible}
            onRequestClose={() => setCurrencyModalVisible(false)}
          >
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
              <View style={{ width: "80%", backgroundColor: "black", borderRadius: 10, padding: 20, alignItems: "center" }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: "white", marginBottom: 15 }}>Wybierz walutę</Text>
                {availableCurrencies.map((currency, index) => (
                  <TouchableOpacity
                    key={index}
                    style={{ paddingVertical: 10, paddingHorizontal: 20, backgroundColor: "rgb(13, 110, 253)", borderRadius: 5, marginBottom: 10 }}
                    onPress={() => selectCurrencyFromModal(currency)}
                  >
                    <Text style={{ color: "white", fontSize: 16 }}>{currency}</Text>
                  </TouchableOpacity>
                ))}
                <Pressable
                  style={{ marginTop: 15, paddingVertical: 10, paddingHorizontal: 20, backgroundColor: "red", borderRadius: 5, alignItems: "center" }}
                  onPress={() => setCurrencyModalVisible(false)}
                >
                  <Text style={{ color: "white", fontSize: 16 }}>Zamknij</Text>
                </Pressable>
              </View>
            </View>
          </Modal>
        )}
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  item: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#0d6efd", // Blue color for items
    borderRadius: 8,
    flexDirection: "row", // Align content in a single row
    alignItems: "center", // Center content vertically
  },
  itemText: {
    color: "white",
    fontSize: 14, // Standardized font size
    fontWeight: "bold", // Standardized font weight
    textAlign: "left",
    flex: 1,
  },
  transferredItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#0d6efd", // Blue background for transferred items
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  receivedItem: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "yellow", // Yellow background for received items
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemTextLeft: {
    color: "white",
    fontSize: 14, // Standardized font size
    fontWeight: "bold", // Standardized font weight
    textAlign: "left",
    flex: 1,
  },
  itemTextRight: {
    color: "white",
    fontSize: 14, // Standardized font size
    fontWeight: "bold", // Standardized font weight
    textAlign: "right",
    flex: 1,
  },
  dotsButton: {
    position: "absolute",
    right: 2,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  dotsText: {
    color: "white",
    fontSize: 25,
    textAlign: "center",
  },
  receivedItemText: {
    color: "black", // Black text for received items
    fontSize: 16, // Match font size from writeoff.jsx
    fontWeight: "bold", // Bold text for emphasis
    flex: 1, // Allow text to take available space
  },
  receivedItemTextLeft: {
    color: "black", // Black text for left-aligned content
    fontSize: 16, // Match font size from writeoff.jsx
    fontWeight: "bold", // Bold text for emphasis
    flex: 1, // Allow text to take available space
    textAlign: "left", // Align text to the left
  },
  receivedItemTextRight: {
    color: "black", // Black text for right-aligned content
    fontSize: 16, // Match font size from writeoff.jsx
    fontWeight: "bold", // Bold text for emphasis
    textAlign: "right", // Align text to the right
  },
  text: {
    color: "white", // White text for items
    fontSize: 14, // Adjust font size for items
  },
  transferredItemTextLeft: {
    color: "white", // White text for left-aligned content
    fontSize: 13, // Match font size from writeoff.jsx
    fontWeight: "bold", // Bold text for emphasis
    flex: 1, // Allow text to take available space
    textAlign: "left", // Align text to the left
  },
  transferredItemTextRight: {
    color: "white", // White text for right-aligned content
    fontSize: 13, // Match font size from writeoff.jsx
    fontWeight: "bold", // Bold text for emphasis
    textAlign: "right", // Align text to the right
  },
});
export default Home; // Export the Home component