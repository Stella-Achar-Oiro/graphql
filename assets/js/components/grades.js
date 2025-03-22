/**
 * Grades Component
 * Renders the projects and grades section
 */

const GradesComponent = (() => {
    // Track state for filtering and sorting
    let projectsData = [];
    let filteredProjects = [];
    
    /**
     * Initialize component event listeners
     */
    const init = () => {
        // Add search functionality
        const searchInput = document.getElementById('project-search');
        if (searchInput) {
            searchInput.addEventListener('input', filterProjects);
        }
        
        // Add filter functionality
        const statusFilter = document.getElementById('status-filter');
        if (statusFilter) {
            statusFilter.addEventListener('change', filterProjects);
        }
        
        // Add sort functionality
        const sortSelect = document.getElementById('sort-select');
        if (sortSelect) {
            sortSelect.addEventListener('change', filterProjects);
        }
    };
    
    /**
     * Filter and sort projects based on user selections
     */
    const filterProjects = () => {
        const searchInput = document.getElementById('project-search');
        const statusFilter = document.getElementById('status-filter');
        const sortSelect = document.getElementById('sort-select');
        const projectList = document.getElementById('project-list');
        const noResults = document.getElementById('no-results');
        
        if (!searchInput || !statusFilter || !sortSelect || !projectList || !noResults) return;
        
        const searchTerm = searchInput.value.toLowerCase();
        const statusValue = statusFilter.value;
        const sortValue = sortSelect.value;
        
        // Apply filters
        filteredProjects = projectsData.filter(project => {
            const projectName = project.path.split('/').pop().toLowerCase();
            const matchesSearch = projectName.includes(searchTerm);
            const matchesStatus = statusValue === 'all' || 
                                 (statusValue === 'passed' && project.grade > 0) ||
                                 (statusValue === 'failed' && project.grade === 0);
            
            return matchesSearch && matchesStatus;
        });
        
        // Apply sorting
        filteredProjects.sort((a, b) => {
            const aName = a.path.split('/').pop();
            const bName = b.path.split('/').pop();
            
            switch(sortValue) {
                case 'recent':
                    return new Date(b.updatedAt) - new Date(a.updatedAt);
                case 'oldest':
                    return new Date(a.updatedAt) - new Date(b.updatedAt);
                case 'name-asc':
                    return aName.localeCompare(bName);
                case 'name-desc':
                    return bName.localeCompare(aName);
                case 'grade-high':
                    return b.grade - a.grade;
                case 'grade-low':
                    return a.grade - b.grade;
                default:
                    return 0;
            }
        });
        
        // Update UI
        renderProjectList(filteredProjects);
        
        // Show/hide no results message
        if (filteredProjects.length === 0) {
            noResults.classList.remove('hidden');
        } else {
            noResults.classList.add('hidden');
        }
        
        // Update counts
        document.getElementById('project-count').textContent = `Showing ${filteredProjects.length} of ${projectsData.length} projects`;
    };
    
    /**
     * Render the filtered project list
     * @param {Array} projects - Projects to display
     */
    const renderProjectList = (projects) => {
        const projectList = document.getElementById('project-list');
        if (!projectList) return;
        
        projectList.innerHTML = projects.slice(0, 50).map(project => {
            const projectName = project.path.split('/').pop();
            const status = project.grade > 0 ? 'passed' : 'failed';
            const date = new Date(project.updatedAt).toLocaleDateString();
            
            return `
                <div class="grade-item">
                    <div>
                        <div class="grade-name">${projectName}</div>
                        <div class="grade-path">${project.path}</div>
                    </div>
                    <div class="grade-info">
                        <div class="grade-status ${status}">${status}</div>
                        <div class="grade-date">${date}</div>
                    </div>
                </div>
            `;
        }).join('');
    };
    
    /**
     * Render the projects section
     * @param {Object} projectsData - Projects data from API
     * @returns {string} HTML content for the projects section
     */
    const render = (projectsData) => {
        const projects = projectsData.progress;
        
        if (!projects || projects.length === 0) {
            return '<div class="error-message">No projects data found</div>';
        }
        
        // Store projects data for filtering
        this.projectsData = projects;
        this.filteredProjects = [...projects];
        
        // Count passed and failed projects
        const passedProjects = projects.filter(project => project.grade > 0);
        const failedProjects = projects.filter(project => project.grade === 0);
        const passedCount = passedProjects.length;
        const failedCount = failedProjects.length;
        const totalCount = projects.length;
        
        // Calculate pass rate
        const passRate = (passedCount / totalCount * 100).toFixed(1);
        
        // Calculate average grade for passed projects
        const averageGrade = passedProjects.length > 0 ? 
            (passedProjects.reduce((sum, project) => sum + project.grade, 0) / passedProjects.length).toFixed(1) :
            0;
        
        // Group projects by category (path)
        const projectsByCategory = projects.reduce((acc, project) => {
            const pathParts = project.path.split('/');
            const category = pathParts.length > 1 ? pathParts[pathParts.length - 2] : 'Other';
            
            if (!acc[category]) {
                acc[category] = [];
            }
            acc[category].push(project);
            return acc;
        }, {});
        
        // Get top categories
        const topCategories = Object.entries(projectsByCategory)
            .map(([category, projects]) => ({
                category,
                count: projects.length,
                passCount: projects.filter(p => p.grade > 0).length
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        
        // Sort projects by date (most recent first)
        const sortedProjects = [...projects].sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        // Build the complete grades section HTML
        return `
            <div class="grades-container">
                <div class="grades-overview">
                    <div class="grades-stats">
                        <div class="grade-metric">
                            <div class="metric-value info">${totalCount}</div>
                            <div class="metric-label">Total Projects</div>
                        </div>
                        <div class="grade-metric">
                            <div class="metric-value ${passRate >= 70 ? 'success' : passRate >= 50 ? 'warning' : 'danger'}">${passRate}%</div>
                            <div class="metric-label">Pass Rate</div>
                        </div>
                        <div class="grade-metric">
                            <div class="metric-value success">${passedCount}</div>
                            <div class="metric-label">Passed</div>
                        </div>
                        <div class="grade-metric">
                            <div class="metric-value danger">${failedCount}</div>
                            <div class="metric-label">Failed</div>
                        </div>
                        <div class="grade-metric">
                            <div class="metric-value warning">${averageGrade}</div>
                            <div class="metric-label">Avg Grade</div>
                        </div>
                    </div>
                    
                    <div class="grades-controls">
                        <div class="search-input">
                            <i class="fas fa-search"></i>
                            <input type="text" id="project-search" placeholder="Search projects...">
                        </div>
                        <div class="filter-select">
                            <select id="status-filter">
                                <option value="all">All Status</option>
                                <option value="passed">Passed Only</option>
                                <option value="failed">Failed Only</option>
                            </select>
                        </div>
                        <div class="filter-select">
                            <select id="sort-select">
                                <option value="recent">Most Recent</option>
                                <option value="oldest">Oldest First</option>
                                <option value="name-asc">Name (A-Z)</option>
                                <option value="name-desc">Name (Z-A)</option>
                                <option value="grade-high">Grade (Highest)</option>
                                <option value="grade-low">Grade (Lowest)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="projects-counter">
                        <span id="project-count">Showing ${totalCount} of ${totalCount} projects</span>
                    </div>
                </div>
                
                <div class="grades-grid">
                    <div class="grade-card">
                        <h3>Recent Projects</h3>
                        <div class="grade-list" id="project-list">
                            ${sortedProjects.slice(0, 50).map(project => {
                                const projectName = project.path.split('/').pop();
                                const status = project.grade > 0 ? 'passed' : 'failed';
                                const date = new Date(project.updatedAt).toLocaleDateString();
                                
                                return `
                                    <div class="grade-item">
                                        <div>
                                            <div class="grade-name">${projectName}</div>
                                            <div class="grade-path">${project.path}</div>
                                        </div>
                                        <div class="grade-info">
                                            <div class="grade-status ${status}">${status}</div>
                                            <div class="grade-date">${date}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                        <div id="no-results" class="hidden">
                            <p class="no-results-message">No projects match your search criteria</p>
                        </div>
                    </div>
                    
                    <div class="grade-card">
                        <h3>Categories Performance</h3>
                        <div class="grade-list">
                            ${topCategories.map(category => {
                                const passRate = category.count > 0 ? 
                                    (category.passCount / category.count * 100).toFixed(1) : 0;
                                const statusClass = passRate >= 70 ? 'success' : 
                                    passRate >= 50 ? 'warning' : 'danger';
                                
                                return `
                                    <div class="grade-item">
                                        <div>
                                            <div class="grade-name">${category.category}</div>
                                            <div class="grade-path">${category.count} projects</div>
                                        </div>
                                        <div class="grade-info">
                                            <div class="grade-status ${statusClass}">${passRate}%</div>
                                            <div class="grade-date">${category.passCount} / ${category.count}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    // Public API
    return {
        init,
        render
    };
})();