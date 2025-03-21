// Authentication Module
const Auth = (() => {
    const authEndpoint = 'https://learn.zone01kisumu.ke/api/auth/signin';
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
                    throw new Error(errorData.error || errorData.message || 'Invalid credentials');
                } catch (jsonError) {
                    // If parsing JSON fails, throw a more general error
                    console.log("Could not parse error JSON:", jsonError);
                    throw new Error(`Authentication failed with status: ${response.status}`);
                }
            }
            
            // Get the token from the response
            let responseText = await response.text();
            console.log("Successful response:", responseText);
            
            // The token is returned as a JSON string with quotes, we need to parse it
            try {
                // Try to parse as JSON first (it might be a string in quotes)
                let parsedToken = JSON.parse(responseText);
                
                // If parsed successfully and it's a string, use that
                if (typeof parsedToken === 'string') {
                    responseText = parsedToken;
                }
                // If it's an object with a token property, use that
                else if (parsedToken && parsedToken.token) {
                    responseText = parsedToken.token;
                }
            } catch (e) {
                // If parsing fails, it's already a raw string
                console.log("Token is already a raw string");
            }
            
            // Final token value
            const token = responseText;
            
            // Check if we received a valid token
            if (!token || token.split('.').length !== 3) {
                console.error("Invalid JWT format:", token);
                throw new Error("Invalid token format received from server");
            }
            
            // Store the JWT token
            localStorage.setItem(TOKEN_KEY, token);
            
            return {
                success: true,
                token: token
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    };
    
    // Function to get the JWT token
    const getToken = () => {
        const token = localStorage.getItem(TOKEN_KEY);
        
        // Check if token exists and has valid format
        if (!token || token.split('.').length !== 3) {
            console.warn("Invalid token format in storage");
            // Clear invalid token
            localStorage.removeItem(TOKEN_KEY);
            return null;
        }
        
        return token;
    };
    
    // Function to check if user is authenticated
    const isAuthenticated = () => {
        const token = getToken();
        if (!token) return false;
        
        try {
            // Parse the JWT parts
            const parts = token.split('.');
            if (parts.length !== 3) return false;
            
            // Get the payload
            const payload = JSON.parse(atob(parts[1]));
            
            // Check if token is expired
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                console.warn("Token expired");
                localStorage.removeItem(TOKEN_KEY);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error("Error validating token:", error);
            return false;
        }
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