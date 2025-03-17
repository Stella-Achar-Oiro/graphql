// Authentication Module
const Auth = (() => {
    const authEndpoint = 'https://01.kood.tech/api/auth/signin';
    const TOKEN_KEY = 'auth_token';
    
    // Function to encode credentials in base64 for Basic Auth
    const encodeCredentials = (username, password) => {
        // Make sure we're encoding properly - trim any whitespace
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();
        return btoa(`${cleanUsername}:${cleanPassword}`);
    };
    
    // Function to attempt login
    const login = async (username, password) => {
        try {
            console.log("Attempting login to:", authEndpoint);
            
            // Log the encoded credentials (don't do this in production!)
            const encodedCreds = encodeCredentials(username, password);
            console.log("Encoded credentials:", encodedCreds);
            
            const response = await fetch(authEndpoint, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${encodedCreds}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            console.log("Response status:", response.status);
            
            // If response is not ok, try to get more detailed error
            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    console.log("Error data:", errorData);
                    throw new Error(errorData.message || 'Invalid credentials');
                } catch (jsonError) {
                    // If parsing JSON fails, throw a more general error
                    console.log("Could not parse error JSON:", jsonError);
                    throw new Error(`Authentication failed with status: ${response.status}`);
                }
            }
            
            const data = await response.json();
            console.log("Successful response:", data);
            
            // Store the JWT token
            localStorage.setItem(TOKEN_KEY, data.token);
            
            return {
                success: true,
                token: data.token
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    };
    
    // Rest of the code remains the same...
    
    // Function to get the JWT token
    const getToken = () => {
        return localStorage.getItem(TOKEN_KEY);
    };
    
    // Function to check if user is authenticated
    const isAuthenticated = () => {
        const token = getToken();
        if (!token) return false;
        
        // Basic validation (you could add JWT expiration check)
        // For a real app, you'd verify the token hasn't expired
        return true;
    };
    
    // Function to decode JWT and get user ID
    const getUserId = () => {
        const token = getToken();
        if (!token) return null;
        
        try {
            // JWT is in format: header.payload.signature
            const payload = token.split('.')[1];
            // Decode the base64 payload
            const decodedPayload = atob(payload);
            // Parse the JSON
            const payloadObj = JSON.parse(decodedPayload);
            
            return payloadObj.sub || payloadObj.userId || null;
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    };
    
    // Function to log out
    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
    };
    
    // Return public methods
    return {
        login,
        logout,
        getToken,
        isAuthenticated,
        getUserId
    };
})();