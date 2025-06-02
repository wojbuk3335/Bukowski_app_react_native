import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Pressable, TextInput, ScrollView, Keyboard, TouchableWithoutFeedback, Alert, FlatList } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Picker } from "@react-native-picker/picker";
import axios from "axios"; // Import axios for HTTP requests

const QRScanner = ({ stateData, user, sizes, colors, goods }) => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedOption, setSelectedOption] = useState(""); // State for Picker selection
  const [barcode, setBarcode] = useState(""); // State for barcode input
  const [cashPriceCurrencyPairs, setCashPriceCurrencyPairs] = useState([{ price: "", currency: "PLN" }]); // State for cash payment
  const [cardPriceCurrencyPairs, setCardPriceCurrencyPairs] = useState([{ price: "", currency: "PLN" }]); // State for carrd payment
  const [currencyMenuVisible, setCurrencyMenuVisible] = useState(false);
  const [currentCurrencyIndex, setCurrentCurrencyIndex] = useState(null);
  const [currentCurrencyType, setCurrentCurrencyType] = useState(""); // "cash" or "card"
  const [sellingPointMenuVisible, setSellingPointMenuVisible] = useState(false); // State for "Sprzedano od" popup
  const availableCurrencies = ["PLN", "HUF", "GBP", "ILS", "USD", "EUR", "CAN"];
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false); // State for currency modal
  const [currentCurrencyPairIndex, setCurrentCurrencyPairIndex] = useState(null); // Track the index of the pair being edited

  const openSellingPointMenu = () => {
    setSellingPointMenuVisible(true);
  };

  const selectSellingPoint = (point) => {
    setSelectedOption(point);
    setSellingPointMenuVisible(false);
  };

  const openSellingPointModal = () => {
    setSellingPointMenuVisible(true);
  };

  const selectSellingPointFromModal = (point) => {
    setSelectedOption(point);
    setSellingPointMenuVisible(false);
  };

  const getMatchingSymbols = () => {
    return stateData
        ?.filter((item) => item.barcode === barcode) // Filter items by matching barcode
        .map((item) => item.symbol) || []; // Extract symbols
};

  const openCurrencyModal = (index) => {
    setCurrentCurrencyPairIndex(index);
    setCurrencyModalVisible(true);
  };

  const selectCurrencyFromModal = (currency) => {
    handleCashPairChange(currentCurrencyPairIndex, "currency", currency);
    setCurrencyModalVisible(false);
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.message, { marginBottom: 20 }]}>Potrzebujemy Twojej zgody na dostęp do kamery</Text>
        <Button title="Zezwól" onPress={requestPermission} />
      </View>
    );
  }

  const handleScan = ({ data, type }) => {
    if (!scanned) {
      setScanned(true);
      setBarcode(data); // Set the scanned barcode

      // Match the scanned barcode with the stateData
      const matchedItem = stateData?.find(item => item.barcode === data);

      if (matchedItem) {
        setModalMessage(`${matchedItem.fullName + ' ' + matchedItem.size}`);
        setSelectedOption(matchedItem.symbol); // Set default selected symbol
      } else {
        setModalMessage("Nie ma takiej kurtki"); // No match found
        setSelectedOption(""); // Clear selected option if no match
      }

      setModalVisible(true); // Show the modal
      setTimeout(() => setScanned(false), 3000);
    }
  };

  const toggleCameraFacing = () => {
    setFacing((prev) => (prev === "back" ? "front" : "back"));
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

  const openCurrencyMenu = (index, type) => {
    setCurrentCurrencyIndex(index);
    setCurrentCurrencyType(type);
    setCurrencyMenuVisible(true);
  };

  const selectCurrency = (currency) => {
    if (currentCurrencyType === "cash") {
      handleCashPairChange(currentCurrencyIndex, "currency", currency);
    } else if (currentCurrencyType === "card") {
      handleCardPairChange(currentCurrencyIndex, "currency", currency);
    }
    setCurrencyMenuVisible(false);
  };

  const handleSubmit = async () => {
    const matchedItems = stateData?.filter(item => item.barcode === barcode);

    if (!matchedItems || matchedItems.length === 0) {
      console.warn("No matched items found for the scanned barcode.");
    }

    const fullName = matchedItems?.[0]?.fullName || null; // Use the first matched item's fullName
    const size = matchedItems?.[0]?.size || null; // Use the first matched item's size
    const symbol = selectedOption || matchedItems?.[0]?.symbol || "Unknown"; // Use selected symbol or fallback

    const sellingPoint = user?.sellingPoint || "Unknown";

    const payload = {
      fullName,
      timestamp: new Date().toLocaleString(), // Format to include both date and time
      barcode,
      size,
      sellingPoint,
      from: selectedOption,
      cash: cashPriceCurrencyPairs.map(pair => ({ price: pair.price, currency: pair.currency })),
      card: cardPriceCurrencyPairs.map(pair => ({ price: pair.price, currency: pair.currency })),
      symbol // Add symbol field
    };

    try {
      const response = await axios.post("https://bukowskiapp.pl/api/sales/save-sales", payload);
      Alert.alert("Success", "Dane zostały zapisane pomyślnie!");

      // Reset modal state
      setCashPriceCurrencyPairs([{ price: "", currency: "PLN" }]);
      setCardPriceCurrencyPairs([{ price: "", currency: "PLN" }]);
      setBarcode("");
      setSelectedOption("");
      setModalMessage("");
    } catch (error) {
      console.error("Error saving data:", error);
      Alert.alert("Error", "Failed to save data.");
    }

    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "upc_e", "code39", "code128"],
        }}
        onBarcodeScanned={handleScan}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea} />
        </View>
      </CameraView>

      {/* Modal for displaying messages */}
      {modalVisible && (
  <View className="flex-1 bg-black w-full h-full justify-start items-center z-5">
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} >
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.modalContent} className="flex-1 bg-black w-full h-full justify-start items-center z-5">
          {/* Close Button */}
          <Pressable
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.closeButtonText}>X</Text>
          </Pressable>
          <Text className='text-l text-white mb-2'>Sprzedano produkt:</Text>
          <TextInput
            style={styles.inputField}
            value={modalMessage} // Display the fullName or message
            editable={false} // Make the input non-editable
          />
          <Text className='text-l text-white mb-2'>Gdzie</Text>
          <TextInput
            style={styles.inputField}
            value={user?.sellingPoint || "Unknown"} // Display the sellingPoint
            editable={false} // Make the input non-editable
            placeholder="Selling Point"
          />
          <Text className='text-l text-white mb-2'>Kod kreskowy</Text>
          <TextInput
            style={styles.inputField}
            value={barcode} // Display the scanned barcode
            editable={false} // Make the input non-editable
            placeholder="Barcode"
          />
          <Text className='text-l text-white mb-2'>Sprzedano od:</Text>
          <View
            style={{
              borderWidth: 1, // Increase border width for better visibility
              borderColor: "white", // Set border color to white
              borderRadius: 5, // Add rounded corners
              paddingHorizontal: 10, // Add horizontal padding for better spacing
              paddingVertical: 5, // Add vertical padding for better spacing
              marginBottom: 20, // Add spacing below the Picker
              width: "100%", // Ensure the container takes full width
            }}
          >
            <TouchableOpacity
              style={{
                height: 40,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: "black",
                borderRadius: 5,
              }}
              onPress={openSellingPointModal}
            >
              <Text style={{ color: "white" }}>
                {selectedOption || "Wybierz punkt sprzedaży"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Selling Point Modal */}
          {sellingPointMenuVisible && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={sellingPointMenuVisible}
              onRequestClose={() => setSellingPointMenuVisible(false)}
            >
              <View style={styles.currencyModalContainer}>
                <View style={styles.currencyModalContent}>
                  <Text style={styles.currencyModalTitle}>Wybierz punkt sprzedaży</Text>
                  <FlatList
                    data={getMatchingSymbols()} // Use the filtered symbols
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.currencyModalItem}
                        onPress={() => selectSellingPointFromModal(item)}
                      >
                        <Text style={styles.currencyModalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <Pressable
                    style={styles.currencyModalCloseButton}
                    onPress={() => setSellingPointMenuVisible(false)}
                  >
                    <Text style={styles.currencyModalCloseButtonText}>Zamknij</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          )}

          {/* Payment Sections */}
          
          <Text style={{
            fontSize: 16,
            marginBottom: 10,
            textAlign: "center",
            color: "white", // Set text color to white
          }}>Płatność gotówką</Text>
          <View
            style={{
              width: "100%", // Full width
              borderWidth: 1, // Add border width
              borderColor: "white", // Set border color to white
              padding: 20, // Add padding for better spacing
            }}
          >

          {cashPriceCurrencyPairs.map((pair, index) => (
            <View
              key={`cash-${index}`}
              style={{
                flexDirection: "row", // Align items side by side
                alignItems: "center", // Center items vertically
                marginBottom: 20, // Add spacing below each pair
              }}
            >
              <TextInput
                style={{
                  flex: 1, // Take up available space
                  height: 40,
                  borderColor: "white",
                  borderWidth: 1,
                  borderRadius: 5,
                  paddingHorizontal: 10,
                  color: "white", // Set text color to white
                  backgroundColor: "black", // Match background with modal
                  marginRight: 10, // Add spacing between input and picker
                }}
                value={pair.price}
                onChangeText={(value) => {
                  const numericValue = value.replace(/[^0-9.]/g, ""); // Allow only numbers and a dot
                  handleCashPairChange(index, "price", numericValue);
                }}
                placeholder="Wpisz kwotę"
                keyboardType="numeric" // Allow only numeric input
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
                onPress={() => openCurrencyModal(index)}
              >
                <Text style={{ color: "white" }}>{pair.currency || "PLN"}</Text>
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
          <Pressable style={styles.addPairButton} onPress={handleAddCashPair}>
            <Text style={styles.addPairButtonText}>Dodaj parę</Text>
          </Pressable>
          </View>

          {/* Currency Modal */}
          {currencyModalVisible && (
            <Modal
              transparent={true}
              animationType="slide"
              visible={currencyModalVisible}
              onRequestClose={() => setCurrencyModalVisible(false)}
            >
              <View style={styles.currencyModalContainer}>
                <View style={styles.currencyModalContent}>
                  <Text style={styles.currencyModalTitle}>Wybierz walutę</Text>
                  <FlatList
                    data={availableCurrencies}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.currencyModalItem}
                        onPress={() => selectCurrencyFromModal(item)}
                      >
                        <Text style={styles.currencyModalItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                  <Pressable
                    style={styles.currencyModalCloseButton}
                    onPress={() => setCurrencyModalVisible(false)}
                  >
                    <Text style={styles.currencyModalCloseButtonText}>Zamknij</Text>
                  </Pressable>
                </View>
              </View>
            </Modal>
          )}

          
          {/* Payment by Card Section */}
          <Text style={{
            fontSize: 16,
            marginBottom: 10,
            marginTop: 20, // Add margin top for separation
            textAlign: "center",
            color: "white", // Set text color to white
          }}>Płatność kartą</Text>
          <View
            style={{
              width: "100%", // Full width
              borderWidth: 1, // Add border width
              borderColor: "white", // Set border color to white
              padding: 20, // Add padding for better spacing
            }}
          >
            {cardPriceCurrencyPairs.map((pair, index) => (
              <View
                key={`card-${index}`}
                style={{
                  flexDirection: "row", // Align items side by side
                  alignItems: "center", // Center items vertically
                  marginBottom: 20, // Add spacing below each pair
                }}
              >
                <TextInput
                  style={{
                    flex: 1, // Take up available space
                    height: 40,
                    borderColor: "white",
                    borderWidth: 1,
                    borderRadius: 5,
                    paddingHorizontal: 10,
                    color: "white", // Set text color to white
                    backgroundColor: "black", // Match background with modal
                    marginRight: 10, // Add spacing between input and picker
                  }}
                  value={pair.price}
                  onChangeText={(value) => {
                    const numericValue = value.replace(/[^0-9.]/g, ""); // Allow only numbers and a dot
                    handleCardPairChange(index, "price", numericValue);
                  }}
                  placeholder="Wpisz kwotę"
                  keyboardType="numeric" // Allow only numeric input
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
                  onPress={() => openCurrencyModal(index)}
                >
                  <Text style={{ color: "white" }}>{pair.currency}</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Anuluj</Text>
            </Pressable>
            <Pressable
              style={[styles.button, styles.addButton]}
              onPress={handleSubmit}
            >
              <Text style={styles.buttonText}>Dodaj</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </TouchableWithoutFeedback>
  </View>
)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black",color: "white" },
  message: { textAlign: "center", marginTop: 20, color: "white" },
  camera: { flex: 1 },
  buttonContainer: {
    position: "absolute",
    bottom: 30,
    alignSelf: "center",
  },
  modalButtons: {
    flexDirection: "row", // Align buttons side by side
    justifyContent: "space-between", // Add space between buttons
    marginTop: 20,
    width: "100%", // Ensure buttons take full width
  },
  button: {
    flex: 1, // Equal width for both buttons
    marginHorizontal: 10, // Add spacing between buttons
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "gray",
  },
  addButton: {
    backgroundColor: "green",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scanArea: {
    width: 250,
    height: 250,
    borderWidth: 2,
    borderColor: "white",
    borderRadius: 10,
  },
  picker: {
    height: 55, // Ensure enough height for text
    width: "100%",
    marginBottom: 20,
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "white", // Ensure Picker is visible
    zIndex: 100, // Ensure Picker is above other elements
    elevation: 10, // Add elevation for Android
    justifyContent: "center", // Center text vertically
    overflow: "visible", // Allow dropdown to render outside boundaries
  },
  currencyPicker: {
    flex: 1,
    height: 55,
    borderColor: "gray",
    borderWidth: 1,
    backgroundColor: "white", // Ensure Picker is visible
    zIndex: 100, // Ensure Picker is above other elements
    elevation: 10, // Add elevation for Android
    overflow: "visible", // Allow dropdown to render outside boundaries
  },
  modalContainer: {
    flex: 1,
    justifyContent: "flex-start", // Align content to the top
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    zIndex: 5, // Ensure modal container is below modal content
  },
  modalContent: {
    width: "100%", // Full width
    height: "100%", // Full height
    padding: 20,
    backgroundColor: "black", // Set background color to black
    borderRadius: 0, // Remove border radius for full-screen effect
    alignItems: "center",
    zIndex: 10, // Ensure modal content is above other elements
    elevation: 5, // Add elevation for Android
    overflow: "visible", // Allow content to render outside boundaries
  },
  modalScrollView: {
    width: "100%",
    flexGrow: 1,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    color: "white", // Set text color to white
  },
  closeButton: {
    top: 10, // Place it near the top
    right: 10, // Place it on the right side
    backgroundColor: "red", // Set background color to red
    borderRadius: 100, // Make the button round
    position: "absolute", // Position it absolutely
    width: 30, // Set width and height for the button
    height: 30,
    justifyContent: "center", // Center the text inside the button

  },
  closeButtonText: {
    color: "white", // Set close button text color to white
    fontSize: 16,
    textAlign: "center", // Center the text
  },
  inputField: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 10,
    color: "white", // Set input text color to white
    backgroundColor: "black", // Match input background with modal
  },
  pairContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 1, // Add border width
    borderColor: "white", // Add border color
  },
  priceInput: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginRight: 10,
    paddingHorizontal: 10,
  },
  addPairButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "rgb(13, 110, 253)", // Set background color to blue
    borderRadius: 5,
    alignItems: "center",
  },
  addPairButtonText: {
    color: "white",
    fontSize: 16,
  },
  removePairButton: {
    marginLeft: 10,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  removePairButtonText: {
    color: "white",
    fontSize: 14,
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: 20,
  },
  scrollViewContent: {
    flexGrow: 1,
    padding: 20,
  },
  currencyButton: {
    flex: 1,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "black",
    borderColor: "white",
    borderWidth: 1,
    borderRadius: 5,
    marginLeft: 10,
  },
  currencyButtonText: {
    color: "white",
    fontSize: 16,
  },
  currencyModalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  currencyModalContent: {
    width: "80%",
    backgroundColor: "black",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  currencyModalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 15,
  },
  currencyModalItem: {
    paddingVertical: 5, // Reduce vertical padding for shorter height
    paddingHorizontal: 30, // Increase horizontal padding for wider items
    marginVertical: 5, // Add vertical margin between items
    borderBottomWidth: 1,
    borderBottomColor: "gray",
    width: 100, // Set the width to 100px
    alignItems: "center",
    backgroundColor: "rgb(13, 110, 253)", // Set background color to blue
  },
  currencyModalItemText: {
    color: "white",
    fontSize: 16,
  },
  currencyModalCloseButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
  },
  currencyModalCloseButtonText: {
    color: "white",
    fontSize: 16,
  },
});

export default QRScanner;