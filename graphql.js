// GraphQL API Module
const GraphQL = (() => {
    // Replace with your actual domain
    const graphqlEndpoint = `https://01.kood.tech/api/graphql-engine/v1/graphql`;
    
    // Function to execute a GraphQL query
    const executeQuery = async (query, variables = {}) => {
        const token = Auth.getToken();
        if (!token) {
            throw new Error('Authentication required');
        }
        
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
            
            if (!response.ok) {
                throw new Error('GraphQL request failed');
            }
            
            const data = await response.json();
            
            if (data.errors) {
                throw new Error(data.errors[0].message);
            }
            
            return data.data;
        } catch (error) {
            console.error('GraphQL error:', error);
            throw error;
        }
    };
    
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
        
        const [xpData, projectsData] = await Promise.all([
            executeQuery(xpQuery),
            executeQuery(projectsQuery)
        ]);
        
        return {
            xpData,
            projectsData
        };
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