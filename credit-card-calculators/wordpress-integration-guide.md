# WordPress Integration Guide for Credit Card Points Calculators

This guide shows you how to integrate the Airlines, Hotels, and Cash calculators into WordPress using Elementor.

## 📁 File Structure

Upload these files to your WordPress site:

```
wordpress-root/
├── credit-card-calculators/
│   ├── shared/
│   │   └── sheets-api.jsx
│   ├── airlines/
│   │   ├── airlines-calculator.html
│   │   ├── airlines-calculator.css
│   │   └── airlines-calculator.js
│   ├── hotels/
│   │   ├── hotels-calculator.html
│   │   ├── hotels-calculator.css
│   │   └── hotels-calculator.js
│   ├── cash/
│   │   ├── cash-calculator.html
│   │   ├── cash-calculator.css
│   │   └── cash-calculator.js
│   └── wordpress-integration-guide.md
```

## 🚀 Integration Methods

### Method 1: Elementor HTML Widget (Recommended)

1. **In Elementor, add an HTML Widget**
2. **Paste the appropriate code:**

#### For Airlines Calculator:
```html
<div id="airlines-calculator-container"></div>
<link rel="stylesheet" href="/credit-card-calculators/airlines/airlines-calculator.css">
<script type="module">
  import('/credit-card-calculators/airlines/airlines-calculator.js');
  
  // Load the HTML content
  fetch('/credit-card-calculators/airlines/airlines-calculator.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const calculatorContent = doc.querySelector('#airlines-calculator');
      document.getElementById('airlines-calculator-container').appendChild(calculatorContent);
    });
</script>
```

#### For Hotels Calculator:
```html
<div id="hotels-calculator-container"></div>
<link rel="stylesheet" href="/credit-card-calculators/hotels/hotels-calculator.css">
<script type="module">
  import('/credit-card-calculators/hotels/hotels-calculator.js');
  
  // Load the HTML content
  fetch('/credit-card-calculators/hotels/hotels-calculator.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const calculatorContent = doc.querySelector('#hotels-calculator');
      document.getElementById('hotels-calculator-container').appendChild(calculatorContent);
    });
</script>
```

#### For Cash Calculator:
```html
<div id="cash-calculator-container"></div>
<link rel="stylesheet" href="/credit-card-calculators/cash/cash-calculator.css">
<script type="module">
  import('/credit-card-calculators/cash/cash-calculator.js');
  
  // Load the HTML content
  fetch('/credit-card-calculators/cash/cash-calculator.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const calculatorContent = doc.querySelector('#cash-calculator');
      document.getElementById('cash-calculator-container').appendChild(calculatorContent);
    });
</script>
```

### Method 2: WordPress Shortcodes

1. **Add this to your theme's functions.php:**

```php
// Airlines Calculator Shortcode
function airlines_calculator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'id' => 'airlines-calculator-' . rand(1000, 9999)
    ), $atts);
    
    return '<div id="' . esc_attr($atts['id']) . '-container"></div>
            <link rel="stylesheet" href="/credit-card-calculators/airlines/airlines-calculator.css">
            <script type="module">
                import("/credit-card-calculators/airlines/airlines-calculator.js");
                fetch("/credit-card-calculators/airlines/airlines-calculator.html")
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, "text/html");
                        const calculatorContent = doc.querySelector("#airlines-calculator");
                        document.getElementById("' . esc_attr($atts['id']) . '-container").appendChild(calculatorContent);
                    });
            </script>';
}
add_shortcode('airlines_calculator', 'airlines_calculator_shortcode');

// Hotels Calculator Shortcode
function hotels_calculator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'id' => 'hotels-calculator-' . rand(1000, 9999)
    ), $atts);
    
    return '<div id="' . esc_attr($atts['id']) . '-container"></div>
            <link rel="stylesheet" href="/credit-card-calculators/hotels/hotels-calculator.css">
            <script type="module">
                import("/credit-card-calculators/hotels/hotels-calculator.js");
                fetch("/credit-card-calculators/hotels/hotels-calculator.html")
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, "text/html");
                        const calculatorContent = doc.querySelector("#hotels-calculator");
                        document.getElementById("' . esc_attr($atts['id']) . '-container").appendChild(calculatorContent);
                    });
            </script>';
}
add_shortcode('hotels_calculator', 'hotels_calculator_shortcode');

// Cash Calculator Shortcode
function cash_calculator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'id' => 'cash-calculator-' . rand(1000, 9999)
    ), $atts);
    
    return '<div id="' . esc_attr($atts['id']) . '-container"></div>
            <link rel="stylesheet" href="/credit-card-calculators/cash/cash-calculator.css">
            <script type="module">
                import("/credit-card-calculators/cash/cash-calculator.js");
                fetch("/credit-card-calculators/cash/cash-calculator.html")
                    .then(response => response.text())
                    .then(html => {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(html, "text/html");
                        const calculatorContent = doc.querySelector("#cash-calculator");
                        document.getElementById("' . esc_attr($atts['id']) . '-container").appendChild(calculatorContent);
                    });
            </script>';
}
add_shortcode('cash_calculator', 'cash_calculator_shortcode');
```

