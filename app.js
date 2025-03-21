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
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.textContent = 'Logging in...';
        submitBtn.disabled = true;
        
        // Attempt login
        const result = await Auth.login(username, password);
        
        // Reset button
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
        
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
            userBasicInfo.innerHTML = '<p class="loading">Loading user information...</p>';
            xpInfo.innerHTML = '<p class="loading">Loading XP data...</p>';
            projectsInfo.innerHTML = '<p class="loading">Loading projects data...</p>';
            
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
            
            // Check if token is invalid and redirect to login if needed
            if (error.message.includes('Authentication') || error.message.includes('token')) {
                Auth.logout();
                showLoginPage();
                errorMessage.textContent = 'Your session has expired. Please log in again.';
                errorMessage.classList.remove('hidden');
            }
        }
    };
    
    // Update user info section with fetched data
    const updateUserInfoSection = (data) => {
        const user = data.user[0]; // Get the first user (should be only one)
        
        if (!user) {
            userBasicInfo.innerHTML = '<p>No user data found</p>';
            return;
        }
        
        // Format user data with better styling
        userBasicInfo.innerHTML = `
            <div class="user-profile">
                <h3>${user.firstName || ''} ${user.lastName || ''} (${user.login})</h3>
                <p><strong>Email:</strong> ${user.email || 'Not available'}</p>
                <p><strong>User ID:</strong> ${user.id}</p>
                ${user.attrs && Object.keys(user.attrs).length > 0 ? 
                    `<p><strong>Attributes:</strong></p>
                    <ul class="xp-list">
                        ${Object.entries(user.attrs).map(([key, value]) => 
                            `<li><strong>${key}:</strong> ${JSON.stringify(value)}</li>`
                        ).join('')}
                    </ul>` : ''}
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
        
        // Calculate XP by month (for showing progression)
        const xpByMonth = transactions.reduce((acc, transaction) => {
            const date = new Date(transaction.createdAt);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!acc[monthYear]) {
                acc[monthYear] = 0;
            }
            acc[monthYear] += transaction.amount;
            return acc;
        }, {});
        
        // Sort months chronologically
        const sortedMonths = Object.entries(xpByMonth)
            .map(([month, xp]) => ({ month, xp }))
            .sort((a, b) => a.month.localeCompare(b.month));
        
        // Format dates for display
        const formatMonth = (monthStr) => {
            const [year, month] = monthStr.split('-');
            const date = new Date(year, month - 1);
            return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
        };
        
        // Format XP data with improved visuals
        xpInfo.innerHTML = `
            <div>
                <div class="xp-total">${totalXP.toLocaleString()} XP</div>
                
                <p class="xp-recent">
                    <strong>Most recent:</strong> ${mostRecent ? 
                    `${mostRecent.amount.toLocaleString()} XP on ${new Date(mostRecent.createdAt).toLocaleDateString()}` : 
                    'None'}
                </p>
                
                <h4>Top Projects by XP:</h4>
                <ul class="xp-list">
                    ${sortedProjects.slice(0, 5).map(project => {
                        const projectName = project.path.split('/').pop();
                        const percentOfTotal = ((project.xp / totalXP) * 100).toFixed(1);
                        return `<li>
                            <strong>${projectName}:</strong> ${project.xp.toLocaleString()} XP
                            <div class="progress-bar">
                                <div class="progress" style="width: ${percentOfTotal}%;" title="${percentOfTotal}%"></div>
                            </div>
                        </li>`;
                    }).join('')}
                </ul>
                
                ${sortedMonths.length > 1 ? `
                <h4>XP Progress:</h4>
                <ul class="xp-list">
                    ${sortedMonths.slice(-3).map(item => {
                        return `<li>
                            <strong>${formatMonth(item.month)}:</strong> ${item.xp.toLocaleString()} XP
                        </li>`;
                    }).join('')}
                </ul>
                ` : ''}
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
        
        // Format projects data with improved visuals
        projectsInfo.innerHTML = `
            <div>
                <div class="projects-overview">
                    <p><strong>Total Projects:</strong> ${totalCount}</p>
                    <p>
                        <strong>Pass Rate:</strong> 
                        <span class="pass-rate" style="background-color: ${passRate >= 70 ? 'var(--success-color)' : passRate >= 50 ? '#f39c12' : 'var(--error-color)'}">
                            ${passRate}%
                        </span>
                    </p>
                    <p>${passedCount} passed, ${failedCount} failed</p>
                </div>
                
                <div class="project-categories">
                    <h4>Projects by Category:</h4>
                    <ul class="xp-list">
                        ${Object.entries(projectsByPath)
                            .sort((a, b) => b[1].length - a[1].length)
                            .slice(0, 3)
                            .map(([category, categoryProjects]) => {
                                const passedInCategory = categoryProjects.filter(p => p.grade > 0).length;
                                const categoryPassRate = ((passedInCategory / categoryProjects.length) * 100).toFixed(1);
                                return `<li>
                                    <strong>${category}:</strong> ${categoryProjects.length} projects
                                    <span class="pass-rate" style="background-color: ${categoryPassRate >= 70 ? 'var(--success-color)' : categoryPassRate >= 50 ? '#f39c12' : 'var(--error-color)'}; font-size: 12px; padding: 2px 6px;">
                                        ${categoryPassRate}%
                                    </span>
                                </li>`;
                            }).join('')}
                    </ul>
                </div>
                
                <div class="project-recent">
                    <h4>Recent Projects:</h4>
                    <ul class="project-recent-list">
                        ${projects
                            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                            .slice(0, 5)
                            .map(project => {
                                const status = project.grade > 0 ? 'Passed' : 'Failed';
                                const statusClass = project.grade > 0 ? 'status-passed' : 'status-failed';
                                const date = new Date(project.updatedAt).toLocaleDateString();
                                const projectName = project.path.split('/').pop();
                                
                                return `<li>
                                    <div class="project-name">${projectName}</div>
                                    <div class="project-meta">
                                        <div class="project-status ${statusClass}">${status}</div>
                                        <div class="project-date">${date}</div>
                                    </div>
                                </li>`;
                            })
                            .join('')
                        }
                    </ul>
                </div>
            </div>
        `;
    };
    
    // Initialize the application
    checkAuth();
});