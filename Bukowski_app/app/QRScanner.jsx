import React, { useState } from "react";
import { View, Text, Button, StyleSheet, TouchableOpacity, Modal, Pressable, TextInput, ScrollView, Keyboard, TouchableWithoutFeedback } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Picker } from "@react-native-picker/picker";

const QRScanner = ({ stateData, user }) => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [selectedOption, setSelectedOption] = useState(""); // State for Picker selection
  const [barcode, setBarcode] = useState(""); // State for barcode input
  const [priceCurrencyPairs, setPriceCurrencyPairs] = useState([{ price: "", currency: "USD" }]); // State for price-currency pairs

  

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to access the camera</Text>
        <Button title="Grant Permission" onPress={requestPermission} />
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

  const handleAddPair = () => {
    setPriceCurrencyPairs([...priceCurrencyPairs, { price: "", currency: "PLN" }]); // Default to Polish Zloty
  };

  const handleRemovePair = (index) => {
    if (priceCurrencyPairs.length > 1) {
      const updatedPairs = priceCurrencyPairs.filter((_, i) => i !== index);
      setPriceCurrencyPairs(updatedPairs);
    }
  };

  const handlePairChange = (index, field, value) => {
    const updatedPairs = [...priceCurrencyPairs];
    updatedPairs[index][field] = value;
    setPriceCurrencyPairs(updatedPairs);
  };

  const handleSubmit = () => {
    const payload = {
      barcode,
      selectedSymbol: selectedOption,
      priceCurrencyPairs,
      timestamp: new Date().toISOString(), // Add current date and time
      seller: user?.email || null, // Add user email as seller
    };

    console.log("Payload to send:", JSON.stringify(payload, null, 2)); // Log the JSON payload
    setModalVisible(false); // Close the modal
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
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Sprzedano produkt:</Text>
              <TextInput
                style={styles.inputField}
                value={modalMessage} // Display the fullName or message
                editable={false} // Make the input non-editable
              />
              {/* Barcode Input */}
              <TextInput
                style={styles.inputField}
                value={barcode} // Display the scanned barcode
                editable={false} // Make the input non-editable
                placeholder="Barcode"
              />
              {/* Dropdown (Picker) */}
              <Picker
                selectedValue={selectedOption}
                onValueChange={(itemValue) => setSelectedOption(itemValue)}
                style={styles.picker}
              >
                {stateData
                  ?.filter(item => item.barcode === barcode) // Filter items by matching barcode
                  .map(item => (
                    <Picker.Item key={item.symbol} label={item.symbol} value={item.symbol} />
                  ))}
              </Picker>
              {/* Price-Currency Pairs */}
              {priceCurrencyPairs.map((pair, index) => (
                <View key={index} style={styles.pairContainer}>
                  <TextInput
                    style={styles.priceInput}
                    value={pair.price}
                    onChangeText={(value) => handlePairChange(index, "price", value)}
                    placeholder="Price"
                    keyboardType="numeric"
                  />
                  <Picker
                    selectedValue={pair.currency}
                    onValueChange={(value) => handlePairChange(index, "currency", value)}
                    style={styles.currencyPicker}
                  >
                    <Picker.Item label="PLN" value="PLN" />
                    <Picker.Item label="HUF" value="HUF" />
                    <Picker.Item label="GBP" value="GBP" />
                    <Picker.Item label="ILS" value="ILS" />
                    <Picker.Item label="USD" value="USD" />
                    <Picker.Item label="EUR" value="EUR" />
                    <Picker.Item label="CAN" value="CAN" />
                  </Picker>
                  {/* Remove Pair Button */}
                  <Pressable
                    style={styles.removePairButton}
                    onPress={() => handleRemovePair(index)}
                  >
                    <Text style={styles.removePairButtonText}>Usuń</Text>
                  </Pressable>
                </View>
              ))}
              <Pressable style={styles.addPairButton} onPress={handleAddPair}>
                <Text style={styles.addPairButtonText}>Dodaj parę</Text>
              </Pressable>
              <View style={styles.modalButtons}>
                {/* "Anuluj" Button */}
                <Pressable
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={styles.buttonText}>Anuluj</Text>
                </Pressable>
                {/* "Dodaj" Button */}
                <Pressable
                  style={[styles.button, styles.addButton]}
                  onPress={handleSubmit} // Call handleSubmit on press
                >
                  <Text style={styles.buttonText}>Dodaj</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  message: { textAlign: "center", marginTop: 20 },
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
    backgroundColor: "white",
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
  },
  closeButton: {
    backgroundColor: "black",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
  },
  inputField: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 20,
    width: "100%",
    paddingHorizontal: 10,
  },
  pairContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
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
    backgroundColor: "blue",
    borderRadius: 5,
    alignItems: "center",
  },
  addPairButtonText: {
    color: "white",
    fontSize: 16,
  },
  removePairButton: {
    marginLeft: 10,
    padding: 10,
    backgroundColor: "red",
    borderRadius: 5,
    alignItems: "center",
  },
  removePairButtonText: {
    color: "white",
    fontSize: 14,
  },
});

export default QRScanner;