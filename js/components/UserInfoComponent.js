// UserInfoComponent.js
import FormatUtils from '../utils/FormatUtils.js';

class UserInfoComponent {
  constructor(container, userData) {
    this.container = container;
    this.userData = userData;
  }

  render() {
    this.container.innerHTML = `
      <div class="card-header">
        <h2><i class="fas fa-user"></i> User Profile</h2>
      </div>
      <div class="card-body">
        <div class="user-profile">
          <div class="profile-header">
            <div class="profile-avatar">
              <span>${this.getInitials()}</span>
            </div>
            <div class="profile-info">
              <h3>${this.userData.login}</h3>
              <p class="user-id">ID: ${this.userData.id}</p>
            </div>
          </div>
          
          <div class="profile-details">
            ${this.renderUserDetails()}
          </div>
        </div>
      </div>
    `;
    
    this.addStyles();
  }
  
  getInitials() {
    const login = this.userData.login || 'User';
    return login.substring(0, 2).toUpperCase();
  }
  
  renderUserDetails() {
    // Add more user details here if available
    return `
      <div class="detail-item">
        <span class="detail-label">Login</span>
        <span class="detail-value">${this.userData.login}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">User ID</span>
        <span class="detail-value">${this.userData.id}</span>
      </div>
    `;
  }
  
  addStyles() {
    // Add component-specific styles
    const style = document.createElement('style');
    style.textContent = `
      .user-profile {
        margin-bottom: 20px;
      }
      
      .profile-header {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
      }
      
      .profile-avatar {
        width: 80px;
        height: 80px;
        border-radius: 50%;
        background-color: var(--secondary-color);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 20px;
        font-size: 2rem;
        font-weight: 600;
        color: white;
      }
      
      .profile-info h3 {
        font-size: 1.5rem;
        margin-bottom: 5px;
      }
      
      .user-id {
        color: var(--text-color);
        opacity: 0.7;
        font-size: 0.9rem;
      }
      
      .profile-details {
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 8px;
        padding: 20px;
      }
      
      .detail-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      
      .detail-item:last-child {
        border-bottom: none;
      }
      
      .detail-label {
        font-weight: 500;
        color: var(--text-color);
        opacity: 0.7;
      }
      
      .detail-value {
        font-weight: 500;
      }
    `;
    
    document.head.appendChild(style);
  }
}

export default UserInfoComponent;