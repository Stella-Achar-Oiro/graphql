// UserInfoComponent.js
class UserInfoComponent {
    constructor(container, userData) {
      this.container = container;
      this.userData = userData;
    }
  
    render() {
      this.container.innerHTML = `
        <h2>User Information</h2>
        <div class="info-card">
          <p><strong>Login:</strong> ${this.userData.login}</p>
          <p><strong>User ID:</strong> ${this.userData.id}</p>
        </div>
      `;
    }
  }
  
  export default UserInfoComponent;