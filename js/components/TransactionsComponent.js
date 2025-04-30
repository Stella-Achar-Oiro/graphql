// TransactionsComponent.js
import FormatUtils from '../utils/FormatUtils.js';

class TransactionsComponent {
  constructor(container, transactions) {
    this.container = container;
    this.transactions = transactions;
    this.itemsPerPage = 10;
    this.currentPage = 1;
    this.filteredTransactions = [...transactions];
    this.activeModuleId = FormatUtils.getPreferredModule();
  }

  async render() {
    this.container.innerHTML = `
      <div class="dashboard-layout">
        <main class="content-area">
          <div id="module-selection-container"></div>
          
          <div class="card transactions-card">
            <div class="card-header">
              <h2><i class="fas fa-list"></i> All XP Transactions</h2>
              <div class="card-actions">
                <button class="btn-icon" id="refresh-transactions">
                  <i class="fas fa-sync"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="transactions-filters">
                <div class="search-group">
                  <div class="search-box">
                    <i class="fas fa-search search-icon"></i>
                    <input type="text" id="transaction-search" placeholder="Search transactions...">
                  </div>
                  <div class="search-tags" id="search-tags"></div>
                </div>
                <div class="filter-group">
                  <div class="filter-box">
                    <select id="sort-transactions">
                      <option value="date-desc">Latest First</option>
                      <option value="date-asc">Oldest First</option>
                      <option value="xp-desc">Highest XP First</option>
                      <option value="xp-asc">Lowest XP First</option>
                    </select>
                  </div>
                  <div class="items-per-page">
                    <select id="items-per-page">
                      <option value="10">10 per page</option>
                      <option value="20">20 per page</option>
                      <option value="50">50 per page</option>
                      <option value="100">100 per page</option>
                    </select>
                  </div>
                </div>
              </div>

              <div class="transactions-summary">
                <div class="summary-item">
                  <span class="summary-label">Total Transactions:</span>
                  <span class="summary-value">${this.filteredTransactions.length}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Total XP:</span>
                  <span class="summary-value">${this.formatTotalXP()}</span>
                </div>
              </div>

              <div class="transactions-list">
                ${this.renderTransactionsList()}
              </div>

              <div class="pagination-container">
                <div class="pagination-info">
                  Showing ${this.getStartIndex() + 1} to ${this.getEndIndex()} of ${this.filteredTransactions.length} entries
                </div>
                <div class="pagination">
                  ${this.renderPagination()}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;

    this.addStyles();
    await this.initializeModuleSelection();
    this.attachEventListeners();
  }

  renderTransactionsList() {
    if (!this.filteredTransactions.length) {
      return '<p class="no-data">No XP transactions found</p>';
    }

    const startIndex = this.getStartIndex();
    const endIndex = this.getEndIndex();
    
    return this.filteredTransactions
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
          <div class="transaction-amount">${FormatUtils.formatXPSize(transaction.amount, this.activeModuleId)}</div>
        </div>
      `).join('');
  }

  renderPagination() {
    const totalPages = Math.ceil(this.filteredTransactions.length / this.itemsPerPage);
    if (totalPages <= 1) return '';

    return `
      <button class="page-btn" data-page="prev" ${this.currentPage === 1 ? 'disabled' : ''}>
        <i class="fas fa-chevron-left"></i>
      </button>
      <span class="page-info">${this.currentPage} / ${totalPages}</span>
      <button class="page-btn" data-page="next" ${this.currentPage === totalPages ? 'disabled' : ''}>
        <i class="fas fa-chevron-right"></i>
      </button>
    `;
  }

  getProjectName(path) {
    return path.split('/').pop();
  }

  async initializeModuleSelection() {
    const moduleSelectionContainer = document.getElementById('module-selection-container');
    const ModuleSelectionComponent = (await import('./ModuleSelectionComponent.js')).default;
    const moduleSelector = new ModuleSelectionComponent(
      moduleSelectionContainer,
      FormatUtils.getPreferredModule(),
      this.handleModuleChange.bind(this)
    );
    moduleSelector.render();
  }

  async handleModuleChange(moduleId) {
    try {
      const { default: GraphQLClient } = await import('../utils/GraphQLClient.js');
      const { getXPQuery } = await import('../utils/queries.js');
      
      this.activeModuleId = moduleId;
      const data = await GraphQLClient.query(getXPQuery(moduleId));
      this.transactions = data.transaction || [];
      this.filteredTransactions = [...this.transactions];
      this.currentPage = 1;
      this.updateTransactionsList();
    } catch (error) {
      console.error('Failed to load transactions:', error);
    }
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

    // Items per page functionality
    const itemsPerPageSelect = document.getElementById('items-per-page');
    if (itemsPerPageSelect) {
      itemsPerPageSelect.addEventListener('change', (e) => {
        this.itemsPerPage = parseInt(e.target.value);
        this.currentPage = 1;
        this.updateTransactionsList();
      });
    }

    // Pagination
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const page = e.target.dataset.page;
        if (page === 'prev' && this.currentPage > 1) {
          this.currentPage--;
        } else if (page === 'next' && this.currentPage < Math.ceil(this.filteredTransactions.length / this.itemsPerPage)) {
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
    this.filteredTransactions = filtered;
    this.currentPage = 1;
    this.updateTransactionsList();
  }

  sortTransactions(sortType) {
    const sorted = [...this.filteredTransactions];
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
    this.filteredTransactions = sorted;
    this.currentPage = 1;
    this.updateTransactionsList();
  }

  updateTransactionsList() {
    const listContainer = this.container.querySelector('.transactions-list');
    if (listContainer) {
      listContainer.innerHTML = this.renderTransactionsList();
    }
    
    const paginationContainer = this.container.querySelector('.pagination');
    if (paginationContainer) {
      paginationContainer.innerHTML = this.renderPagination();
    }
    
    const summaryContainer = this.container.querySelector('.transactions-summary');
    if (summaryContainer) {
      summaryContainer.innerHTML = `
        <div class="summary-item">
          <span class="summary-label">Total Transactions:</span>
          <span class="summary-value">${this.filteredTransactions.length}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total XP:</span>
          <span class="summary-value">${this.formatTotalXP()}</span>
        </div>
      `;
    }

    const paginationInfoContainer = this.container.querySelector('.pagination-info');
    if (paginationInfoContainer) {
      paginationInfoContainer.innerHTML = `
        Showing ${this.getStartIndex() + 1} to ${this.getEndIndex()} of ${this.filteredTransactions.length} entries
      `;
    }

    this.attachEventListeners();
  }

  formatTotalXP() {
    const total = this.filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    return FormatUtils.formatXPSize(total, this.activeModuleId);
  }

  getStartIndex() {
    return (this.currentPage - 1) * this.itemsPerPage;
  }

  getEndIndex() {
    const end = this.getStartIndex() + this.itemsPerPage;
    return Math.min(end, this.filteredTransactions.length);
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .transactions-filters {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 15px;
      }

      .search-group {
        flex: 1;
        min-width: 250px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .search-box {
        display: flex;
        align-items: center;
        gap: 10px;
        width: 100%;
      }

      .search-box input {
        padding: 8px 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        width: 100%;
        min-width: 200px;
        font-size: 0.9rem;
      }

      .filter-group {
        display: flex;
        gap: 15px;
        flex-wrap: wrap;
      }

      .filter-box select,
      .items-per-page select {
        padding: 8px 12px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        border-radius: 4px;
        min-width: 120px;
        font-size: 0.9rem;
      }

      .transactions-summary {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        margin-bottom: 20px;
        gap: 15px;
      }

      .summary-item {
        display: flex;
        gap: 10px;
        font-size: 0.9rem;
        flex: 1;
        min-width: 200px;
      }

      .transaction-item {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        padding: 15px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);
      }

      .transaction-details {
        flex: 1;
        min-width: 0;
        padding-right: 15px;
      }

      .transaction-path {
        font-weight: 500;
        margin-bottom: 5px;
        word-break: break-word;
      }

      .transaction-info {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        font-size: 0.8rem;
        opacity: 0.7;
        margin-top: 5px;
      }

      .transaction-amount {
        font-weight: 600;
        color: var(--secondary-color);
        white-space: nowrap;
      }

      .pagination-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        gap: 15px;
      }

      .pagination-info {
        font-size: 0.9rem;
        opacity: 0.7;
      }

      .pagination {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      @media (max-width: 768px) {
        .transactions-filters,
        .filter-group {
          flex-direction: column;
        }

        .search-box input,
        .filter-box select,
        .items-per-page select {
          width: 100%;
        }

        .pagination-container {
          flex-direction: column;
          align-items: stretch;
          text-align: center;
        }

        .pagination {
          justify-content: center;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

export default TransactionsComponent;