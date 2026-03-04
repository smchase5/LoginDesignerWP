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
 * Sanitize a checkbox-like value to 1/0.
 *
 * @param mixed $value Raw value.
 * @return int
 */
function logindesignerwp_sanitize_bool($value)
{
    return !empty($value) ? 1 : 0;
}

/**
 * Sanitize an enum-like setting.
 *
 * @param mixed $value Raw value.
 * @param array $allowed Allowed values.
 * @param mixed $default Default value.
 * @return mixed
 */
function logindesignerwp_sanitize_enum($value, $allowed, $default)
{
    return in_array($value, $allowed, true) ? $value : $default;
}

/**
 * Sanitize an integer within a fixed range.
 *
 * @param mixed $value Raw value.
 * @param int   $default Default fallback.
 * @param int   $min Minimum value.
 * @param int   $max Maximum value.
 * @return int
 */
function logindesignerwp_sanitize_int_range($value, $default, $min, $max)
{
    return max($min, min($max, absint($value ?? $default)));
}

/**
 * Normalize the saved layout mode.
 *
 * @param array $settings Plugin settings.
 * @return string
 */
function logindesignerwp_get_layout_mode($settings)
{
    return isset($settings['layout_mode']) ? $settings['layout_mode'] : 'centered';
}

/**
 * Check whether the selected layout is a split/card layout.
 *
 * @param string $layout_mode Layout mode.
 * @return bool
 */
function logindesignerwp_is_split_layout_mode($layout_mode)
{
    return strpos($layout_mode, 'split_') === 0 || $layout_mode === 'card_split';
}

/**
 * Check whether the selected layout should render the layout shell.
 *
 * @param array $settings Plugin settings.
 * @return bool
 */
function logindesignerwp_requires_layout_shell($settings)
{
    if (logindesignerwp_is_split_layout_mode(logindesignerwp_get_layout_mode($settings))) {
        return true;
    }

    return !empty($settings['custom_message']);
}

/**
 * Check whether the effective form style is simple.
 *
 * @param array $settings Plugin settings.
 * @return bool
 */
function logindesignerwp_is_simple_layout($settings)
{
    $layout_mode = logindesignerwp_get_layout_mode($settings);
    $layout_form_style = isset($settings['layout_form_style']) ? $settings['layout_form_style'] : 'boxed';

    return $layout_mode === 'simple' || (logindesignerwp_is_split_layout_mode($layout_mode) && $layout_form_style === 'simple');
}

/**
 * Map brand logo radius presets to rendered pixel values.
 *
 * @param string $preset Radius preset.
 * @return int
 */
function logindesignerwp_get_brand_logo_radius($preset)
{
    $radius_map = array(
        'square' => 0,
        'soft' => 25,
        'rounded' => 10,
        'full' => 100,
    );

    return isset($radius_map[$preset]) ? $radius_map[$preset] : 0;
}

/**
 * Get default settings.
 *
 * @return array Default settings array.
 */
