// Main Application Logic
document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const loginPage = document.getElementById('login-page');
    const profilePage = document.getElementById('profile-page');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const logoutButton = document.getElementById('logout-btn');
    
    // Profile section elements
    const userBasicInfo = document.getElementById('user-basic-info');
    const xpInfo = document.getElementById('xp-info');
    const projectsInfo = document.getElementById('projects-info');
    
    // Graph elements
    const xpPerProjectGraph = document.getElementById('xp-per-project-graph');
    const passFailGraph = document.getElementById('pass-fail-graph');
    
    // Check authentication status on page load
    const checkAuth = () => {
        if (Auth.isAuthenticated()) {
            showProfilePage();
            loadUserData();
        } else {
            showLoginPage();
        }
    };
    
    // Show login page and hide profile page
    const showLoginPage = () => {
        loginPage.classList.remove('hidden');
        profilePage.classList.add('hidden');
    };
    
    // Show profile page and hide login page
    const showProfilePage = () => {
        loginPage.classList.add('hidden');
        profilePage.classList.remove('hidden');
    };
    
    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Get form values
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        // Clear previous errors
        errorMessage.classList.add('hidden');
        
        // Attempt login
        const result = await Auth.login(username, password);
        
        if (result.success) {
            showProfilePage();
            loadUserData();
        } else {
            // Show error message
            errorMessage.textContent = result.error || 'Login failed. Please try again.';
            errorMessage.classList.remove('hidden');
        }
    });
    
    // Handle logout button click
    logoutButton.addEventListener('click', () => {
        Auth.logout();
        showLoginPage();
    });
    
    // Load all user data for profile
    const loadUserData = async () => {
        try {
            // Display loading indicators
            userBasicInfo.innerHTML = '<p>Loading...</p>';
            xpInfo.innerHTML = '<p>Loading...</p>';
            projectsInfo.innerHTML = '<p>Loading...</p>';
            
            // Fetch all data in parallel
            const [userInfo, xpData, projectsData, graphData] = await Promise.all([
                GraphQL.getUserInfo(),
                GraphQL.getUserXP(),
                GraphQL.getUserProjects(),
                GraphQL.getGraphData()
            ]);
            
            // Update profile sections
            updateUserInfoSection(userInfo);
            updateXpSection(xpData);
            updateProjectsSection(projectsData);
            
            // Generate graphs with the data
            Charts.createXpBarChart(graphData.xpData.transaction, 'xp-per-project-graph');
            Charts.createPassFailPieChart(graphData.projectsData.progress, 'pass-fail-graph');
            
        } catch (error) {
            console.error('Error loading user data:', error);
            // Show error messages in the sections
            userBasicInfo.innerHTML = '<p class="error">Error loading user data</p>';
            xpInfo.innerHTML = '<p class="error">Error loading XP data</p>';
            projectsInfo.innerHTML = '<p class="error">Error loading projects data</p>';
        }
    };
    
    // Update user info section with fetched data
    const updateUserInfoSection = (data) => {
        const user = data.user[0]; // Get the first user (should be only one)
        
        if (!user) {
            userBasicInfo.innerHTML = '<p>No user data found</p>';
            return;
        }
        
        // Format user data
        userBasicInfo.innerHTML = `
            <div class="user-profile">
                <h3>${user.firstName || ''} ${user.lastName || ''} (${user.login})</h3>
                <p><strong>Email:</strong> ${user.email || 'Not available'}</p>
                <p><strong>User ID:</strong> ${user.id}</p>
                ${user.attrs ? `<p><strong>Attributes:</strong> ${JSON.stringify(user.attrs)}</p>` : ''}
            </div>
        `;
    };
    
    // Update XP section with fetched data
    const updateXpSection = (data) => {
        const transactions = data.transaction;
        
        if (!transactions || transactions.length === 0) {
            xpInfo.innerHTML = '<p>No XP data found</p>';
            return;
        }
        
        // Calculate total XP
        const totalXP = transactions.reduce((sum, transaction) => sum + transaction.amount, 0);
        
        // Group XP by path (project)
        const xpByPath = transactions.reduce((acc, transaction) => {
            const path = transaction.path;
            if (!acc[path]) {
                acc[path] = 0;
            }
            acc[path] += transaction.amount;
            return acc;
        }, {});
        
        // Sort projects by XP
        const sortedProjects = Object.entries(xpByPath)
            .map(([path, xp]) => ({ path, xp }))
            .sort((a, b) => b.xp - a.xp);
        
        // Find most recent XP transaction
        const mostRecent = transactions.sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        )[0];
        
        // Format XP data
        xpInfo.innerHTML = `
            <div>
                <h3>Total XP: ${totalXP.toLocaleString()}</h3>
                <p><strong>Most recent XP:</strong> ${mostRecent ? `${mostRecent.amount} XP on ${new Date(mostRecent.createdAt).toLocaleDateString()}` : 'None'}</p>
                
                <h4>Top Projects by XP:</h4>
                <ul>
                    ${sortedProjects.slice(0, 5).map(project => 
                        `<li><strong>${project.path.split('/').pop()}:</strong> ${project.xp.toLocaleString()} XP</li>`
                    ).join('')}
                </ul>
            </div>
        `;
    };
    
    // Update projects section with fetched data
    const updateProjectsSection = (data) => {
        const projects = data.progress;
        
        if (!projects || projects.length === 0) {
            projectsInfo.innerHTML = '<p>No projects data found</p>';
            return;
        }
        
        // Count passed and failed projects
        const passedCount = projects.filter(project => project.grade > 0).length;
        const failedCount = projects.filter(project => project.grade === 0).length;
        const totalCount = projects.length;
        
        // Calculate pass rate
        const passRate = (passedCount / totalCount * 100).toFixed(1);
        
        // Group projects by path
        const projectsByPath = projects.reduce((acc, project) => {
            const pathParts = project.path.split('/');
            const category = pathParts[pathParts.length - 2] || 'Other'; // Get second-to-last part of path as category
            
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(project);
            return acc;
        }, {});
        
        // Format projects data
        projectsInfo.innerHTML = `
            <div>
                <h3>Projects Overview</h3>
                <p><strong>Total Projects:</strong> ${totalCount}</p>
                <p><strong>Pass Rate:</strong> ${passRate}% (${passedCount} passed, ${failedCount} failed)</p>
                
                <h4>Projects by Category:</h4>
                <ul>
                    ${Object.entries(projectsByPath).map(([category, categoryProjects]) => 
                        `<li>
                            <strong>${category}:</strong> ${categoryProjects.length} projects
                            (${categoryProjects.filter(p => p.grade > 0).length} passed)
                        </li>`
                    ).join('')}
                </ul>
                
                <h4>Recent Projects:</h4>
                <ul>
                    ${projects
                        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                        .slice(0, 5)
                        .map(project => {
                            const status = project.grade > 0 ? 'Passed' : 'Failed';
                            const date = new Date(project.updatedAt).toLocaleDateString();
                            return `<li>
                                <strong>${project.path.split('/').pop()}:</strong> 
                                ${status} (${date})
                            </li>`;
                        })
                        .join('')
                    }
                </ul>
            </div>
        `;
    };
    
    // Initialize the application
    checkAuth();
});