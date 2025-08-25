# WordPress Elementor Integration Guide

This guide shows you how to integrate the Credit Card Points Calculators into WordPress using Elementor.

## 📁 File Upload Instructions

### Step 1: Upload Calculator Files to WordPress

1. **Access your WordPress files** via FTP, cPanel File Manager, or hosting control panel
2. **Navigate to your WordPress root directory** (where `wp-config.php` is located)
3. **Create a new folder** called `credit-card-calculators`
4. **Upload all calculator files** maintaining the folder structure:

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
│   ├── main.js
│   ├── style.css
│   └── index.html
```

## 🚀 Integration Methods

### Method 1: Elementor HTML Widget (Recommended)

#### For Main Unified Calculator:
1. **Add HTML Widget** in Elementor
2. **Paste this code**:

```html
<div id="main-calculator-container"></div>
<link rel="stylesheet" href="/credit-card-calculators/style.css">
<script type="module">
  // Load the main calculator HTML content
  fetch('/credit-card-calculators/index.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const calculatorContent = doc.querySelector('body').innerHTML;
      document.getElementById('main-calculator-container').innerHTML = calculatorContent;
      
      // Load the JavaScript after HTML is inserted
      import('/credit-card-calculators/main.js');
    })
    .catch(error => {
      console.error('Error loading calculator:', error);
      document.getElementById('main-calculator-container').innerHTML = 
        '<p style="text-align: center; color: #dc2626; padding: 2rem;">Error loading calculator. Please refresh the page.</p>';
    });
</script>
```

#### For Airlines Calculator:
1. **Add HTML Widget** in Elementor
2. **Paste this code**:

```html
<div id="airlines-calculator-container"></div>
<link rel="stylesheet" href="/credit-card-calculators/airlines/airlines-calculator.css">
<script type="module">
  // Load the airlines calculator HTML content
  fetch('/credit-card-calculators/airlines/airlines-calculator.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const calculatorContent = doc.querySelector('#airlines-calculator').outerHTML;
      document.getElementById('airlines-calculator-container').innerHTML = calculatorContent;
      
      // Load the JavaScript after HTML is inserted
      import('/credit-card-calculators/airlines/airlines-calculator.js');
    })
    .catch(error => {
      console.error('Error loading airlines calculator:', error);
      document.getElementById('airlines-calculator-container').innerHTML = 
        '<p style="text-align: center; color: #dc2626; padding: 2rem;">Error loading airlines calculator. Please refresh the page.</p>';
    });
</script>
```

#### For Hotels Calculator:
1. **Add HTML Widget** in Elementor
2. **Paste this code**:

```html
<div id="hotels-calculator-container"></div>
<link rel="stylesheet" href="/credit-card-calculators/hotels/hotels-calculator.css">
<script type="module">
  // Load the hotels calculator HTML content
  fetch('/credit-card-calculators/hotels/hotels-calculator.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const calculatorContent = doc.querySelector('#hotels-calculator').outerHTML;
      document.getElementById('hotels-calculator-container').innerHTML = calculatorContent;
      
      // Load the JavaScript after HTML is inserted
      import('/credit-card-calculators/hotels/hotels-calculator.js');
    })
    .catch(error => {
      console.error('Error loading hotels calculator:', error);
      document.getElementById('hotels-calculator-container').innerHTML = 
        '<p style="text-align: center; color: #dc2626; padding: 2rem;">Error loading hotels calculator. Please refresh the page.</p>';
    });
</script>
```

#### For Cash Calculator:
1. **Add HTML Widget** in Elementor
2. **Paste this code**:

```html
<div id="cash-calculator-container"></div>
<link rel="stylesheet" href="/credit-card-calculators/cash/cash-calculator.css">
<script type="module">
  // Load the cash calculator HTML content
  fetch('/credit-card-calculators/cash/cash-calculator.html')
    .then(response => response.text())
    .then(html => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const calculatorContent = doc.querySelector('#cash-calculator').outerHTML;
      document.getElementById('cash-calculator-container').innerHTML = calculatorContent;
      
      // Load the JavaScript after HTML is inserted
      import('/credit-card-calculators/cash/cash-calculator.js');
    })
    .catch(error => {
      console.error('Error loading cash calculator:', error);
      document.getElementById('cash-calculator-container').innerHTML = 
        '<p style="text-align: center; color: #dc2626; padding: 2rem;">Error loading cash calculator. Please refresh the page.</p>';
    });
