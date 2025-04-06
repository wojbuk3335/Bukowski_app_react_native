import React, { createContext, useState } from "react";

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Global state for user

    const updateUser = (userData) => {
        console.log("Global State Updated:", userData); // Debug log
        setUser(userData);
    };

    return (
        <GlobalStateContext.Provider value={{ user, setUser: updateUser }}>
            {children}
        </GlobalStateContext.Provider>
    );
};
