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