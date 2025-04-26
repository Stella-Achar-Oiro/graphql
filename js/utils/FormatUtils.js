// FormatUtils.js
class FormatUtils {
    static formatXPSize(xpAmount) {
      if (xpAmount < 1024) {
        return `${xpAmount} bytes`;
      } else if (xpAmount < 1024 * 1024) {
        return `${(xpAmount / 1024).toFixed(2)} kB`;
      } else {
        return `${(xpAmount / (1024 * 1024)).toFixed(2)} MB`;
      }
    }
  
    static formatDate(dateString) {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
  
    static extractModuleNumber(path) {
      // Extract module number from path
      const moduleMatch = path.match(/#(\d+)/);
      return moduleMatch ? parseInt(moduleMatch[1]) : null;
    }
  
    static isModule75(path) {
      return this.extractModuleNumber(path) === 75;
    }
  }
  
  export default FormatUtils;