// AuthManager.js
class AuthManager {
  static setToken(token) {
    if (!token) {
      return;
    }
    
    // Validate token format (should have 3 parts)
    if (!token.includes('.') || token.split('.').length !== 3) {
      return;
    }
    
    localStorage.setItem('jwt_token', token);
  }

  static getToken() {
    const token = localStorage.getItem('jwt_token');
    return token;
  }

  static removeToken() {
    localStorage.removeItem('jwt_token');
  }

  static isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Validate token format
    if (!token.includes('.') || token.split('.').length !== 3) {
      this.removeToken(); // Remove invalid token
      return false;
    }
    
    return true;
  }

  static decodeToken(token) {
    try {
      // Validate token format
      if (!token || !token.includes('.') || token.split('.').length !== 3) {
        return null;
      }
      
      // JWT tokens are split into three parts: header.payload.signature
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (e) {
      console.error('Failed to decode token', e);
      return null;
    }
  }

  static getUserIdFromToken() {
    const token = this.getToken();
    if (!token) return null;
    
    const decoded = this.decodeToken(token);
    return decoded ? decoded.sub : null; // 'sub' typically contains the user ID
  }
}

export default AuthManager;