import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Global state for user
    const [isLoggedIn, setIsLoggedIn] = useState(false); // State to track login status
    const [isLoading, setIsLoading] = useState(false); // State to track loading status

    const updateUser = (userData) => {
        setUser(userData);
        setIsLoggedIn(!!userData); // Update login status
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

    return (
        <GlobalStateContext.Provider value={{ user, isLoggedIn, isLoading, setUser: updateUser, bukowski_login, logout }}>
            {children}
        </GlobalStateContext.Provider>
    );
};
