# 🚀 WordPress Credit Card Calculator Setup

## 📁 Step 1: Upload Files

1. **Download** the `wordpress-upload` folder
2. **Upload** the entire `credit-card-calculators` folder to your **WordPress root directory** (where `wp-config.php` is located)

Your file structure should look like:
```
wordpress-root/
├── wp-config.php
├── wp-content/
├── credit-card-calculators/
│   ├── js/
│   │   ├── secure-proxy.js
│   │   ├── access-control.js
│   │   ├── sheets-api.js
│   │   ├── main-calculator.js
│   │   ├── airlines-calculator.js
│   │   ├── hotels-calculator.js
│   │   └── cash-calculator.js
│   ├── css/
│   │   ├── main-calculator.css
│   │   ├── airlines-calculator.css
│   │   ├── hotels-calculator.css
│   │   └── cash-calculator.css
│   └── html/
│       ├── main-calculator.html
│       ├── airlines-calculator.html
│       ├── hotels-calculator.html
│       └── cash-calculator.html
```

## 🔧 Step 2: Add PHP Code to WordPress

1. **Go to WordPress Admin → Appearance → Theme Editor**
2. **Select `functions.php`**
3. **Copy the ENTIRE content** from `functions.php` file in the upload folder
4. **Paste it at the END** of your theme's functions.php (before the closing `?>` if it exists)

## 🔑 Step 3: Get Google Sheets API Key

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** or select existing one
3. **Enable Google Sheets API**:
   - Go to "APIs & Services" → "Library"
   - Search for "Google Sheets API"
   - Click "Enable"
4. **Create API Key**:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - Copy the API key
5. **Make your Google Sheet public**:
   - Open your Google Sheet
   - Click "Share" → "Change to anyone with the link"
   - Set permission to "Viewer"

## ⚙️ Step 4: Configure WordPress Settings

1. **Go to WordPress Admin → Settings → Calculator Settings**
2. **Enter your Google Sheets API Key**
3. **Enter your Spreadsheet ID** (from the Google Sheet URL)
4. **Click "Save Settings"**

## 🎯 Step 5: Add to Elementor Pages

### Method 1: Using Shortcodes (Recommended)

Simply add these shortcodes to any page or post:

- **Main Calculator**: `[main_calculator]`
- **Airlines Calculator**: `[airlines_calculator]`
- **Hotels Calculator**: `[hotels_calculator]`
- **Cash Calculator**: `[cash_calculator]`

### Method 2: Using HTML Widget

Add an **HTML Widget** in Elementor and paste this code:

**For Main Calculator:**
```html
<div id="main-calculator-container"></div>
<script>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof ccalc_ajax !== 'undefined') {
        window.ccalc_nonce = ccalc_ajax.nonce;
    }
    
    fetch('/credit-card-calculators/html/main-calculator.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('main-calculator-container').innerHTML = html;
            
            // Load CSS
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/credit-card-calculators/css/main-calculator.css';
            document.head.appendChild(link);
            
            // Load scripts
            const secureProxy = document.createElement('script');
            secureProxy.src = '/credit-card-calculators/js/secure-proxy.js';
            document.head.appendChild(secureProxy);
            
            secureProxy.onload = function() {
                const mainScript = document.createElement('script');
                mainScript.type = 'module';
                mainScript.src = '/credit-card-calculators/js/main-calculator.js';
                document.head.appendChild(mainScript);
            };
        })
        .catch(error => {
            document.getElementById('main-calculator-container').innerHTML = 
                '<p style="text-align: center; color: #dc2626; padding: 2rem;">Calculator temporarily unavailable. Please refresh the page.</p>';
        });
});
</script>
```

**For Airlines Calculator:**
```html
<div id="airlines-calculator-container"></div>
<script>
document.addEventListener('DOMContentLoaded', function() {
    if (typeof ccalc_ajax !== 'undefined') {
        window.ccalc_nonce = ccalc_ajax.nonce;
    }
    
    fetch('/credit-card-calculators/html/airlines-calculator.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('airlines-calculator-container').innerHTML = html;
            
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = '/credit-card-calculators/css/airlines-calculator.css';
            document.head.appendChild(link);
            
            const secureProxy = document.createElement('script');
            secureProxy.src = '/credit-card-calculators/js/secure-proxy.js';
            document.head.appendChild(secureProxy);
            
            secureProxy.onload = function() {
                const mainScript = document.createElement('script');
                mainScript.type = 'module';
                mainScript.src = '/credit-card-calculators/js/airlines-calculator.js';
                document.head.appendChild(mainScript);
            };
        });
});
</script>
```

## 🔒 Security Features

✅ **API Keys Protected** - Never exposed to visitors  
✅ **Direct Access Blocked** - Calculator files return 403 errors  
✅ **WordPress-only Access** - Only works when embedded  
✅ **CSRF Protection** - Nonce security on all requests  

## 🚨 Troubleshooting

**Calculator not loading?**
- Check WordPress Admin → Calculator Settings
- Verify API key is entered correctly
- Check browser console for errors

**Access denied errors?**
- Make sure you're accessing through WordPress pages
- Clear browser cache

**API errors?**
- Verify Google Sheets API key is valid
- Check spreadsheet is publicly accessible

## ✅ You're Done!

Your calculators are now **100% secure** and ready to use! 🎉

The calculators will:
- ✅ Load securely through WordPress
- ✅ Block direct file access
- ✅ Keep API keys hidden
- ✅ Work perfectly in Elementor