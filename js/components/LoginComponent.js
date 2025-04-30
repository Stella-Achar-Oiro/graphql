// LoginComponent.js
import AuthManager from '../utils/AuthManager.js';

class LoginComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    this.container.innerHTML = `
      <div class="login-container">
        <h2>Dev Profile</h2>
        <div id="error-message" class="error-message" style="display: none;"></div>
        
        <form id="login-form">
          <div class="form-group">
            <label for="username">Username or Email</label>
            <input type="text" id="username" name="username" required>
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required>
          </div>
          
          <button type="submit" id="login-button">
            <span id="login-text">Login</span>
            <span id="login-spinner" class="spinner" style="display: none;"></span>
          </button>
        </form>
        
        <div class="login-footer">
          <p>Dev Profile</p>
        </div>
      </div>
      
      <div class="theme-toggle">
        <input type="checkbox" id="theme-switch" class="theme-switch">
        <label for="theme-switch" class="theme-label">
          <i class="fas fa-sun"></i>
          <i class="fas fa-moon"></i>
          <div class="toggle-ball"></div>
        </label>
      </div>
    `;
    
    this.addStyles();
    this.attachEventListeners();
  }
  
  addStyles() {
    // Add login-specific styles
    const style = document.createElement('style');
    style.textContent = `
      .login-container {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
      }
      
      .login-footer {
        margin-top: 30px;
        text-align: center;
        font-size: 0.9rem;
        color: var(--text-color);
        opacity: 0.7;
      }
      
      .spinner {
        display: inline-block;
        width: 20px;
        height: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: #fff;
        animation: spin 1s ease-in-out infinite;
        margin-left: 10px;
      }
      
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    `;
    
    document.head.appendChild(style);
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      if (document.getElementById('theme-switch')) {
        document.getElementById('theme-switch').checked = true;
      }
    }
  }

  attachEventListeners() {
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    const loginButton = document.getElementById('login-button');
    const loginText = document.getElementById('login-text');
    const loginSpinner = document.getElementById('login-spinner');
    
    // Theme toggle
    if (document.getElementById('theme-switch')) {
      document.getElementById('theme-switch').addEventListener('change', function() {
        if (this.checked) {
          document.documentElement.setAttribute('data-theme', 'dark');
          localStorage.setItem('theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
          localStorage.setItem('theme', 'light');
        }
      });
    }
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.style.display = 'none';
      
      // Show loading state
      loginButton.disabled = true;
      loginText.textContent = 'Logging in...';
      loginSpinner.style.display = 'inline-block';
      
      const username = document.getElementById('username').value;
      const password = document.getElementById('password').value;
      
      try {
        // Create Basic auth header with base64 encoding
        const authString = btoa(`${username}:${password}`);
        
        const response = await fetch('https://learn.zone01kisumu.ke/api/auth/signin', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Invalid credentials');
        }

        // Process response data properly
        let data;
        try {
          data = await response.json();
        } catch (e) {
          // Handle case where response is not JSON
          data = await response.text();
        }

        // Extract token correctly
        let token;
        if (typeof data === 'string' && data.split('.').length === 3) {
          // If data is already a JWT string
          token = data;
        } else if (typeof data === 'object') {
          // If data is an object with token property
          token = data.token || data.jwt || data.access_token;
        }
        
        if (!token) {
          throw new Error('No token received from server');
        }

        // Validate token format
        if (!token.includes('.') || token.split('.').length !== 3) {
          throw new Error('Invalid token format received from server');
        }
        
        // Store JWT token
        AuthManager.setToken(token);
        
        // Use window.location.hash instead of Router
        window.location.hash = '/profile';
      } catch (err) {
        // Reset button state
        loginButton.disabled = false;
        loginText.textContent = 'Login';
        loginSpinner.style.display = 'none';
        
        // Show error
        errorMessage.textContent = 'Login failed: ' + err.message;
        errorMessage.style.display = 'block';
      }
    });
  }
}

export default LoginComponent;