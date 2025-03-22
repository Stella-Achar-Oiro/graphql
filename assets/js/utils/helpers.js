/**
 * Helpers Utility
 * Common utility functions used across components
 */

const Helpers = (() => {
    /**
     * Format a number with commas for thousands
     * @param {number} num - Number to format
     * @returns {string} Formatted number
     */
    const formatNumber = (num) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    
    /**
     * Format date for display
     * @param {string} dateString - ISO date string
     * @param {Object} options - Date formatting options
     * @returns {string} Formatted date
     */
    const formatDate = (dateString, options = {}) => {
        const date = new Date(dateString);
        const defaultOptions = { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        };
        
        return date.toLocaleDateString(undefined, {...defaultOptions, ...options});
    };
    
    /**
     * Extract project name from path
     * @param {string} path - Project path
     * @returns {string} Project name
     */
    const getProjectName = (path) => {
        return path.split('/').pop();
    };
    
    /**
     * Get category from path
     * @param {string} path - Project path
     * @returns {string} Category name
     */
    const getCategory = (path) => {
        const parts = path.split('/');
        return parts.length > 1 ? parts[parts.length - 2] : 'Other';
    };
    
    /**
     * Create a throttled function that doesn't run more than once in a given timeframe
     * @param {Function} func - Function to throttle
     * @param {number} limit - Throttle time in milliseconds
     * @returns {Function} Throttled function
     */
    const throttle = (func, limit) => {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };
    
    /**
     * Generate a unique ID
     * @returns {string} Unique ID
     */
    const generateId = () => {
        return '_' + Math.random().toString(36).substr(2, 9);
    };
    
    /**
     * Format XP as file size (B, KB, MB, GB) based on platform-like display
     * @param {number} xp - XP amount
     * @returns {string} Formatted XP with appropriate unit
     */
    const formatXpAsFileSize = (xp) => {
        if (xp === 0) return "0 B";
        
        // For values under 1000, display as bytes
        if (xp < 1000) {
            return `${xp} B`;
        }
        
        // For values between 1K and 1M, display as KB with 1 decimal place
        if (xp < 1000000) {
            return `${(xp / 1000).toFixed(1)} KB`;
        }
        
        // For values over 1M, display as MB with 2 decimal places
        return `${(xp / 1000000).toFixed(2)} MB`;
    };
    
    /**
     * Format XP calibrated to a reference value
     * @param {number} xp - XP amount
     * @param {number} referenceXp - Known reference XP amount
     * @param {number} displayValue - Known display value for reference XP
     * @returns {string} Calibrated XP value
     */
    const calibrateXpDisplay = (xp, referenceXp, displayValue) => {
        // Calculate calibration factor based on known reference
        const calibrationFactor = referenceXp / displayValue;
        
        // Apply calibration
        return (xp / calibrationFactor).toFixed(2);
    };
    
    /**
     * Format time elapsed since a date
     * @param {string} dateString - ISO date string
     * @returns {string} Formatted time elapsed (e.g., "2 days ago")
     */
    const timeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) {
            return interval === 1 ? '1 year ago' : `${interval} years ago`;
        }
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) {
            return interval === 1 ? '1 month ago' : `${interval} months ago`;
        }
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) {
            return interval === 1 ? '1 day ago' : `${interval} days ago`;
        }
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) {
            return interval === 1 ? '1 hour ago' : `${interval} hours ago`;
        }
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) {
            return interval === 1 ? '1 minute ago' : `${interval} minutes ago`;
        }
        
        return seconds < 10 ? 'just now' : `${Math.floor(seconds)} seconds ago`;
    };
    
    // Public API
    return {
        formatNumber,
        formatDate,
        getProjectName,
        getCategory,
        throttle,
        generateId,
        formatXpAsFileSize,
        calibrateXpDisplay,
        timeAgo
    };
})();