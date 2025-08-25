/**
 * Secure Proxy for Credit Card Calculators
 * This handles API calls securely without exposing keys
 */

class SecureCalculatorProxy {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
    this.baseUrl = window.location.origin;
  }

  /**
   * Secure API call through WordPress AJAX
   */
  async fetchSheetData(sheetName) {
    const cacheKey = `sheet_${sheetName}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log(`Using cached data for sheet: ${sheetName}`);
      return cached.data;
    }

    try {
      // Use WordPress AJAX endpoint instead of direct API call
      const formData = new FormData();
      formData.append('action', 'ccalc_get_data');
      formData.append('sheet_name', sheetName);
      formData.append('nonce', window.ccalc_nonce || '');

      const response = await fetch(`${this.baseUrl}/wp-admin/admin-ajax.php`, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.data || 'API request failed');
      }

      const processedData = result.data;
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      });
      
      return processedData;
    } catch (error) {
      console.error(`Error fetching sheet data for ${sheetName}:`, error);
      // Return fallback data instead of throwing
      return this.getFallbackData(sheetName);
    }
  }

  getFallbackData(sheetName) {
    const fallbackCards = [
      { id: 'hdfc_regalia', name: 'Regalia Credit Card', bank: 'HDFC Bank', program: 'hdfc' },
      { id: 'axis_magnus', name: 'Magnus Credit Card', bank: 'Axis Bank', program: 'axis' },
      { id: 'amex_platinum', name: 'Platinum Card', bank: 'American Express', program: 'amex' }
    ];

    const fallbackPrograms = [
      { 
        id: 'program_1', 
        name: sheetName === 'Airlines' ? 'Air Miles' : sheetName === 'Hotels' ? 'Hotel Points' : 'Cash Back',
        pointName: sheetName === 'Airlines' ? 'Miles' : sheetName === 'Hotels' ? 'Points' : 'Cash',
        values: {
          'hdfc_regalia': 1.0,
          'axis_magnus': 1.2,
          'amex_platinum': 1.5
        }
      }
    ];

    return { creditCards: fallbackCards, rewardPrograms: fallbackPrograms };
  }

  /**
   * Get all data for all categories
   */
  async getAllData() {
    try {
      const [airlinesData, hotelsData, cashData] = await Promise.all([
        this.fetchSheetData('Airlines'),
        this.fetchSheetData('Hotels'),
        this.fetchSheetData('Cash')
      ]);

      return {
        airlines: airlinesData,
        hotels: hotelsData,
        cash: cashData
      };
    } catch (error) {
      console.error('Error fetching all sheet data:', error);
      return {
        airlines: this.getFallbackData('Airlines'),
        hotels: this.getFallbackData('Hotels'),
        cash: this.getFallbackData('Cash')
      };
    }
  }

  /**
   * Get unique credit cards across all sheets
   */
  async getAllCreditCards() {
    try {
      const allData = await this.getAllData();
      const cardMap = new Map();

      Object.values(allData).forEach(sheetData => {
        sheetData.creditCards.forEach(card => {
          const key = `${card.bank}_${card.name}`.toLowerCase();
          if (!cardMap.has(key)) {
            cardMap.set(key, {
              id: card.id,
              name: card.name,
              bank: card.bank,
              program: this.inferProgramFromBank(card.bank)
            });
          }
        });
      });

      return Array.from(cardMap.values());
    } catch (error) {
      console.error('Error getting all credit cards:', error);
      return this.getFallbackData('All').creditCards;
    }
  }

  /**
   * Get reward programs for a specific category
   */
  async getRewardPrograms(category) {
    try {
      const sheetName = this.getCategorySheetName(category);
      const data = await this.fetchSheetData(sheetName);
      return data.rewardPrograms;
    } catch (error) {
      console.error(`Error getting reward programs for ${category}:`, error);
      return this.getFallbackData(category).rewardPrograms;
    }
  }

  /**
   * Get conversion value for a specific card and program
   */
  async getConversionValue(category, programId, cardId) {
    try {
      const programs = await this.getRewardPrograms(category);
      const program = programs.find(p => p.id === programId);
      
      if (program && program.values && program.values.hasOwnProperty(cardId)) {
        return program.values[cardId];
      }
      
      return null;
    } catch (error) {
      console.error('Error getting conversion value:', error);
      return null;
    }
  }

  getCategorySheetName(category) {
    const sheetNames = {
      'airlines': 'Airlines',
      'hotels': 'Hotels',
      'cash': 'Cash'
    };
    return sheetNames[category] || 'Airlines';
  }

  inferProgramFromBank(bankName) {
    const bankPrograms = {
      'hdfc': 'hdfc',
      'axis': 'axis',
      'american express': 'amex',
      'amex': 'amex',
      'sbi': 'sbi',
      'icici': 'icici'
    };
    
    const bank = bankName.toLowerCase();
    return bankPrograms[bank] || 'other';
  }

  clearCache() {
    this.cache.clear();
  }
}

// Make available globally
window.SecureCalculatorProxy = SecureCalculatorProxy;