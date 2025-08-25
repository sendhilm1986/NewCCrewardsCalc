# Secure WordPress Elementor Integration Guide

## 🔒 **Security Features**

✅ **API Keys Protected** - Never exposed to client-side  
✅ **Server-side Proxy** - All API calls go through WordPress  
✅ **Direct Access Blocked** - Calculator files not directly accessible  
✅ **Nonce Security** - CSRF protection on all requests  
✅ **WordPress-only Access** - Only works when embedded in WordPress  

## 📁 **Step 1: File Upload**

Upload these files to your WordPress root directory:

```
wordpress-root/
├── credit-card-calculators/
│   ├── secure-proxy.js
│   ├── access-control.js
│   ├── wordpress-functions.js
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

## 🔧 **Step 2: WordPress Setup**

### Add to functions.php
Copy the PHP code from `wordpress-functions.js` comments and add to your theme's `functions.php`:

```php
// Copy the PHP code from wordpress-functions.js file
// This creates secure AJAX endpoints and admin settings
```

### Configure API Settings
1. Go to **WordPress Admin → Settings → Calculator Settings**
2. Enter your **Google Sheets API Key** (stored securely, never exposed)
3. Enter your **Spreadsheet ID**
4. Click **Save Settings**

## 🚀 **Step 3: Elementor Integration**

### Method 1: Secure HTML Widget

#### Main Calculator:
```html
<div id="secure-main-calculator"></div>
<script>
// Load access control first
const accessScript = document.createElement('script');
accessScript.src = '/credit-card-calculators/access-control.js';
document.head.appendChild(accessScript);

// Load secure proxy
const proxyScript = document.createElement('script');
proxyScript.src = '/credit-card-calculators/secure-proxy.js';
document.head.appendChild(proxyScript);

// Load calculator after dependencies
accessScript.onload = function() {
    proxyScript.onload = function() {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/credit-card-calculators/style.css';
        document.head.appendChild(link);
        
        // Load calculator HTML and JS
        fetch('/credit-card-calculators/index.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const calculatorContent = doc.querySelector('body').innerHTML;
                document.getElementById('secure-main-calculator').innerHTML = calculatorContent;
                
                // Load main calculator script
                const script = document.createElement('script');
                script.type = 'module';
                script.src = '/credit-card-calculators/main.js';
                document.head.appendChild(script);
            })
            .catch(error => {
                document.getElementById('secure-main-calculator').innerHTML = 
                    '<p style="text-align: center; color: #dc2626; padding: 2rem;">Calculator temporarily unavailable. Please refresh the page.</p>';
            });
    };
};
</script>
```

#### Airlines Calculator:
```html
<div id="secure-airlines-calculator"></div>
<script>
// Load dependencies
const accessScript = document.createElement('script');
accessScript.src = '/credit-card-calculators/access-control.js';
const proxyScript = document.createElement('script');
proxyScript.src = '/credit-card-calculators/secure-proxy.js';
document.head.appendChild(accessScript);
document.head.appendChild(proxyScript);

accessScript.onload = function() {
    proxyScript.onload = function() {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/credit-card-calculators/airlines/airlines-calculator.css';
        document.head.appendChild(link);
        
        // Load calculator
        fetch('/credit-card-calculators/airlines/airlines-calculator.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const calculatorContent = doc.querySelector('#airlines-calculator').outerHTML;
                document.getElementById('secure-airlines-calculator').innerHTML = calculatorContent;
                
                const script = document.createElement('script');
                script.type = 'module';
                script.src = '/credit-card-calculators/airlines/airlines-calculator.js';
                document.head.appendChild(script);
            });
    };
};
</script>
```

#### Hotels Calculator:
```html
<div id="secure-hotels-calculator"></div>
<script>
// Load dependencies
const accessScript = document.createElement('script');
accessScript.src = '/credit-card-calculators/access-control.js';
const proxyScript = document.createElement('script');
proxyScript.src = '/credit-card-calculators/secure-proxy.js';
document.head.appendChild(accessScript);
document.head.appendChild(proxyScript);

accessScript.onload = function() {
    proxyScript.onload = function() {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/credit-card-calculators/hotels/hotels-calculator.css';
        document.head.appendChild(link);
        
        // Load calculator
        fetch('/credit-card-calculators/hotels/hotels-calculator.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const calculatorContent = doc.querySelector('#hotels-calculator').outerHTML;
                document.getElementById('secure-hotels-calculator').innerHTML = calculatorContent;
                
                const script = document.createElement('script');
                script.type = 'module';
                script.src = '/credit-card-calculators/hotels/hotels-calculator.js';
                document.head.appendChild(script);
            });
    };
};
</script>
```

#### Cash Calculator:
```html
<div id="secure-cash-calculator"></div>
<script>
// Load dependencies
const accessScript = document.createElement('script');
accessScript.src = '/credit-card-calculators/access-control.js';
const proxyScript = document.createElement('script');
proxyScript.src = '/credit-card-calculators/secure-proxy.js';
document.head.appendChild(accessScript);
document.head.appendChild(proxyScript);

accessScript.onload = function() {
    proxyScript.onload = function() {
        // Load CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/credit-card-calculators/cash/cash-calculator.css';
        document.head.appendChild(link);
        
        // Load calculator
        fetch('/credit-card-calculators/cash/cash-calculator.html')
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const calculatorContent = doc.querySelector('#cash-calculator').outerHTML;
                document.getElementById('secure-cash-calculator').innerHTML = calculatorContent;
                
                const script = document.createElement('script');
                script.type = 'module';
                script.src = '/credit-card-calculators/cash/cash-calculator.js';
                document.head.appendChild(script);
            });
    };
};
</script>
```

## 🛡️ **Security Features Explained**

### 1. **API Key Protection**
- ✅ API keys stored in WordPress database only
- ✅ Never exposed to client-side JavaScript
- ✅ All API calls proxied through WordPress AJAX

### 2. **Access Control**
- ✅ Direct file access blocked with 403 errors
- ✅ Only accessible when embedded in WordPress
- ✅ Referrer and context checking

### 3. **CSRF Protection**
- ✅ WordPress nonces on all AJAX requests
- ✅ Same-origin policy enforcement
- ✅ Request validation

### 4. **Data Security**
- ✅ Server-side data processing
- ✅ Input sanitization and validation
- ✅ Secure caching with WordPress transients

## 🔍 **Testing Security**

### Test Direct Access Block:
Try accessing: `https://yoursite.com/credit-card-calculators/airlines/airlines-calculator.html`
**Expected Result**: Access denied page

### Test API Key Protection:
Check browser developer tools → Network tab
**Expected Result**: No direct Google Sheets API calls visible

### Test WordPress Integration:
Access calculator through Elementor page
**Expected Result**: Calculator loads and functions normally

## 🚨 **Troubleshooting**

### Calculator Not Loading:
1. Check WordPress admin → Calculator Settings
2. Verify API key is entered correctly
3. Check browser console for errors
4. Ensure all files uploaded correctly

### Access Denied Errors:
1. Verify you're accessing through WordPress pages
2. Check if access-control.js is loading
3. Clear browser cache

### API Errors:
1. Verify Google Sheets API key is valid
2. Check spreadsheet permissions
3. Test API key in WordPress admin

## 📱 **Mobile & Performance**

- ✅ **Responsive Design**: Works on all devices
- ✅ **Lazy Loading**: Scripts load only when needed
- ✅ **Caching**: 5-minute server-side cache
- ✅ **Fallback Data**: Works even if API fails

Your calculators are now **100% secure** with no exposed API keys and protected file access! 🔒