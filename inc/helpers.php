<?php
/**
 * Helper functions for LoginDesignerWP.
 *
 * @package LoginDesignerWP
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Check if Pro plugin is active and licensed.
 *
 * @return bool True if Pro is active and licensed.
 */
function logindesignerwp_is_pro_active()
{
    return apply_filters('logindesignerwp_is_pro_active', false);
}

/**
 * Get default settings.
 *
 * @return array Default settings array.
 */
function logindesignerwp_get_defaults()
{
    $defaults = array(
        // Background settings.
        'background_mode' => 'solid',
        'background_color' => '#0f172a',
        'background_gradient_1' => '#0f172a',
        'background_gradient_2' => '#111827',
        'background_gradient_3' => '#1e3a5f',
        'gradient_type' => 'linear',
        'gradient_angle' => 135,
        'gradient_position' => 'center center',
        'background_image_id' => 0,
        'background_image_size' => 'cover',
        'background_image_pos' => 'center',
        'background_image_repeat' => 'no-repeat',
        'background_blur' => 0,

        // Form container settings.
        'form_bg_color' => '#020617',
        'form_border_radius' => 12,
        'form_border_color' => '#1e293b',
        'form_shadow_enable' => 1,

        // Social Login settings.
        'google_login_enable' => 0,
        'google_auth_mode' => 'proxy', // 'proxy' or 'custom'
        'google_client_id' => '',
        'google_client_secret' => '',
        'github_login_enable' => 0,
        'github_auth_mode' => 'proxy', // 'proxy' or 'custom'
        'github_client_id' => '',
        'github_client_secret' => '',
        'social_login_layout' => 'column', // column, row
        'social_login_shape' => 'rounded', // rounded, pill, square
        'social_login_style' => 'branding', // branding, custom
        'social_proxy_url' => 'https://auth.logindesigner.com', // Configurable proxy URL

        // Label and input settings.
        'label_text_color' => '#e5e7eb',
        'input_bg_color' => '#020617',
        'input_text_color' => '#f9fafb',
        'input_border_color' => '#1f2937',
        'input_border_focus' => '#3b82f6',

        'button_bg' => '#3b82f6',
        'button_bg_hover' => '#2563eb',
        'button_text_color' => '#ffffff',
        'button_border_radius' => 999,

        // Below form link settings.
        'below_form_link_color' => '#555d66',

        // Logo
        'logo_id' => 0,
        'logo_width' => 84,
        'logo_height' => 84,
        'logo_padding' => 0,
        'logo_border_radius' => 0,
        'logo_bottom_margin' => 0,
        'logo_background_color' => '',
        'logo_url' => '',
        'logo_title' => '',
    );

    // Allow Pro to extend defaults.
    return apply_filters('logindesignerwp_default_settings', $defaults);
}

/**
 * Get plugin settings merged with defaults.
 *
 * @return array Settings array.
 */
function logindesignerwp_get_settings()
{
    $defaults = logindesignerwp_get_defaults();
    $settings = get_option('logindesignerwp_settings', array());

    return wp_parse_args($settings, $defaults);
}

/**
 * Sanitize settings on save.
 *
 * @param array $input Raw input array.
 * @return array Sanitized settings.
 */
