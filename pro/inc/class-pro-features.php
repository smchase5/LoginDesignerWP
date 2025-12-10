<?php
/**
 * Pro Features Enablement.
 *
 * Hooks into Free plugin to enable Pro features when licensed.
 *
 * @package LoginDesignerWP_Pro
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Pro features class.
 */
class LoginDesignerWP_Pro_Features
{

    /**
     * Constructor.
     */
    public function __construct()
    {
        // Hook into Pro detection filter.
        add_filter('logindesignerwp_is_pro_active', array($this, 'check_pro_status'));

        // Extend default settings.
        add_filter('logindesignerwp_default_settings', array($this, 'extend_defaults'));

        // Extend sanitization.
        add_filter('logindesignerwp_sanitize_settings', array($this, 'sanitize_pro_settings'));
    }

    /**
     * Check if Pro is active and licensed.
     *
     * @param bool $is_active Current Pro status.
     * @return bool True if Pro is active.
     */
    public function check_pro_status($is_active)
    {
        // Get license instance and check validity.
        $license = new LoginDesignerWP_Pro_License();
        return $license->is_valid();
    }

    /**
     * Extend default settings with Pro options.
     *
     * @param array $defaults Default settings.
     * @return array Extended defaults.
     */
    public function extend_defaults($defaults)
    {
        $pro_defaults = array(
            // Current preset (if any).
            'active_preset' => '',

            // Glassmorphism settings (for future).
            'glass_enabled' => false,
            'glass_blur' => 10,
            'glass_transparency' => 80,
            'glass_border' => true,

            // Custom CSS (for future).
            'custom_css' => '',
        );

        return array_merge($defaults, $pro_defaults);
    }

    /**
     * Sanitize Pro-specific settings.
     *
     * @param array $settings Settings to sanitize.
     * @return array Sanitized settings.
     */
    public function sanitize_pro_settings($settings)
    {
        // Sanitize active preset.
        if (isset($settings['active_preset'])) {
            $settings['active_preset'] = sanitize_text_field($settings['active_preset']);
        }

        // Sanitize glassmorphism settings.
        if (isset($settings['glass_enabled'])) {
            $settings['glass_enabled'] = (bool) $settings['glass_enabled'];
        }
        if (isset($settings['glass_blur'])) {
            $settings['glass_blur'] = absint($settings['glass_blur']);
        }
        if (isset($settings['glass_transparency'])) {
            $settings['glass_transparency'] = min(100, max(0, absint($settings['glass_transparency'])));
        }
        if (isset($settings['glass_border'])) {
            $settings['glass_border'] = (bool) $settings['glass_border'];
        }

        // Sanitize custom CSS.
        if (isset($settings['custom_css'])) {
            $settings['custom_css'] = wp_strip_all_tags($settings['custom_css']);
        }

        return $settings;
    }
}
