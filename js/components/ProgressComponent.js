// ProgressComponent.js
import FormatUtils from '../utils/FormatUtils.js';

class ProgressComponent {
  constructor(container, progressData) {
    this.container = container;
    this.progressData = progressData;
  }

  render() {
    this.container.innerHTML = `
      <div class="card-header">
        <h2><i class="fas fa-tasks"></i> Project Progress</h2>
      </div>
      <div class="card-body">
        <div class="progress-stats">
          <div class="stat-box">
            <div class="stat-value">${this.progressData.length}</div>
            <div class="stat-label">Total Projects</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${this.getPassedProjectsCount()}</div>
            <div class="stat-label">Passed</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${this.getFailedProjectsCount()}</div>
            <div class="stat-label">Failed</div>
          </div>
          <div class="stat-box">
            <div class="stat-value">${this.getSuccessRate()}%</div>
            <div class="stat-label">Success Rate</div>
          </div>
        </div>
        
        <h3 class="subsection-title">Recent Projects</h3>
        ${this.renderProgressList()}
      </div>
    `;
    
    this.addStyles();
  }

  getPassedProjectsCount() {
    return this.progressData.filter(item => item.grade !== null && item.grade >= 1).length;
  }
  
  getFailedProjectsCount() {
    return this.progressData.filter(item => item.grade !== null && item.grade < 1).length;
  }
  
  getSuccessRate() {
    const auditedProjects = this.progressData.filter(item => item.grade !== null);
    const passedCount = this.getPassedProjectsCount();
    return auditedProjects.length > 0 
      ? Math.round((passedCount / auditedProjects.length) * 100) 
      : 0;
  }

  getProjectName(path) {
    return path.split('/').pop();
  }

  renderProgressList() {
    if (!this.progressData.length) {
      return '<p class="no-data">No progress data found</p>';
    }

    const progressHTML = this.progressData
      .slice(0, 5)
      .map(item => {
        // Get the status - either passed, failed, or pending audit
        const status = item.grade === null 
          ? 'pending-audit'
          : item.grade >= 1 ? 'passed' : 'failed';
        
        // Get the status text
        const statusText = status === 'pending-audit' 
          ? 'Pending Audit'
          : status === 'passed' ? 'Passed' : 'Failed';

        return `
          <div class="project-item">
            <div class="project-details">
              <div class="project-name">${this.getProjectName(item.path)}</div>
              <div class="project-date">${FormatUtils.formatDate(item.createdAt)}</div>
            </div>
            <div class="project-grade ${status}">
              ${statusText}
            </div>
          </div>
        `;
      }).join('');

    return `<div class="projects-list">${progressHTML}</div>`;
  }
  
  addStyles() {
    // Add component-specific styles
    const style = document.createElement('style');
    style.textContent = `
      .progress-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 15px;
        margin-bottom: 30px;
      }
      
      .stat-box {
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 8px;
        padding: 15px;
        text-align: center;
      }
      
      .stat-value {
        font-size: 1.8rem;
        font-weight: 600;
        color: var(--primary-color);
        margin-bottom: 5px;
      }
      
      .stat-label {
        font-size: 0.9rem;
        opacity: 0.7;
      }
      
      .subsection-title {
        font-size: 1.1rem;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      
      .projects-list {
        margin-bottom: 20px;
      }
      
      .project-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      
      .project-item:last-child {
        border-bottom: none;
      }
      
      .project-name {
        font-weight: 500;
        margin-bottom: 5px;
      }
      
      .project-date {
        font-size: 0.8rem;
        opacity: 0.7;
      }
      
      .project-grade {
        font-weight: 600;
        padding: 5px 10px;
        border-radius: 4px;
        font-size: 0.9rem;
      }
      
      .project-grade.passed {
        background-color: rgba(46, 204, 113, 0.2);
        color: #2ecc71;
      }
      
      .project-grade.failed {
        background-color: rgba(231, 76, 60, 0.2);
        color: #e74c3c;
      }
      
      .project-grade.pending-audit {
        background-color: rgba(241, 196, 15, 0.2);
        color: #f1c40f;
      }
      
      .no-data {
        padding: 15px;
        background-color: rgba(0, 0, 0, 0.03);
        border-radius: 4px;
        text-align: center;
        color: var(--text-color);
        opacity: 0.7;
      }
    `;
    
    document.head.appendChild(style);
  }
}

export default ProgressComponent;