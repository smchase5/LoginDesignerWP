<?php
/**
 * Login styling class for LoginDesignerWP.
 *
 * @package LoginDesignerWP
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class LoginDesignerWP_Login_Style
 *
 * Handles login page styling and customization.
 */
class LoginDesignerWP_Login_Style
{

    /**
     * Plugin settings.
     *
     * @var array
     */
    private $settings;

    /**
     * Constructor.
     */
    public function __construct()
    {
        add_action('login_enqueue_scripts', array($this, 'output_login_styles'));
        add_filter('login_headerurl', array($this, 'custom_logo_url'));
        add_filter('login_headertext', array($this, 'custom_logo_title'));
        add_action('login_footer', array($this, 'output_custom_message'));
    }

    /**
     * Output login page styles.
     */
    public function output_login_styles()
    {
        // Don't apply any custom styles until user has saved settings at least once
        // This keeps the default WordPress login page untouched on fresh installs
        if (!get_option('logindesignerwp_settings_saved', false)) {
            return;
        }

        // Enqueue Layout System CSS
        wp_enqueue_style(
            'logindesignerwp-layouts',
            LOGINDESIGNERWP_URL . 'assets/src/layouts.css',
            array(),
            LOGINDESIGNERWP_VERSION
        );

        $this->settings = logindesignerwp_get_settings();
        $s = $this->settings;

        // Get background image URL if applicable.
        $bg_image_url = '';
        if ('image' === $s['background_mode'] && $s['background_image_id']) {
            $bg_image_url = wp_get_attachment_image_url($s['background_image_id'], 'full');
        }
        // Fallback to preset bundled background URL if no media library image
        if ('image' === $s['background_mode'] && empty($bg_image_url)) {
            // Check if preset_background_url is set
            if (!empty($s['preset_background_url'])) {
                $bg_image_url = $s['preset_background_url'];
            }
            // Special case: glassmorphism preset - use bundled image
            elseif (isset($s['active_preset']) && $s['active_preset'] === 'glassmorphism') {
                $bg_image_url = LOGINDESIGNERWP_URL . 'assets/images/glassmorphism-bg.png';
            }
        }

        // Get custom logo URL if applicable.
        $logo_url = '';
        if ($s['logo_id']) {
            $logo_url = wp_get_attachment_image_url($s['logo_id'], 'full');
        }

        // Build CSS as a string to avoid line break issues
        $css = "/* LoginDesignerWP Custom Styles */\n";

        // Determine Layout Mode
        $layout_mode = isset($s['layout_mode']) ? $s['layout_mode'] : 'centered';

        // Layout types:
        // - 'simple': Just fields/logo, no form container styling
        // - 'centered': Background on body, form in styled box
        // - 'split_left'/'split_right': Two panels, brand gets background, form gets panel styling
        $is_split_layout = strpos($layout_mode, 'split_') === 0;
        $is_simple_layout = $layout_mode === 'simple';

        // Form width (for simple layout) and split ratio (for split layouts)
        $form_width = isset($s['layout_form_width']) ? intval($s['layout_form_width']) : 360;
        $split_ratio = isset($s['layout_split_ratio']) ? intval($s['layout_split_ratio']) : 50;
        $css .= ":root { --lp-max-width: " . $form_width . "px; --lp-brand-width: " . $split_ratio . "%; }\n";

        // Simple layout: remove form box styling entirely
        if ($is_simple_layout) {
            $css .= "#loginform { background: transparent !important; border: none !important; box-shadow: none !important; padding: 0 !important; margin: 0 !important; }\n";

            // Determine effective background color to calculate contrast
            $bg_check_color = isset($s['background_color']) ? $s['background_color'] : '#ffffff';
            if (isset($s['background_mode'])) {
                if ($s['background_mode'] === 'gradient' && isset($s['background_gradient_1'])) {
                    $bg_check_color = $s['background_gradient_1'];
                }
                // Image mode falls back to background_color which is safe default
            }

            // Calculate brightness (0-255)
            $brightness = $this->get_perceived_brightness($bg_check_color);

            // If background is dark (< 128), force white text. If light, force dark text.
            // Using a slightly higher threshold (140) to err on side of darker text on mid-tones
            $contrast_text_color = ($brightness < 140) ? '#ffffff' : '#111827';

            // Override settings locally for CSS generation
            $s['label_text_color'] = $contrast_text_color;
            $s['below_form_link_color'] = $contrast_text_color;
        }

        // Selectors based on layout type
        if ($is_split_layout) {
            $bg_target = '.lp-brand';
        } else {
            // Simple and Centered both use body.login for background
            $bg_target = 'body.login';
        }

        // Split layouts: style the form panel (.lp-main)
        if ($is_split_layout) {
            // Reset body background for split layouts
            $css .= "body.login { background: none !important; }\n";

            // Form Panel Background Styling
            $form_panel_mode = isset($s['form_panel_bg_mode']) ? $s['form_panel_bg_mode'] : 'solid';
            $form_panel_color = isset($s['form_panel_bg_color']) ? esc_attr($s['form_panel_bg_color']) : '#ffffff';
            $form_panel_shadow = !empty($s['form_panel_shadow']);

            // Get form panel image URL if set
            $form_panel_image_url = '';
            if (!empty($s['form_panel_image_id'])) {
                $form_panel_image_url = wp_get_attachment_image_url($s['form_panel_image_id'], 'full');
            }

            $css .= ".lp-main {\n";

            if ('solid' === $form_panel_mode) {
                $css .= "    background-color: " . $form_panel_color . " !important;\n";
            } elseif ('image' === $form_panel_mode && !empty($form_panel_image_url)) {
                $css .= "    background-image: url('" . esc_url($form_panel_image_url) . "') !important;\n";
                $css .= "    background-size: cover !important;\n";
                $css .= "    background-position: center !important;\n";
            } elseif ('image' === $form_panel_mode) {
                $css .= "    background-color: #ffffff !important;\n";
            } elseif ('glassmorphism' === $form_panel_mode) {
                $css .= "    background-color: rgba(255, 255, 255, 0.15) !important;\n";
                $css .= "    backdrop-filter: blur(10px) !important;\n";
                $css .= "    -webkit-backdrop-filter: blur(10px) !important;\n";
                $css .= "    border: 1px solid rgba(255, 255, 255, 0.25) !important;\n";
            }

            if ($form_panel_shadow) {
                $css .= "    box-shadow: 0 4px 30px rgba(0, 0, 0, 0.15) !important;\n";
            } else {
                $css .= "    box-shadow: none !important;\n";
            }

            $css .= "}\n";
        }



        // Open Background Target Block (Brand or Body)
        $css .= "$bg_target {\n";

        // Background Properties
        if ('solid' === $s['background_mode']) {
            $css .= "    background-color: " . esc_attr($s['background_color']) . " !important;\n";
            $css .= "    background-image: none !important;\n";
        } elseif ('gradient' === $s['background_mode']) {
            $css .= "    background-color: " . esc_attr($s['background_color']) . " !important;\n"; // Fallback

            $gradient_type = isset($s['gradient_type']) ? $s['gradient_type'] : 'linear';
            $gradient_angle = isset($s['gradient_angle']) ? $s['gradient_angle'] : 135;
            $gradient_pos = isset($s['gradient_position']) ? $s['gradient_position'] : 'center center';
            $col1 = esc_attr($s['background_gradient_1']);
            $col2 = esc_attr($s['background_gradient_2']);

            if ('linear' === $gradient_type) {
                $css .= "    background: linear-gradient(" . intval($gradient_angle) . "deg, " . $col1 . ", " . $col2 . ") !important;\n";
            } elseif ('radial' === $gradient_type) {
                $css .= "    background: radial-gradient(circle at " . esc_attr($gradient_pos) . ", " . $col1 . ", " . $col2 . ") !important;\n";
            } elseif ('mesh' === $gradient_type) {
                $col3 = esc_attr(isset($s['background_gradient_3']) ? $s['background_gradient_3'] : $col1);
                $css .= "    background: radial-gradient(at top left, " . $col1 . ", transparent 70%),\n";
                $css .= "                radial-gradient(at bottom right, " . $col2 . ", transparent 70%),\n";
                $css .= "                radial-gradient(at top right, " . $col3 . ", transparent 70%),\n";
                $css .= "                linear-gradient(135deg, " . $col2 . ", " . $col1 . ") !important;\n";
            } else {
                $css .= "    background: linear-gradient(135deg, " . $col1 . ", " . $col2 . ") !important;\n";
            }
        } elseif ('image' === $s['background_mode'] && $bg_image_url) {
            // For Image Mode, we apply color to target as well
            $css .= "    background-color: " . esc_attr($s['background_color']) . " !important;\n";

            $blur_amount = isset($s['background_blur']) ? intval($s['background_blur']) : 0;

            if ($blur_amount > 0) {
                // Blur Logic
                // If it's advanced (Brand panel), we can just filter the panel because content is in Main
                if ($is_split_layout) {
                    $css .= "    background-image: url('" . esc_url($bg_image_url) . "') !important;\n";
                    $css .= "    background-size: " . esc_attr($s['background_image_size']) . " !important;\n";
                    $css .= "    background-position: " . esc_attr($s['background_image_pos']) . " !important;\n";
                    $css .= "    background-repeat: " . esc_attr($s['background_image_repeat']) . " !important;\n";
                    $css .= "    filter: blur(" . $blur_amount . "px);\n";
                    $css .= "    transform: scale(1.1);\n";
                } else {
                    // Centered Mode: Needs pseudo-element to avoid blurring the form
                    $css .= "    background-image: none !important;\n"; // Clear from body
                    $css .= "    position: relative;\n";
                    $css .= "}\n"; // Close body block

                    $css .= "body.login::before {\n";
                    $css .= "    content: '';\n";
                    $css .= "    position: fixed;\n";
                    $css .= "    top: 0; left: 0; right: 0; bottom: 0;\n";
                    $css .= "    z-index: -1;\n";
                    $css .= "    background-color: " . esc_attr($s['background_color']) . ";\n";
                    $css .= "    background-image: url('" . esc_url($bg_image_url) . "');\n";
                    $css .= "    background-size: " . esc_attr($s['background_image_size']) . ";\n";
                    $css .= "    background-position: " . esc_attr($s['background_image_pos']) . ";\n";
                    $css .= "    background-repeat: " . esc_attr($s['background_image_repeat']) . ";\n";
                    $css .= "    filter: blur(" . $blur_amount . "px);\n";
                    $css .= "    transform: scale(1.1);\n";
                }
            } else {
                // No blur
                $css .= "    background-image: url('" . esc_url($bg_image_url) . "') !important;\n";
                $css .= "    background-size: " . esc_attr($s['background_image_size']) . " !important;\n";
                $css .= "    background-position: " . esc_attr($s['background_image_pos']) . " !important;\n";
                $css .= "    background-repeat: " . esc_attr($s['background_image_repeat']) . " !important;\n";
                if (!$is_split_layout) {
                    $css .= "    background-attachment: fixed !important;\n";
                }
            }
        } elseif ('image' === $s['background_mode']) {
            $css .= "    background-color: " . esc_attr($s['background_color']) . " !important;\n";
        }
        $css .= "}\n";

        // Background Overlay
        if ('image' === $s['background_mode'] && !empty($s['background_overlay_enable']) && !empty($bg_image_url)) {
            $overlay_color = isset($s['background_overlay_color']) ? $s['background_overlay_color'] : '#000000';
            $overlay_opacity = isset($s['background_overlay_opacity']) ? intval($s['background_overlay_opacity']) : 50;

            // Convert hex to rgba
            $hex = ltrim($overlay_color, '#');
            $r = hexdec(substr($hex, 0, 2));
            $g = hexdec(substr($hex, 2, 2));
            $b = hexdec(substr($hex, 4, 2));
            $alpha = $overlay_opacity / 100;

            if ($is_split_layout) {
                // Apply overlay to Brand Panel ::after
                $css .= ".lp-brand::after {\n";
                $css .= "    content: ''; position: absolute; inset: 0;\n";
                $css .= "    background-color: rgba(" . $r . "," . $g . "," . $b . "," . $alpha . ");\n";
                $css .= "    z-index: 1;\n"; // Above bg, below content? Brand usually has no content content.
                $css .= "}\n";
            } else {
                $css .= "body.login::after {\n";
                $css .= "    content: '';\n";
                $css .= "    position: fixed;\n";
                $css .= "    top: 0; left: 0; right: 0; bottom: 0;\n";
                $css .= "    background-color: rgba(" . $r . "," . $g . "," . $b . "," . $alpha . ");\n";
                $css .= "    z-index: 0;\n";
                $css .= "    pointer-events: none;\n";
                $css .= "}\n";
            }
        }


        // Form Container Styling (skip for Simple layout which has no form box)
        if (!$is_simple_layout) {
            $css .= "body.login div#login form#loginform,\n";
            $css .= "body.login div#login form#registerform,\n";
            $css .= "body.login div#login form#lostpasswordform,\n";
            $css .= "#loginform, #registerform, #lostpasswordform {\n";
            $css .= "    background: " . esc_attr($s['form_bg_color']) . " !important;\n";
            $css .= "    border-radius: " . intval($s['form_border_radius']) . "px !important;\n";
            $css .= "    border: 1px solid " . esc_attr($s['form_border_color']) . " !important;\n";
            $css .= $s['form_shadow_enable'] ? "    box-shadow: 0 4px 24px rgba(0,0,0,0.25) !important;\n" : "    box-shadow: none !important;\n";
            $css .= "    padding: 26px 24px !important;\n";
            $css .= "}\n";
        } else {
            // Simple layout: completely transparent form with no styling
            $css .= "body.login div#login form#loginform,\n";
            $css .= "body.login div#login form#registerform,\n";
            $css .= "body.login div#login form#lostpasswordform,\n";
            $css .= "#loginform, #registerform, #lostpasswordform {\n";
            $css .= "    background: transparent !important;\n";
            $css .= "    border: none !important;\n";
            $css .= "    border-radius: 0 !important;\n";
            $css .= "    box-shadow: none !important;\n";
            $css .= "    padding: 0 !important;\n";
            $css .= "    margin: 0 !important;\n";
            $css .= "}\n";
        }

        // Labels
        $css .= "body.login div#login label, #login label {\n";
        $css .= "    color: " . esc_attr($s['label_text_color']) . " !important;\n";
        $css .= "    font-size: 14px !important;\n";
        $css .= "}\n";

        // Input Fields
        $css .= "body.login div#login input[type='text'],\n";
        $css .= "body.login div#login input[type='password'],\n";
        $css .= "body.login div#login input[type='email'],\n";
        $css .= "body.login div#login input[type='number'],\n";
        $css .= "#login input[type='text'], #login input[type='password'], #login input[type='email'], #login input[type='number'] {\n";
        $css .= "    background: " . esc_attr($s['input_bg_color']) . " !important;\n";
        $css .= "    color: " . esc_attr($s['input_text_color']) . " !important;\n";
        $css .= "    border: 1px solid " . esc_attr($s['input_border_color']) . " !important;\n";
        $css .= "    border-radius: 6px !important;\n";
        $css .= "    padding: 8px 12px !important;\n";
        $css .= "    font-size: 16px !important;\n";
        $css .= "}\n";

        // Input Focus
        $css .= "#login input[type='text']:focus, #login input[type='password']:focus, #login input[type='email']:focus, #login input[type='number']:focus {\n";
        $css .= "    border-color: " . esc_attr($s['input_border_focus']) . " !important;\n";
        $css .= "    box-shadow: 0 0 0 1px " . esc_attr($s['input_border_focus']) . " !important;\n";
        $css .= "    outline: none !important;\n";
        $css .= "}\n";

        // Submit Button
        $css .= "body.login div#login form .submit input[type='submit'],\n";
        $css .= "body.login form p.submit input#wp-submit,\n";
        $css .= ".wp-core-ui .button-primary,\n";
        $css .= "#login .button-primary, #wp-submit {\n";
        $css .= "    background: " . esc_attr($s['button_bg']) . " !important;\n";
        $css .= "    background-color: " . esc_attr($s['button_bg']) . " !important;\n";
        $css .= "    border: none !important;\n";
        $css .= "    border-color: " . esc_attr($s['button_bg']) . " !important;\n";
        $css .= "    border-radius: " . intval($s['button_border_radius']) . "px !important;\n";
        $css .= "    color: " . esc_attr($s['button_text_color']) . " !important;\n";
        $css .= "    font-size: 14px !important;\n";
        $css .= "    font-weight: 500 !important;\n";
        $css .= "    padding: 8px 16px !important;\n";
        $css .= "    text-shadow: none !important;\n";
        $css .= "    box-shadow: none !important;\n";
        $css .= "}\n";

        // Button Hover
        $css .= "#login .button-primary:hover, #login .button-primary:focus,\n";
        $css .= ".wp-core-ui .button-primary:hover, .wp-core-ui .button-primary:focus,\n";
        $css .= "#wp-submit:hover, #wp-submit:focus {\n";
        $css .= "    background: " . esc_attr($s['button_bg_hover']) . " !important;\n";
        $css .= "    background-color: " . esc_attr($s['button_bg_hover']) . " !important;\n";
        $css .= "    color: " . esc_attr($s['button_text_color']) . " !important;\n";
        $css .= "}\n";

        // Links below form
        // Links below form
        if (!empty($s['hide_footer_links'])) {
            $css .= "#login #nav, #login #backtoblog { display: none !important; }\n";
        } else {
            $css .= "#login #nav a, #login #backtoblog a {\n";
            $css .= "    color: " . esc_attr($s['below_form_link_color']) . " !important;\n";
            $css .= "}\n";
            $css .= "#login #nav a:hover, #login #backtoblog a:hover {\n";
            $css .= "    color: " . esc_attr($s['input_border_focus']) . " !important;\n";
            $css .= "}\n";
        }

        // Logo
        $logo_color = ltrim(esc_attr($s['label_text_color']), '#');

        // Logo Container (h1)
        $css .= "#login h1 {\n";
        $css .= "    margin-bottom: " . intval($s['logo_bottom_margin']) . "px !important;\n";
        $css .= "}\n";

        // Logo Link (a)
        $css .= "#login h1 a {\n";
        $css .= "    width: " . intval($s['logo_width']) . "px !important;\n";

        // Use auto if 0/empty (User Request), otherwise custom px. 
        // We must stick to !important to override WP default 84px.
        if (intval($s['logo_height']) > 0) {
            $css .= "    height: " . intval($s['logo_height']) . "px !important;\n";
        } else {
            // Auto Height Calculation (Width controls Height)
            // Since we use background-image, 'auto' collapses. We must calculate the height based on aspect ratio.
            $calculated_height = 84; // Default fallback (WordPress standard)

            if (!empty($s['logo_id'])) {
                // Get image dimensions for custom logo
                $image_meta = wp_get_attachment_metadata($s['logo_id']);
                if ($image_meta && !empty($image_meta['width']) && !empty($image_meta['height'])) {
                    $ratio = $image_meta['height'] / $image_meta['width'];
                    $calculated_height = intval($s['logo_width']) * $ratio;
                }
            } else {
                // Default WordPress Logo is 84x84 (Square ratio roughly, but constrained by 84px height usually)
                // If user sets width > 84, we should scale height?
                // Standard WP logo is 84px height. Let's keep 84px for default unless width scales it?
                // Actually, default WP logo is about a 1:1 ratio icon.
                // Let's assume square usage for default if they change width.
                $calculated_height = intval($s['logo_width']);
            }

            $css .= "    height: " . round($calculated_height) . "px !important;\n";
        }

        $css .= "    max-width: 100% !important;\n";
        $css .= "    padding: " . intval($s['logo_padding']) . "px !important;\n";
        $css .= "    border-radius: " . intval($s['logo_border_radius']) . "px !important;\n";
        if ($logo_url) {
            // Apply background color if enabled
            if (!empty($s['logo_background_enable']) && !empty($s['logo_background_color'])) {
                $css .= "    background-color: " . esc_attr($s['logo_background_color']) . " !important;\n";
            }

            $css .= "    background-image: url('" . esc_url($logo_url) . "') !important;\n";
            $css .= "    background-size: contain !important;\n";
        } else {
            // Default WordPress Logo
            $css .= "    background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 122.52 122.523'%3E%3Cpath fill='%23" . $logo_color . "' d='M8.708 61.26c0 20.802 12.089 38.779 29.619 47.298L13.258 39.872a52.354 52.354 0 00-4.55 21.388zM96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501L48.2 93.547l11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z'/%3E%3Cpath fill='%23" . $logo_color . "' d='M62.184 65.857l-15.768 45.819a52.552 52.552 0 0032.29-.838 4.693 4.693 0 01-.37-.712L62.184 65.857zM107.376 36.046a42.584 42.584 0 01.358 5.708c0 5.651-1.057 12.002-4.229 19.94l-16.973 49.082c16.519-9.627 27.618-27.628 27.618-48.18 0-9.762-2.499-18.929-6.774-26.55z'/%3E%3Cpath fill='%23" . $logo_color . "' d='M61.262 0C27.483 0 0 27.481 0 61.26c0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.265-27.48 61.265-61.263C122.526 27.481 95.04 0 61.262 0zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z'/%3E%3C/svg%3E\") !important;\n";
            $css .= "    background-size: contain !important;\n";
        }
        $css .= "    background-position: center !important;\n";
        $css .= "    background-repeat: no-repeat !important;\n";
        $css .= "    background-origin: content-box !important;\n"; // Fix: ensure padding doesn't clip background or affect size
        $css .= "    box-sizing: content-box !important;\n"; // Fix: ensure width refers to image usage area
        $css .= "}\n";

        // Messages (Info notices - e.g. "Check your email")
        // Use solid white background with forced dark text for maximum readability
        $css .= "#login .message, #login .success {\n";
        $css .= "    background: #ffffff !important;\n";
        $css .= "    color: #333333 !important;\n";
        $css .= "    border: 1px solid " . esc_attr($s['input_border_color']) . " !important;\n";
        $css .= "    border-left: 4px solid " . esc_attr($s['input_border_focus']) . " !important;\n";
        $css .= "    border-radius: 8px !important;\n";
        $css .= "    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;\n";
        $css .= "    padding: 16px 20px !important;\n";
        $css .= "    margin-bottom: 20px !important;\n";
        $css .= "}\n";
        $css .= "#login .message a, #login .success a { color: " . esc_attr($s['input_border_focus']) . " !important; }\n";

        // Errors (e.g. "Invalid password")
        $css .= "#login #login_error {\n";
        $css .= "    background: #ffffff !important;\n";
        $css .= "    color: #333333 !important;\n";
        $css .= "    border: 1px solid #dc2626 !important;\n";
        $css .= "    border-left: 4px solid #dc2626 !important;\n";
        $css .= "    border-radius: 8px !important;\n";
        $css .= "    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.15) !important;\n";
        $css .= "    padding: 16px 20px !important;\n";
        $css .= "    margin-bottom: 20px !important;\n";
        $css .= "}\n";
        $css .= "#login #login_error a { color: #dc2626 !important; text-decoration: underline; }\n";

        // Misc
        $css .= ".wp-hide-pw { color: " . esc_attr($s['label_text_color']) . " !important; }\n";
        $css .= ".privacy-policy-page-link a { color: " . esc_attr($s['label_text_color']) . " !important; }\n";
        $css .= "#login .forgetmenot { color: " . esc_attr($s['label_text_color']) . " !important; }\n";

        // Output the CSS
        echo "<!-- LoginDesignerWP CSS -->\n";
        echo "<style type=\"text/css\" id=\"logindesignerwp-styles\">\n";
        echo $css;

        // Allow Pro to add additional CSS.
        do_action('logindesignerwp_login_styles', $s);

        echo "</style>\n";
    }

