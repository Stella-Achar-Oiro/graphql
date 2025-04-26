// LoginComponent.js
import AuthManager from '../utils/AuthManager.js';
import Router from '../router.js';

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

        const data = await response.json();
        
        // Store JWT token
        AuthManager.setToken(data.token);
        
        // Navigate to profile page
        Router.navigate('/profile');
      } catch (err) {
        errorMessage.textContent = 'Login failed: ' + err.message;
        errorMessage.style.display = 'block';
      }
    });
  }
}

export default LoginComponent;