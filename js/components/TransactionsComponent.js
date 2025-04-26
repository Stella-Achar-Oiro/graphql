// TransactionsComponent.js
import FormatUtils from '../utils/FormatUtils.js';

class TransactionsComponent {
  constructor(container, transactions) {
    this.container = container;
    this.transactions = transactions;
    this.itemsPerPage = 10;
    this.currentPage = 1;
  }

  render() {
    this.container.innerHTML = `
      <div class="card transactions-card">
        <div class="card-header">
          <h2><i class="fas fa-list"></i> All XP Transactions</h2>
        </div>
        <div class="card-body">
          <div class="transactions-filters">
            <div class="search-box">
              <input type="text" id="transaction-search" placeholder="Search transactions...">
            </div>
            <div class="filter-box">
              <select id="sort-transactions">
                <option value="date-desc">Latest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="xp-desc">Highest XP First</option>
                <option value="xp-asc">Lowest XP First</option>
              </select>
            </div>
          </div>

          <div class="transactions-list">
            ${this.renderTransactionsList()}
          </div>

          <div class="pagination">
            ${this.renderPagination()}
          </div>
        </div>
      </div>
    `;

    this.addStyles();
    this.attachEventListeners();
  }

  renderTransactionsList() {
    if (!this.transactions.length) {
      return '<p class="no-data">No XP transactions found</p>';
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    
    return this.transactions
      .slice(startIndex, endIndex)
      .map(transaction => `
        <div class="transaction-item">
          <div class="transaction-details">
            <div class="transaction-path">${this.getProjectName(transaction.path)}</div>
            <div class="transaction-info">
              <span class="transaction-date">${FormatUtils.formatDate(transaction.createdAt)}</span>
              <span class="transaction-id">ID: ${transaction.id}</span>
            </div>
          </div>
          <div class="transaction-amount">${FormatUtils.formatXPSize(transaction.amount)}</div>
        </div>
      `).join('');
  }

  renderPagination() {
    const totalPages = Math.ceil(this.transactions.length / this.itemsPerPage);
    if (totalPages <= 1) return '';

    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(`
        <button class="page-btn ${i === this.currentPage ? 'active' : ''}" 
                data-page="${i}">
          ${i}
        </button>
      `);
    }

    return `
      <button class="page-btn" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
      ${pages.join('')}
      <button class="page-btn" data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
  }

  getProjectName(path) {
    return path.split('/').pop();
  }

  attachEventListeners() {
    // Search functionality
    const searchInput = document.getElementById('transaction-search');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        this.filterTransactions(searchTerm);
      });
    }

    // Sorting functionality
    const sortSelect = document.getElementById('sort-transactions');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortTransactions(e.target.value);
      });
    }

    // Pagination
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.target.dataset.page;
        if (page === 'prev' && this.currentPage > 1) {
          this.currentPage--;
        } else if (page === 'next' && this.currentPage < Math.ceil(this.transactions.length / this.itemsPerPage)) {
          this.currentPage++;
        } else if (page !== 'prev' && page !== 'next') {
          this.currentPage = parseInt(page);
        }
        this.updateTransactionsList();
      });
    });
  }

  filterTransactions(searchTerm) {
    const filtered = this.transactions.filter(t => 
      this.getProjectName(t.path).toLowerCase().includes(searchTerm) ||
      t.id.toString().includes(searchTerm)
    );
    this.currentPage = 1;
    this.updateTransactionsList(filtered);
  }

  sortTransactions(sortType) {
    const sorted = [...this.transactions];
    switch (sortType) {
      case 'date-desc':
        sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'date-asc':
        sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'xp-desc':
        sorted.sort((a, b) => b.amount - a.amount);
        break;
      case 'xp-asc':
        sorted.sort((a, b) => a.amount - b.amount);
        break;
    }
    this.currentPage = 1;
    this.updateTransactionsList(sorted);
  }

  updateTransactionsList(transactions = this.transactions) {
    const listContainer = this.container.querySelector('.transactions-list');
    if (listContainer) {
      listContainer.innerHTML = this.renderTransactionsList();
    }
    
    const paginationContainer = this.container.querySelector('.pagination');
    if (paginationContainer) {
      paginationContainer.innerHTML = this.renderPagination();
    }
    
    this.attachEventListeners();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .transactions-filters {
        display: flex;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 15px;
      }

      .search-box input {
        padding: 8px 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        width: 250px;
        font-size: 0.9rem;
      }

      .filter-box select {
        padding: 8px 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        background-color: white;
        font-size: 0.9rem;
      }

      .transaction-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }

      .transaction-info {
        display: flex;
        gap: 15px;
        font-size: 0.8rem;
        opacity: 0.7;
        margin-top: 5px;
      }

      .transaction-amount {
        font-weight: 600;
        color: var(--secondary-color);
      }

      .pagination {
        display: flex;
        justify-content: center;
        gap: 5px;
        margin-top: 20px;
      }

      .page-btn {
        padding: 8px 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        background-color: white;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .page-btn.active {
        background-color: var(--secondary-color);
        color: white;
        border-color: var(--secondary-color);
      }

      .page-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      [data-theme="dark"] .search-box input,
      [data-theme="dark"] .filter-box select,
      [data-theme="dark"] .page-btn {
        background-color: var(--card-bg);
        color: var(--text-color);
        border-color: rgba(255, 255, 255, 0.1);
      }
    `;
    document.head.appendChild(style);
  }
}

export default TransactionsComponent;