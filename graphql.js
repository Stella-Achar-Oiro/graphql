// GraphQL API Module
const GraphQL = (() => {
    // GraphQL endpoint
    const graphqlEndpoint = `https://learn.zone01kisumu.ke/api/graphql-engine/v1/graphql`;
    
    // Function to execute a GraphQL query
    const executeQuery = async (query, variables = {}) => {
        const token = Auth.getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
        // Log token format for debugging
        console.log("Token format check:", {
            token: token.substring(0, 10) + "...", // Only show beginning for security
            parts: token.split('.').length,
            isValid: token.split('.').length === 3
        });
        
        try {
            const response = await fetch(graphqlEndpoint, {
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
            
            // Log more detailed response info for debugging
            console.log("GraphQL response status:", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("GraphQL error response:", errorText);
                try {
                    const errorJson = JSON.parse(errorText);
                    throw new Error(errorJson.error || errorJson.message || 'GraphQL request failed');
                } catch (e) {
                    throw new Error(`GraphQL request failed with status: ${response.status}`);
                }
            }
            
            const data = await response.json();
            
            if (data.errors) {
                console.error("GraphQL errors:", data.errors);
                throw new Error(data.errors[0].message);
            }
            
            return data.data;
        } catch (error) {
            console.error('GraphQL error:', error);
            
            // Handle token-related errors
            if (error.message.includes('JWT') || error.message.includes('token')) {
                // Clear invalid token
                Auth.logout();
                throw new Error('Authentication token is invalid. Please log in again.');
            }
            
            throw error;
        }
    };
    
    // The rest of your code remains the same...
    
    // Function to fetch user basic info
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
    
    // Function to fetch user XP
    const getUserXP = async () => {
        const query = `
            {
                transaction(where: {type: {_eq: "xp"}}) {
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
    
    // Function to fetch user projects with their grades
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
    
    // Function to fetch user audit data
    const getUserAudits = async () => {
        const query = `
            {
                transaction(where: {type: {_eq: "up"}}) {
                    id
                    amount
                    objectId
                    createdAt
                }
                transaction(where: {type: {_eq: "down"}}) {
                    id
                    amount
                    objectId
                    createdAt
                }
            }
        `;
        
        return executeQuery(query);
    };
    
    // Function to fetch data for specific project
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
    
    // Function to fetch all data needed for graphs
    const getGraphData = async () => {
        // Get XP per project data
        const xpQuery = `
            {
                transaction(where: {type: {_eq: "xp"}}) {
                    id
                    amount
                    objectId
                    createdAt
                    path
                    object {
                        id
                        name
                        type
                    }
                }
            }
        `;
        
        // Get pass/fail data
        const projectsQuery = `
            {
                progress {
                    id
                    objectId
                    grade
                    path
                    object {
                        id
                        name
                        type
                    }
                }
            }
        `;
        
        try {
            const [xpData, projectsData] = await Promise.all([
                executeQuery(xpQuery),
                executeQuery(projectsQuery)
            ]);
            
            return {
                xpData,
                projectsData
            };
        } catch (error) {
            console.error("Error fetching graph data:", error);
            throw error;
        }
    };
    
    return {
        executeQuery,
        getUserInfo,
        getUserXP,
        getUserProjects,
        getUserAudits,
        getProjectById,
        getGraphData
    };
})();