<?php
/**
 * Design Presets Feature.
 *
 * Provides built-in presets and save/apply functionality.
 *
 * @package LoginDesignerWP_Pro
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Presets management class.
 */
class LoginDesignerWP_Pro_Presets
{

    /**
     * Built-in presets.
     *
     * @var array
     */
    private $built_in_presets = array();

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->init_presets();

        // Hook into Pro sections rendering.
        add_action('logindesignerwp_render_pro_sections', array($this, 'render_presets_section'));

        // AJAX handlers.
        add_action('wp_ajax_logindesignerwp_apply_preset', array($this, 'ajax_apply_preset'));
        add_action('wp_ajax_logindesignerwp_save_preset', array($this, 'ajax_save_preset'));
        add_action('wp_ajax_logindesignerwp_delete_preset', array($this, 'ajax_delete_preset'));
    }

    /**
     * Initialize built-in presets.
     */
    private function init_presets()
    {
        // Use the centralized Core Presets Manager
        if (class_exists('Login_Designer_WP_Presets_Core')) {
            $this->built_in_presets = \Login_Designer_WP_Presets_Core::get_presets();
        } else {
            // Fallback (should not happen providing core is loaded)
            $this->built_in_presets = array();
        }
    }

    /**
     * Get all presets (built-in + custom).
     *
     * @return array All presets.
     */
    public function get_all_presets()
    {
        $custom_presets = get_option('logindesignerwp_custom_presets', array());
        return array_merge($this->built_in_presets, $custom_presets);
    }

    /**
     * Render presets section in settings.
     *
     * @param array $settings Current settings.
     */
    public function render_presets_section($settings)
    {
        // Core now handles the presets section for both Free and Pro.
        return;
    }

    /**
     * AJAX handler for applying preset.
     */
    public function ajax_apply_preset()
    {
        check_ajax_referer('logindesignerwp_preset_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied.');
        }

        $preset_key = isset($_POST['preset']) ? sanitize_text_field($_POST['preset']) : '';
        $all_presets = $this->get_all_presets();

        if (!isset($all_presets[$preset_key])) {
            wp_send_json_error('Preset not found.');
        }

        $preset = $all_presets[$preset_key];
        $current_settings = logindesignerwp_get_settings();

        // Merge preset settings with current settings.
        $new_settings = array_merge($current_settings, $preset['settings']);

        // Fix Stickiness: Force disable Glassmorphism if not explicitly enabled in preset
        if (!isset($preset['settings']['glass_enabled'])) {
            $new_settings['glass_enabled'] = 0;
        }

        // Don't save to DB - preview only (client-side application)
        // $new_settings['active_preset'] = $preset_key; 
        // update_option('logindesignerwp_settings', $new_settings);

        // Get Image URL if ID exists for preview
        $bg_image_url = '';
        if (!empty($new_settings['background_image_id'])) {
            $bg_image_url = wp_get_attachment_image_url($new_settings['background_image_id'], 'medium');
        }

        // Return new settings for AJAX update
        wp_send_json_success(array(
            'message' => 'Preset applied!',
            'settings' => $new_settings,
            'preset_name' => $preset['name'],
            'background_image_url' => $bg_image_url
        ));
    }

    /**
     * AJAX handler for saving preset.
     */
    public function ajax_save_preset()
    {
        check_ajax_referer('logindesignerwp_preset_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied.');
        }

        $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';

        if (empty($name)) {
            wp_send_json_error('Please enter a preset name.');
        }

        // Get current settings.
        $current_settings = logindesignerwp_get_settings();

        // Extract only the styling settings (not Pro-specific ones).
        $preset_settings = array(
            'background_mode' => $current_settings['background_mode'],
            'background_color' => $current_settings['background_color'],
            'background_gradient_1' => $current_settings['background_gradient_1'],
            'background_gradient_2' => $current_settings['background_gradient_2'],
            'form_bg_color' => $current_settings['form_bg_color'],
            'form_border_radius' => $current_settings['form_border_radius'],
            'form_border_color' => $current_settings['form_border_color'],
            'form_shadow_enable' => $current_settings['form_shadow_enable'],
            'label_text_color' => $current_settings['label_text_color'],
            'input_bg_color' => $current_settings['input_bg_color'],
            'input_text_color' => $current_settings['input_text_color'],
            'input_border_color' => $current_settings['input_border_color'],
            'input_border_focus' => $current_settings['input_border_focus'],
            'button_bg' => $current_settings['button_bg'],
            'button_bg_hover' => $current_settings['button_bg_hover'],
            'button_text_color' => $current_settings['button_text_color'],
            'button_border_radius' => $current_settings['button_border_radius'],
            'below_form_link_color' => $current_settings['below_form_link_color'],
            // Pro Features
            'glassmorphism_enable' => isset($current_settings['glassmorphism_enable']) ? $current_settings['glassmorphism_enable'] : 0,
            'glassmorphism_blur' => isset($current_settings['glassmorphism_blur']) ? $current_settings['glassmorphism_blur'] : 10,
            'glassmorphism_transparency' => isset($current_settings['glassmorphism_transparency']) ? $current_settings['glassmorphism_transparency'] : 20,
            'glassmorphism_border' => isset($current_settings['glassmorphism_border']) ? $current_settings['glassmorphism_border'] : 0,
        );

        // Generate unique key.
        $key = 'custom_' . sanitize_key($name) . '_' . time();

        // Get existing custom presets.
        $custom_presets = get_option('logindesignerwp_custom_presets', array());

        // Add new preset.
        $custom_presets[$key] = array(
            'name' => $name,
            'settings' => $preset_settings,
        );

        update_option('logindesignerwp_custom_presets', $custom_presets);

        wp_send_json_success('Preset saved!');
    }

    /**
     * AJAX handler for deleting preset.
     */
    public function ajax_delete_preset()
    {
        check_ajax_referer('logindesignerwp_preset_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied.');
        }

        $preset_key = isset($_POST['preset']) ? sanitize_text_field($_POST['preset']) : '';

        // Can only delete custom presets.
        if (strpos($preset_key, 'custom_') !== 0) {
            wp_send_json_error('Cannot delete built-in presets.');
        }

        $custom_presets = get_option('logindesignerwp_custom_presets', array());

        if (isset($custom_presets[$preset_key])) {
            unset($custom_presets[$preset_key]);
            update_option('logindesignerwp_custom_presets', $custom_presets);
        }

        wp_send_json_success('Preset deleted.');
    }
}
