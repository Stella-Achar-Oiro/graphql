/**
 * XP Component
 * Renders the XP progress section in file-size style
 */

const XPComponent = (() => {
    /**
     * Render the XP section
     * @param {Object} xpData - XP data from API
     * @returns {string} HTML content for the XP section
     */
    const render = (xpData) => {
        const transactions = xpData.transaction || [];
        
        if (!transactions || transactions.length === 0) {
            return '<div class="error-message">No XP data found</div>';
        }
        
        // Calculate total XP - ensure we're getting valid numeric values
        let totalXP = transactions.reduce((sum, transaction) => {
            const amount = Number(transaction.amount) || 0;
            return sum + amount;
        }, 0);
        
        // Format total XP using the helper function for file size display
        const formattedTotalXP = Helpers.formatXpAsFileSize(totalXP);
        
        // Group XP by path (project)
        const xpByPath = transactions.reduce((acc, transaction) => {
            const path = transaction.path;
            if (!acc[path]) {
                acc[path] = 0;
            }
            acc[path] += Number(transaction.amount) || 0;
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
        
        // Group by month and calculate XP per month
        const xpByMonth = transactions.reduce((acc, transaction) => {
            const date = new Date(transaction.createdAt);
            const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            if (!acc[monthYear]) {
                acc[monthYear] = {
                    month: date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
                    xp: 0
                };
            }
            acc[monthYear].xp += Number(transaction.amount) || 0;
            return acc;
        }, {});
        
        // Sort months chronologically
        const sortedMonths = Object.values(xpByMonth)
            .sort((a, b) => new Date(b.month) - new Date(a.month))
            .slice(0, 3); // Take last 3 months
        
        // Build project items HTML
        const projectItems = sortedProjects.slice(0, 5).map(project => {
            const projectName = Helpers.getProjectName(project.path);
            return `
                <div class="xp-item">
                    <div class="xp-item-type">Project</div>
                    <div class="xp-item-separator">—</div>
                    <div class="xp-item-name">${projectName}</div>
                    <div class="xp-item-size">${Helpers.formatXpAsFileSize(project.xp)}</div>
                </div>
            `;
        }).join('');
        
        // Build monthly XP items HTML
        const monthlyItems = sortedMonths.map(month => {
            return `
                <div class="xp-item">
                    <div class="xp-item-type">Month</div>
                    <div class="xp-item-separator">—</div>
                    <div class="xp-item-name">${month.month}</div>
                    <div class="xp-item-size">${Helpers.formatXpAsFileSize(month.xp)}</div>
                </div>
            `;
        }).join('');
        
        // Build recent XP item
        const recentItem = mostRecent ? `
            <div class="xp-item highlight">
                <div class="xp-item-type">Recent</div>
                <div class="xp-item-separator">—</div>
                <div class="xp-item-name">${Helpers.getProjectName(mostRecent.path)}</div>
                <div class="xp-item-size">${Helpers.formatXpAsFileSize(mostRecent.amount)}</div>
            </div>
        ` : '';
        
        // Build the complete XP section HTML
        return `
            <div class="xp-container">
                <div class="xp-overview-card">
                    <div class="xp-total">${formattedTotalXP}</div>
                    <div class="xp-subtitle">Last activity: ${mostRecent ? Helpers.timeAgo(mostRecent.createdAt) : 'N/A'}</div>
                    
                    <div class="xp-items-list">
                        ${recentItem}
                        ${projectItems}
                    </div>
                </div>
                
                <div class="xp-details-grid">
                    <div class="xp-card">
                        <h3>Recent XP Activity</h3>
                        <div class="xp-items-list scrollable">
                            ${monthlyItems}
                        </div>
                    </div>
                    
                    <div class="xp-card">
                        <h3>XP Distribution</h3>
                        <div class="xp-distribution">
                            ${sortedProjects.slice(0, 3).map(project => {
                                const projectName = Helpers.getProjectName(project.path);
                                const percentage = totalXP > 0 ? ((project.xp / totalXP) * 100).toFixed(1) : 0;
                                return `
                                    <div class="xp-distribution-item">
                                        <div class="distribution-header">
                                            <div class="distribution-name">${projectName}</div>
                                            <div class="distribution-value">${percentage}%</div>
                                        </div>
                                        <div class="progress-bar">
                                            <div class="progress" style="width: ${percentage}%"></div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                    
                    <div class="xp-card">
                        <h3>XP Stats</h3>
                        <div class="xp-stats-grid">
                            <div class="xp-stat">
                                <div class="stat-value">${transactions.length}</div>
                                <div class="stat-label">Transactions</div>
                            </div>
                            <div class="xp-stat">
                                <div class="stat-value">${sortedProjects.length}</div>
                                <div class="stat-label">Projects</div>
                            </div>
                            <div class="xp-stat">
                                <div class="stat-value">${Object.keys(xpByMonth).length}</div>
                                <div class="stat-label">Months</div>
                            </div>
                            <div class="xp-stat">
                                <div class="stat-value">${transactions.length > 0 ? Math.round(totalXP / transactions.length) : 0}</div>
                                <div class="stat-label">Avg XP/Task</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    };
    
    // Public API
    return {
        render
    };
})();