</script>
```

### Method 2: WordPress Shortcodes

#### Step 1: Add to functions.php
Add this code to your theme's `functions.php` file:

```php
<?php
// Main Calculator Shortcode
function main_calculator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'id' => 'main-calculator-' . rand(1000, 9999)
    ), $atts);
    
    ob_start();
    ?>
    <div id="<?php echo esc_attr($atts['id']); ?>-container"></div>
    <link rel="stylesheet" href="/credit-card-calculators/style.css">
    <script type="module">
        fetch('/credit-card-calculators/index.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const calculatorContent = doc.querySelector('body').innerHTML;
                document.getElementById('<?php echo esc_attr($atts['id']); ?>-container').innerHTML = calculatorContent;
                import('/credit-card-calculators/main.js');
            })
            .catch(error => {
                console.error('Error loading calculator:', error);
                document.getElementById('<?php echo esc_attr($atts['id']); ?>-container').innerHTML = 
                    '<p style="text-align: center; color: #dc2626; padding: 2rem;">Error loading calculator. Please refresh the page.</p>';
            });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('main_calculator', 'main_calculator_shortcode');

// Airlines Calculator Shortcode
function airlines_calculator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'id' => 'airlines-calculator-' . rand(1000, 9999)
    ), $atts);
    
    ob_start();
    ?>
    <div id="<?php echo esc_attr($atts['id']); ?>-container"></div>
    <link rel="stylesheet" href="/credit-card-calculators/airlines/airlines-calculator.css">
    <script type="module">
        fetch('/credit-card-calculators/airlines/airlines-calculator.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const calculatorContent = doc.querySelector('#airlines-calculator').outerHTML;
                document.getElementById('<?php echo esc_attr($atts['id']); ?>-container').innerHTML = calculatorContent;
                import('/credit-card-calculators/airlines/airlines-calculator.js');
            })
            .catch(error => {
                console.error('Error loading airlines calculator:', error);
                document.getElementById('<?php echo esc_attr($atts['id']); ?>-container').innerHTML = 
                    '<p style="text-align: center; color: #dc2626; padding: 2rem;">Error loading airlines calculator. Please refresh the page.</p>';
            });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('airlines_calculator', 'airlines_calculator_shortcode');

// Hotels Calculator Shortcode
function hotels_calculator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'id' => 'hotels-calculator-' . rand(1000, 9999)
    ), $atts);
    
    ob_start();
    ?>
    <div id="<?php echo esc_attr($atts['id']); ?>-container"></div>
    <link rel="stylesheet" href="/credit-card-calculators/hotels/hotels-calculator.css">
    <script type="module">
        fetch('/credit-card-calculators/hotels/hotels-calculator.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const calculatorContent = doc.querySelector('#hotels-calculator').outerHTML;
                document.getElementById('<?php echo esc_attr($atts['id']); ?>-container').innerHTML = calculatorContent;
                import('/credit-card-calculators/hotels/hotels-calculator.js');
            })
            .catch(error => {
                console.error('Error loading hotels calculator:', error);
                document.getElementById('<?php echo esc_attr($atts['id']); ?>-container').innerHTML = 
                    '<p style="text-align: center; color: #dc2626; padding: 2rem;">Error loading hotels calculator. Please refresh the page.</p>';
            });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('hotels_calculator', 'hotels_calculator_shortcode');

// Cash Calculator Shortcode
function cash_calculator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'id' => 'cash-calculator-' . rand(1000, 9999)
    ), $atts);
    
    ob_start();
    ?>
    <div id="<?php echo esc_attr($atts['id']); ?>-container"></div>
    <link rel="stylesheet" href="/credit-card-calculators/cash/cash-calculator.css">
    <script type="module">
        fetch('/credit-card-calculators/cash/cash-calculator.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const calculatorContent = doc.querySelector('#cash-calculator').outerHTML;
                document.getElementById('<?php echo esc_attr($atts['id']); ?>-container').innerHTML = calculatorContent;
                import('/credit-card-calculators/cash/cash-calculator.js');
            })
            .catch(error => {
                console.error('Error loading cash calculator:', error);
                document.getElementById('<?php echo esc_attr($atts['id']); ?>-container').innerHTML = 
                    '<p style="text-align: center; color: #dc2626; padding: 2rem;">Error loading cash calculator. Please refresh the page.</p>';
            });
    </script>
    <?php
    return ob_get_clean();
}
add_shortcode('cash_calculator', 'cash_calculator_shortcode');
?>
```

#### Step 2: Use Shortcodes in Elementor
Add a **Shortcode Widget** in Elementor and use:

- `[main_calculator]` - For the unified calculator
- `[airlines_calculator]` - For airlines calculator
- `[hotels_calculator]` - For hotels calculator  
- `[cash_calculator]` - For cash calculator

### Method 3: Direct iframe Embedding

For a simpler approach, you can use iframes:

```html
<!-- Main Calculator -->
<iframe src="/credit-card-calculators/index.html" 
        width="100%" 
        height="800" 
        frameborder="0" 
        style="border: none; border-radius: 8px;">
