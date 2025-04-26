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
      },
      '/transactions': async () => {
        const { default: TransactionsComponent } = await import('./components/TransactionsComponent.js');
        const { default: GraphQLClient } = await import('./utils/GraphQLClient.js');
        const { MODULE_75_XP_QUERY } = await import('./utils/queries.js');
        
        try {
          const data = await GraphQLClient.query(MODULE_75_XP_QUERY);
          const transactions = data.transaction || [];
          new TransactionsComponent(document.getElementById('app'), transactions).render();
        } catch (error) {
          console.error('Failed to load transactions:', error);
          this.navigate('/profile');
        }
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