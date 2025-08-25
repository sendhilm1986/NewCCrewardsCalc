/**
 * Google Sheets API Integration for Credit Card Points Calculator
 */

export class SheetsAPI {
  constructor() {
    this.apiKey = 'YOUR_GOOGLE_SHEETS_API_KEY'; // Replace with your actual API key
    this.spreadsheetId = '1QznZhNzCxeijnnct6n_eauTtHElBlW25c2iQMmWRiUY';
    this.baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';
    this.cache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Fetch data from a specific sheet
   */
  async fetchSheetData(sheetName) {
    const cacheKey = `sheet_${sheetName}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      console.log(`Using cached data for sheet: ${sheetName}`);
      return cached.data;
    }

    try {
      const range = `${sheetName}!A1:Z1000`; // Get all data from A1 to Z1000 to ensure we get all rows
      const url = `${this.baseUrl}/${this.spreadsheetId}/values/${range}?key=${this.apiKey}`;
      
      console.log(`Fetching data from URL: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        console.error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
        console.error(`Failed to fetch data from sheet: ${sheetName}`);
        // Return empty data structure instead of throwing
        return { creditCards: [], rewardPrograms: [] };
      }
      
      const data = await response.json();
      console.log(`Raw API response for ${sheetName}:`, data);
      console.log(`Number of rows received: ${data.values ? data.values.length : 0}`);
      const processedData = this.processSheetData(data.values || []);
      
      // Cache the result
      this.cache.set(cacheKey, {
        data: processedData,
        timestamp: Date.now()
      });
      
      console.log(`Processed data for ${sheetName}:`, processedData);
      return processedData;
    } catch (error) {
      console.error(`Error fetching sheet data for ${sheetName}:`, error);
      // Return empty data structure instead of throwing
      return { creditCards: [], rewardPrograms: [] };
    }
  }

  /**
   * Process raw sheet data into structured format
   */
  processSheetData(rawData) {
    console.log('Processing sheet data:', rawData);
    
    if (rawData.length < 3) {
      console.log('Not enough rows in sheet data');
      return { creditCards: [], rewardPrograms: [] };
    }

    const creditCards = [];
    const rewardPrograms = [];

    // Extract credit cards from row 1 and 2 (bank name and card name)
    const bankRow = rawData[0] || [];
    const cardRow = rawData[1] || [];
    
    console.log('Bank row:', bankRow);
    console.log('Card row:', cardRow);
    
    for (let col = 2; col < Math.max(bankRow.length, cardRow.length); col++) {
      const bankName = bankRow[col] || '';
      const cardName = cardRow[col] || '';
      
      if (bankName.trim() || cardName.trim()) {
       // Create a consistent ID based on bank and card name
       const cardId = this.createCardId(bankName.trim(), cardName.trim());
        creditCards.push({
         id: cardId,
          bank: bankName.trim(),
          name: cardName.trim(),
          column: col // This is the actual column index in the sheet
        });
        console.log(`Card found: ${cardName} (${bankName}) at column ${col} with ID: ${cardId}`);
      }
    }
    
    console.log('Extracted credit cards:', creditCards);

    // Extract reward programs starting from row 3
    for (let row = 2; row < rawData.length; row++) {
      const rowData = rawData[row] || [];
      const programName = rowData[0] || '';
      const pointName = rowData[1] || '';
      
     console.log(`Processing row ${row + 1}: Program="${programName}", Point="${pointName}"`);
     console.log(`Row data:`, rowData);
      if (programName.trim()) {
        const program = {
          id: `program_${row}`,
          name: programName.trim(),
          pointName: pointName.trim() || programName.trim(),
          values: {}
        };

        // Extract values for each credit card
        creditCards.forEach(card => {
         const rawValue = rowData[card.column]; // Use the actual column position
         console.log(`Program: ${programName}, Card: ${card.name} (col ${card.column}), Raw Value: "${rawValue}" (type: ${typeof rawValue})`);
         
         if (rawValue !== undefined && rawValue !== null && rawValue.toString().trim() !== '') {
           // Handle different value formats
           let cleanValue = rawValue.toString().trim();
           
           // Remove any currency symbols, commas, or other formatting
           cleanValue = cleanValue.replace(/[₹$,\s]/g, '');
           
           const numValue = parseFloat(cleanValue);
           console.log(`Cleaned value: "${cleanValue}" -> ${numValue}`);
           
            if (!isNaN(numValue)) {
              program.values[card.id] = numValue;
              console.log(`✓ Added value ${numValue} for card ${card.id} in program ${programName}`);
            } else {
             console.log(`✗ Invalid number value "${rawValue}" -> "${cleanValue}" for card ${card.id} in program ${programName}`);
            }
          } else {
           console.log(`✗ Empty/null value for card ${card.id} in program ${programName} at column ${card.column} (raw: "${rawValue}")`);
          }
        });

        console.log(`Program ${programName} final values:`, program.values);
        rewardPrograms.push(program);
      }
    }
    
    console.log('Extracted reward programs:', rewardPrograms);

    return { creditCards, rewardPrograms };
  }

  /**
  * Create a consistent card ID based on bank and card name
  */
 createCardId(bankName, cardName) {
   // Remove common words and normalize
   const normalizeText = (text) => {
     return text.toLowerCase()
       .replace(/\s+/g, '_')
       .replace(/[^a-z0-9_]/g, '')
       .replace(/_+/g, '_')
       .replace(/^_|_$/g, '');
   };
   
   const normalizedBank = normalizeText(bankName);
   const normalizedCard = normalizeText(cardName);
   
   return `${normalizedBank}_${normalizedCard}`;
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
      // Return empty data structure for all categories
      return {
        airlines: { creditCards: [], rewardPrograms: [] },
        hotels: { creditCards: [], rewardPrograms: [] },
        cash: { creditCards: [], rewardPrograms: [] }
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

      // Combine cards from all sheets
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

     const result = Array.from(cardMap.values());
     console.log('Final credit cards list:', result);
     return result;
    } catch (error) {
      console.error('Error getting all credit cards:', error);
      return [];
    }
  }

  /**
   * Get reward programs for a specific category
   */
  async getRewardPrograms(category) {
    try {
      const sheetName = this.getCategorySheetName(category);
      console.log(`Fetching reward programs from sheet: ${sheetName} for category: ${category}`);
      const data = await this.fetchSheetData(sheetName);
      console.log(`Sheet data for ${sheetName}:`, data);
      console.log(`Reward programs found: ${data.rewardPrograms.length}`);
      return data.rewardPrograms;
    } catch (error) {
      console.error(`Error getting reward programs for ${category}:`, error);
      // Return empty array instead of throwing
      return [];
    }
  }

  /**
   * Get conversion value for a specific card and program
   */
  async getConversionValue(category, programId, cardId) {
    try {
      console.log(`Getting conversion value for category: ${category}, program: ${programId}, card: ${cardId}`);
      const programs = await this.getRewardPrograms(category);
      const program = programs.find(p => p.id === programId);
      
      if (program && program.values && program.values.hasOwnProperty(cardId)) {
        const value = program.values[cardId];
        console.log(`Conversion value for ${cardId} in ${programId}: ${value}`);
        return value;
      }
      
      console.log(`No conversion value found for card ${cardId} in program ${programId}. Available cards in program:`, program ? Object.keys(program.values) : 'Program not found');
      return null;
    } catch (error) {
      console.error('Error getting conversion value:', error);
      return null;
    }
  }

  /**
   * Helper methods
   */
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
      'chase': 'chase',
      'american express': 'amex',
      'amex': 'amex',
      'capital one': 'capital-one',
      'citi': 'citi',
      'marriott': 'marriott',
      'hilton': 'hilton'
    };
    
    const bank = bankName.toLowerCase();
    return bankPrograms[bank] || 'other';
  }

  /**
   * Clear cache (useful for testing or forcing refresh)
   */
  clearCache() {
    this.cache.clear();
  }
}