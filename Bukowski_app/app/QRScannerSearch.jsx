import React, { useState } from "react";
import { View, Text, Button, StyleSheet, Modal, FlatList, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { GlobalStateContext } from "../context/GlobalState"; // Adjust the import path as necessary
import { useContext } from "react"; // Ensure useContext is imported

const QRScannerSearch = () => {
  const [facing, setFacing] = useState("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [modalVisible, setModalVisible] = useState(false);
  const [matchedItems, setMatchedItems] = useState([]);
  const { stateData } = useContext(GlobalStateContext); // Access state data from global context


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
    // Match only first five digits of barcode
    const prefix = data.slice(0, 5);
    const matches = stateData.filter(item => (item.barcode || "").slice(0, 5) === prefix);
    setMatchedItems(matches);
    setModalVisible(true);
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
      <Modal
        visible={modalVisible}
        transparent={false} // Make modal full screen
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.fullScreenModalOverlay}>
          <View style={styles.fullScreenModalContent}>
            <Text style={styles.modalTitle}>Znalezione produkty</Text>
            <FlatList
              data={matchedItems}
              keyExtractor={item => item.id}
              renderItem={({ item, index }) => (
                <View
                  style={[
                    styles.itemContainer,
                    // No transfer logic here, so no highlight
                    { marginHorizontal: 0 }, // Remove side margins
                  ]}
                >
                  <Text style={styles.itemText} numberOfLines={1}>
                    {index + 1}. {item.fullName}   {item.size}
                  </Text>
                  <Text style={styles.barcode}>{item.barcode}</Text>
                  <Text style={styles.menuText}>{item.symbol}</Text>

                </View>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>Brak wyników</Text>
              }
            />
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Zamknij</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "black", color: "white" },
  message: { textAlign: "center", marginTop: 20, color: "white" },
  camera: { flex: 1 },
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
  fullScreenModalOverlay: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 40,
  },
  fullScreenModalContent: {
    flex: 1,
    width: '100%',
    backgroundColor: 'black',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 0,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#fff',
  },
  itemContainer: {
    backgroundColor: "#0d6efd",
    padding: 5,
    borderRadius: 5,
    width: "100%",
    marginVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemText: {
    color: "white",
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "left",
    flex: 1,
  },
  menuText: {
    color: "white",
    fontSize: 20,
    marginLeft: 8,
    fontWeight: "bold",
  },
  barcode: {
    position: 'absolute',
    right : 38,
    fontSize: 13,
    color: 'white',
    marginLeft: 8,
  },
  emptyText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 24,
    fontSize: 13,
  },
  closeButton: {
    backgroundColor: 'red',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    width: '100%', // Make the button take 100% width
    alignItems: 'center',
    alignSelf: 'stretch', // Ensure it stretches to parent width
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default QRScannerSearch;