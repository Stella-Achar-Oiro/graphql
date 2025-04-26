// ProfileComponent.js
import AuthManager from '../utils/AuthManager.js';
import GraphQLClient from '../utils/GraphQLClient.js';
import UserInfoComponent from './UserInfoComponent.js';
import XPComponent from './XPComponent.js';
import ProgressComponent from './ProgressComponent.js';
import StatisticsComponent from './StatisticsComponent.js';
import { 
  USER_INFO_QUERY, 
  MODULE_75_XP_QUERY, 
  MODULE_75_PROGRESS_QUERY,
  TOTAL_MODULE_75_XP_QUERY,
  AUDIT_DATA_QUERY
} from '../utils/queries.js';

class ProfileComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.userData = null;
  }

  async render() {
    if (!AuthManager.isAuthenticated()) {
      // Instead of directly using Router, dispatch a navigation event
      window.location.hash = '/login';
      return;
    }

    this.container.innerHTML = `
      <div class="profile-container">
        <header>
          <h1>Dev Profile</h1>
          <button id="logout-btn" class="logout-btn">Logout</button>
        </header>
        <div id="loading">Loading profile data...</div>
        <div id="user-info-section" class="profile-section" style="display:none;"></div>
        <div id="xp-section" class="profile-section" style="display:none;"></div>
        <div id="progress-section" class="profile-section" style="display:none;"></div>
        <div id="statistics-section" class="statistics-section" style="display:none;"></div>
      </div>
    `;

    this.attachLogoutHandler();
    await this.loadData();
    this.renderSections();
  }

  attachLogoutHandler() {
    document.getElementById('logout-btn').addEventListener('click', () => {
      AuthManager.removeToken();
      // Instead of directly using Router, change the hash
      window.location.hash = '/login';
    });
  }

async loadData() {
  try {
    const [userInfo, xpData, progressData, totalXP, auditData] = await Promise.all([
      GraphQLClient.query(USER_INFO_QUERY),
      GraphQLClient.query(MODULE_75_XP_QUERY),
      GraphQLClient.query(MODULE_75_PROGRESS_QUERY),
      GraphQLClient.query(TOTAL_MODULE_75_XP_QUERY),
      GraphQLClient.query(AUDIT_DATA_QUERY)
    ]);

    console.log('XP Data:', xpData);
    console.log('Total XP:', totalXP);

    this.userData = {
      user: userInfo.user[0],
      transactions: xpData.transaction || [],
      progress: progressData.progress || [],
      totalXP: totalXP.transaction_aggregate?.aggregate?.sum?.amount || 0,
      auditData: auditData.transaction || []
    };

    document.getElementById('loading').style.display = 'none';
  } catch (error) {
    console.error('Failed to load profile data:', error);
    document.getElementById('loading').textContent = 'Error loading profile data. Please try again.';
  }
}

  renderSections() {
    if (!this.userData) return;

    // Render each section with its own component
    const userInfoSection = document.getElementById('user-info-section');
    userInfoSection.style.display = 'block';
    new UserInfoComponent(userInfoSection, this.userData.user).render();

    const xpSection = document.getElementById('xp-section');
    xpSection.style.display = 'block';
    new XPComponent(xpSection, this.userData.transactions, this.userData.totalXP).render();

    const progressSection = document.getElementById('progress-section');
    progressSection.style.display = 'block';
    new ProgressComponent(progressSection, this.userData.progress).render();

    const statisticsSection = document.getElementById('statistics-section');
    statisticsSection.style.display = 'block';
    new StatisticsComponent(statisticsSection, this.userData.transactions, this.userData.auditData).render();
  }
}

export default ProfileComponent;