// GraphQLClient.js
import AuthManager from './AuthManager.js';

class GraphQLClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  async query(query, variables = {}) {
    const token = AuthManager.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Validate token format
    if (!token.includes('.') || token.split('.').length !== 3) {
      AuthManager.removeToken(); // Remove invalid token
      throw new Error('Invalid token format. Please log in again.');
    }

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query,
          variables
        })
      });

      if (!response.ok) {
        throw new Error(`GraphQL request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        // Check for authentication errors
        const authErrors = data.errors.some(error => 
          error.message.includes('JWT') || 
          error.message.includes('token') || 
          error.message.includes('auth')
        );
        
        if (authErrors) {
          // Remove invalid token and throw specific error
          AuthManager.removeToken();
          throw new Error('Authentication failed. Please log in again.');
        }
        
        throw new Error(`GraphQL errors: ${JSON.stringify(data.errors)}`);
      }
      
      return data.data;
    } catch (error) {
      console.error('GraphQL query error:', error);
      throw error;
    }
  }
}

export default new GraphQLClient('https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql');