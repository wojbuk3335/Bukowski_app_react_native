export const bukowski_login = async (email, password, navigation) => {
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
        console.log("Login successful:", data); // Debug log
        return data; // Return user data
    } catch (error) {
        console.error("Login error:", error.message); // Debug log
        throw error;
    }
};