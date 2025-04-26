// ProgressComponent.js
import FormatUtils from '../utils/FormatUtils.js';

class ProgressComponent {
  constructor(container, progressData) {
    this.container = container;
    this.progressData = progressData;
  }

  render() {
    this.container.innerHTML = `
      <h2>Progress Information</h2>
      <div class="info-card">
        <h3>Project Progress</h3>
        ${this.renderProgressList()}
      </div>
    `;
  }

  renderProgressList() {
    if (!this.progressData.length) {
      return '<p>No progress data found</p>';
    }

    const progressHTML = this.progressData
      .slice(0, 5)
      .map(item => `
        <li>
          <span>${item.path}</span>
          <span>Grade: ${item.grade}</span>
          <span>${FormatUtils.formatDate(item.createdAt)}</span>
        </li>
      `).join('');

    return `<ul class="progress-list">${progressHTML}</ul>`;
  }
}

export default ProgressComponent;