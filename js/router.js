// router.js
import LoginComponent from './components/LoginComponent.js';
import ProfileComponent from './components/ProfileComponent.js';
import AuthManager from './utils/AuthManager.js';

class Router {
  constructor() {
    this.routes = {
      '/': this.redirectToDefaultRoute.bind(this),
      '/login': () => new LoginComponent('app').render(),
      '/profile': () => new ProfileComponent('app').render()
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

export default new Router();