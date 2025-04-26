// FormatUtils.js
class FormatUtils {
  static formatXPSize(xpAmount) {
    if (xpAmount < 1000) {
      return `${xpAmount} XP`;
    } else if (xpAmount < 1000000) {
      return `${(xpAmount / 1000).toFixed(2)} KB`;
    } else {
      return `${(xpAmount / 1000000).toFixed(2)} MB`;
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