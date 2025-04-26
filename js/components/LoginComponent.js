// LoginComponent.js
import AuthManager from '../utils/AuthManager.js';

class LoginComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render() {
    this.container.innerHTML = `
      <div class="login-container">
        <h2>Login to Your Profile</h2>
        <div id="error-message" class="error-message" style="display: none;"></div>
        <form id="login-form">
          <div class="form-group">
            <label for="username">Username or Email:</label>
            <input type="text" id="username" name="username" required>
          </div>
          <div class="form-group">
            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required>
          </div>
          <button type="submit">Login</button>
        </form>
      </div>
    `;

    this.attachEventListeners();
  }

  attachEventListeners() {
    const form = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');
    
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorMessage.style.display = 'none';
      
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
        errorMessage.textContent = 'Login failed: ' + err.message;
        errorMessage.style.display = 'block';
      }
    });
  }
}

export default LoginComponent;