/**
 * GraphQL API Service
 * Handles all GraphQL queries to the backend
 */

const API = (() => {
    // Constants
    const GRAPHQL_ENDPOINT = 'https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql';
    
    /**
     * Execute a GraphQL query
     * @param {string} query - GraphQL query string
     * @param {Object} variables - Query variables (optional)
     * @returns {Promise<Object>} Query result data
     */
    const executeQuery = async (query, variables = {}) => {
        const token = Auth.getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        try {
            const response = await fetch(GRAPHQL_ENDPOINT, {
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
                const errorText = await response.text();
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.error || errorJson.message || 'GraphQL request failed');
                } catch (e) {
                    throw new Error(`GraphQL request failed with status: ${response.status}`);
                }
            }
            
            const data = await response.json();
            
            if (data.errors) {
                throw new Error(data.errors[0].message);
            }
            
            return data.data;
        } catch (error) {
            console.error('GraphQL error:', error);
            
            // Handle token-related errors
            if (error.message.includes('JWT') || error.message.includes('token')) {
                Auth.logout();
                throw new Error('Authentication token is invalid. Please log in again.');
            }
            
            throw error;
        }
    };
    
    /**
     * Fetch user basic information
     * @returns {Promise<Object>} User data
     */
    const getUserInfo = async () => {
        const query = `
            {
                user {
                    id
                    login
                    firstName
                    lastName
                    email
                    attrs
                }
            }
        `;
        
        return executeQuery(query);
    };
    
    /**
     * Fetch user XP transactions
     * @returns {Promise<Object>} XP transaction data
     */
    const getUserXP = async () => {
        const query = `
            {
                transaction(where: {type: {_eq: "xp"}}) {
                    id
                    amount
                    objectId
                    createdAt
                    path
                    object {
                        name
                        type
                    }
                }
            }
        `;
        
        return executeQuery(query);
    };
    
    /**
     * Fetch user projects with grades
     * @returns {Promise<Object>} Projects and progress data
     */
    const getUserProjects = async () => {
        const query = `
            {
                progress {
                    id
                    objectId
                    grade
                    createdAt
                    updatedAt
                    path
                    object {
                        id
                        name
                        type
                    }
                }
            }
        `;
        
        return executeQuery(query);
    };
    
    /**
     * Fetch user audit data (both given and received)
     * @returns {Promise<Object>} Audit transaction data
     */
    const getUserAudits = async () => {
        const query = `
            {
                up: transaction(where: {type: {_eq: "up"}}) {
                    id
                    amount
                    objectId
                    createdAt
                    path
                }
                down: transaction(where: {type: {_eq: "down"}}) {
                    id
                    amount
                    objectId
                    createdAt
                    path
                }
            }
        `;
        
        return executeQuery(query);
    };
    
    /**
     * Fetch data for a specific project by ID
     * @param {number} projectId - Project ID
     * @returns {Promise<Object>} Project data
     */
    const getProjectById = async (projectId) => {
        const query = `
            {
                object(where: {id: {_eq: ${projectId}}}) {
                    id
                    name
                    type
                    attrs
                }
            }
        `;
        
        return executeQuery(query);
    };
    
    // Public API
    return {
        executeQuery,
        getUserInfo,
        getUserXP,
        getUserProjects,
        getUserAudits,
        getProjectById
    };
})();