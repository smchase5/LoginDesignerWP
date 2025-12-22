<?php
/**
 * Google reCAPTCHA Integration
 *
 * @package LoginDesignerWP
 */

namespace LoginDesignerWP\Pro\Security;

if (!defined('ABSPATH')) {
    exit;
}

class Recaptcha
{

    /**
     * Settings.
     *
     * @var array
     */
    private $settings;

    /**
     * Constructor.
     *
     * @param array $settings Security settings.
     */
    public function __construct($settings)
    {
        $this->settings = $settings;
        add_action('logindesignerwp_render_captcha', array($this, 'render'));
        add_filter('logindesignerwp_validate_captcha', array($this, 'validate'), 10, 2);
        add_action('login_enqueue_scripts', array($this, 'enqueue_scripts'));
    }

    /**
     * Enqueue Scripts.
     */
    public function enqueue_scripts()
    {
        if ($this->settings['method'] === 'recaptcha' && $this->settings['enabled']) {
            $site_key = $this->settings['recaptcha_site_key'];
            if (!empty($site_key)) {
                wp_enqueue_script('google-recaptcha', 'https://www.google.com/recaptcha/api.js', array(), null, true);
            }
        }
    }

    /**
     * Render Widget.
     *
     * @param array $settings
     */
    public function render($settings)
    {
        if ($settings['method'] !== 'recaptcha')
            return;

        $site_key = $settings['recaptcha_site_key'];
        if (empty($site_key)) {
            if (current_user_can('manage_options')) {
                echo '<p style="color:red; background:white; padding:10px; border:1px solid red;">' . esc_html__('Error: reCAPTCHA Site Key is missing.', 'logindesignerwp') . '</p>';
            }
            return;
        }

        // v2 Checkbox
        // Dark Theme Detection
        // Dark Theme Detection
        $defaults = function_exists('logindesignerwp_get_defaults') ? logindesignerwp_get_defaults() : array();
        $design = wp_parse_args(get_option('logindesignerwp_settings', array()), $defaults);
        $theme = 'light';

        // Use label text color as proxy for contrast (light text = dark bg)
        if (!empty($design['label_text_color'])) {
            $hex = ltrim($design['label_text_color'], '#');
            if (strlen($hex) === 3) {
                $hex = $hex[0] . $hex[0] . $hex[1] . $hex[1] . $hex[2] . $hex[2];
            }
            if (strlen($hex) === 6) {
                $r = hexdec(substr($hex, 0, 2));
                $g = hexdec(substr($hex, 2, 2));
                $b = hexdec(substr($hex, 4, 2));
                $luma = (0.299 * $r + 0.587 * $g + 0.114 * $b);

                // If label is bright (> 150), assume dark background
                if ($luma > 150) {
                    $theme = 'dark';
                }
            }
        }

        echo '<div style="display:flex; justify-content:center; width:100%; margin: 16px 0;">';
        echo '<div class="g-recaptcha" data-sitekey="' . esc_attr($site_key) . '" data-theme="' . esc_attr($theme) . '"></div>';
        echo '</div>';
    }

    /**
     * Validate Token.
     *
     * @param bool|WP_Error $valid Previous validation status.
     * @param array         $settings
     * @return bool|WP_Error
     */
    public function validate($valid, $settings)
    {
        if (is_wp_error($valid))
            return $valid; // Already failed
        if ($settings['method'] !== 'recaptcha')
            return $valid; // Not active method

        $token = isset($_POST['g-recaptcha-response']) ? $_POST['g-recaptcha-response'] : '';
        if (empty($token)) {
            return new \WP_Error('recaptcha_missing', __('Please complete the reCAPTCHA.', 'logindesignerwp'));
        }

        $secret = $settings['recaptcha_secret'];
        if (empty($secret)) {
            return new \WP_Error('recaptcha_config_error', __('CAPTCHA configuration error.', 'logindesignerwp'));
        }

        $response = wp_remote_post('https://www.google.com/recaptcha/api/siteverify', array(
            'body' => array(
                'secret' => $secret,
                'response' => $token,
                'remoteip' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '',
            ),
        ));

        if (is_wp_error($response)) {
            return new \WP_Error('recaptcha_api_error', __('CAPTCHA validation failed (API error).', 'logindesignerwp'));
        }

        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);

        if (empty($result['success'])) {
            return new \WP_Error('recaptcha_failed', __('CAPTCHA validation failed.', 'logindesignerwp'));
        }

        return true;
    }
}
