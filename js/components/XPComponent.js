// XPComponent.js
import FormatUtils from '../utils/FormatUtils.js';

class XPComponent {
  constructor(container, transactions, totalXP) {
    this.container = container;
    this.transactions = transactions;
    this.totalXP = totalXP;
  }

  render() {
    this.container.innerHTML = `
      <h2>XP Information</h2>
      <div class="info-card">
        <p><strong>Total XP:</strong> ${FormatUtils.formatXPSize(this.totalXP)}</p>
        <h3>XP Transactions</h3>
        ${this.renderTransactionsList()}
      </div>
    `;
  }

  renderTransactionsList() {
    if (!this.transactions.length) {
      return '<p>No XP transactions found</p>';
    }

    const transactionsHTML = this.transactions
      .slice(0, 5)
      .map(transaction => `
        <li>
          <span>${FormatUtils.formatXPSize(transaction.amount)}</span>
          <span>${FormatUtils.formatDate(transaction.createdAt)}</span>
          <span>${transaction.path}</span>
        </li>
      `).join('');

    return `<ul class="transaction-list">${transactionsHTML}</ul>`;
  }
}

export default XPComponent;