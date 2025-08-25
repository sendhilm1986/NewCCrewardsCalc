import { SheetsAPI } from '../shared/sheets-api.jsx'

class HotelsCalculator {
  constructor() {
    this.sheetsAPI = new SheetsAPI();
    this.selectedCard = null;
    this.selectedProgram = null;
    this.currentPage = 1;
    this.cardsPerPage = 12;
    this.filteredCards = [];
    this.allCards = [];
    this.isLoading = false;
    this.category = 'hotels';
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
      console.error('Error initializing hotels calculator:', error);
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
      `Select hotel program for ${cardName} points redemption`;

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
          <p>Loading hotel programs...</p>
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
          <p class="error-message">No hotel programs available for ${cardName}.</p>
          <p style="color: var(--neutral-500); font-size: 0.875rem; margin-top: var(--space-2);">
            This card may not have conversion rates available for hotel redemptions.
          </p>
          <button class="retry-button" onclick="location.reload()" style="margin-top: var(--space-3);">Reload Page</button>
        </div>
      `;
      return;
    }
    
    const categoryIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 640 640" fill="currentColor">
      <path d="M80 88C80 74.7 90.7 64 104 64L536 64C549.3 64 560 74.7 560 88C560 101.3 549.3 112 536 112L528 112L528 528L536 528C549.3 528 560 538.7 560 552C560 565.3 549.3 576 536 576L104 576C90.7 576 80 565.3 80 552C80 538.7 90.7 528 104 528L112 528L112 112L104 112C90.7 112 80 101.3 80 88zM288 176L288 208C288 216.8 295.2 224 304 224L336 224C344.8 224 352 216.8 352 208L352 176C352 167.2 344.8 160 336 160L304 160C295.2 160 288 167.2 288 176zM192 160C183.2 160 176 167.2 176 176L176 208C176 216.8 183.2 224 192 224L224 224C232.8 224 240 216.8 240 208L240 176C240 167.2 232.8 160 224 160L192 160zM288 272L288 304C288 312.8 295.2 320 304 320L336 320C344.8 320 352 312.8 352 304L352 272C352 263.2 344.8 256 336 256L304 256C295.2 256 288 263.2 288 272zM416 160C407.2 160 400 167.2 400 176L400 208C400 216.8 407.2 224 416 224L448 224C456.8 224 464 216.8 464 208L464 176C464 167.2 456.8 160 448 160L416 160zM176 272L176 304C176 312.8 183.2 320 192 320L224 320C232.8 320 240 312.8 240 304L240 272C240 263.2 232.8 256 224 256L192 256C183.2 256 176 263.2 176 272zM416 256C407.2 256 400 263.2 400 272L400 304C400 312.8 407.2 320 416 320L448 320C456.8 320 464 312.8 464 304L464 272C464 263.2 456.8 256 448 256L416 256zM352 448L395.8 448C405.7 448 413.3 439 409.8 429.8C396 393.7 361 368 320.1 368C279.2 368 244.2 393.7 230.4 429.8C226.9 439 234.5 448 244.4 448L288.2 448L288.2 528L352.2 528L352.2 448z"/>
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
      <path d="M80 88C80 74.7 90.7 64 104 64L536 64C549.3 64 560 74.7 560 88C560 101.3 549.3 112 536 112L528 112L528 528L536 528C549.3 528 560 538.7 560 552C560 565.3 549.3 576 536 576L104 576C90.7 576 80 565.3 80 552C80 538.7 90.7 528 104 528L112 528L112 112L104 112C90.7 112 80 101.3 80 88zM288 176L288 208C288 216.8 295.2 224 304 224L336 224C344.8 224 352 216.8 352 208L352 176C352 167.2 344.8 160 336 160L304 160C295.2 160 288 167.2 288 176zM192 160C183.2 160 176 167.2 176 176L176 208C176 216.8 183.2 224 192 224L224 224C232.8 224 240 216.8 240 208L240 176C240 167.2 232.8 160 224 160L192 160zM288 272L288 304C288 312.8 295.2 320 304 320L336 320C344.8 320 352 312.8 352 304L352 272C352 263.2 344.8 256 336 256L304 256C295.2 256 288 263.2 288 272zM416 160C407.2 160 400 167.2 400 176L400 208C400 216.8 407.2 224 416 224L448 224C456.8 224 464 216.8 464 208L464 176C464 167.2 456.8 160 448 160L416 160zM176 272L176 304C176 312.8 183.2 320 192 320L224 320C232.8 320 240 312.8 240 304L240 272C240 263.2 232.8 256 224 256L192 256C183.2 256 176 263.2 176 272zM416 256C407.2 256 400 263.2 400 272L400 304C400 312.8 407.2 320 416 320L448 320C456.8 320 464 312.8 464 304L464 272C464 263.2 456.8 256 448 256L416 256zM352 448L395.8 448C405.7 448 413.3 439 409.8 429.8C396 393.7 361 368 320.1 368C279.2 368 244.2 393.7 230.4 429.8C226.9 439 234.5 448 244.4 448L288.2 448L288.2 528L352.2 528L352.2 448z"/>
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

// Initialize the hotels calculator
new HotelsCalculator();