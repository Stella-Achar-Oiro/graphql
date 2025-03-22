/**
 * Authentication Service
 * Handles user authentication, token management, and session validation
 */

const Auth = (() => {
    // Constants
    const AUTH_ENDPOINT = 'https://learn.zone01kisumu.ke/api/auth/signin';
    const TOKEN_KEY = 'auth_token';
    
    /**
     * Encode credentials for Basic Auth
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @returns {string} Base64 encoded credentials
     */
    const encodeCredentials = (username, password) => {
        const cleanUsername = username.trim();
        const cleanPassword = password.trim();
        return btoa(`${cleanUsername}:${cleanPassword}`);
    };
    
    /**
     * Attempt user login
     * @param {string} username - Username or email
     * @param {string} password - Password
     * @returns {Promise<Object>} Login result with success flag and token or error
     */
    const login = async (username, password) => {
        try {
            console.log("Attempting login...");
            
            const encodedCreds = encodeCredentials(username, password);
            
            const response = await fetch(AUTH_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Authorization': `Basic ${encodedCreds}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                try {
                    const errorData = await response.json();
                    throw new Error(errorData.error || errorData.message || 'Invalid credentials');
                } catch (jsonError) {
                    throw new Error(`Authentication failed with status: ${response.status}`);
                }
            }
            
            // Get the token from the response
            let responseText = await response.text();
            
            // Parse the token
            try {
                let parsedToken = JSON.parse(responseText);
                
                if (typeof parsedToken === 'string') {
                    responseText = parsedToken;
                } else if (parsedToken && parsedToken.token) {
                    responseText = parsedToken.token;
                }
            } catch (e) {
                // If parsing fails, it's already a raw string
                console.log("Token is already a raw string");
            }
            
            // Final token value
            const token = responseText;
            
            // Validate token format
            if (!token || token.split('.').length !== 3) {
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
    
    /**
     * Get the JWT token from storage
     * @returns {string|null} JWT token or null if not found/invalid
     */
    const getToken = () => {
        const token = localStorage.getItem(TOKEN_KEY);
        
        // Check if token exists and has valid format
        if (!token || token.split('.').length !== 3) {
            // Clear invalid token
            localStorage.removeItem(TOKEN_KEY);
            return null;
        }
        
        return token;
    };
    
    /**
     * Check if user is authenticated with a valid token
     * @returns {boolean} Authentication status
     */
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
    
    /**
     * Get user ID from the JWT token
     * @returns {string|null} User ID or null if not found
     */
    const getUserId = () => {
        const token = getToken();
        if (!token) return null;
        
        try {
            // Decode the JWT payload
            const payload = token.split('.')[1];
            const decodedPayload = atob(payload);
            const payloadObj = JSON.parse(decodedPayload);
            
            return payloadObj.sub || payloadObj.userId || null;
        } catch (error) {
            console.error('Error decoding JWT:', error);
            return null;
        }
    };
    
    /**
     * Log out the current user
     */
    const logout = () => {
        localStorage.removeItem(TOKEN_KEY);
    };
    
    // Public API
    return {
        login,
        logout,
        getToken,
        isAuthenticated,
        getUserId
    };
})();