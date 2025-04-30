// XPComponent.js
import FormatUtils from '../utils/FormatUtils.js';

class XPComponent {
  constructor(container, transactions, totalXP) {
    this.container = container;
    this.transactions = transactions;
    this.totalXP = totalXP;
    this.activeModuleId = FormatUtils.getPreferredModule();
  }

  render() {
    this.container.innerHTML = `
      <div class="card-header">
        <h2><i class="fas fa-chart-line"></i> XP Information</h2>
      </div>
      <div class="card-body">
        <div class="xp-summary">
          <div class="xp-total">
            <h3>Total XP</h3>
            <div class="xp-value">${FormatUtils.formatXPSize(this.totalXP, this.activeModuleId)}</div>
          </div>
          <div class="xp-chart">
            <canvas id="xp-progress-chart" width="400" height="100"></canvas>
          </div>
        </div>
        
        <h3 class="subsection-title">Recent XP Transactions</h3>
        ${this.renderTransactionsList()}
        
        <a href="#/transactions" class="btn btn-outline view-all-btn">View All Transactions</a>
      </div>
    `;
    
    this.addStyles();
  }

  getProjectName(path) {
    return path.split('/').pop();
  }

  renderTransactionsList() {
    if (!this.transactions.length) {
      return '<p class="no-data">No XP transactions found</p>';
    }

    const transactionsHTML = this.transactions
      .slice(0, 5)
      .map(transaction => `
        <div class="transaction-item">
          <div class="transaction-details">
            <div class="transaction-path">${this.getProjectName(transaction.path)}</div>
            <div class="transaction-date">${FormatUtils.formatDate(transaction.createdAt)}</div>
          </div>
          <div class="transaction-amount">${FormatUtils.formatXPSize(transaction.amount, this.activeModuleId)}</div>
        </div>
      `).join('');

    return `<div class="transactions-list">${transactionsHTML}</div>`;
  }
  
  addStyles() {
    // Add component-specific styles
    const style = document.createElement('style');
    style.textContent = `
      .xp-summary {
        display: flex;
        align-items: center;
        margin-bottom: 30px;
        background: rgba(0, 168, 204, 0.05);
        border-radius: 8px;
        padding: 20px;
      }
      
      .xp-total {
        min-width: 150px;
        margin-right: 20px;
      }
      
      .xp-total h3 {
        font-size: 0.9rem;
        opacity: 0.7;
        margin-bottom: 5px;
      }
      
      .xp-value {
        font-size: 2rem;
        font-weight: 600;
        color: var(--secondary-color);
      }
      
      .xp-chart {
        flex: 1;
        height: 100px;
      }
      
      .subsection-title {
        font-size: 1.1rem;
        margin-bottom: 15px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      
      .transactions-list {
        margin-bottom: 20px;
      }
      
      .transaction-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }
      
      .transaction-item:last-child {
        border-bottom: none;
      }
      
      .transaction-path {
        font-weight: 500;
        margin-bottom: 5px;
      }
      
      .transaction-date {
        font-size: 0.8rem;
        opacity: 0.7;
      }
      
      .transaction-amount {
        font-weight: 600;
        color: var(--secondary-color);
      }
      
      .view-all-btn {
        margin-top: 10px;
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

export default XPComponent;