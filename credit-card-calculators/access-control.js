/**
 * Access Control for Credit Card Calculators
 * Prevents direct access to calculator files
 */

(function() {
  'use strict';

  // Check if we're being accessed directly (not embedded in WordPress)
  function isDirectAccess() {
    // Check if we're in an iframe or embedded context
    if (window.self !== window.top) {
      return false; // We're in an iframe, likely embedded
    }

    // Check for WordPress indicators
    if (document.querySelector('body.wordpress') || 
        document.querySelector('#wpadminbar') ||
        window.wp || 
        document.querySelector('.elementor')) {
      return false; // WordPress environment detected
    }

    // Check referrer
    const referrer = document.referrer;
    const currentDomain = window.location.hostname;
    
    if (referrer && new URL(referrer).hostname === currentDomain) {
      return false; // Same domain referrer
    }

    // Check for specific WordPress query parameters or paths
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('elementor-preview') || 
        window.location.pathname.includes('/wp-content/') ||
        window.location.pathname.includes('/wp-admin/')) {
      return false; // WordPress context
    }

    return true; // Likely direct access
  }

  // Block direct access
  if (isDirectAccess()) {
    document.body.innerHTML = `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: #f8fafc;
        color: #334155;
        text-align: center;
        padding: 2rem;
      ">
        <div style="
          background: white;
          padding: 3rem;
          border-radius: 1rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          max-width: 500px;
        ">
          <div style="
            width: 64px;
            height: 64px;
            background: #fee2e2;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 1.5rem;
          ">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
          </div>
          <h1 style="
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 1rem;
            color: #1f2937;
          ">Access Restricted</h1>
          <p style="
            margin-bottom: 1.5rem;
            line-height: 1.6;
            color: #6b7280;
          ">
            This calculator is only available through WordPress pages. 
            Please access it through the proper website integration.
          </p>
          <p style="
            font-size: 0.875rem;
            color: #9ca3af;
          ">
            If you're a website administrator, please embed this calculator 
            using the provided WordPress integration methods.
          </p>
        </div>
      </div>
    `;
    
    // Prevent any scripts from running
    const scripts = document.querySelectorAll('script');
    scripts.forEach(script => {
      if (script.src && !script.src.includes('access-control.js')) {
        script.remove();
      }
    });
    
    return;
  }

  // If we reach here, access is allowed
  console.log('Calculator access granted - WordPress environment detected');
})();