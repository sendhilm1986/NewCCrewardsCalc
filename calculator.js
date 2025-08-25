export class PointsCalculator {
  constructor() {
    this.redemptionRates = {
      'chase': {
        'Cash Back': { rate: 0.01, description: 'Direct cash back redemption' },
        'Travel Portal': { rate: 0.0125, description: 'Book through Chase Travel Portal' },
        'Transfer Partners': { rate: 0.015, description: 'Transfer to airline/hotel partners' },
        'Gift Cards': { rate: 0.01, description: 'Redeem for gift cards' },
        'Statement Credit': { rate: 0.01, description: 'Apply as statement credit' }
      },
      'amex': {
        'Cash Back': { rate: 0.006, description: 'Direct cash back redemption' },
        'Travel Portal': { rate: 0.01, description: 'Book through Amex Travel' },
        'Transfer Partners': { rate: 0.018, description: 'Transfer to airline/hotel partners' },
        'Gift Cards': { rate: 0.007, description: 'Redeem for gift cards' },
        'Amazon': { rate: 0.007, description: 'Use points at Amazon checkout' }
      },
      'capital-one': {
        'Cash Back': { rate: 0.01, description: 'Direct cash back redemption' },
        'Travel': { rate: 0.01, description: 'Erase travel purchases' },
        'Gift Cards': { rate: 0.01, description: 'Redeem for gift cards' },
        'Statement Credit': { rate: 0.01, description: 'Apply as statement credit' },
        'Amazon': { rate: 0.01, description: 'Use points at Amazon checkout' }
      },
      'citi': {
        'Cash Back': { rate: 0.01, description: 'Direct cash back redemption' },
        'Travel Portal': { rate: 0.01, description: 'Book through Citi Travel Portal' },
        'Transfer Partners': { rate: 0.012, description: 'Transfer to airline/hotel partners' },
        'Gift Cards': { rate: 0.008, description: 'Redeem for gift cards' },
        'Statement Credit': { rate: 0.01, description: 'Apply as statement credit' }
      },
      'marriott': {
        'Free Nights': { rate: 0.007, description: 'Redeem for hotel stays' },
        'Cash Back': { rate: 0.003, description: 'Convert to cash' },
        'Travel Packages': { rate: 0.008, description: 'Hotel + airline miles packages' },
        'Experiences': { rate: 0.006, description: 'Unique experiences and events' }
      },
      'hilton': {
        'Free Nights': { rate: 0.005, description: 'Redeem for hotel stays' },
        'Cash Back': { rate: 0.002, description: 'Convert to cash' },
        'Amazon': { rate: 0.005, description: 'Use points at Amazon' },
        'Experiences': { rate: 0.004, description: 'Unique experiences and events' }
      }
    };
  }

  calculateConversions(points, program) {
    const programRates = this.redemptionRates[program];
    
    if (!programRates) {
      throw new Error('Invalid card program selected');
    }

    const conversions = [];

    Object.entries(programRates).forEach(([type, data]) => {
      const value = points * data.rate;
      conversions.push({
        type: type,
        value: value,
        rate: data.rate * 100, // Convert to cents per point
        description: data.description
      });
    });

    return conversions;
  }

  getBestRedemption(conversions) {
    return conversions.reduce((best, current) => 
      current.value > best.value ? current : best
    );
  }

  getWorstRedemption(conversions) {
    return conversions.reduce((worst, current) => 
      current.value < worst.value ? current : worst
    );
  }
}