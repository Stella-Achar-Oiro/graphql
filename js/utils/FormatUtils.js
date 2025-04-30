// FormatUtils.js
class FormatUtils {
  static formatXPSize(xpAmount) {
    const roundedAmount = Math.round(xpAmount);
    
        if (roundedAmount < 1000) {
      return `${roundedAmount} B`;
    } else if (roundedAmount < 1000000) {
      return `${(roundedAmount / 1000).toFixed(1)} KB`;
    } else {
      return `${(roundedAmount / 1000000).toFixed(2)} MB`;
    }
  }

  static formatRatio(value) {
    return Number(value).toFixed(1);
  }

  static formatPercentage(value) {
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

  static formatShortDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  
  static extractModuleNumber(path) {
    const moduleMatch = path.match(/#(\d+)/);
    return moduleMatch ? parseInt(moduleMatch[1]) : null;
  }

  static getModuleDisplayName(module) {
    return `${module.name} #${module.id}`;
  }
  
  static getModuleTimeframe(module) {
    return `${this.formatShortDate(module.startDate)} > ${this.formatShortDate(module.endDate)}`;
  }
  
  static isActiveModule(module, currentModuleId) {
    return module.id === currentModuleId;
  }

  static isChildModule(moduleId, parentId) {
    // Helper to check if a module is a child of another module
    if (!moduleId || !parentId) return false;
    return moduleId !== parentId && this.getParentModuleId(moduleId) === parentId;
  }

  static getParentModuleId(childModuleId) {
    // Map of known child modules to their parent modules
    const moduleParents = {
      83: 75,  // Piscine JS is part of Module 75
      84: 75,  // Piscine Rust is part of Module 75
      88: 75,  // piscine-ux is part of Module 75
      180: 75, // piscine-ui is part of Module 75
    };
    return moduleParents[childModuleId] || null;
  }

  static async saveModulePreference(moduleId) {
    try {
      localStorage.setItem('preferred_module', moduleId.toString());
    } catch (error) {
      console.warn('Failed to save module preference:', error);
    }
  }

  static getPreferredModule() {
    try {
      const savedModule = localStorage.getItem('preferred_module');
      return savedModule ? parseInt(savedModule) : 75; // Default to Module 75
    } catch (error) {
      console.warn('Failed to get module preference:', error);
      return 75;
    }
  }
}
  
export default FormatUtils;