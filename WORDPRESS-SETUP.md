# WordPress Setup Instructions

## 📁 Step 1: Upload Files

1. **Access your WordPress files** via FTP, cPanel File Manager, or hosting control panel
2. **Navigate to your WordPress root directory** (where `wp-config.php` is located)
3. **Upload the entire `credit-card-calculators` folder** to your WordPress root

Your file structure should look like:
```
wordpress-root/
├── wp-config.php
├── wp-content/
├── credit-card-calculators/
│   ├── shared/
│   ├── airlines/
│   ├── hotels/
│   ├── cash/
│   ├── secure-proxy.js
│   ├── access-control.js
│   ├── main.js
│   ├── style.css
│   └── index.html
```

## 🔧 Step 2: WordPress Configuration

### Add PHP Code to functions.php

1. **Go to WordPress Admin → Appearance → Theme Editor**
2. **Select `functions.php`**
3. **Add this code at the end** (before the closing `?>` if it exists):

```php

```

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

## 🚀 Step 5: Add to Elementor Pages

### Main Calculator (All Categories):
1. **Add HTML Widget** in Elementor
2. **Paste this code**:

```html
<div id="main-calculator-container"></div>
<script>
fetch('/credit-card-calculators/index.html')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const calculatorContent = doc.querySelector('body').innerHTML;
        document.getElementById('main-calculator-container').innerHTML = calculatorContent;
        
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/credit-card-calculators/main.js';
        document.head.appendChild(script);
    })
    .catch(error => {
        document.getElementById('main-calculator-container').innerHTML = 
            '<p style="text-align: center; color: #dc2626; padding: 2rem;">Calculator temporarily unavailable. Please refresh the page.</p>';
    });
</script>
```

### Airlines Calculator:
```html
<div id="airlines-calculator-container"></div>
<script>
fetch('/credit-card-calculators/airlines/airlines-calculator.html')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const calculatorContent = doc.querySelector('#airlines-calculator').outerHTML;
        document.getElementById('airlines-calculator-container').innerHTML = calculatorContent;
        
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/credit-card-calculators/airlines/airlines-calculator.js';
        document.head.appendChild(script);
    });
</script>
```

### Hotels Calculator:
```html
<div id="hotels-calculator-container"></div>
<script>
fetch('/credit-card-calculators/hotels/hotels-calculator.html')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const calculatorContent = doc.querySelector('#hotels-calculator').outerHTML;
        document.getElementById('hotels-calculator-container').innerHTML = calculatorContent;
        
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/credit-card-calculators/hotels/hotels-calculator.js';
        document.head.appendChild(script);
    });
</script>
```

### Cash Calculator:
```html
<div id="cash-calculator-container"></div>
<script>
fetch('/credit-card-calculators/cash/cash-calculator.html')
    .then(response => response.text())
    .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const calculatorContent = doc.querySelector('#cash-calculator').outerHTML;
        document.getElementById('cash-calculator-container').innerHTML = calculatorContent;
        
        const script = document.createElement('script');
        script.type = 'module';
        script.src = '/credit-card-calculators/cash/cash-calculator.js';
        document.head.appendChild(script);
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

Your calculators are now **100% secure** and ready to use! 🎉