    /**
     * Custom logo URL.
     *
     * @param string $url Default URL.
     * @return string Custom URL or default.
     */
    public function custom_logo_url($url)
    {
        $settings = logindesignerwp_get_settings();

        if (!empty($settings['logo_url'])) {
            return esc_url($settings['logo_url']);
        }

        return home_url();
    }

    /**
     * Custom logo title.
     *
     * @param string $title Default title.
     * @return string Custom title or default.
     */
    public function custom_logo_title($title)
    {
        $settings = logindesignerwp_get_settings();

        if (!empty($settings['logo_title'])) {
            return esc_html($settings['logo_title']);
        }

        return get_bloginfo('name');
    }
    /**
     * Output custom message.
     */
    public function output_custom_message()
    {
        $settings = logindesignerwp_get_settings();

        if (!empty($settings['custom_message'])) {
            $button_color = isset($settings['button_bg']) ? $settings['button_bg'] : '#2271b1';

            // Calculate radius
            $radius = 0;
            if (isset($settings['form_border_radius']) && $settings['form_border_radius'] !== '') {
                $radius = intval($settings['form_border_radius']);
            } else {
                $style = isset($settings['form_corner_style']) ? $settings['form_corner_style'] : 'none';
                $map = ['none' => 0, 'small' => 4, 'medium' => 8, 'large' => 12, 'rounded' => 24];
                $radius = isset($map[$style]) ? $map[$style] : 0;
            }

            // Output custom message below the back to blog link
            echo '<div id="ldwp-custom-message" style="
                margin-top: 16px;
                padding: 12px;
                background-color: #fff;
                border-left: 4px solid ' . esc_attr($button_color) . ';
                box-shadow: 0 1px 1px 0 rgba(0,0,0,.1);
                font-size: 13px;
                color: #444;
                text-align: left;
                width: 320px;
                margin-left: auto;
                margin-right: auto;
                box-sizing: border-box;
                border-radius: ' . intval($radius / 2) . 'px;
                position: relative;
                z-index: 10;
            ">';
            echo wp_kses_post($settings['custom_message']);
            echo '</div>';
        }
    }
    /**
     * Calculate perceived brightness of a hex color.
     * Returns a value between 0 (darkest) and 255 (lightest).
     *
     * @param string $hex Hex color code.
     * @return int Brightness value.
     */
    private function get_perceived_brightness($hex)
    {
        $hex = ltrim($hex, '#');
        if (strlen($hex) == 3) {
            $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
        }
        $r = hexdec(substr($hex, 0, 2));
        $g = hexdec(substr($hex, 2, 2));
        $b = hexdec(substr($hex, 4, 2));
        return (($r * 299) + ($g * 587) + ($b * 114)) / 1000;
    }
}
