import { SheetsAPI } from '../shared/sheets-api.jsx'

class AirlinesCalculator {
  constructor() {
    this.sheetsAPI = new SheetsAPI();
    this.selectedCard = null;
    this.selectedProgram = null;
    this.currentPage = 1;
    this.cardsPerPage = 12;
    this.filteredCards = [];
    this.allCards = [];
    this.isLoading = false;
    this.category = 'airlines';
    this.init();
  }

  async init() {
    try {
      this.isLoading = true;
      this.showLoading();
      await this.loadCreditCards();
      this.filteredCards = [...this.allCards];
      this.isLoading = false;
      this.hideLoading();
      this.renderCurrentPage();
      this.renderPagination();
      this.bindEvents();
    } catch (error) {
      console.error('Error initializing airlines calculator:', error);
      this.isLoading = false;
      this.showError('Failed to load credit card data. Please try again later.');
    }
  }

  async loadCreditCards() {
    try {
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 5000)
      );
      
      const cardsPromise = this.sheetsAPI.getAllCreditCards();
      
      this.allCards = await Promise.race([cardsPromise, timeoutPromise]);
      
      if (!this.allCards || this.allCards.length === 0) {
        throw new Error('No credit cards found in the spreadsheet');
      }
      
      console.log('Loaded cards from API:', this.allCards.length);
    } catch (error) {
      console.warn('Error loading credit cards from API, using fallback:', error);
      this.allCards = this.getDefaultCards();
    }
  }

  getDefaultCards() {
    return [
      { id: 'hdfc-regalia', name: 'Regalia Credit Card', bank: 'HDFC Bank', program: 'hdfc' },
      { id: 'hdfc-diners-black', name: 'Diners Club Black', bank: 'HDFC Bank', program: 'hdfc' },
      { id: 'axis-magnus', name: 'Magnus Credit Card', bank: 'Axis Bank', program: 'axis' },
      { id: 'axis-reserve', name: 'Reserve Credit Card', bank: 'Axis Bank', program: 'axis' },
      { id: 'sbi-elite', name: 'Elite Credit Card', bank: 'SBI Card', program: 'sbi' },
      { id: 'icici-emeralde', name: 'Emeralde Credit Card', bank: 'ICICI Bank', program: 'icici' },
      { id: 'amex-platinum', name: 'Platinum Card', bank: 'American Express', program: 'amex' },
      { id: 'amex-gold', name: 'Gold Card', bank: 'American Express', program: 'amex' }
    ];
  }

  showLoading() {
    const cardGrid = document.querySelector('.card-grid');
    if (cardGrid) {
      cardGrid.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading credit cards...</p>
        </div>
      `;
    }
    this.isLoading = true;
  }

  hideLoading() {
    this.isLoading = false;
  }

  showError(message) {
    const cardGrid = document.querySelector('.card-grid');
    if (cardGrid) {
      cardGrid.innerHTML = `
        <div class="error-container">
          <p class="error-message">${message}</p>
          <button class="retry-button" onclick="location.reload()">Retry</button>
        </div>
      `;
    }
  }

  renderCurrentPage() {
    if (this.isLoading) {
      this.showLoading();
      return;
    }
    
    const cardGrid = document.querySelector('.card-grid');
    if (!cardGrid) return;
    
    if (this.filteredCards.length === 0) {
      cardGrid.innerHTML = `
        <div class="error-container">
          <p>No credit cards found.</p>
        </div>
      `;
      return;
    }
    
    const startIndex = (this.currentPage - 1) * this.cardsPerPage;
    const endIndex = startIndex + this.cardsPerPage;
    const cardsToRender = this.filteredCards.slice(startIndex, endIndex);
    
    cardGrid.innerHTML = cardsToRender.map(card => `
      <div class="credit-card-option" data-card="${card.program}" data-card-id="${card.id}">
        <h3 class="card-name">${card.name}</h3>
        <p class="bank-name">${card.bank}</p>
      </div>
    `).join('');
    
    this.bindCardEvents();
  }

  renderPagination() {
    if (this.isLoading || this.filteredCards.length === 0) return;
    
    const totalPages = Math.ceil(this.filteredCards.length / this.cardsPerPage);
    const startIndex = (this.currentPage - 1) * this.cardsPerPage + 1;
    const endIndex = Math.min(this.currentPage * this.cardsPerPage, this.filteredCards.length);
    
    const paginationInfo = document.getElementById('pagination-info-text');
    if (paginationInfo) {
      paginationInfo.textContent = 
      `Showing ${startIndex}-${endIndex} of ${this.filteredCards.length} cards`;
    }
    
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn) prevBtn.disabled = this.currentPage === 1;
    if (nextBtn) nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    
    const pageNumbersContainer = document.getElementById('page-numbers');
    if (!pageNumbersContainer) return;
    
    pageNumbersContainer.innerHTML = '';
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        this.createPageNumber(i, pageNumbersContainer);
      }
    } else {
      if (this.currentPage <= 3) {
        for (let i = 1; i <= 3; i++) {
          this.createPageNumber(i, pageNumbersContainer);
        }
        if (totalPages > 4) {
          pageNumbersContainer.appendChild(this.createEllipsis());
          this.createPageNumber(totalPages, pageNumbersContainer);
        }
      } else if (this.currentPage >= totalPages - 2) {
        this.createPageNumber(1, pageNumbersContainer);
        pageNumbersContainer.appendChild(this.createEllipsis());
        for (let i = totalPages - 2; i <= totalPages; i++) {
          this.createPageNumber(i, pageNumbersContainer);
        }
      } else {
        this.createPageNumber(1, pageNumbersContainer);
        pageNumbersContainer.appendChild(this.createEllipsis());
        for (let i = this.currentPage - 1; i <= this.currentPage + 1; i++) {
          this.createPageNumber(i, pageNumbersContainer);
        }
        pageNumbersContainer.appendChild(this.createEllipsis());
        this.createPageNumber(totalPages, pageNumbersContainer);
      }
    }
  }

  createPageNumber(pageNum, container) {
    const pageButton = document.createElement('button');
    pageButton.className = `page-number ${pageNum === this.currentPage ? 'active' : ''}`;
    pageButton.textContent = pageNum;
    pageButton.addEventListener('click', () => this.goToPage(pageNum));
    container.appendChild(pageButton);
  }

  createEllipsis() {
    const ellipsis = document.createElement('span');
    ellipsis.textContent = '...';
    ellipsis.className = 'page-ellipsis';
    ellipsis.style.padding = 'var(--space-2)';
    ellipsis.style.color = 'var(--neutral-400)';
    return ellipsis;
  }

  goToPage(pageNum) {
    this.currentPage = pageNum;
    this.renderCurrentPage();
    this.renderPagination();
  }

  bindCardEvents() {
    const cardOptions = document.querySelectorAll('.credit-card-option');
    cardOptions.forEach(card => {
      card.addEventListener('click', (event) => {
        window.currentCardEvent = event;
        this.selectCard(card.dataset.card);
      });
    });
  }

  bindEvents() {
    const searchInput = document.getElementById('card-search');
    const clearButton = document.getElementById('clear-search');
    
    searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    clearButton.addEventListener('click', () => this.clearSearch());
    
    searchInput.addEventListener('input', (e) => {
      if (e.target.value.trim()) {
        clearButton.classList.remove('hidden');
      } else {
        clearButton.classList.add('hidden');
      }
    });

    document.getElementById('back-to-cards').addEventListener('click', () => this.showCardSelection());
    document.getElementById('back-to-programs').addEventListener('click', () => this.showProgramsSelection());
    
    document.getElementById('prev-page').addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.goToPage(this.currentPage - 1);
      }
    });
    
    document.getElementById('next-page').addEventListener('click', () => {
      const totalPages = Math.ceil(this.filteredCards.length / this.cardsPerPage);
      if (this.currentPage < totalPages) {
        this.goToPage(this.currentPage + 1);
      }
    });
  }

  handleSearch(query) {
    this.currentPage = 1;
    
    if (!query.trim()) {
      this.filteredCards = [...this.allCards];
    } else {
      this.filteredCards = this.allCards.filter(card => 
        card.name.toLowerCase().includes(query.toLowerCase()) ||
        card.bank.toLowerCase().includes(query.toLowerCase())
      );
    }
    
    if (!this.isLoading) {
      this.renderCurrentPage();
      this.renderPagination();
    }
  }

  clearSearch() {
    const searchInput = document.getElementById('card-search');
    const clearButton = document.getElementById('clear-search');
    
    searchInput.value = '';
    clearButton.classList.add('hidden');
    this.currentPage = 1;
    this.filteredCards = [...this.allCards];
    if (!this.isLoading) {
      this.renderCurrentPage();
      this.renderPagination();
    }
    searchInput.focus();
  }

  selectCard(cardType) {
    const selectedCardElement = window.currentCardEvent.target.closest('.credit-card-option');
    if (selectedCardElement) {
      const cardId = selectedCardElement.dataset.cardId;
      const cardName = selectedCardElement.querySelector('.card-name').textContent;
      const bankName = selectedCardElement.querySelector('.bank-name').textContent;
      
      this.selectedCard = {
        id: cardId,
        name: cardName,
        bank: bankName,
        program: cardType
      };
      
      console.log('Selected card:', this.selectedCard);
    } else {
      console.error('Could not find selected card element');
      return;
    }
    
    document.querySelectorAll('.credit-card-option').forEach(card => {
      card.classList.remove('selected');
    });
    selectedCardElement.classList.add('selected');

    setTimeout(() => {
      this.showProgramsSelection();
    }, 300);
  }

  showCardSelection() {
    document.getElementById('card-selection').classList.remove('hidden');
    document.getElementById('programs-selection').classList.add('hidden');
    document.getElementById('points-calculator').classList.add('hidden');
    
    document.querySelectorAll('.credit-card-option').forEach(card => {
      card.classList.remove('selected');
    });
    this.selectedCard = null;
  }

  showProgramsSelection() {
    document.getElementById('card-selection').classList.add('hidden');
    document.getElementById('programs-selection').classList.remove('hidden');
    document.getElementById('points-calculator').classList.add('hidden');

    const cardName = this.selectedCard ? `${this.selectedCard.bank} ${this.selectedCard.name}` : 'Selected Card';
    document.querySelector('#programs-selection .step-description').textContent = 
      `Select airline program for ${cardName} points redemption`;

    this.showRewardPrograms();
  }

  showRewardPrograms() {
    this.showProgramsLoading();
    this.loadRewardPrograms();
  }

  showProgramsLoading() {
    const programsGrid = document.getElementById('programs-grid');
    if (programsGrid) {
      programsGrid.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading airline programs...</p>
        </div>
      `;
    }
  }

  async loadRewardPrograms() {
    try {
      console.log(`Loading reward programs for category: ${this.category}`);
      const programs = await this.sheetsAPI.getRewardPrograms(this.category);
      console.log(`Raw programs from API for ${this.category}:`, programs);
      const filteredPrograms = await this.filterProgramsForSelectedCard(programs);
      console.log(`Filtered programs for ${this.category}:`, filteredPrograms);
      this.renderRewardPrograms(filteredPrograms);
    } catch (error) {
      console.error('Error loading reward programs:', error);
      this.renderRewardPrograms([]);
    }
  }

  async filterProgramsForSelectedCard(programs) {
    if (!this.selectedCard || !this.selectedCard.id) {
      console.log('No card selected or card ID missing');
      return [];
    }
    
    const selectedCardId = this.selectedCard.id;
    console.log('Filtering programs for card ID:', selectedCardId, 'Card details:', this.selectedCard);

    const filteredPrograms = [];
    
    for (const program of programs) {
      try {
        const conversionValue = await this.sheetsAPI.getConversionValue(
          this.category, 
          program.id, 
          selectedCardId
        );
        
        console.log(`Program ${program.name} - Card ${selectedCardId} - Value: ${conversionValue}`);
        
        if (conversionValue !== null && conversionValue !== undefined && conversionValue > 0) {
          filteredPrograms.push(program);
          console.log(`✓ Including program: ${program.name}`);
        } else {
          console.log(`✗ Excluding program: ${program.name} (no valid conversion value)`);
        }
      } catch (error) {
        console.error('Error checking conversion value for program:', program.name, error);
      }
    }
    
    console.log(`Filtered programs for card ${selectedCardId} in ${this.category}:`, filteredPrograms.length);
    return filteredPrograms;
  }

  renderRewardPrograms(programs) {
    const programsGrid = document.getElementById('programs-grid');
    if (!programsGrid) return;
    
    if (programs.length === 0) {
      const cardName = this.selectedCard ? `${this.selectedCard.bank} ${this.selectedCard.name}` : 'Selected Card';
      programsGrid.innerHTML = `
        <div class="error-container">
          <p class="error-message">No airline programs available for ${cardName}.</p>
          <p style="color: var(--neutral-500); font-size: 0.875rem; margin-top: var(--space-2);">
            This card may not have conversion rates available for airline redemptions.
          </p>
          <button class="retry-button" onclick="location.reload()" style="margin-top: var(--space-3);">Reload Page</button>
        </div>
      `;
      return;
    }
    
    const categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640" fill="currentColor">
      <path d="M552 264C582.9 264 608 289.1 608 320C608 350.9 582.9 376 552 376L424.7 376L265.5 549.6C259.4 556.2 250.9 560 241.9 560L198.2 560C187.3 560 179.6 549.3 183 538.9L237.3 376L137.6 376L84.8 442C81.8 445.8 77.2 448 72.3 448L52.5 448C42.1 448 34.5 438.2 37 428.1L64 320L37 211.9C34.4 201.8 42.1 192 52.5 192L72.3 192C77.2 192 81.8 194.2 84.8 198L137.6 264L237.3 264L183 101.1C179.6 90.7 187.3 80 198.2 80L241.9 80C250.9 80 259.4 83.8 265.5 90.4L424.7 264L552 264z"/>
    </svg>`;
    
    programsGrid.innerHTML = programs.map(program => `
      <div class="program-card" data-program="${program.id}">
        <div class="program-icon">
          ${categoryIcon}
        </div>
        <h3 class="program-name">${program.name}</h3>
        <p class="point-name">${program.pointName}</p>
        <div class="conversion-note">
          <span>Value varies by redemption</span>
        </div>
      </div>
    `).join('');
    
    this.bindProgramEvents();
  }

  bindProgramEvents() {
    const programCards = document.querySelectorAll('.program-card');
    programCards.forEach(card => {
      card.addEventListener('click', () => this.selectProgram(card.dataset.program));
    });
  }

  async selectProgram(programId) {
    const programs = await this.sheetsAPI.getRewardPrograms(this.category);
    const selectedProgram = programs.find(p => p.id === programId);
    
    if (!selectedProgram) return;
    
    this.selectedProgram = selectedProgram;
    
    document.querySelectorAll('.program-card').forEach(card => {
      card.classList.remove('selected');
    });
    document.querySelector(`[data-program="${programId}"]`).classList.add('selected');

    setTimeout(() => {
      this.showPointsCalculator();
    }, 300);
  }

  async showPointsCalculator() {
    document.getElementById('card-selection').classList.add('hidden');
    document.getElementById('programs-selection').classList.add('hidden');
    document.getElementById('points-calculator').classList.remove('hidden');

    const cardName = this.selectedCard ? `${this.selectedCard.bank} ${this.selectedCard.name}` : 'Selected Card';
    document.querySelector('#points-calculator .step-description').textContent = 
      `Calculate ${cardName} points value for ${this.selectedProgram.name}`;

    document.getElementById('selected-program-name').textContent = this.selectedProgram.name;
    document.getElementById('selected-point-name').textContent = this.selectedProgram.pointName;
    
    const conversionValue = await this.getConversionRate();
    document.getElementById('conversion-rate').textContent = conversionValue ? 
      `₹${conversionValue} per point` : 'Rate varies by redemption';
    
    document.getElementById('selected-card-name').textContent = cardName;
    
    const categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 640 640" fill="currentColor">
      <path d="M552 264C582.9 264 608 289.1 608 320C608 350.9 582.9 376 552 376L424.7 376L265.5 549.6C259.4 556.2 250.9 560 241.9 560L198.2 560C187.3 560 179.6 549.3 183 538.9L237.3 376L137.6 376L84.8 442C81.8 445.8 77.2 448 72.3 448L52.5 448C42.1 448 34.5 438.2 37 428.1L64 320L37 211.9C34.4 201.8 42.1 192 52.5 192L72.3 192C77.2 192 81.8 194.2 84.8 198L137.6 264L237.3 264L183 101.1C179.6 90.7 187.3 80 198.2 80L241.9 80C250.9 80 259.4 83.8 265.5 90.4L424.7 264L552 264z"/>
    </svg>`;
    document.querySelector('.info-icon').innerHTML = categoryIcon;
    
    this.bindCalculatorEvents();
  }

  async getConversionRate() {
    try {
      if (!this.selectedCard || !this.selectedCard.id) return null;
      
      const rate = await this.sheetsAPI.getConversionValue(
        this.category, 
        this.selectedProgram.id, 
        this.selectedCard.id
      );
      return rate;
    } catch (error) {
      console.error('Error getting conversion rate:', error);
      return null;
    }
  }

  async bindCalculatorEvents() {
    const pointsInput = document.getElementById('points-input');
    const resultValue = document.getElementById('result-value');
    const resultDescription = document.getElementById('result-description');
    
    const calculateValue = async () => {
      const points = parseFloat(pointsInput.value) || 0;
      
      if (points > 0) {
        const conversionRate = await this.getConversionRate();
        if (conversionRate) {
          const rate = parseFloat(conversionRate);
          const value = points * rate;
          resultValue.textContent = `₹${value.toFixed(2)}`;
          resultDescription.textContent = `${points.toLocaleString()} ${this.selectedProgram.pointName.toLowerCase()} = ₹${value.toFixed(2)}`;
        } else {
          resultValue.textContent = 'N/A';
          resultDescription.textContent = 'Conversion rate not available for this card';
        }
      } else {
        resultValue.textContent = '₹0.00';
        resultDescription.textContent = 'Enter points above to see value';
      }
    };
    
    pointsInput.removeEventListener('input', calculateValue);
    pointsInput.removeEventListener('keyup', calculateValue);
    
    pointsInput.addEventListener('input', calculateValue);
    pointsInput.addEventListener('keyup', calculateValue);
    
    pointsInput.focus();
  }
}

// Initialize the airlines calculator
new AirlinesCalculator();