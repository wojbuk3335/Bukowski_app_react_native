import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Global state for user
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
    const [isLoading, setIsLoading] = useState(false); // State to track loading status
    const [stateData, setStateData] = useState(null); // Global state for fetched data
    const [matchedItems, setMatchedItems] = useState([]); // Lista dopasowanych elementów

    const addMatchedItem = (barcode) => {
        if (stateData) {
            const matchedItem = stateData.find(item => item.barcode === barcode);
            if (matchedItem) {
                setMatchedItems(prev => [...prev, matchedItem]);
            }
        }
    };

    const updateUser = (userData) => {
        setUser(userData);
        setIsLoggedIn(!!userData); // Update login status
    };

    const fetchState = async () => {
        try {
            const response = await fetch("https://bukowskiapp.pl/api/state");
            if (!response.ok) {
                throw new Error("Failed to fetch state");
            }
            const data = await response.json();
            console.log("Fetched state:", data); // Debug log
            setStateData(data); // Set the fetched data into stateData
            return data; // Return fetched state
        } catch (error) {
            console.error("Error fetching state:", error.message);
            throw error;
        }
    };

    const bukowski_login = async (email, password, navigation) => {
        setIsLoading(true); // Set loading to true
        try {
            const response = await fetch("https://bukowskiapp.pl/api/user/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Login failed");
            }

            const data = await response.json();
            setUser(data); // Update user state
            setIsLoggedIn(true); // Set login status to true
            await AsyncStorage.setItem("user", JSON.stringify(data)); // Save user data locally

            // Fetch additional state after login
            const fetchedState = await fetchState();
            setStateData(fetchedState); // Update global state with fetched data
            console.log("State data after login:", fetchedState); // Debug log

            return data; // Return user data
        } catch (error) {
            console.error("Login error:", error.message); // Debug log
            throw error;
        } finally {
            setIsLoading(false); // Set loading to false
        }
    };

    const logout = async () => {
        console.log("User logged out"); // Debug log
        setUser(null); // Clear user state
        setIsLoggedIn(false); // Set login status to false
        await AsyncStorage.removeItem("user"); // Remove user data from storage
    };

    React.useEffect(() => {
        fetchState(); // Fetch state data on app initialization
    }, []);

    return (
        <GlobalStateContext.Provider value={{
            user,
            isLoggedIn,
            isLoading,
            stateData,
            matchedItems, // Udostępnij listę dopasowanych elementów
            setUser: updateUser,
            bukowski_login,
            logout,
            addMatchedItem, // Udostępnij funkcję dodawania dopasowanych elementów
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
};
