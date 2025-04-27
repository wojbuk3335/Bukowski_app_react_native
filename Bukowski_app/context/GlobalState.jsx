import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Global state for user
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
    const [isLoading, setIsLoading] = useState(false); // State to track loading status
    const [stateData, setStateData] = useState(null); // Global state for fetched data
    const [sizes, setSizes] = useState([]); // Global state for sizes
    const [colors, setColors] = useState([]); // Global state for colors
    const [goods, setGoods] = useState([]); // Global state for goods
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

    const fetchSizes = async () => {
        try {
            const response = await fetch("https://bukowskiapp.pl/api/excel/size/get-all-sizes");
            if (!response.ok) {
                throw new Error("Failed to fetch sizes");
            }
            const data = await response.json();
            console.log("Fetched sizes:", data); // Debug log
            setSizes(data); // Set the fetched sizes into state
            return data; // Return fetched sizes
        } catch (error) {
            console.error("Error fetching sizes:", error.message);
            throw error;
        }
    };

    const fetchColors = async () => {
        try {
            const response = await fetch("https://bukowskiapp.pl/api/excel/color/get-all-colors");
            if (!response.ok) {
                throw new Error("Failed to fetch colors");
            }
            const data = await response.json();
            console.log("Fetched colors:", data); // Debug log
            setColors(data); // Set the fetched colors into state
            return data; // Return fetched colors
        } catch (error) {
            console.error("Error fetching colors:", error.message);
            throw error;
        }
    };

    const fetchGoods = async () => {
        try {
            const response = await fetch("https://bukowskiapp.pl/api/excel/goods/get-all-goods");
            if (!response.ok) {
                throw new Error("Failed to fetch goods");
            }
            const data = await response.json();
            console.log("Fetched goods:", data); // Debug log
            setGoods(data); // Set the fetched goods into state
            return data; // Return fetched goods
        } catch (error) {
            console.error("Error fetching goods:", error.message);
            throw error;
        }
    };

    const bukowski_login = async (email, password, navigation) => {
        setIsLoading(true); // Set loading to true
        try {
            const response = await fetch("http://localhost:3000/api/user/login", {
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
        fetchSizes(); // Fetch sizes on app initialization
        fetchColors(); // Fetch colors on app initialization
        fetchGoods(); // Fetch goods on app initialization
    }, []);

    return (
        <GlobalStateContext.Provider value={{
            user,
            isLoggedIn,
            isLoading,
            stateData,
            sizes, // Provide sizes in the global state
            colors, // Provide colors in the global state
            goods, // Provide goods in the global state
            matchedItems, // Provide matched items in the global state
            setUser: updateUser,
            bukowski_login,
            logout,
            addMatchedItem, // Provide function to add matched items
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
};
