/**
 * Audits Component
 * Renders the audits section showing audits given and received
 */

const AuditsComponent = (() => {
    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted date
     */
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    
    /**
     * Render the audits section
     * @param {Object} auditData - Audit data from API
     * @returns {string} HTML content for the audits section
     */
    const render = (auditData) => {
        const auditsReceived = auditData.up || [];
        const auditsGiven = auditData.down || [];
        
        if (auditsReceived.length === 0 && auditsGiven.length === 0) {
            return '<div class="error-message">No audit data found</div>';
        }
        
        // Calculate totals
        const totalReceived = auditsReceived.reduce((sum, tx) => sum + tx.amount, 0);
        const totalGiven = auditsGiven.reduce((sum, tx) => sum + tx.amount, 0);
        
        // Calculate ratio
        const ratio = totalGiven > 0 ? (totalReceived / totalGiven).toFixed(2) : 'N/A';
        
        // Calculate counts
        const receivedCount = auditsReceived.length;
        const givenCount = auditsGiven.length;
        
        // Sort audits by date (most recent first)
        const sortedReceived = [...auditsReceived].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        const sortedGiven = [...auditsGiven].sort((a, b) => 
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        
        // Build the complete audits section HTML
        return `
            <div class="audits-container">
                <div class="audits-summary-card">
                    <div class="summary-header">
                        <div class="summary-title">
                            <h2>Audit Summary</h2>
                            <p class="summary-subtitle">Your peer review performance</p>
                        </div>
                        <div class="summary-ratio">
                            <div class="ratio-value">${ratio}</div>
                            <div class="ratio-label">Ratio</div>
                        </div>
                    </div>
                    
                    <div class="audit-metrics">
                        <div class="audit-metric received">
                            <div class="metric-icon">
                                <i class="fas fa-arrow-down"></i>
                            </div>
                            <div class="metric-details">
                                <div class="metric-value">${receivedCount}</div>
                                <div class="metric-label">Received</div>
                                <div class="metric-points">+${totalReceived} points</div>
                            </div>
                        </div>
                        
                        <div class="audit-metric given">
                            <div class="metric-icon">
                                <i class="fas fa-arrow-up"></i>
                            </div>
                            <div class="metric-details">
                                <div class="metric-value">${givenCount}</div>
                                <div class="metric-label">Given</div>
                                <div class="metric-points">-${totalGiven} points</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="audits-grid">
                    <div class="audit-card">
                        <div class="audit-card-header">
                            <h3>
                                <i class="fas fa-arrow-down"></i>
                                Audits Received
                            </h3>
                            <div class="audit-count">${receivedCount}</div>
                        </div>
                        
                        <div class="audit-list scrollable">
                            ${sortedReceived.length > 0 ? 
                                sortedReceived.slice(0, 20).map(tx => {
                                    const date = formatDate(tx.createdAt);
                                    const projectName = tx.path.split('/').pop();
                                    
                                    return `
                                        <div class="audit-item">
                                            <div class="audit-project-info">
                                                <div class="audit-project-name">${projectName}</div>
                                                <div class="audit-date">${date}</div>
                                            </div>
                                            <div class="audit-points received">+${tx.amount}</div>
                                        </div>
                                    `;
                                }).join('') : 
                                '<div class="empty-state">No audits received</div>'
                            }
                        </div>
                    </div>
                    
                    <div class="audit-card">
                        <div class="audit-card-header">
                            <h3>
                                <i class="fas fa-arrow-up"></i>
                                Audits Given
                            </h3>
                            <div class="audit-count">${givenCount}</div>
                        </div>
                        
                        <div class="audit-list scrollable">
                            ${sortedGiven.length > 0 ? 
                                sortedGiven.slice(0, 20).map(tx => {
                                    const date = formatDate(tx.createdAt);
                                    const projectName = tx.path.split('/').pop();
                                    
                                    return `
                                        <div class="audit-item">
                                            <div class="audit-project-info">
                                                <div class="audit-project-name">${projectName}</div>
                                                <div class="audit-date">${date}</div>
                                            </div>
                                            <div class="audit-points given">-${tx.amount}</div>
                                        </div>
                                    `;
                                }).join('') : 
                                '<div class="empty-state">No audits given</div>'
                            }
                        </div>
                    </div>
                </div>
                
                <div class="audit-chart-card">
                    <div class="chart-header">
                        <h3>Audit History</h3>
                    </div>
                    <div class="chart-container">
                        <svg id="audit-history-chart" width="100%" height="250"></svg>
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