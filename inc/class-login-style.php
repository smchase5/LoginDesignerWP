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
    }

    /**
     * Output login page styles.
     */
    public function output_login_styles()
    {
        $this->settings = logindesignerwp_get_settings();
        $s = $this->settings;

        // Get background image URL if applicable.
        $bg_image_url = '';
        if ('image' === $s['background_mode'] && $s['background_image_id']) {
            $bg_image_url = wp_get_attachment_image_url($s['background_image_id'], 'full');
        }

        // Get custom logo URL if applicable.
        $logo_url = '';
        if ($s['logo_id']) {
            $logo_url = wp_get_attachment_image_url($s['logo_id'], 'full');
        }

        // Build CSS as a string to avoid line break issues
        $css = "/* LoginDesignerWP Custom Styles */\n";

        // Background
        $css .= "body.login {\n";
        if ('solid' === $s['background_mode']) {
            $css .= "    background: " . esc_attr($s['background_color']) . " !important;\n";
        } elseif ('gradient' === $s['background_mode']) {
            $css .= "    background: linear-gradient(to bottom, " . esc_attr($s['background_gradient_1']) . ", " . esc_attr($s['background_gradient_2']) . ") !important;\n";
            $css .= "    min-height: 100vh;\n";
        } elseif ('image' === $s['background_mode'] && $bg_image_url) {
            $css .= "    background-color: " . esc_attr($s['background_color']) . " !important;\n";
            $css .= "    background-image: url('" . esc_url($bg_image_url) . "') !important;\n";
            $css .= "    background-size: " . esc_attr($s['background_image_size']) . " !important;\n";
            $css .= "    background-position: " . esc_attr($s['background_image_pos']) . " !important;\n";
            $css .= "    background-repeat: " . esc_attr($s['background_image_repeat']) . " !important;\n";
            $css .= "    background-attachment: fixed !important;\n";
        }
        $css .= "}\n";

        // Form Container
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

        // Labels
        $css .= "body.login div#login label, #login label {\n";
        $css .= "    color: " . esc_attr($s['label_text_color']) . " !important;\n";
        $css .= "    font-size: 14px !important;\n";
        $css .= "}\n";

        // Input Fields
        $css .= "body.login div#login input[type='text'],\n";
        $css .= "body.login div#login input[type='password'],\n";
        $css .= "body.login div#login input[type='email'],\n";
        $css .= "#login input[type='text'], #login input[type='password'], #login input[type='email'] {\n";
        $css .= "    background: " . esc_attr($s['input_bg_color']) . " !important;\n";
        $css .= "    color: " . esc_attr($s['input_text_color']) . " !important;\n";
        $css .= "    border: 1px solid " . esc_attr($s['input_border_color']) . " !important;\n";
        $css .= "    border-radius: 6px !important;\n";
        $css .= "    padding: 8px 12px !important;\n";
        $css .= "    font-size: 16px !important;\n";
        $css .= "}\n";

        // Input Focus
        $css .= "#login input[type='text']:focus, #login input[type='password']:focus, #login input[type='email']:focus {\n";
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
        $css .= "#login #nav a, #login #backtoblog a {\n";
        $css .= "    color: " . esc_attr($s['below_form_link_color']) . " !important;\n";
        $css .= "}\n";
        $css .= "#login #nav a:hover, #login #backtoblog a:hover {\n";
        $css .= "    color: " . esc_attr($s['input_border_focus']) . " !important;\n";
        $css .= "}\n";

        // Logo
        $logo_color = ltrim(esc_attr($s['label_text_color']), '#');
        $css .= "#login h1 a {\n";
        $css .= "    width: " . intval($s['logo_width']) . "px !important;\n";
        $css .= "    height: 84px !important;\n";
        $css .= "    max-width: 100% !important;\n";
        if ($logo_url) {
            $css .= "    background-image: url('" . esc_url($logo_url) . "') !important;\n";
            $css .= "    background-size: contain !important;\n";
        } else {
            $css .= "    background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 122.52 122.523'%3E%3Cpath fill='%23" . $logo_color . "' d='M8.708 61.26c0 20.802 12.089 38.779 29.619 47.298L13.258 39.872a52.354 52.354 0 00-4.55 21.388zM96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501L48.2 93.547l11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z'/%3E%3Cpath fill='%23" . $logo_color . "' d='M62.184 65.857l-15.768 45.819a52.552 52.552 0 0032.29-.838 4.693 4.693 0 01-.37-.712L62.184 65.857zM107.376 36.046a42.584 42.584 0 01.358 5.708c0 5.651-1.057 12.002-4.229 19.94l-16.973 49.082c16.519-9.627 27.618-27.628 27.618-48.18 0-9.762-2.499-18.929-6.774-26.55z'/%3E%3Cpath fill='%23" . $logo_color . "' d='M61.262 0C27.483 0 0 27.481 0 61.26c0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.265-27.48 61.265-61.263C122.526 27.481 95.04 0 61.262 0zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z'/%3E%3C/svg%3E\") !important;\n";
            $css .= "    background-size: 84px 84px !important;\n";
        }
        $css .= "    background-position: center !important;\n";
        $css .= "    background-repeat: no-repeat !important;\n";
        $css .= "}\n";

        // Messages
        $css .= "#login .message, #login .success {\n";
        $css .= "    border-left-color: " . esc_attr($s['input_border_focus']) . " !important;\n";
        $css .= "    background: " . esc_attr($s['form_bg_color']) . " !important;\n";
        $css .= "    color: " . esc_attr($s['label_text_color']) . " !important;\n";
        $css .= "}\n";

        // Errors
        $css .= "#login #login_error {\n";
        $css .= "    border-left-color: #dc2626 !important;\n";
        $css .= "    background: " . esc_attr($s['form_bg_color']) . " !important;\n";
        $css .= "    color: " . esc_attr($s['label_text_color']) . " !important;\n";
        $css .= "}\n";
        $css .= "#login #login_error a { color: " . esc_attr($s['input_border_focus']) . " !important; }\n";

        // Misc
        $css .= ".wp-hide-pw { color: " . esc_attr($s['label_text_color']) . " !important; }\n";
        $css .= ".privacy-policy-page-link a { color: " . esc_attr($s['label_text_color']) . " !important; }\n";
        $css .= "#login .forgetmenot { color: " . esc_attr($s['label_text_color']) . " !important; }\n";

        // Output the CSS
        echo "<!-- LoginDesignerWP CSS -->\n";
        echo "<style type=\"text/css\" id=\"logindesignerwp-styles\">\n";
        echo $css;
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
}