function logindesignerwp_sanitize_settings($input)
{
    $defaults = logindesignerwp_get_defaults();
    $sanitized = array();

    error_log('LoginDesignerWP Sanitization Start');
    error_log('Raw Input Keys: ' . implode(', ', array_keys($input)));
    if (isset($input['background_color'])) {
        error_log('Input Background Color: ' . $input['background_color']);
    }

    // Background mode.
    $sanitized['background_mode'] = in_array($input['background_mode'] ?? '', array('solid', 'gradient', 'image'), true)
        ? $input['background_mode']
        : $defaults['background_mode'];

    // Colors - sanitize hex colors.
    $color_fields = array(
        'background_color',
        'background_gradient_1',
        'background_gradient_2',
        'background_gradient_3',
        'form_bg_color',
        'form_border_color',
        'label_text_color',
        'input_bg_color',
        'input_text_color',
        'input_border_color',
        'input_border_focus',
        'button_bg',
        'button_bg_hover',
        'button_text_color',
        'below_form_link_color',
    );

    foreach ($color_fields as $field) {
        $sanitized[$field] = sanitize_hex_color($input[$field] ?? '') ?: $defaults[$field];
    }

    // Image ID.
    $sanitized['background_image_id'] = absint($input['background_image_id'] ?? 0);

    // Social Login.
    $sanitized['google_login_enable'] = isset($input['google_login_enable']) ? 1 : 0;
    $sanitized['google_client_id'] = sanitize_text_field($input['google_client_id'] ?? '');
    $sanitized['google_client_secret'] = sanitize_text_field($input['google_client_secret'] ?? '');
    $sanitized['github_login_enable'] = isset($input['github_login_enable']) ? 1 : 0;
    $sanitized['github_client_id'] = sanitize_text_field($input['github_client_id'] ?? '');
    $sanitized['github_login_enable'] = isset($input['github_login_enable']) ? 1 : 0;
    $sanitized['github_client_id'] = sanitize_text_field($input['github_client_id'] ?? '');
    $sanitized['github_client_secret'] = sanitize_text_field($input['github_client_secret'] ?? '');

    // Social Login Design.
    $sanitized['social_login_layout'] = in_array($input['social_login_layout'] ?? '', array('column', 'row'), true) ? $input['social_login_layout'] : $defaults['social_login_layout'];
    $sanitized['social_login_shape'] = in_array($input['social_login_shape'] ?? '', array('rounded', 'pill', 'square'), true) ? $input['social_login_shape'] : $defaults['social_login_shape'];
    $sanitized['social_login_style'] = in_array($input['social_login_style'] ?? '', array('branding', 'custom'), true) ? $input['social_login_style'] : $defaults['social_login_style'];

    // Image size.
    $sanitized['background_image_size'] = in_array($input['background_image_size'] ?? '', array('cover', 'contain', 'auto'), true)
        ? $input['background_image_size']
        : $defaults['background_image_size'];

    // Image position.
    $valid_positions = array('center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right');
    $sanitized['background_image_pos'] = in_array($input['background_image_pos'] ?? '', $valid_positions, true)
        ? $input['background_image_pos']
        : $defaults['background_image_pos'];

    // Image repeat.
    $sanitized['background_image_repeat'] = in_array($input['background_image_repeat'] ?? '', array('no-repeat', 'repeat', 'repeat-x', 'repeat-y'), true)
        ? $input['background_image_repeat']
        : $defaults['background_image_repeat'];

    // Background blur (0-20).
    $sanitized['background_blur'] = max(0, min(20, absint($input['background_blur'] ?? $defaults['background_blur'])));

    // Gradient settings.
    $sanitized['gradient_type'] = in_array($input['gradient_type'] ?? '', array('linear', 'radial', 'mesh'), true)
        ? $input['gradient_type']
        : $defaults['gradient_type'];

    $sanitized['gradient_angle'] = absint($input['gradient_angle'] ?? $defaults['gradient_angle']);
    $sanitized['gradient_position'] = sanitize_text_field($input['gradient_position'] ?? $defaults['gradient_position']);

    // Border radius - integers with bounds.
    $sanitized['form_border_radius'] = max(0, min(50, absint($input['form_border_radius'] ?? $defaults['form_border_radius'])));
    $sanitized['button_border_radius'] = max(0, min(999, absint($input['button_border_radius'] ?? $defaults['button_border_radius'])));

    // Shadow toggle.
    $sanitized['form_shadow_enable'] = !empty($input['form_shadow_enable']);

    // Logo settings.
    $sanitized['logo_id'] = absint($input['logo_id'] ?? 0);
    $sanitized['logo_width'] = max(50, min(500, absint($input['logo_width'] ?? $defaults['logo_width'])));
    $sanitized['logo_height'] = absint($input['logo_height'] ?? $defaults['logo_height']);
    $sanitized['logo_padding'] = absint($input['logo_padding'] ?? $defaults['logo_padding']);
    $sanitized['logo_border_radius'] = absint($input['logo_border_radius'] ?? $defaults['logo_border_radius']);
    $sanitized['logo_bottom_margin'] = absint($input['logo_bottom_margin'] ?? $defaults['logo_bottom_margin']);
    $sanitized['logo_background_color'] = sanitize_hex_color($input['logo_background_color'] ?? $defaults['logo_background_color']);
    $sanitized['logo_url'] = esc_url_raw($input['logo_url'] ?? '');
    $sanitized['logo_title'] = sanitize_text_field($input['logo_title'] ?? '');

    return apply_filters('logindesignerwp_sanitize_settings', $sanitized, $input);
}
