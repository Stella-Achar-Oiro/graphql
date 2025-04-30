// GraphQLClient.js
import AuthManager from './AuthManager.js';

class GraphQLClient {
  constructor(endpoint) {
    this.endpoint = endpoint;
    this.pendingRequests = new Map();
  }

  async query(query, variables = {}) {
    const token = AuthManager.getToken();
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    if (!token.includes('.') || token.split('.').length !== 3) {
      AuthManager.removeToken();
      throw new Error('Invalid token format. Please log in again.');
    }

    // Create a unique key for this request
    const requestKey = JSON.stringify({ query, variables });
    
    // Check if there's already a pending request for this query
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey);
    }

    try {
      const requestPromise = this._executeQuery(query, variables, token);
      this.pendingRequests.set(requestKey, requestPromise);
      
      const data = await requestPromise;
      this.pendingRequests.delete(requestKey);
      return data;
    } catch (error) {
      this.pendingRequests.delete(requestKey);
      throw error;
    }
  }

  async _executeQuery(query, variables, token) {
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
        const authErrors = data.errors.some(error => 
          error.message.toLowerCase().includes('jwt') || 
          error.message.toLowerCase().includes('token') || 
          error.message.toLowerCase().includes('auth')
        );
        
        if (authErrors) {
          AuthManager.removeToken();
          throw new Error('Authentication failed. Please log in again.');
        }

        // Check for module-specific errors
        const moduleErrors = data.errors.some(error => 
          error.message.toLowerCase().includes('module') ||
          error.message.toLowerCase().includes('event')
        );

        if (moduleErrors) {
          throw new Error('Unable to load module data. The module may not exist or you may not have access to it.');
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