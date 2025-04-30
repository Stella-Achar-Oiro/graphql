// ProgressComponent.js
import FormatUtils from '../utils/FormatUtils.js';

class ProgressComponent {
  constructor(container, progressData) {
    this.container = container;
    this.progressData = progressData;
    this.activeModuleId = FormatUtils.getPreferredModule();
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
        background-color: var(--card-bg);
        border: 1px solid rgba(var(--text-rgb), 0.1);
        border-radius: 8px;
        padding: 20px;
        text-align: center;
        transition: transform 0.3s ease;
      }
      
      .stat-box:hover {
        transform: translateY(-2px);
      }
      
      .stat-value {
        font-size: 2rem;
        font-weight: 600;
        color: var(--stat-value-color);
        margin-bottom: 8px;
      }
      
      .stat-label {
        font-size: 0.9rem;
        color: var(--text-muted);
      }
      
      .subsection-title {
        font-size: 1.1rem;
        margin: 25px 0 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(var(--text-rgb), 0.1);
        color: var(--text-color);
      }
      
      .projects-list {
        margin-bottom: 20px;
      }
      
      .project-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(var(--text-rgb), 0.1);
      }
      
      .project-item:last-child {
        border-bottom: none;
      }
      
      .project-name {
        font-weight: 500;
        color: var(--text-color);
        margin-bottom: 5px;
      }
      
      .project-date {
        font-size: 0.8rem;
        color: var(--text-muted);
      }
      
      .project-grade {
        font-weight: 600;
        padding: 6px 12px;
        border-radius: 4px;
        font-size: 0.9rem;
      }
      
      .project-grade.passed {
        background-color: rgba(46, 204, 113, 0.15);
        color: var(--success-color);
      }
      
      .project-grade.failed {
        background-color: rgba(231, 76, 60, 0.15);
        color: var(--error-color);
      }
      
      .project-grade.pending-audit {
        background-color: rgba(241, 196, 15, 0.15);
        color: var(--pending-color);
      }
      
      .no-data {
        padding: 15px;
        background-color: var(--card-bg);
        border-radius: 4px;
        text-align: center;
        color: var(--text-muted);
      }

      [data-theme="dark"] .stat-box {
        background-color: rgba(255, 255, 255, 0.03);
      }

      [data-theme="dark"] .stat-value {
        color: var(--stat-value-color);
      }
      
      [data-theme="dark"] .project-grade.passed {
        color: #2ecc71;
      }
      
      [data-theme="dark"] .project-grade.failed {
        color: #e74c3c;
      }
      
      [data-theme="dark"] .project-grade.pending-audit {
        color: #f1c40f;
      }
    `;
    
    document.head.appendChild(style);
  }

  createBarChart(data) {
    // ...existing code...

    data.forEach((item, index) => {
      // ...existing code...

      // Label text with formatted XP value
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', legendX);
      text.setAttribute('y', legendY + 9);
      text.setAttribute('font-size', '12');
      text.setAttribute('fill', 'var(--text-color)');
      text.textContent = `${item.type}: ${FormatUtils.formatXPSize(item.value, this.activeModuleId)}`;
      
      svg.appendChild(square);
      svg.appendChild(text);
    });

    // ...rest of existing code...
  }
}

export default ProgressComponent;