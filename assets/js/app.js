/**
 * Main application script
 * Controls the overall app flow and navigation
 */

// Wait for DOM to load
document.addEventListener('DOMContentLoaded', () => {
    // DOM References
    const loginPage = document.getElementById('login-page');
    const dashboard = document.getElementById('dashboard');
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const logoutButton = document.getElementById('logout-btn');
    const navItems = document.querySelectorAll('.sidebar-nav li');
    const sections = document.querySelectorAll('.dashboard-section');
    const sectionTitle = document.getElementById('section-title');
    const themeToggle = document.getElementById('theme-toggle');
    const lastUpdate = document.getElementById('last-update');
    
    // State management
    let userData = {
        user: null,
        xp: null,
        projects: null,
        audits: null,
        statistics: null
    };
    
    // Theme management
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'dark';
        document.body.className = `${savedTheme}-theme`;
        
        // Update theme toggle icon
        const isDark = savedTheme === 'dark';
        themeToggle.innerHTML = `<i class="fas fa-${isDark ? 'sun' : 'moon'}"></i>`;
        
        // Add toggle event
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            document.body.className = `${newTheme}-theme`;
            themeToggle.innerHTML = `<i class="fas fa-${newTheme === 'dark' ? 'sun' : 'moon'}"></i>`;
            
            localStorage.setItem('theme', newTheme);
            
            // Refresh charts with new theme
            if (userData.statistics) {
                renderStatistics();
            }
        });
    };
    
    // Navigation management
    const initNavigation = () => {
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active class from all nav items and sections
                navItems.forEach(navItem => navItem.classList.remove('active'));
                sections.forEach(section => section.classList.remove('active'));
                
                // Add active class to clicked item and corresponding section
                item.classList.add('active');
                const sectionId = `${item.dataset.section}-section`;
                document.getElementById(sectionId).classList.add('active');
                
                // Update section title
                sectionTitle.textContent = item.querySelector('span').textContent;
            });
        });
    };
    
    // Authentication check
    const checkAuth = () => {
        if (Auth.isAuthenticated()) {
            showDashboard();
            loadUserData();
        } else {
            showLoginPage();
        }
    };
    
    // Show login page
    const showLoginPage = () => {
        loginPage.classList.remove('hidden');
        dashboard.classList.add('hidden');
    };
    
    // Show dashboard
    const showDashboard = () => {
        loginPage.classList.add('hidden');
        dashboard.classList.remove('hidden');
    };
    
    // Load all user data
    const loadUserData = async () => {
        try {
            // Set loading state
            updateLoadingState(true);
            
            // Fetch all data in parallel
            const [user, xp, projects, audits] = await Promise.all([
                API.getUserInfo(),
                API.getUserXP(),
                API.getUserProjects(),
                API.getUserAudits()
            ]);
            
            // Store data in app state
            userData = {
                user,
                xp,
                projects,
                audits,
                statistics: {
                    xp: xp,
                    projects: projects,
                    audits: audits
                }
            };
            
            // Update last data refresh time
            updateLastRefresh();
            
            // Render all sections
            renderSidebarUser();
            renderProfile();
            renderXP();
            renderProjects();
            renderAudits();
            renderSkills();
            renderStatistics();
            
            // Clear loading state
            updateLoadingState(false);
        } catch (error) {
            console.error('Error loading user data:', error);
            
            // Show error in all sections
            document.querySelectorAll('.loading-placeholder').forEach(el => {
                el.innerHTML = `<div class="error-message">Error loading data: ${error.message}</div>`;
            });
            
            // Check if authentication error
            if (error.message.includes('Authentication') || error.message.includes('token')) {
                Auth.logout();
                showLoginPage();
                displayError('Your session has expired. Please log in again.');
            }
        }
    };
    
    // Update loading state
    const updateLoadingState = (isLoading) => {
        const loadingElements = document.querySelectorAll('.loading-placeholder');
        
        if (isLoading) {
            loadingElements.forEach(el => {
                el.innerHTML = `
                    <div class="loading-spinner">
                        <i class="fas fa-circle-notch fa-spin"></i>
                        <span>Loading data...</span>
                    </div>
                `;
            });
        } else {
            loadingElements.forEach(el => {
                el.style.display = 'none';
            });
        }
    };
    
    // Update last refresh timestamp
    const updateLastRefresh = () => {
        const now = new Date();
        lastUpdate.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    };
    
    // Display error message
    const displayError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
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
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i> Signing in...';
        submitBtn.disabled = true;
        
        // Attempt login
        try {
            const result = await Auth.login(username, password);
            
            if (result.success) {
                showDashboard();
                loadUserData();
            } else {
                displayError(result.error || 'Login failed. Please try again.');
            }
        } catch (error) {
            displayError('An unexpected error occurred. Please try again.');
            console.error('Login error:', error);
        } finally {
            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    });
    
    // Handle logout button click
    logoutButton.addEventListener('click', () => {
        Auth.logout();
        showLoginPage();
    });
    
    // Render sidebar user info
    const renderSidebarUser = () => {
        const sidebarUserInfo = document.getElementById('sidebar-user-info');
        const user = userData.user.user[0];
        
        if (!user) return;
        
        sidebarUserInfo.innerHTML = `
            <div class="avatar">${user.firstName ? user.firstName.charAt(0) : user.login.charAt(0)}</div>
            <h3>${user.firstName || ''} ${user.lastName || ''}</h3>
            <p>@${user.login}</p>
        `;
    };
    
    // Render profile section - delegate to profile component
    const renderProfile = () => {
        if (!userData.user) return;
        
        const profileContent = document.getElementById('profile-content');
        profileContent.innerHTML = ProfileComponent.render(userData.user);
        
        // Initialize any profile component events
        ProfileComponent.init();
    };
    
    // Render XP section - delegate to XP component
    const renderXP = () => {
        if (!userData.xp) return;
        
        const xpContent = document.getElementById('xp-content');
        xpContent.innerHTML = XPComponent.render(userData.xp);
    };
    
    // Render projects section - delegate to Grades component
    const renderProjects = () => {
        if (!userData.projects) return;
        
        const projectsContent = document.getElementById('projects-content');
        projectsContent.innerHTML = GradesComponent.render(userData.projects);
        
        // Initialize projects component events (filtering, sorting)
        GradesComponent.init();
    };
    
    // Render audits section - delegate to Audits component
    const renderAudits = () => {
        if (!userData.audits) return;
        
        const auditsContent = document.getElementById('audits-content');
        auditsContent.innerHTML = AuditsComponent.render(userData.audits);
        
        // Initialize the audit history chart
        ChartUtils.createAuditHistoryChart(userData.audits, 'audit-history-chart');
    };
    
    // Render skills section - delegate to Skills component
    const renderSkills = () => {
        if (!userData.xp && !userData.projects) return;
        
        const skillsContent = document.getElementById('skills-content');
        skillsContent.innerHTML = SkillsComponent.render(userData.xp, userData.projects);
    };
    
    // Render statistics section - using ChartUtils
    const renderStatistics = () => {
        if (!userData.statistics) return;
        
        // Create XP by Project chart
        ChartUtils.createXpBarChart(
            userData.statistics.xp.transaction,
            'xp-project-chart'
        );
        
        // Create Pass/Fail ratio chart
        ChartUtils.createPassFailPieChart(
            userData.statistics.projects.progress,
            'pass-fail-chart'
        );
        
        // Create XP Timeline chart
        ChartUtils.createXpTimelineChart(
            userData.statistics.xp.transaction,
            'xp-timeline-chart'
        );
        
        // Create Audit Performance chart
        ChartUtils.createAuditChart(
            userData.statistics.audits,
            'audit-chart'
        );
    };
    
    // Initialize the application
    const init = () => {
        initTheme();
        initNavigation();
        checkAuth();
    };
    
    // Start the app
    init();
});