</iframe>

<!-- Airlines Calculator -->
<iframe src="/credit-card-calculators/airlines/airlines-calculator.html" 
        width="100%" 
        height="800" 
        frameborder="0" 
        style="border: none; border-radius: 8px;">
</iframe>

<!-- Hotels Calculator -->
<iframe src="/credit-card-calculators/hotels/hotels-calculator.html" 
        width="100%" 
        height="800" 
        frameborder="0" 
        style="border: none; border-radius: 8px;">
</iframe>

<!-- Cash Calculator -->
<iframe src="/credit-card-calculators/cash/cash-calculator.html" 
        width="100%" 
        height="800" 
        frameborder="0" 
        style="border: none; border-radius: 8px;">
</iframe>
```

## 🎨 Styling Integration

### Custom CSS for WordPress Themes
Add this CSS to your theme's Additional CSS or child theme:

```css
/* Calculator Container Styling */
.elementor-widget-html [id*="calculator-container"] {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
}

/* Remove default margins that might conflict */
.elementor-widget-html [id*="calculator-container"] * {
    box-sizing: border-box;
}

/* Ensure responsive behavior */
@media (max-width: 768px) {
    .elementor-widget-html [id*="calculator-container"] {
        padding: 0 1rem;
    }
}

/* Override theme styles if needed */
.elementor-widget-html [id*="calculator-container"] input,
.elementor-widget-html [id*="calculator-container"] button {
    font-family: inherit;
    outline: none;
}
```

## 🔧 Configuration

### Google Sheets API Setup
1. **Get API Key**: Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable Sheets API**: Enable Google Sheets API for your project
3. **Update API Key**: Replace `'YOUR_GOOGLE_SHEETS_API_KEY'` in `/credit-card-calculators/shared/sheets-api.jsx`
4. **Make Sheet Public**: Ensure your Google Sheet is publicly accessible

### Customization Options
You can customize colors by adding CSS variables:

```css
:root {
    --primary-500: #your-brand-color;
    --secondary-500: #your-accent-color;
    --neutral-900: #your-text-color;
}
```

## 📱 Responsive Design

All calculators are fully responsive and work on:
- ✅ **Desktop** (1200px+)
- ✅ **Tablet** (768px - 1199px)  
- ✅ **Mobile** (320px - 767px)

## 🚨 Troubleshooting

### Common Issues:

1. **Calculator not loading**
   - Check file paths are correct
   - Verify files uploaded to right directory
   - Check browser console for errors

2. **Styling conflicts**
   - Add CSS specificity with `!important`
   - Use the custom CSS provided above
   - Check for theme conflicts

3. **API errors**
   - Verify Google Sheets API key is valid
   - Check sheet permissions
   - Ensure sheet is publicly accessible

4. **Mobile display issues**
   - Test on actual devices
   - Check viewport meta tag
   - Verify responsive CSS is loading

## 🎯 Best Practices

1. **Performance**: Calculators load asynchronously to avoid blocking page load
2. **Error Handling**: Built-in fallback data if API fails
3. **Caching**: Google Sheets data cached for 5 minutes
4. **SEO Friendly**: No impact on page SEO or loading speed
5. **Theme Compatible**: Works with any WordPress theme

## 📞 Support

If you encounter issues:
1. Check browser console for error messages
2. Verify all files uploaded correctly
3. Test with default WordPress theme to rule out conflicts
4. Ensure hosting supports ES6 modules

The calculators are now ready for seamless WordPress Elementor integration! 🚀