2. **Use the shortcodes in Elementor:**
   - `[airlines_calculator]`
   - `[hotels_calculator]`
   - `[cash_calculator]`

## 🎨 Customization

### Custom Styling
You can override the default styles by adding custom CSS in Elementor or your theme:

```css
/* Custom styling for calculators */
.calculator-container {
    max-width: 1000px; /* Adjust width */
    margin: 2rem auto;  /* Adjust spacing */
}

.calculator-header {
    background: linear-gradient(135deg, #your-color-1, #your-color-2);
}

/* Customize colors for each calculator */
#airlines-calculator {
    --primary-500: #your-airlines-color;
}

#hotels-calculator {
    --primary-500: #your-hotels-color;
}

#cash-calculator {
    --primary-500: #your-cash-color;
}
```

## 📊 Google Sheets Integration

The calculators automatically pull data from Google Sheets:
- **Spreadsheet ID**: `1QznZhNzCxeijnnct6n_eauTtHElBlW25c2iQMmWRiUY`
- **API Key**: Built-in (no setup required)
- **Sheets**: Airlines, Hotels, Cash
- **Auto-refresh**: Data is cached for 5 minutes

### Sheet Structure
- **Column A**: Reward Program names
- **Column B**: Point names (e.g., "SkyPoints")
- **Column C+**: Credit card columns with conversion rates
- **Row 1**: Bank names
- **Row 2**: Card names
- **Row 3+**: Conversion values

## 📱 Responsive Design

All calculators are fully responsive and work on:
- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (320px - 767px)

## 🔧 Troubleshooting

### Common Issues:

1. **Calculator not loading**
   - Check browser console for errors
   - Verify file paths are correct
   - Ensure files are uploaded to the right directory

2. **Styling issues**
   - Check if CSS file is loading
   - Look for theme conflicts
   - Try adding `!important` to custom styles

3. **Data not loading**
   - Check Google Sheets permissions
   - Verify API key is working
   - Check browser network tab for failed requests

4. **Mobile display issues**
   - Ensure viewport meta tag is present
   - Check for theme CSS conflicts
   - Test on actual devices

### Debug Mode:
Open browser console (F12) to see detailed logs about:
- Card loading process
- API calls to Google Sheets
- Program filtering
- Conversion value calculations

## 🚀 Performance Tips

1. **Lazy Loading**: Calculators only load when needed
2. **Caching**: Google Sheets data is cached for 5 minutes
3. **Minification**: Consider minifying CSS/JS for production
4. **CDN**: Use a CDN for faster file delivery

## 📞 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all files are uploaded correctly
3. Test with default WordPress theme to rule out conflicts
4. Ensure your hosting supports ES6 modules

## 🎯 Features

### Airlines Calculator:
- ✈️ Airline-specific theming (blue colors)
- 🎯 Focuses on airline redemption programs
- 📊 Shows airline miles and transfer partner values

### Hotels Calculator:
- 🏨 Hotel-specific theming (green/orange colors)
- 🎯 Focuses on hotel redemption programs
- 📊 Shows hotel points and free night values

### Cash Calculator:
- 💰 Cash-specific theming (yellow/green colors)
- 🎯 Focuses on cash redemption options
- 📊 Shows statement credits and gift card values

All calculators share the same robust functionality with category-specific optimizations!