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
        // Handle successful login (e.g., save token, user data, etc.)
        console.log("Login successful:", data);

        // Redirect to home
        alert(response.token);
    } catch (error) {
        console.error("Login error:", error.message);
        throw error;
    }
};