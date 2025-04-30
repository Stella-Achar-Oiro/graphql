// ProfileComponent.js
import AuthManager from '../utils/AuthManager.js';
import GraphQLClient from '../utils/GraphQLClient.js';
import FormatUtils from '../utils/FormatUtils.js';
import UserInfoComponent from './UserInfoComponent.js';
import XPComponent from './XPComponent.js';
import ProgressComponent from './ProgressComponent.js';
import StatisticsComponent from './StatisticsComponent.js';
import { 
  USER_INFO_QUERY,
  getXPQuery,
  getProgressQuery,
  getTotalXPQuery,
  getAuditQuery
} from '../utils/queries.js';

class ProfileComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.userData = null;
    this.activeModuleId = 75; // Default module
    this.activeSection = 'user';
  }

  async render() {
    if (!AuthManager.isAuthenticated()) {
      window.location.hash = '/login';
      return;
    }

    this.container.innerHTML = `
      <div class="dashboard-layout">
        <aside class="sidebar">
          <div class="sidebar-header">
            <h2>GraphQL Profile</h2>
          </div>
          <nav class="sidebar-nav">
            <ul>
              <li><a href="#user" class="active" data-section="user"><i class="fas fa-user"></i> <span>User Info</span></a></li>
              <li><a href="#xp" data-section="xp"><i class="fas fa-chart-line"></i> <span>XP Progress</span></a></li>
              <li><a href="#progress" data-section="progress"><i class="fas fa-tasks"></i> <span>Projects</span></a></li>
              <li><a href="#statistics" data-section="statistics"><i class="fas fa-chart-pie"></i> <span>Statistics</span></a></li>
            </ul>
          </nav>
          <div class="sidebar-footer">
            <button id="logout-btn" class="sidebar-logout"><span>Logout</span> <i class="fas fa-sign-out-alt"></i></button>
          </div>
        </aside>
        <main class="content-area">
          <div id="module-selection-container"></div>
          
          <div id="loading">Loading profile data...</div>
          
          <div id="dashboard-summary" style="display:none;" class="dashboard-grid">
            <!-- Summary cards will be added here -->
          </div>

          <div id="user-section" class="section" style="display:none;">
            <h2 class="section-title">User Information</h2>
            <div id="user-info-container" class="card">
              <!-- User info will be rendered here -->
            </div>
          </div>
          
          <div id="xp-section" class="section" style="display:none;">
            <h2 class="section-title">XP Progress</h2>
            <div id="xp-container" class="card">
              <!-- XP info will be rendered here -->
            </div>
          </div>
          
          <div id="progress-section" class="section" style="display:none;">
            <h2 class="section-title">Project Progress</h2>
            <div id="progress-container" class="card">
              <!-- Progress info will be rendered here -->
            </div>
          </div>
          
          <div id="statistics-section" class="section" style="display:none;">
            <h2 class="section-title">Statistics</h2>
            <div id="statistics-container">
              <!-- Statistics will be rendered here -->
            </div>
          </div>
        </main>
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

    this.attachEventListeners();
    await this.loadData();
    this.renderSections();
  }

  attachEventListeners() {
    // Existing event listeners
    document.getElementById('logout-btn').addEventListener('click', () => {
      AuthManager.removeToken();
      window.location.hash = '/login';
    });
    
    document.querySelectorAll('.sidebar-nav a').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.sidebar-nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        const sectionId = link.getAttribute('data-section');
        this.showSection(sectionId);
      });
    });
    
    // Theme toggle
    const themeSwitch = document.getElementById('theme-switch');
    themeSwitch.addEventListener('change', function() {
      if (this.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
      }
      // Redraw charts when theme changes
      this.reloadCharts();
    }.bind(this));
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.getElementById('theme-switch').checked = true;
    }
  }

  async loadData() {
    try {
      // Load module selection component first
      const moduleSelectionContainer = document.getElementById('module-selection-container');
      const ModuleSelectionComponent = (await import('./ModuleSelectionComponent.js')).default;
      const moduleSelector = new ModuleSelectionComponent(
        moduleSelectionContainer, 
        this.activeModuleId,
        this.handleModuleChange.bind(this)
      );
      moduleSelector.render();

      // Load data for active module
      await this.loadModuleData();
    } catch (error) {
      console.error('Failed to load data:', error);
      document.getElementById('loading').textContent = 'Error loading data. Please try again.';
    }
  }

  async loadModuleData() {
    try {
      const [userInfo, xpData, progressData, totalXP, auditData] = await Promise.all([
        GraphQLClient.query(USER_INFO_QUERY),
        GraphQLClient.query(getXPQuery(this.activeModuleId)),
        GraphQLClient.query(getProgressQuery(this.activeModuleId)),
        GraphQLClient.query(getTotalXPQuery(this.activeModuleId)),
        GraphQLClient.query(getAuditQuery(this.activeModuleId))
      ]);
  
      // Process XP data
      const transactions = xpData.transaction || [];
      const totalXPAmount = totalXP.transaction_aggregate?.aggregate?.sum?.amount || 0;
      
      // Process project success data
      const progressItems = progressData.progress || [];
      const auditedProjects = progressItems.filter(item => item.grade !== null);
      const passedProjects = auditedProjects.filter(item => item.grade >= 1).length;
      const failedProjects = auditedProjects.filter(item => item.grade < 1).length;
  
      this.userData = {
        user: userInfo.user[0],
        transactions: transactions,
        progress: progressData.progress || [],
        totalXP: totalXPAmount,
        projectStats: {
          total: progressItems.length,
          audited: auditedProjects.length,
          passed: passedProjects,
          failed: failedProjects,
          successRate: auditedProjects.length > 0 ? (passedProjects / auditedProjects.length) * 100 : 0
        },
        auditData: auditData.transaction || []
      };
  
      document.getElementById('loading').style.display = 'none';
      document.getElementById('dashboard-summary').style.display = 'grid';
    } catch (error) {
      console.error('Failed to load module data:', error);
      document.getElementById('loading').textContent = 'Error loading module data. Please try again.';
    }
  }

  async handleModuleChange(moduleId) {
    this.activeModuleId = moduleId;
    document.getElementById('loading').style.display = 'block';
    document.getElementById('dashboard-summary').style.display = 'none';
    
    await this.loadModuleData();
    this.renderSections();
  }

  reloadCharts() {
    if (this.userData) {
      const statisticsContainer = document.getElementById('statistics-container');
      if (statisticsContainer) {
        new StatisticsComponent(
          statisticsContainer, 
          this.userData.transactions, 
          this.userData.auditData,
          this.activeModuleId
        ).render();
      }
    }
  }

  showSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
      section.style.display = 'none';
    });
    
    const section = document.getElementById(`${sectionId}-section`);
    if (section) {
      section.style.display = 'block';
    }
    
    this.activeSection = sectionId;
  }

  renderSections() {
    if (!this.userData) return;

    this.renderSummary();

    const userInfoContainer = document.getElementById('user-info-container');
    new UserInfoComponent(userInfoContainer, this.userData.user).render();

    const xpContainer = document.getElementById('xp-container');
    new XPComponent(xpContainer, this.userData.transactions, this.userData.totalXP).render();

    const progressContainer = document.getElementById('progress-container');
    new ProgressComponent(progressContainer, this.userData.progress).render();

    const statisticsContainer = document.getElementById('statistics-container');
    new StatisticsComponent(
      statisticsContainer, 
      this.userData.transactions, 
      this.userData.auditData,
      this.activeModuleId
    ).render();

    this.showSection(this.activeSection);
  }

  renderSummary() {
    const summaryContainer = document.getElementById('dashboard-summary');
    
    const successRate = this.userData.projectStats.successRate.toFixed(1);
    
    const xpAwarded = this.userData.auditData
      .filter(a => a.type === "up")
      .reduce((sum, audit) => sum + (audit.amount || 0), 0);
      
    const xpReceived = this.userData.auditData
      .filter(a => a.type === "down")
      .reduce((sum, audit) => sum + (audit.amount || 0), 0);
      
    const auditRatio = xpReceived > 0 ? (xpAwarded / xpReceived).toFixed(1) : '0.0';
    
    summaryContainer.innerHTML = `
      <div class="card summary-card">
        <div class="summary-icon"><i class="fas fa-code"></i></div>
        <div class="summary-info">
          <h3>Total XP</h3>
          <p class="summary-value">${FormatUtils.formatXPSize(this.userData.totalXP)}</p>
        </div>
      </div>
      
      <div class="card summary-card">
        <div class="summary-icon"><i class="fas fa-tasks"></i></div>
        <div class="summary-info">
          <h3>Projects</h3>
          <p class="summary-value">${this.userData.projectStats.audited}/${this.userData.projectStats.total}</p>
          <small class="summary-subtitle">Audited/Total</small>
        </div>
      </div>
      
      <div class="card summary-card">
        <div class="summary-icon"><i class="fas fa-check-circle"></i></div>
        <div class="summary-info">
          <h3>Success Rate</h3>
          <p class="summary-value">${successRate}%</p>
          <small class="summary-subtitle">of audited projects</small>
        </div>
      </div>
      
      <div class="card summary-card">
        <div class="summary-icon"><i class="fas fa-exchange-alt"></i></div>
        <div class="summary-info">
          <h3>Audit Ratio</h3>
          <p class="summary-value">${auditRatio}</p>
          <small class="summary-subtitle">XP awarded/received</small>
        </div>
      </div>
    `;
  }
}

export default ProfileComponent;