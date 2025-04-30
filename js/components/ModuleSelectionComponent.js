// ModuleSelectionComponent.js
class ModuleSelectionComponent {
  constructor(container, activeModuleId, onModuleSelect) {
    this.container = container;
    this.activeModuleId = activeModuleId;
    this.onModuleSelect = onModuleSelect;
    this.modules = [
      {
        id: 48,
        name: 'Piscine Go',
        startDate: '2024-01-22',
        endDate: '2024-02-17'
      },
      {
        id: 75,
        name: 'Module',
        startDate: '2024-04-08',
        endDate: '2026-04-08',
        children: [
          {
            id: 83,
            name: 'Piscine JS',
            startDate: '2024-08-26',
            endDate: '2024-09-21'
          },
          {
            id: 84,
            name: 'Piscine Rust',
            startDate: '2025-04-01',
            endDate: '2025-05-02'
          },
          {
            id: 88,
            name: 'piscine-ux',
            startDate: '2024-09-30',
            endDate: '2024-10-25'
          },
          {
            id: 180,
            name: 'piscine-ui',
            startDate: '2024-11-04',
            endDate: '2024-11-25'
          }
        ]
      }
    ];
  }

  render() {
    this.container.innerHTML = `
      <div class="module-selection">
        <h3 class="module-selection-title">Select Module</h3>
        <div class="module-cards-container">
          <div class="module-cards-scroll">
            ${this.renderModuleCards()}
          </div>
        </div>
      </div>
    `;

    this.addStyles();
    this.attachEventListeners();
  }

  renderModuleCards() {
    let cards = '';
    
    // Render main modules
    this.modules.forEach(module => {
      cards += this.createModuleCard(module);
      
      // Render child modules if any
      if (module.children) {
        module.children.forEach(child => {
          cards += this.createModuleCard(child, module.id);
        });
      }
    });
    
    return cards;
  }

  createModuleCard(module, parentId = null) {
    const isActive = module.id === this.activeModuleId;
    const parentInfo = parentId ? `<div class="module-parent">in Module #${parentId}</div>` : '';
    const dates = `${this.formatDate(module.startDate)} > ${this.formatDate(module.endDate)}`;
    
    return `
      <div class="module-card ${isActive ? 'active' : ''}" data-module-id="${module.id}">
        <div class="module-name">${module.name} #${module.id}</div>
        ${parentInfo}
        <div class="module-dates">${dates}</div>
      </div>
    `;
  }

  formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .module-selection {
        margin-bottom: 30px;
      }

      .module-selection-title {
        font-size: 1.1rem;
        margin-bottom: 15px;
        color: var(--text-color);
      }

      .module-cards-container {
        width: 100%;
        overflow: hidden;
        position: relative;
      }

      .module-cards-scroll {
        display: flex;
        gap: 15px;
        overflow-x: auto;
        padding: 10px 0;
        scroll-behavior: smooth;
        -webkit-overflow-scrolling: touch;
      }

      .module-card {
        flex: 0 0 auto;
        width: 220px;
        padding: 15px;
        background-color: var(--card-bg);
        border-radius: 8px;
        border: 2px solid transparent;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .module-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      }

      .module-card.active {
        border-color: #8c52ff;
        background-color: rgba(140, 82, 255, 0.1);
      }

      .module-name {
        font-weight: 600;
        margin-bottom: 5px;
        color: var(--text-color);
      }

      .module-parent {
        font-size: 0.8rem;
        color: var(--secondary-color);
        margin-bottom: 5px;
      }

      .module-dates {
        font-size: 0.8rem;
        opacity: 0.7;
      }

      /* Scrollbar styling */
      .module-cards-scroll::-webkit-scrollbar {
        height: 6px;
      }

      .module-cards-scroll::-webkit-scrollbar-track {
        background: rgba(0, 0, 0, 0.1);
        border-radius: 3px;
      }

      .module-cards-scroll::-webkit-scrollbar-thumb {
        background: var(--secondary-color);
        border-radius: 3px;
      }
    `;
    
    document.head.appendChild(style);
  }

  attachEventListeners() {
    const cards = this.container.querySelectorAll('.module-card');
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const moduleId = parseInt(card.dataset.moduleId);
        if (moduleId !== this.activeModuleId) {
          this.activeModuleId = moduleId;
          this.onModuleSelect(moduleId);
          
          // Update active state
          cards.forEach(c => c.classList.remove('active'));
          card.classList.add('active');
        }
      });
    });
  }
}

export default ModuleSelectionComponent;