function logindesignerwp_get_defaults()
{
    // WordPress login page default values.
    $defaults = array(
        // Background settings.
        'background_mode' => 'solid',
        'background_color' => '#f0f0f1',
        'background_gradient_1' => '#f0f0f1',
        'background_gradient_2' => '#c3c4c7',
        'background_gradient_3' => '#dcdcde',
        'background_gradient_4' => '#c3c4c7',
        'mesh_point_1_x' => 18,
        'mesh_point_1_y' => 22,
        'mesh_point_1_spread' => 74,
        'mesh_point_2_x' => 78,
        'mesh_point_2_y' => 18,
        'mesh_point_2_spread' => 78,
        'mesh_point_3_x' => 26,
        'mesh_point_3_y' => 78,
        'mesh_point_3_spread' => 76,
        'mesh_point_4_x' => 74,
        'mesh_point_4_y' => 70,
        'mesh_point_4_spread' => 80,
        'gradient_type' => 'linear',
        'gradient_angle' => 135,
        'gradient_position' => 'center center',
        'background_image_id' => 0,
        'background_image_size' => 'cover',
        'background_image_pos' => 'center',
        'background_image_repeat' => 'no-repeat',
        'background_blur' => 0,
        'background_overlay_enable' => 0,
        'background_overlay_color' => '#000000',
        'background_overlay_opacity' => 50,
        'preset_background_url' => '',

        // Card split.
        'card_page_background_color' => '',

        // Form container.
        'form_bg_color' => '#ffffff',
        'form_border_radius' => 0,
        'form_corner_style' => 'none',
        'form_border_color' => '#c3c4c7',
        'form_shadow_enable' => 1,
        'form_padding' => 26,
        'enable_glassmorphism' => 0,
        'glass_border' => 1,
        'glass_enabled' => 0,
        'glass_blur' => 10,
        'glass_transparency' => 80,

        // Social login.
        'google_login_enable' => 0,
        'google_auth_mode' => '',
        'google_client_id' => '',
        'google_client_secret' => '',
        'github_login_enable' => 0,
        'github_client_id' => '',
        'github_client_secret' => '',
        'social_login_layout' => 'column',
        'social_login_shape' => 'rounded',
        'social_login_style' => 'branding',

        // Labels and inputs.
        'label_text_color' => '#1e1e1e',
        'input_bg_color' => '#ffffff',
        'input_text_color' => '#1e1e1e',
        'input_border_color' => '#8c8f94',
        'input_border_radius' => 6,
        'input_border_focus' => '#2271b1',

        // Buttons and links.
        'button_bg' => '#2271b1',
        'button_bg_hover' => '#135e96',
        'button_text_color' => '#ffffff',
        'button_border_radius' => 3,
        'below_form_link_color' => '#50575e',

        // Logo.
        'logo_id' => 0,
        'logo_width' => 84,
        'logo_height' => 84,
        'logo_padding' => 0,
        'logo_border_radius' => 0,
        'logo_bottom_margin' => 25,
        'logo_background_enable' => 0,
        'logo_background_color' => '',
        'logo_url' => '',
        'logo_title' => '',

        // General settings.
        'enable_styles' => 1,
        'hide_wp_logo' => 0,
        'custom_message' => '',
        'redirect_after_login' => '',
        'redirect_after_logout' => '',
        'active_preset' => '',

        // Layout.
        'layout_mode' => 'centered',
        'layout_density' => 'normal',
        'layout_vertical_align' => 'center',
        'layout_form_width' => '360',
        'layout_split_ratio' => '50',
        'layout_split_mobile' => 'stack',
        'layout_form_style' => 'boxed',

        // Form panel background.
        'form_panel_bg_mode' => 'solid',
        'form_panel_bg_color' => '#ffffff',
        'form_panel_gradient_1' => '#ffffff',
        'form_panel_gradient_2' => '#f0f0f1',
        'form_panel_gradient_type' => 'linear',
        'form_panel_gradient_angle' => 135,
        'form_panel_gradient_position' => 'center center',
        'form_panel_image_id' => 0,
        'form_panel_shadow' => 1,

        // Brand content.
        'brand_content_enable' => 0,
        'brand_logo_id' => 0,
        'brand_logo_url' => '',
        'brand_title' => '',
        'brand_subtitle' => '',
        'brand_content_align' => 'center',
        'brand_hide_form_logo' => 0,
        'brand_logo_bg_enable' => 0,
        'brand_logo_bg_color' => '#ffffff',
        'brand_logo_radius_preset' => 'square',
        'brand_text_color' => '#ffffff',
    );

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

    $gradient_positions = array(
        'center center',
        'top left',
        'top center',
        'top right',
        'center left',
        'center right',
        'bottom left',
        'bottom center',
        'bottom right',
    );

    // General settings.
    $sanitized['enable_styles'] = logindesignerwp_sanitize_bool($input['enable_styles'] ?? 0);
    $sanitized['hide_wp_logo'] = logindesignerwp_sanitize_bool($input['hide_wp_logo'] ?? 0);
    $sanitized['custom_message'] = wp_kses_post($input['custom_message'] ?? '');
    $sanitized['redirect_after_login'] = esc_url_raw($input['redirect_after_login'] ?? '');
    $sanitized['redirect_after_logout'] = esc_url_raw($input['redirect_after_logout'] ?? '');
    $sanitized['active_preset'] = sanitize_text_field($input['active_preset'] ?? '');

    // Background settings.
    $sanitized['background_mode'] = logindesignerwp_sanitize_enum(
        $input['background_mode'] ?? '',
        array('solid', 'gradient', 'image'),
        $defaults['background_mode']
    );

    $color_fields = array(
        'background_color',
        'background_gradient_1',
        'background_gradient_2',
        'background_gradient_3',
        'background_gradient_4',
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
        'background_overlay_color',
        'card_page_background_color',
        'form_panel_bg_color',
        'form_panel_gradient_1',
        'form_panel_gradient_2',
        'logo_background_color',
        'brand_logo_bg_color',
        'brand_text_color',
    );

    foreach ($color_fields as $field) {
        $sanitized[$field] = sanitize_hex_color($input[$field] ?? '') ?: $defaults[$field];
    }

    $sanitized['background_image_id'] = absint($input['background_image_id'] ?? 0);
    $sanitized['background_image_size'] = logindesignerwp_sanitize_enum(
        $input['background_image_size'] ?? '',
        array('cover', 'contain', 'auto'),
        $defaults['background_image_size']
    );
    $sanitized['background_image_pos'] = logindesignerwp_sanitize_enum(
        $input['background_image_pos'] ?? '',
        array('center', 'top', 'bottom', 'left', 'right', 'top left', 'top right', 'bottom left', 'bottom right'),
        $defaults['background_image_pos']
    );
    $sanitized['background_image_repeat'] = logindesignerwp_sanitize_enum(
        $input['background_image_repeat'] ?? '',
        array('no-repeat', 'repeat', 'repeat-x', 'repeat-y'),
        $defaults['background_image_repeat']
    );
    $sanitized['background_blur'] = logindesignerwp_sanitize_int_range($input['background_blur'] ?? null, $defaults['background_blur'], 0, 20);
    $sanitized['background_overlay_enable'] = logindesignerwp_sanitize_bool($input['background_overlay_enable'] ?? 0);
    $sanitized['background_overlay_opacity'] = logindesignerwp_sanitize_int_range($input['background_overlay_opacity'] ?? null, 50, 0, 100);
    $sanitized['preset_background_url'] = esc_url_raw($input['preset_background_url'] ?? '');
    $sanitized['gradient_type'] = logindesignerwp_sanitize_enum(
        $input['gradient_type'] ?? '',
        array('linear', 'radial', 'mesh'),
        $defaults['gradient_type']
    );
    $sanitized['gradient_angle'] = absint($input['gradient_angle'] ?? $defaults['gradient_angle']);
    $sanitized['gradient_position'] = logindesignerwp_sanitize_enum(
        $input['gradient_position'] ?? '',
        $gradient_positions,
        $defaults['gradient_position']
    );
    $sanitized['mesh_point_1_x'] = logindesignerwp_sanitize_int_range($input['mesh_point_1_x'] ?? null, $defaults['mesh_point_1_x'], 0, 100);
    $sanitized['mesh_point_1_y'] = logindesignerwp_sanitize_int_range($input['mesh_point_1_y'] ?? null, $defaults['mesh_point_1_y'], 0, 100);
    $sanitized['mesh_point_1_spread'] = logindesignerwp_sanitize_int_range($input['mesh_point_1_spread'] ?? null, $defaults['mesh_point_1_spread'], 40, 95);
    $sanitized['mesh_point_2_x'] = logindesignerwp_sanitize_int_range($input['mesh_point_2_x'] ?? null, $defaults['mesh_point_2_x'], 0, 100);
    $sanitized['mesh_point_2_y'] = logindesignerwp_sanitize_int_range($input['mesh_point_2_y'] ?? null, $defaults['mesh_point_2_y'], 0, 100);
    $sanitized['mesh_point_2_spread'] = logindesignerwp_sanitize_int_range($input['mesh_point_2_spread'] ?? null, $defaults['mesh_point_2_spread'], 40, 95);
    $sanitized['mesh_point_3_x'] = logindesignerwp_sanitize_int_range($input['mesh_point_3_x'] ?? null, $defaults['mesh_point_3_x'], 0, 100);
    $sanitized['mesh_point_3_y'] = logindesignerwp_sanitize_int_range($input['mesh_point_3_y'] ?? null, $defaults['mesh_point_3_y'], 0, 100);
    $sanitized['mesh_point_3_spread'] = logindesignerwp_sanitize_int_range($input['mesh_point_3_spread'] ?? null, $defaults['mesh_point_3_spread'], 40, 95);
    $sanitized['mesh_point_4_x'] = logindesignerwp_sanitize_int_range($input['mesh_point_4_x'] ?? null, $defaults['mesh_point_4_x'], 0, 100);
    $sanitized['mesh_point_4_y'] = logindesignerwp_sanitize_int_range($input['mesh_point_4_y'] ?? null, $defaults['mesh_point_4_y'], 0, 100);
    $sanitized['mesh_point_4_spread'] = logindesignerwp_sanitize_int_range($input['mesh_point_4_spread'] ?? null, $defaults['mesh_point_4_spread'], 40, 95);

    // Form settings.
    $sanitized['form_border_radius'] = logindesignerwp_sanitize_int_range($input['form_border_radius'] ?? null, $defaults['form_border_radius'], 0, 50);
    $sanitized['form_corner_style'] = logindesignerwp_sanitize_enum(
        $input['form_corner_style'] ?? '',
        array('none', 'soft', 'rounded'),
        $defaults['form_corner_style']
    );
    $sanitized['input_border_radius'] = logindesignerwp_sanitize_int_range($input['input_border_radius'] ?? null, $defaults['input_border_radius'], 0, 50);
    $sanitized['button_border_radius'] = logindesignerwp_sanitize_int_range($input['button_border_radius'] ?? null, $defaults['button_border_radius'], 0, 999);
    $sanitized['form_shadow_enable'] = logindesignerwp_sanitize_bool($input['form_shadow_enable'] ?? 0);
    $sanitized['form_padding'] = logindesignerwp_sanitize_int_range($input['form_padding'] ?? null, $defaults['form_padding'], 0, 100);
    $sanitized['enable_glassmorphism'] = logindesignerwp_sanitize_bool($input['enable_glassmorphism'] ?? 0);
    $sanitized['glass_border'] = logindesignerwp_sanitize_bool($input['glass_border'] ?? $defaults['glass_border']);
    $sanitized['glass_enabled'] = logindesignerwp_sanitize_bool($input['glass_enabled'] ?? 0);
    $sanitized['glass_blur'] = logindesignerwp_sanitize_int_range($input['glass_blur'] ?? null, $defaults['glass_blur'], 0, 100);
    $sanitized['glass_transparency'] = logindesignerwp_sanitize_int_range($input['glass_transparency'] ?? null, $defaults['glass_transparency'], 0, 100);

    // Social login.
    $sanitized['google_login_enable'] = logindesignerwp_sanitize_bool($input['google_login_enable'] ?? 0);
    $sanitized['google_auth_mode'] = sanitize_text_field($input['google_auth_mode'] ?? $defaults['google_auth_mode']);
    $sanitized['google_client_id'] = sanitize_text_field($input['google_client_id'] ?? '');
    $sanitized['google_client_secret'] = sanitize_text_field($input['google_client_secret'] ?? '');
    $sanitized['github_login_enable'] = logindesignerwp_sanitize_bool($input['github_login_enable'] ?? 0);
    $sanitized['github_client_id'] = sanitize_text_field($input['github_client_id'] ?? '');
    $sanitized['github_client_secret'] = sanitize_text_field($input['github_client_secret'] ?? '');
    $sanitized['social_login_layout'] = logindesignerwp_sanitize_enum($input['social_login_layout'] ?? '', array('column', 'row'), $defaults['social_login_layout']);
    $sanitized['social_login_shape'] = logindesignerwp_sanitize_enum($input['social_login_shape'] ?? '', array('rounded', 'pill', 'square'), $defaults['social_login_shape']);
    $sanitized['social_login_style'] = logindesignerwp_sanitize_enum($input['social_login_style'] ?? '', array('branding', 'custom'), $defaults['social_login_style']);

    // Logo settings.
    $sanitized['logo_id'] = absint($input['logo_id'] ?? 0);
    $sanitized['logo_width'] = logindesignerwp_sanitize_int_range($input['logo_width'] ?? null, $defaults['logo_width'], 50, 500);
    $sanitized['logo_height'] = isset($input['logo_height']) ? absint($input['logo_height']) : $defaults['logo_height'];
    $sanitized['logo_padding'] = absint($input['logo_padding'] ?? $defaults['logo_padding']);
    $sanitized['logo_border_radius'] = absint($input['logo_border_radius'] ?? $defaults['logo_border_radius']);
    $sanitized['logo_bottom_margin'] = absint($input['logo_bottom_margin'] ?? $defaults['logo_bottom_margin']);
    $sanitized['logo_background_enable'] = logindesignerwp_sanitize_bool($input['logo_background_enable'] ?? 0);
    $sanitized['logo_url'] = esc_url_raw($input['logo_url'] ?? '');
    $sanitized['logo_title'] = sanitize_text_field($input['logo_title'] ?? '');

    // Layout settings.
    $sanitized['layout_mode'] = logindesignerwp_sanitize_enum(
        $input['layout_mode'] ?? '',
        array('simple', 'centered', 'split_left', 'split_right', 'card_split'),
        $defaults['layout_mode']
    );
    $sanitized['layout_density'] = logindesignerwp_sanitize_enum(
        $input['layout_density'] ?? '',
        array('compact', 'normal', 'spacious'),
        $defaults['layout_density']
    );
    $sanitized['layout_vertical_align'] = logindesignerwp_sanitize_enum(
        $input['layout_vertical_align'] ?? '',
        array('top', 'center'),
        $defaults['layout_vertical_align']
    );
    $sanitized['layout_form_width'] = logindesignerwp_sanitize_enum(
        $input['layout_form_width'] ?? '',
        array('320', '360', '420', '480'),
        $defaults['layout_form_width']
    );
    $sanitized['layout_split_ratio'] = logindesignerwp_sanitize_enum(
        $input['layout_split_ratio'] ?? '',
        array('20', '25', '30', '35', '40', '45', '50', '55', '60', '65', '70', '75', '80'),
        $defaults['layout_split_ratio']
    );
    $sanitized['layout_split_mobile'] = logindesignerwp_sanitize_enum(
        $input['layout_split_mobile'] ?? '',
        array('stack', 'hide_brand'),
        $defaults['layout_split_mobile']
    );
    $sanitized['layout_form_style'] = logindesignerwp_sanitize_enum(
        $input['layout_form_style'] ?? '',
        array('boxed', 'simple'),
        $defaults['layout_form_style']
    );

    // Form panel settings.
    $sanitized['form_panel_bg_mode'] = logindesignerwp_sanitize_enum(
        $input['form_panel_bg_mode'] ?? '',
        array('solid', 'image', 'gradient'),
        $defaults['form_panel_bg_mode']
    );
    $sanitized['form_panel_gradient_type'] = logindesignerwp_sanitize_enum(
        $input['form_panel_gradient_type'] ?? '',
        array('linear', 'radial'),
        $defaults['form_panel_gradient_type']
    );
    $sanitized['form_panel_gradient_angle'] = absint($input['form_panel_gradient_angle'] ?? $defaults['form_panel_gradient_angle']);
    $sanitized['form_panel_gradient_position'] = logindesignerwp_sanitize_enum(
        $input['form_panel_gradient_position'] ?? '',
        $gradient_positions,
        $defaults['form_panel_gradient_position']
    );
    $sanitized['form_panel_image_id'] = absint($input['form_panel_image_id'] ?? 0);
    $sanitized['form_panel_shadow'] = logindesignerwp_sanitize_bool($input['form_panel_shadow'] ?? 0);

    // Brand content.
    $sanitized['brand_content_enable'] = logindesignerwp_sanitize_bool($input['brand_content_enable'] ?? 0);
    $sanitized['brand_logo_id'] = absint($input['brand_logo_id'] ?? 0);
    $sanitized['brand_logo_url'] = esc_url_raw($input['brand_logo_url'] ?? '');
    $sanitized['brand_title'] = sanitize_text_field($input['brand_title'] ?? '');
    $sanitized['brand_subtitle'] = sanitize_textarea_field($input['brand_subtitle'] ?? '');
    $sanitized['brand_content_align'] = logindesignerwp_sanitize_enum(
        $input['brand_content_align'] ?? '',
        array('left', 'center', 'right'),
        $defaults['brand_content_align']
    );
    $sanitized['brand_hide_form_logo'] = logindesignerwp_sanitize_bool($input['brand_hide_form_logo'] ?? 0);
    $sanitized['brand_logo_bg_enable'] = logindesignerwp_sanitize_bool($input['brand_logo_bg_enable'] ?? 0);
    $sanitized['brand_logo_radius_preset'] = logindesignerwp_sanitize_enum(
        $input['brand_logo_radius_preset'] ?? '',
        array('square', 'rounded', 'soft', 'full'),
        $defaults['brand_logo_radius_preset']
    );

    return apply_filters('logindesignerwp_sanitize_settings', $sanitized, $input);
}
