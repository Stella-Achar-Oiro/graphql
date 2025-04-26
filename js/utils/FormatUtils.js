// FormatUtils.js
class FormatUtils {
  static formatXPSize(xpAmount) {
    // Round to nearest whole number first
    const roundedAmount = Math.round(xpAmount);
    
    if (roundedAmount < 1000) {
      // Format as whole XP
      return `${roundedAmount} XP`;
    } else if (roundedAmount < 1000000) {
      // Format as KB with one decimal
      return `${(roundedAmount / 1000).toFixed(1)} KB`;
    } else {
      // Format as MB with two decimals
      return `${(roundedAmount / 1000000).toFixed(2)} MB`;
    }
  }

  static formatRatio(value) {
    // Format ratio with one decimal place
    return Number(value).toFixed(1);
  }

  static formatPercentage(value) {
    // Format percentage with one decimal place
    return Number(value).toFixed(1);
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