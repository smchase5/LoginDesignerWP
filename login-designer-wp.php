<?php
/**
 * Plugin Name: Login Designer WP
 * Plugin URI:  https://github.com/smchase5/LoginDesignerWP
 * Description: A lightweight way to visually customize the default WordPress login screen.
 * Version:     1.1.0
 * Author:      LoginDesignerWP
 * Author URI:  https://github.com/smchase5
 * License:     GPL-2.0-or-later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: logindesignerwp
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants.
define('LOGINDESIGNERWP_VERSION', '1.1.0');
define('LOGINDESIGNERWP_PATH', plugin_dir_path(__FILE__));
define('LOGINDESIGNERWP_URL', plugin_dir_url(__FILE__));

// Load helpers first.
require_once LOGINDESIGNERWP_PATH . 'inc/helpers.php';

// Load classes.
require_once LOGINDESIGNERWP_PATH . 'inc/class-settings.php';
require_once LOGINDESIGNERWP_PATH . 'inc/class-login-style.php';
require_once LOGINDESIGNERWP_PATH . 'inc/class-login-layout.php';
require_once LOGINDESIGNERWP_PATH . 'inc/class-ai.php';
require_once LOGINDESIGNERWP_PATH . 'inc/class-social-login.php';
require_once LOGINDESIGNERWP_PATH . 'inc/class-presets-core.php';
require_once LOGINDESIGNERWP_PATH . 'inc/security/class-security.php';

// Load Pro module (Development Mode / Integrated).
if (file_exists(LOGINDESIGNERWP_PATH . 'inc/pro/class-pro-manager.php')) {
    require_once LOGINDESIGNERWP_PATH . 'inc/pro/class-pro-manager.php';
}

/**
 * Initialize the plugin.
 */
function logindesignerwp_init()
{
    // Initialize settings (admin).
    if (is_admin()) {
        new LoginDesignerWP_Settings();
    }

    // Initialize login styling (frontend).
    new LoginDesignerWP_Login_Style();
    new LoginDesignerWP_Login_Layout();

    // Initialize AI features.
    if (is_admin()) {
        new LoginDesignerWP_AI();
    }

    // Initialize Social Login.
    new LoginDesignerWP_Social_Login();

    // Initialize Bot Protection.
    LoginDesignerWP_Security::get_instance();

    // Initialize Presets UI (AJAX & Renderer).
    if (file_exists(LOGINDESIGNERWP_PATH . 'inc/class-presets-ui.php')) {
        require_once LOGINDESIGNERWP_PATH . 'inc/class-presets-ui.php';
        Login_Designer_WP_Presets_UI::get_instance();
    }

    // Initialize Pro Features.
    if (class_exists('LoginDesignerWP\Pro\Pro_Manager')) {
        new \LoginDesignerWP\Pro\Pro_Manager();
    }
}
add_action('plugins_loaded', 'logindesignerwp_init');
