import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Button, Pressable, Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import { GlobalStateContext } from "../../context/GlobalState";

const WriteOff = () => {
    const { user, stateData } = React.useContext(GlobalStateContext);
    const [modalVisible, setModalVisible] = useState(false);
    const [transferModalVisible, setTransferModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [users, setUsers] = useState([]); // List of users for transfer
    const [transfers, setTransfers] = useState([]); // List of current transfers

    const filteredData = stateData.filter(item => item.symbol === user?.symbol); // Use optional chaining

    useFocusEffect(
        React.useCallback(() => {
            fetchTransfers();
        }, [stateData])
    );

    const fetchTransfers = async () => {
        try {
            const response = await fetch(`https://bukowskiapp.pl/api/transfer/${user.symbol}`);
            const data = await response.json();
            setTransfers(data);
        } catch (error) {
            console.error("Error fetching transfers:", error);
        }
    };

    const openModal = (item) => {
        console.log("Opening modal for item:", item); // Debug log
        setSelectedItem(item);
        setModalVisible(true);
    };

    const closeModal = () => {
        setModalVisible(false);
        setSelectedItem(null); // Reset selectedItem
    };

    const fetchUsers = async () => {
        try {
            const response = await fetch("https://bukowskiapp.pl/api/user"); // Fetch all users
            const data = await response.json();
            setUsers(
                data.users.filter(
                    (u) => u.symbol !== user.symbol && u.role !== "admin" // Exclude current user and admin
                )
            );
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const initiateTransfer = async (toSymbol) => {
        if (!selectedItem) {
            Alert.alert("Error", "No item selected for transfer.");
            return;
        }

        try {
            const response = await fetch("https://bukowskiapp.pl/api/transfer/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId: selectedItem.id,
                    fullName: selectedItem.fullName,
                    size: selectedItem.size,
                    from: user.symbol,
                    to: toSymbol,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                Alert.alert("Error", errorData.message || "Failed to create transfer.");
                return;
            }

            console.log("Transfer created successfully");
            fetchTransfers(); // Refresh transfers
            setTransferModalVisible(false);
        } catch (error) {
            console.error("Error creating transfer:", error);
            Alert.alert("Error", "An unexpected error occurred while creating the transfer.");
        }
    };

    const cancelTransfer = async () => {
        if (!selectedItem) {
            Alert.alert("Error", "No item selected to cancel transfer.");
            return;
        }

        try {
            const transfer = transfers.find(t => t.productId === selectedItem.id);
            if (!transfer) {
                Alert.alert("Error", "No transfer found for this product.");
                return;
            }

            const response = await fetch(`https://bukowskiapp.pl/api/transfer/cancel/${transfer._id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to cancel transfer");
            }

            console.log("Transfer canceled successfully");
            fetchTransfers(); // Refresh transfers
            closeModal();
        } catch (error) {
            console.error("Error canceling transfer:", error);
            Alert.alert("Error", "An unexpected error occurred while canceling the transfer.");
        }
    };

    const isTransferred = (item) => transfers.some(t => t.productId === item.id);

    return (
        <View style={styles.container}>
            <FlatList
                ListHeaderComponent={
                    <Text style={styles.headerText}>
                        Stan użytkownika: {user.email}
                    </Text>
                }
                contentContainerStyle={{ paddingHorizontal: 0 }}
                data={filteredData}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <View
                        style={[
                            styles.itemContainer,
                            isTransferred(item) && { backgroundColor: "#6c757d" }, // Highlight transferred items
                            { marginHorizontal: 0 }, // Remove side margins
                        ]}
                    >
                        <Text style={styles.itemText} numberOfLines={1}>
                            {index + 1}. {item.fullName}   {item.size}
                        </Text>
                        <TouchableOpacity
                            onPress={() => openModal(item)}
                            style={styles.menuButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.menuText}>⋮</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={closeModal}
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
                            {selectedItem && isTransferred(selectedItem) ? (
                                <Pressable
                                    onPress={cancelTransfer}
                                    style={{
                                        backgroundColor: "#dc3545",
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderRadius: 5,
                                        marginBottom: 10,
                                    }}
                                >
                                    <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Anuluj przepisanie</Text>
                                </Pressable>
                            ) : (
                                <Pressable
                                    onPress={() => {
                                        setModalVisible(false);
                                        setTransferModalVisible(true); // Open transfer modal
                                    }}
                                    style={{
                                        backgroundColor: "#0d6efd",
                                        paddingVertical: 10,
                                        paddingHorizontal: 20,
                                        borderRadius: 5,
                                        marginBottom: 10,
                                    }}
                                >
                                    <Text style={{ color: "white", fontWeight: "bold", textAlign: "center" }}>Przepisz do</Text>
                                </Pressable>
                            )}
                            <Pressable
                                onPress={closeModal}
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
            <Modal
                visible={transferModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setTransferModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalText}>Wybierz użytkownika:</Text>
                        <FlatList
                            data={users}
                            keyExtractor={(item) => item._id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.userItem}
                                    onPress={() => initiateTransfer(item.symbol)}
                                >
                                    <Text style={styles.userItemText}>{item.symbol}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <Pressable
                            style={styles.closeButton}
                            onPress={() => setTransferModalVisible(false)}
                        >
                            <Text style={styles.closeButtonText}>Zamknij</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "black",
        paddingHorizontal: 0,
        marginTop: 20, // Dodaj margines do samej góry
    },
    text: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    headerText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
        marginTop: 20,
    },
    itemContainer: {
        backgroundColor: "#0d6efd",
        padding: 10,
        borderRadius: 5,
        width: "100%",
        marginVertical: 5,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    itemText: {
        color: "white",
        fontSize: 16,
    },
    menuButton: {
        padding: 5,
    },
    menuText: {
        color: "white",
        fontSize: 20,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 20,
        borderRadius: 10,
        width: "80%",
        alignItems: "center",
    },
    modalText: {
        fontSize: 18,
        marginBottom: 10,
    },
    userItem: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#0d6efd",
        borderRadius: 5,
        marginBottom: 10,
        alignItems: "center",
    },
    userItemText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
    },
    closeButton: {
        marginTop: 15,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: "#6c757d",
        borderRadius: 5,
        alignItems: "center",
    },
    closeButtonText: {
        color: "white",
        fontSize: 16,
    },
});

export default WriteOff;