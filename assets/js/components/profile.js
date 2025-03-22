/**
 * Profile Component
 * Renders the user profile information section
 */

const ProfileComponent = (() => {
    // Private properties
    let userAttributes = {};
    
    /**
     * Format a user attribute value for display
     * @param {string} key - Attribute key
     * @param {any} value - Attribute value
     * @returns {string} Formatted value
     */
    const formatValue = (key, value) => {
        // Handle null or undefined
        if (value === null || value === undefined) {
            return 'Not available';
        }
        
        // Format date of birth
        if (key === 'dateOfBirth' && typeof value === 'string') {
            try {
                const date = new Date(value);
                return date.toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                });
            } catch (e) {
                return value;
            }
        }
        
        // Mask sensitive information
        if (['ID.NUMBER', 'phone', 'emergencyTel'].includes(key) && typeof value === 'string') {
            if (value.length > 4) {
                return '••••' + value.substring(value.length - 4);
            } else {
                return '••••';
            }
        }
        
        // Handle boolean values
        if (typeof value === 'boolean') {
            return value ? 'Yes' : 'No';
        }
        
        // Handle objects and arrays
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        
        // Return simple values directly
        return value;
    };
    
    /**
     * Group attributes by category for better organization
     * @param {Object} attrs - User attributes object
     * @returns {Object} Grouped attributes by category
     */
    const groupAttributes = (attrs) => {
        if (!attrs || Object.keys(attrs).length === 0) {
            return {};
        }
        
        // Define attribute categories
        const categories = {
            'Personal Information': ['firstName', 'lastName', 'middleName', 'gender', 'dateOfBirth', 'ID.NUMBER'],
            'Contact Information': ['email', 'phone', 'country', 'environment'],
            'Emergency Contact': ['emergencyFirstName', 'emergencyLastName', 'emergencyTel', 'emergencyAffiliation'],
            'Medical Information': ['medicalInfo'],
            'Preferences': ['language', 'chart01Accepted', 'regulationAccepted', 'general-conditionsAccepted'],
            'Other': [] // Will catch uncategorized attributes
        };
        
        // Initialize result object
        const grouped = {};
        
        // Process each category
        for (const [category, keys] of Object.entries(categories)) {
            grouped[category] = {};
            
            // Find attributes in this category
            for (const [key, value] of Object.entries(attrs)) {
                // Skip if the key is empty
                if (!key || key === '""') continue;
                
                if (keys.includes(key)) {
                    grouped[category][key] = value;
                } else if (category === 'Other' && !Object.values(categories).flat().includes(key)) {
                    // Add to "Other" if not in any specific category
                    grouped[category][key] = value;
                }
            }
            
            // Remove empty categories
            if (Object.keys(grouped[category]).length === 0) {
                delete grouped[category];
            }
        }
        
        return grouped;
    };
    
    /**
     * Initialize component event listeners
     */
    const init = () => {
        // Add toggle functionality to category headers
        document.querySelectorAll('.profile-category-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                content.classList.toggle('hidden');
                
                const icon = header.querySelector('.toggle-icon');
                if (icon) {
                    icon.textContent = content.classList.contains('hidden') ? '▼' : '▲';
                }
            });
        });
        
        // Initially hide sensitive categories
        const sensitiveCategories = ['Medical Information', 'Emergency Contact'];
        
        sensitiveCategories.forEach(category => {
            const header = Array.from(document.querySelectorAll('.profile-category-header'))
                .find(el => el.textContent.includes(category));
            
            if (header) {
                const content = header.nextElementSibling;
                content.classList.add('hidden');
            }
        });
    };
    
    /**
     * Render the user profile section
     * @param {Object} userData - User data from API
     * @returns {string} HTML content for the profile section
     */
    const render = (userData) => {
        const user = userData.user[0];
        
        if (!user) {
            return '<div class="error-message">No user data found</div>';
        }
        
        // Store attributes for later use
        userAttributes = user.attrs || {};
        
        // Group attributes by category
        const groupedAttrs = groupAttributes(userAttributes);
        
        // Build attributes HTML
        let attributesHtml = '';
        
        for (const [category, attrs] of Object.entries(groupedAttrs)) {
            if (Object.keys(attrs).length === 0) continue;
            
            attributesHtml += `
                <div class="profile-category">
                    <h3 class="profile-category-header">
                        ${category} <span class="toggle-icon">▼</span>
                    </h3>
                    <div class="profile-category-content">
                        <div class="profile-attribute-grid">
                            ${Object.entries(attrs).map(([key, value]) => `
                                <div class="profile-attribute">
                                    <div class="attribute-label">${key}</div>
                                    <div class="attribute-value">${formatValue(key, value)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
        
        // Build the complete profile HTML
        return `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar">
                        ${user.firstName ? user.firstName.charAt(0) : user.login.charAt(0)}
                    </div>
                    <div class="profile-title">
                        <h2>${user.firstName || ''} ${user.lastName || ''}</h2>
                        <p class="profile-subtitle">@${user.login}</p>
                    </div>
                </div>
                
                <div class="profile-card">
                    <div class="profile-info-grid">
                        <div class="profile-info-item">
                            <div class="info-label">Email</div>
                            <div class="info-value">${user.email || 'Not available'}</div>
                        </div>
                        <div class="profile-info-item">
                            <div class="info-label">User ID</div>
                            <div class="info-value">${user.id}</div>
                        </div>
                        <div class="profile-info-item">
                            <div class="info-label">Location</div>
                            <div class="info-value">${userAttributes.country || 'Not specified'}</div>
                        </div>
                    </div>
                </div>
                
                <div class="profile-attributes">
                    ${attributesHtml}
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