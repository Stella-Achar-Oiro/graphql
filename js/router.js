// router.js
import AuthManager from './utils/AuthManager.js';

class Router {
  constructor() {
    // Use dynamic imports to avoid circular dependencies
    this.routes = {
      '/': this.redirectToDefaultRoute.bind(this),
      '/login': async () => {
        const { default: LoginComponent } = await import('./components/LoginComponent.js');
        new LoginComponent('app').render();
      },
      '/profile': async () => {
        const { default: ProfileComponent } = await import('./components/ProfileComponent.js');
        new ProfileComponent('app').render();
      }
    };

    this.init();
  }

  init() {
    window.addEventListener('hashchange', this.handleRouteChange.bind(this));
    this.handleRouteChange();
  }

  handleRouteChange() {
    const path = window.location.hash.slice(1) || '/';
    const routeHandler = this.routes[path];
    
    if (routeHandler) {
      routeHandler();
    } else {
      this.navigate('/');
    }
  }

  redirectToDefaultRoute() {
    if (AuthManager.isAuthenticated()) {
      this.navigate('/profile');
    } else {
      this.navigate('/login');
    }
  }

  navigate(path) {
    window.location.hash = path;
  }
}

// Export a singleton instance
const router = new Router();
export default router;