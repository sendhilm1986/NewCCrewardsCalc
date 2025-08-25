<?php
/**
 * Secure Credit Card Calculators WordPress Integration
 * Add this code to your theme's functions.php file
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Secure AJAX handler for calculator data
add_action('wp_ajax_ccalc_get_data', 'ccalc_handle_sheet_request');
add_action('wp_ajax_nopriv_ccalc_get_data', 'ccalc_handle_sheet_request');

function ccalc_handle_sheet_request() {
    // Verify nonce for security
    if (!wp_verify_nonce($_POST['nonce'], 'ccalc_nonce')) {
        wp_send_json_error('Security check failed');
        return;
    }
    
    $sheet_name = sanitize_text_field($_POST['sheet_name']);
    $cache_key = 'ccalc_sheet_' . $sheet_name;
    
    // Check cache first (5 minutes)
    $cached_data = get_transient($cache_key);
    if ($cached_data !== false) {
        wp_send_json_success($cached_data);
        return;
    }
    
    // Get API key from WordPress options (set in admin)
    $api_key = get_option('ccalc_google_api_key', '');
    $spreadsheet_id = get_option('ccalc_spreadsheet_id', '1QznZhNzCxeijnnct6n_eauTtHElBlW25c2iQMmWRiUY');
    
    if (empty($api_key)) {
        wp_send_json_error('API key not configured');
        return;
    }
    
    // Fetch from Google Sheets API server-side
    $range = $sheet_name . '!A1:Z1000';
    $url = "https://sheets.googleapis.com/v4/spreadsheets/{$spreadsheet_id}/values/{$range}?key={$api_key}";
    
    $response = wp_remote_get($url);
    
    if (is_wp_error($response)) {
        wp_send_json_error('Failed to fetch data');
        return;
    }
    
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    
    if (!isset($data['values'])) {
        wp_send_json_error('Invalid data format');
        return;
    }
    
    // Process the data
    $processed_data = ccalc_process_sheet_data($data['values']);
    
    // Cache for 5 minutes
    set_transient($cache_key, $processed_data, 5 * MINUTE_IN_SECONDS);
    
    wp_send_json_success($processed_data);
}

function ccalc_process_sheet_data($raw_data) {
    if (count($raw_data) < 3) {
        return array('creditCards' => array(), 'rewardPrograms' => array());
    }
    
    $credit_cards = array();
    $reward_programs = array();
    
    $bank_row = isset($raw_data[0]) ? $raw_data[0] : array();
    $card_row = isset($raw_data[1]) ? $raw_data[1] : array();
    
    // Extract credit cards
    for ($col = 2; $col < max(count($bank_row), count($card_row)); $col++) {
        $bank_name = isset($bank_row[$col]) ? trim($bank_row[$col]) : '';
        $card_name = isset($card_row[$col]) ? trim($card_row[$col]) : '';
        
        if (!empty($bank_name) || !empty($card_name)) {
            $card_id = ccalc_create_card_id($bank_name, $card_name);
            $credit_cards[] = array(
                'id' => $card_id,
                'bank' => $bank_name,
                'name' => $card_name,
                'column' => $col
            );
        }
    }
    
    // Extract reward programs
    for ($row = 2; $row < count($raw_data); $row++) {
        $row_data = isset($raw_data[$row]) ? $raw_data[$row] : array();
        $program_name = isset($row_data[0]) ? trim($row_data[0]) : '';
        $point_name = isset($row_data[1]) ? trim($row_data[1]) : '';
        
        if (!empty($program_name)) {
            $program = array(
                'id' => 'program_' . $row,
                'name' => $program_name,
                'pointName' => !empty($point_name) ? $point_name : $program_name,
                'values' => array()
            );
            
            foreach ($credit_cards as $card) {
                $raw_value = isset($row_data[$card['column']]) ? $row_data[$card['column']] : '';
                if (!empty($raw_value)) {
                    $clean_value = preg_replace('/[₹$,\s]/', '', $raw_value);
                    $num_value = floatval($clean_value);
                    if ($num_value > 0) {
                        $program['values'][$card['id']] = $num_value;
                    }
                }
            }
            
            $reward_programs[] = $program;
        }
    }
    
    return array('creditCards' => $credit_cards, 'rewardPrograms' => $reward_programs);
}

function ccalc_create_card_id($bank_name, $card_name) {
    $normalize_text = function($text) {
        return preg_replace('/[^a-z0-9_]/', '', 
               preg_replace('/_+/', '_', 
               preg_replace('/\s+/', '_', 
               strtolower(trim($text)))));
    };
    
    $normalized_bank = $normalize_text($bank_name);
    $normalized_card = $normalize_text($card_name);
    
    return $normalized_bank . '_' . $normalized_card;
}

// Enqueue nonce for AJAX security
add_action('wp_enqueue_scripts', 'ccalc_enqueue_scripts');
function ccalc_enqueue_scripts() {
    wp_localize_script('jquery', 'ccalc_ajax', array(
        'nonce' => wp_create_nonce('ccalc_nonce')
    ));
}

// Add admin page for API key configuration
add_action('admin_menu', 'ccalc_add_admin_menu');
function ccalc_add_admin_menu() {
    add_options_page(
        'Calculator Settings',
        'Calculator Settings', 
        'manage_options',
        'ccalc-settings',
        'ccalc_admin_page'
    );
}

function ccalc_admin_page() {
    if (isset($_POST['submit'])) {
        update_option('ccalc_google_api_key', sanitize_text_field($_POST['api_key']));
        update_option('ccalc_spreadsheet_id', sanitize_text_field($_POST['spreadsheet_id']));
        echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
    }
    
    $api_key = get_option('ccalc_google_api_key', '');
    $spreadsheet_id = get_option('ccalc_spreadsheet_id', '1QznZhNzCxeijnnct6n_eauTtHElBlW25c2iQMmWRiUY');
    ?>
    <div class="wrap">
        <h1>Calculator Settings</h1>
        <form method="post">
            <table class="form-table">
                <tr>
                    <th scope="row">Google Sheets API Key</th>
                    <td>
                        <input type="password" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                        <p class="description">Enter your Google Sheets API key. This is stored securely and never exposed to visitors.</p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">Spreadsheet ID</th>
                    <td>
                        <input type="text" name="spreadsheet_id" value="<?php echo esc_attr($spreadsheet_id); ?>" class="regular-text" />
                        <p class="description">The ID of your Google Spreadsheet.</p>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>
    </div>
    <?php
}

// Block direct access to calculator files
add_action('template_redirect', 'ccalc_block_direct_access');
function ccalc_block_direct_access() {
    $request_uri = $_SERVER['REQUEST_URI'];
    
    // Block direct access to calculator files
    if (strpos($request_uri, '/credit-card-calculators/') !== false && 
        !wp_doing_ajax() && 
        !ccalc_is_internal_request()) {
        
        wp_die('Access denied. This content is only available through WordPress pages.', 'Access Denied', array('response' => 403));
    }
}

function ccalc_is_internal_request() {
    $referer = wp_get_referer();
    $site_url = site_url();
    return $referer && strpos($referer, $site_url) === 0;
}

// Register shortcodes for easy embedding
add_shortcode('main_calculator', 'ccalc_main_calculator_shortcode');
add_shortcode('airlines_calculator', 'ccalc_airlines_calculator_shortcode');
add_shortcode('hotels_calculator', 'ccalc_hotels_calculator_shortcode');
add_shortcode('cash_calculator', 'ccalc_cash_calculator_shortcode');

function ccalc_main_calculator_shortcode($atts) {
    ob_start();
    ?>
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
    <?php
    return ob_get_clean();
}

function ccalc_airlines_calculator_shortcode($atts) {
    ob_start();
    ?>
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
                
                // Load CSS
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '/credit-card-calculators/css/airlines-calculator.css';
                document.head.appendChild(link);
                
                // Load scripts
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
    <?php
    return ob_get_clean();
}

function ccalc_hotels_calculator_shortcode($atts) {
    ob_start();
    ?>
    <div id="hotels-calculator-container"></div>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof ccalc_ajax !== 'undefined') {
            window.ccalc_nonce = ccalc_ajax.nonce;
        }
        
        fetch('/credit-card-calculators/html/hotels-calculator.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('hotels-calculator-container').innerHTML = html;
                
                // Load CSS
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '/credit-card-calculators/css/hotels-calculator.css';
                document.head.appendChild(link);
                
                // Load scripts
                const secureProxy = document.createElement('script');
                secureProxy.src = '/credit-card-calculators/js/secure-proxy.js';
                document.head.appendChild(secureProxy);
                
                secureProxy.onload = function() {
                    const mainScript = document.createElement('script');
                    mainScript.type = 'module';
                    mainScript.src = '/credit-card-calculators/js/hotels-calculator.js';
                    document.head.appendChild(mainScript);
                };
            });
    });
    </script>
    <?php
    return ob_get_clean();
}

function ccalc_cash_calculator_shortcode($atts) {
    ob_start();
    ?>
    <div id="cash-calculator-container"></div>
    <script>
    document.addEventListener('DOMContentLoaded', function() {
        if (typeof ccalc_ajax !== 'undefined') {
            window.ccalc_nonce = ccalc_ajax.nonce;
        }
        
        fetch('/credit-card-calculators/html/cash-calculator.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('cash-calculator-container').innerHTML = html;
                
                // Load CSS
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = '/credit-card-calculators/css/cash-calculator.css';
                document.head.appendChild(link);
                
                // Load scripts
                const secureProxy = document.createElement('script');
                secureProxy.src = '/credit-card-calculators/js/secure-proxy.js';
                document.head.appendChild(secureProxy);
                
                secureProxy.onload = function() {
                    const mainScript = document.createElement('script');
                    mainScript.type = 'module';
                    mainScript.src = '/credit-card-calculators/js/cash-calculator.js';
                    document.head.appendChild(mainScript);
                };
            });
    });
    </script>
    <?php
    return ob_get_clean();
}
?>