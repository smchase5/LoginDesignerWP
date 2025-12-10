<?php
/**
 * LoginDesignerWP Pro - Main Pro Module
 *
 * This file is loaded by the Free plugin when Pro features are needed.
 * In production, this will be extracted to a separate plugin.
 *
 * @package LoginDesignerWP_Pro
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

// Define Pro constants.
if (!defined('LOGINDESIGNERWP_PRO_VERSION')) {
    define('LOGINDESIGNERWP_PRO_VERSION', '1.0.0');
}
if (!defined('LOGINDESIGNERWP_PRO_PATH')) {
    define('LOGINDESIGNERWP_PRO_PATH', plugin_dir_path(__FILE__));
}

// Load Pro classes.
require_once LOGINDESIGNERWP_PRO_PATH . 'inc/class-license.php';
require_once LOGINDESIGNERWP_PRO_PATH . 'inc/class-pro-features.php';
require_once LOGINDESIGNERWP_PRO_PATH . 'inc/class-presets.php';

/**
 * Initialize Pro features.
 */
function logindesignerwp_pro_bootstrap()
{
    // Initialize Pro classes.
    // Use get_instance() where available to prevent duplicate instantiation.
    if (class_exists('LoginDesignerWP_Pro_License')) {
        LoginDesignerWP_Pro_License::get_instance();
    }

    // For other classes, we continue to use new until they are refactored,
    // but ideally we should be consistent.
    new LoginDesignerWP_Pro_Features();
    new LoginDesignerWP_Pro_Presets();
}
add_action('init', 'logindesignerwp_pro_bootstrap');
