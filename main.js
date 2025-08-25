import { SheetsAPI } from './credit-card-calculators/shared/sheets-api.jsx'
import './style.css'

class App {
  constructor() {
    this.sheetsAPI = new SheetsAPI();
    this.selectedCard = null;
    this.selectedCategory = null;
    this.selectedProgram = null;
    this.currentPage = 1;
    this.cardsPerPage = 12;
    this.filteredCards = [];
    this.allCards = [];
    this.isLoading = false;
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
      console.error('Error initializing app:', error);
      this.isLoading = false;
      this.showError('Failed to load credit card data. Please try again later.');
    }
  }

  async loadCreditCards() {
    try {
      // Set a timeout for the API call
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('API timeout')), 5000)
      );
      
      const cardsPromise = this.sheetsAPI.getAllCreditCards();
      
      this.allCards = await Promise.race([cardsPromise, timeoutPromise]);
      
      if (!this.allCards || this.allCards.length === 0) {
        console.warn('No cards from API, using fallback');
        throw new Error('No credit cards found in the spreadsheet');
      }
      
      console.log('Loaded cards from API:', this.allCards.length);
    } catch (error) {
      console.warn('Error loading credit cards from API, using fallback:', error);
      this.allCards = this.getDefaultCards();
      console.log('Using fallback cards:', this.allCards.length);
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
      { id: 'amex-gold', name: 'Gold Card', bank: 'American Express', program: 'amex' },
      { id: 'citi-prestige', name: 'Prestige Credit Card', bank: 'Citi Bank', program: 'citi' },
      { id: 'yes-marquee', name: 'Marquee Credit Card', bank: 'Yes Bank', program: 'yes' },
      { id: 'kotak-white', name: 'White Credit Card', bank: 'Kotak Bank', program: 'kotak' },
      { id: 'indusind-pioneer', name: 'Pioneer Credit Card', bank: 'IndusInd Bank', program: 'indusind' },
      { id: 'rbl-world-safari', name: 'World Safari Card', bank: 'RBL Bank', program: 'rbl' },
      { id: 'standard-chartered-ultimate', name: 'Ultimate Credit Card', bank: 'Standard Chartered', program: 'sc' },
      { id: 'hsbc-premier', name: 'Premier Credit Card', bank: 'HSBC', program: 'hsbc' }
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
    
    // Re-bind click events for newly rendered cards
    this.bindCardEvents();
  }

  renderPagination() {
    if (this.isLoading || this.filteredCards.length === 0) return;
    
    const totalPages = Math.ceil(this.filteredCards.length / this.cardsPerPage);
    const startIndex = (this.currentPage - 1) * this.cardsPerPage + 1;
    const endIndex = Math.min(this.currentPage * this.cardsPerPage, this.filteredCards.length);
    
    // Update pagination info
    const paginationInfo = document.getElementById('pagination-info-text');
    if (paginationInfo) {
      paginationInfo.textContent = 
      `Showing ${startIndex}-${endIndex} of ${this.filteredCards.length} cards`;
    }
    
    // Update previous/next buttons
    const prevBtn = document.getElementById('prev-page');
    const nextBtn = document.getElementById('next-page');
    if (prevBtn) prevBtn.disabled = this.currentPage === 1;
    if (nextBtn) nextBtn.disabled = this.currentPage === totalPages || totalPages === 0;
    
    // Render page numbers
    const pageNumbersContainer = document.getElementById('page-numbers');
    if (!pageNumbersContainer) return;
    
    pageNumbersContainer.innerHTML = '';
    
    if (totalPages <= 5) {
      // Show all pages if 5 or fewer
      for (let i = 1; i <= totalPages; i++) {
        this.createPageNumber(i, pageNumbersContainer);
      }
    } else {
      // Show smart pagination for more than 5 pages
      if (this.currentPage <= 3) {
        // Show first 3 pages, ellipsis, last page
        for (let i = 1; i <= 3; i++) {
          this.createPageNumber(i, pageNumbersContainer);
        }
        if (totalPages > 4) {
          pageNumbersContainer.appendChild(this.createEllipsis());
          this.createPageNumber(totalPages, pageNumbersContainer);
        }
      } else if (this.currentPage >= totalPages - 2) {
        // Show first page, ellipsis, last 3 pages
        this.createPageNumber(1, pageNumbersContainer);
        pageNumbersContainer.appendChild(this.createEllipsis());
        for (let i = totalPages - 2; i <= totalPages; i++) {
          this.createPageNumber(i, pageNumbersContainer);
        }
      } else {
        // Show first page, ellipsis, current-1, current, current+1, ellipsis, last page
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
        // Store the event for use in selectCard
        window.currentCardEvent = event;
        this.selectCard(card.dataset.card);
      });
    });
  }

  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById('card-search');
    const clearButton = document.getElementById('clear-search');
    
    searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    clearButton.addEventListener('click', () => this.clearSearch());
    
    // Show/hide clear button based on input
    searchInput.addEventListener('input', (e) => {
      if (e.target.value.trim()) {
        clearButton.classList.remove('hidden');
      } else {
        clearButton.classList.add('hidden');
      }
    });

    // Category selection
    const categoryOptions = document.querySelectorAll('.reward-category');
    categoryOptions.forEach(category => {
      category.addEventListener('click', () => this.selectCategory(category.dataset.category));
    });

    // Back buttons
    document.getElementById('back-to-cards').addEventListener('click', () => this.showCardSelection());
    document.getElementById('back-to-categories').addEventListener('click', () => this.showCategorySelection());
    document.getElementById('back-to-programs').addEventListener('click', () => this.showCalculationSection());
    
    // Pagination controls
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
    this.currentPage = 1; // Reset to first page when searching
    
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
    // Find the actual card data from the clicked element
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
    
    // Update visual selection
    document.querySelectorAll('.credit-card-option').forEach(card => {
      card.classList.remove('selected');
    });
    selectedCardElement.classList.add('selected');

    // Show category selection after a brief delay for visual feedback
    setTimeout(() => {
      this.showCategorySelection();
    }, 300);
  }

  selectCategory(categoryType) {
    this.selectedCategory = categoryType;
    
    // Update visual selection
    document.querySelectorAll('.reward-category').forEach(category => {
      category.classList.remove('selected');
    });
    document.querySelector(`[data-category="${categoryType}"]`).classList.add('selected');

    // Show calculation section after a brief delay
    setTimeout(() => {
      this.showCalculationSection();
    }, 300);
  }

  showCardSelection() {
    document.getElementById('card-selection').classList.remove('hidden');
    document.getElementById('category-selection').classList.add('hidden');
    document.getElementById('calculation-section').classList.add('hidden');
    document.getElementById('points-calculator').classList.add('hidden');
    
    // Reset selections
    document.querySelectorAll('.credit-card-option').forEach(card => {
      card.classList.remove('selected');
    });
    this.selectedCard = null;
  }

  showCategorySelection() {
    document.getElementById('card-selection').classList.add('hidden');
    document.getElementById('category-selection').classList.remove('hidden');
    document.getElementById('calculation-section').classList.add('hidden');
    document.getElementById('points-calculator').classList.add('hidden');

    // Update the step description to show selected card
    const cardName = this.selectedCard ? `${this.selectedCard.bank} ${this.selectedCard.name}` : 'Selected Card';
    document.querySelector('#category-selection .step-description').textContent = 
      `Select how you'd like to redeem your ${cardName} points`;
  }

  showCalculationSection() {
    document.getElementById('card-selection').classList.add('hidden');
    document.getElementById('category-selection').classList.add('hidden');
    document.getElementById('calculation-section').classList.remove('hidden');
    document.getElementById('points-calculator').classList.add('hidden');

    // Update the step description to show selected card and category
    const cardName = this.selectedCard ? `${this.selectedCard.bank} ${this.selectedCard.name}` : 'Selected Card';
    const categoryName = this.getCategoryDisplayName(this.selectedCategory);
    document.querySelector('#calculation-section .step-description').textContent = 
      `Select ${categoryName} program for ${cardName} points redemption`;

    // Show reward programs for the selected category
    this.showRewardPrograms();
  }

  showRewardPrograms() {
    this.showProgramsLoading();
    this.loadRewardPrograms();
  }

  showProgramsLoading() {
    const rewardProgramsGrid = document.getElementById('reward-programs-grid');
    if (rewardProgramsGrid) {
      rewardProgramsGrid.innerHTML = `
        <div class="loading-container">
          <div class="loading-spinner"></div>
          <p>Loading reward programs...</p>
        </div>
      `;
    }
  }

  async loadRewardPrograms() {
    try {
      console.log(`Loading reward programs for category: ${this.selectedCategory}`);
      const programs = await this.sheetsAPI.getRewardPrograms(this.selectedCategory);
      console.log(`Raw programs from API for ${this.selectedCategory}:`, programs);
      const filteredPrograms = await this.filterProgramsForSelectedCard(programs);
      console.log(`Filtered programs for ${this.selectedCategory}:`, filteredPrograms);
      this.renderRewardPrograms(filteredPrograms);
    } catch (error) {
      console.error('Error loading reward programs:', error);
      // Show error instead of fallback to avoid confusion
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
    console.log('Available programs:', programs.map(p => ({ name: p.name, id: p.id })));

    const filteredPrograms = [];
    
    for (const program of programs) {
      try {
        const conversionValue = await this.sheetsAPI.getConversionValue(
          this.selectedCategory, 
          program.id, 
          selectedCardId
        );
        
        console.log(`Program ${program.name} - Card ${selectedCardId} - Value: ${conversionValue}`);
        console.log(`Program ${program.name} available cards:`, Object.keys(program.values || {}));
       
        // Only include programs that have a valid conversion value for this card
        if (conversionValue !== null && conversionValue !== undefined && conversionValue > 0) {
          filteredPrograms.push(program);
          console.log(`✓ Including program: ${program.name}`);
        } else {
          console.log(`✗ Excluding program: ${program.name} (no valid conversion value)`);
        }
      } catch (error) {
        console.error('Error checking conversion value for program:', program.name, error);
        // Don't include program if we can't get conversion value
        console.log(`Skipping program ${program.name} - no conversion value for card ${selectedCardId}`);
      }
    }
    
    console.log(`Filtered programs for card ${selectedCardId} in ${this.selectedCategory}:`, filteredPrograms.length);
    return filteredPrograms;
  }

  renderRewardPrograms(programs) {
    const rewardProgramsGrid = document.getElementById('reward-programs-grid');
    if (!rewardProgramsGrid) return;
    
    if (programs.length === 0) {
      const cardName = this.selectedCard ? `${this.selectedCard.bank} ${this.selectedCard.name}` : 'Selected Card';
      rewardProgramsGrid.innerHTML = `
        <div class="error-container">
          <p class="error-message">No reward programs available for ${cardName} in ${this.getCategoryDisplayName(this.selectedCategory)} category.</p>
          <p style="color: var(--neutral-500); font-size: 0.875rem; margin-top: var(--space-2);">
            This card may not have conversion rates available for ${this.getCategoryDisplayName(this.selectedCategory)} redemptions, or there may be an issue loading data from the spreadsheet.
          </p>
          <button class="retry-button" onclick="location.reload()" style="margin-top: var(--space-3);">Reload Page</button>
        </div>
      `;
      return;
    }
    
    const categoryIcon = this.getCategoryIcon(this.selectedCategory);
    
    rewardProgramsGrid.innerHTML = programs.map(program => `
      <div class="reward-program-card" data-program="${program.id}">
        <div class="reward-program-icon">
          ${categoryIcon}
        </div>
        <div class="reward-program-content">
          <h3 class="program-name">${program.name}</h3>
          <p class="point-name">${program.pointName}</p>
          <div class="conversion-note">
            <span class="note-text">Value varies by redemption</span>
          </div>
        </div>
      </div>
    `).join('');
    
    // Bind click events for reward program cards
    this.bindProgramEvents();
  }

  bindProgramEvents() {
    const programCards = document.querySelectorAll('.reward-program-card');
    programCards.forEach(card => {
      card.addEventListener('click', () => this.selectProgram(card.dataset.program));
    });
  }

  async selectProgram(programId) {
    // Find the program data
    const programs = await this.sheetsAPI.getRewardPrograms(this.selectedCategory);
    const selectedProgram = programs.find(p => p.id === programId);
    
    if (!selectedProgram) return;
    
    this.selectedProgram = selectedProgram;
    
    // Update visual selection
    document.querySelectorAll('.reward-program-card').forEach(card => {
      card.classList.remove('selected');
    });
    document.querySelector(`[data-program="${programId}"]`).classList.add('selected');

    // Show calculator after a brief delay
    setTimeout(() => {
      this.showPointsCalculator();
    }, 300);
  }

  async showPointsCalculator() {
    document.getElementById('card-selection').classList.add('hidden');
    document.getElementById('category-selection').classList.add('hidden');
    document.getElementById('calculation-section').classList.add('hidden');
    document.getElementById('points-calculator').classList.remove('hidden');

    // Update the step description to show selected card and program
    const cardName = this.selectedCard ? `${this.selectedCard.bank} ${this.selectedCard.name}` : 'Selected Card';
    const categoryName = this.getCategoryDisplayName(this.selectedCategory);
    document.querySelector('#points-calculator .step-description').textContent = 
      `Calculate ${cardName} points value for ${this.selectedProgram.name}`;

    // Update the calculator with selected program info
    document.getElementById('selected-program-name').textContent = this.selectedProgram.name;
    document.getElementById('selected-point-name').textContent = this.selectedProgram.pointName;
    
    // Get conversion rate for selected card
    const conversionValue = await this.getConversionRate();
    document.getElementById('conversion-rate').textContent = conversionValue ? 
      `₹${conversionValue} per point` : 'Rate varies by redemption';
    
    // Show selected card information
    document.getElementById('selected-card-name').textContent = cardName;
    
    // Add category icon
    const categoryIcon = this.getCategoryIcon(this.selectedCategory);
    document.getElementById('calculator-icon').innerHTML = categoryIcon;
    
    // Bind calculator events
    this.bindCalculatorEvents();
  }

  async getConversionRate() {
    try {
      if (!this.selectedCard || !this.selectedCard.id) return null;
      
      const rate = await this.sheetsAPI.getConversionValue(
        this.selectedCategory, 
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
          const rate = parseFloat(conversionRate); // Rate is in rupees per point
          const value = points * rate; // Direct multiplication since rate is already in rupees
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
    
    // Remove existing event listeners to prevent duplicates
    pointsInput.removeEventListener('input', calculateValue);
    pointsInput.removeEventListener('keyup', calculateValue);
    
    // Add event listeners for real-time calculation
    pointsInput.addEventListener('input', calculateValue);
    pointsInput.addEventListener('keyup', calculateValue);
    
    // Focus on input field
    pointsInput.focus();
  }

  getCategoryIcon(category) {
    const icons = {
      'airlines': `<svg width="32" height="32" viewBox="0 0 640 640" fill="currentColor">
        <path d="M552 264C582.9 264 608 289.1 608 320C608 350.9 582.9 376 552 376L424.7 376L265.5 549.6C259.4 556.2 250.9 560 241.9 560L198.2 560C187.3 560 179.6 549.3 183 538.9L237.3 376L137.6 376L84.8 442C81.8 445.8 77.2 448 72.3 448L52.5 448C42.1 448 34.5 438.2 37 428.1L64 320L37 211.9C34.4 201.8 42.1 192 52.5 192L72.3 192C77.2 192 81.8 194.2 84.8 198L137.6 264L237.3 264L183 101.1C179.6 90.7 187.3 80 198.2 80L241.9 80C250.9 80 259.4 83.8 265.5 90.4L424.7 264L552 264z"/>
      </svg>`,
      'hotels': `<svg width="32" height="32" viewBox="0 0 640 640" fill="currentColor">
        <path d="M80 88C80 74.7 90.7 64 104 64L536 64C549.3 64 560 74.7 560 88C560 101.3 549.3 112 536 112L528 112L528 528L536 528C549.3 528 560 538.7 560 552C560 565.3 549.3 576 536 576L104 576C90.7 576 80 565.3 80 552C80 538.7 90.7 528 104 528L112 528L112 112L104 112C90.7 112 80 101.3 80 88zM288 176L288 208C288 216.8 295.2 224 304 224L336 224C344.8 224 352 216.8 352 208L352 176C352 167.2 344.8 160 336 160L304 160C295.2 160 288 167.2 288 176zM192 160C183.2 160 176 167.2 176 176L176 208C176 216.8 183.2 224 192 224L224 224C232.8 224 240 216.8 240 208L240 176C240 167.2 232.8 160 224 160L192 160zM288 272L288 304C288 312.8 295.2 320 304 320L336 320C344.8 320 352 312.8 352 304L352 272C352 263.2 344.8 256 336 256L304 256C295.2 256 288 263.2 288 272zM416 160C407.2 160 400 167.2 400 176L400 208C400 216.8 407.2 224 416 224L448 224C456.8 224 464 216.8 464 208L464 176C464 167.2 456.8 160 448 160L416 160zM176 272L176 304C176 312.8 183.2 320 192 320L224 320C232.8 320 240 312.8 240 304L240 272C240 263.2 232.8 256 224 256L192 256C183.2 256 176 263.2 176 272zM416 256C407.2 256 400 263.2 400 272L400 304C400 312.8 407.2 320 416 320L448 320C456.8 320 464 312.8 464 304L464 272C464 263.2 456.8 256 448 256L416 256zM352 448L395.8 448C405.7 448 413.3 439 409.8 429.8C396 393.7 361 368 320.1 368C279.2 368 244.2 393.7 230.4 429.8C226.9 439 234.5 448 244.4 448L288.2 448L288.2 528L352.2 528L352.2 448z"/>
      </svg>`,
      'cash': `<svg width="32" height="32" viewBox="0 0 640 640" fill="currentColor">
        <path d="M160 128C160 110.3 174.3 96 192 96L456 96C469.3 96 480 106.7 480 120C480 133.3 469.3 144 456 144L379.3 144C397 163.8 409.4 188.6 414 216L456 216C469.3 216 480 226.7 480 240C480 253.3 469.3 264 456 264L414 264C403.6 326.2 353.2 374.9 290.2 382.9L434.6 486C449 496.3 452.3 516.3 442 530.6C431.7 544.9 411.7 548.3 397.4 538L173.4 378C162.1 370 157.3 355.5 161.5 342.2C165.7 328.9 178.1 320 192 320L272 320C307.8 320 338.1 296.5 348.3 264L184 264C170.7 264 160 253.3 160 240C160 226.7 170.7 216 184 216L348.3 216C338.1 183.5 307.8 160 272 160L192 160C174.3 160 160 145.7 160 128z"/>
      </svg>`
    };
    return icons[category] || '';
  }

  getCategoryDisplayName(categoryType) {
    const categoryNames = {
      'airlines': 'Airlines',
      'hotels': 'Hotels',
      'cash': 'Cash'
    };
    return categoryNames[categoryType] || categoryType;
  }
}

// Initialize the app
new App();