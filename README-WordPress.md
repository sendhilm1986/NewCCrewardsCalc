# Credit Card Points Calculator - WordPress Integration

This calculator can be easily integrated into any WordPress site without requiring PHP plugins.

## Installation Steps

### 1. Upload Files to WordPress
1. Download/copy all the calculator files
2. Create a folder called ``` in your WordPress root directory (same level as wp-content)
3. Upload these files to the folder:
   - `style.css`
   - `main.js`
   - `calculator.js`
   - `sheets-api.js`
   - `wp-integration.js`

### 2. Integration Methods

#### Method 1: Using Elementor HTML Widget
1. In Elementor, add an **HTML Widget**
2. Paste this code:
```html
<div id="credit-card-calculator"></div>
<script src="/credit-card-calculator/wp-integration.js"></script>
```

#### Method 2: Using WordPress Code Snippets Plugin
1. Install the "Code Snippets" plugin
2. Add this code snippet:
```javascript
// Add to footer
function add_credit_card_calculator_script() {
    echo '<script src="/credit-card-calculator/wp-integration.js"></script>';
}
add_action('wp_footer', 'add_credit_card_calculator_script');
```

3. Then use this HTML anywhere you want the calculator:
```html
<div id="credit-card-calculator"></div>
```

#### Method 3: Manual JavaScript Integration
Add this to your theme's footer.php or use a plugin like "Insert Headers and Footers":

```html
<script src="/credit-card-calculator/wp-integration.js"></script>
<script>
// Initialize calculator on specific pages
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('my-calculator')) {
        initCreditCardCalculator('my-calculator');
    }
});
</script>
```

Then add this HTML where you want the calculator:
```html
<div id="my-calculator"></div>
```

### 3. Elementor Shortcode Method
1. Add this to your theme's functions.php:
```php
function credit_card_calculator_shortcode($atts) {
    $atts = shortcode_atts(array(
        'id' => 'credit-card-calculator-' . rand(1000, 9999)
    ), $atts);
    
    return '<div id="' . esc_attr($atts['id']) . '"></div>
            <script>
            if (typeof CreditCardCalculatorShortcode === "function") {
                CreditCardCalculatorShortcode("' . esc_attr($atts['id']) . '");
            } else {
                document.addEventListener("DOMContentLoaded", function() {
                    var script = document.createElement("script");
                    script.src = "/credit-card-calculator/wp-integration.js";
                    script.onload = function() {
                        CreditCardCalculatorShortcode("' . esc_attr($atts['id']) . '");
                    };
                    document.head.appendChild(script);
                });
            }
            </script>';
}
add_shortcode('credit_card_calculator', 'credit_card_calculator_shortcode');
```

2. Use the shortcode in Elementor:
```
[credit_card_calculator]
```

## Configuration Options

You can customize the calculator by passing options:

```javascript
initCreditCardCalculator('my-calculator', {
    assetsPath: '/my-custom-path/',  // Custom path to assets
    cssFile: 'custom-style.css',     // Custom CSS file
    jsFiles: ['calculator.js', 'main.js']  // Required JS files
});
```

## File Structure
```
wordpress-root/
├── credit-card-calculator/
│   ├── style.css
│   ├── main.js
│   ├── calculator.js
│   ├── sheets-api.js
│   ├── wp-integration.js
│   └── README-WordPress.md
```

## Google Sheets Integration

The calculator now pulls data from Google Sheets:
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

## Troubleshooting

1. **Calculator not loading**: Check browser console for errors and verify file paths
2. **Styling issues**: Ensure CSS file is loading correctly
3. **Path issues**: Adjust the `assetsPath` in the configuration
4. **Data not loading**: Check Google Sheets permissions and API key
5. **Fallback data**: If sheets fail, default cards will be shown

## Notes
- The calculator is fully self-contained and doesn't require any WordPress plugins
- It's responsive and works with all modern themes
- No database or server-side processing required
- Compatible with page builders like Elementor, Gutenberg, etc.