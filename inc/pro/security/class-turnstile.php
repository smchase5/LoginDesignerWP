<?php
/**
 * Cloudflare Turnstile Integration
 *
 * @package LoginDesignerWP
 */

namespace LoginDesignerWP\Pro\Security;

if (!defined('ABSPATH')) {
    exit;
}

class Turnstile
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
        if ($this->settings['method'] === 'turnstile' && $this->settings['enabled']) {
            wp_enqueue_script('cf-turnstile', 'https://challenges.cloudflare.com/turnstile/v0/api.js', array(), null, true);
        }
    }

    /**
     * Render Widget.
     *
     * @param array $settings
     */
    public function render($settings)
    {
        if ($settings['method'] !== 'turnstile')
            return;

        $site_key = $settings['turnstile_site_key'];
        if (empty($site_key)) {
            if (current_user_can('manage_options')) {
                echo '<p style="color:red; background:white; padding:10px; border:1px solid red;">' . esc_html__('Error: Turnstile Site Key is missing.', 'logindesignerwp') . '</p>';
            }
            return;
        }

        echo '<div style="display:flex; justify-content:center; width:100%; margin: 16px 0;">';
        echo '<div class="cf-turnstile" data-sitekey="' . esc_attr($site_key) . '"></div>';
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
        if ($settings['method'] !== 'turnstile')
            return $valid; // Not active method

        $token = isset($_POST['cf-turnstile-response']) ? $_POST['cf-turnstile-response'] : '';
        if (empty($token)) {
            return new \WP_Error('turnstile_missing', __('Please verify that you are human.', 'logindesignerwp'));
        }

        $secret = $settings['turnstile_secret'];
        if (empty($secret)) {
            // Configuration error - fail open or closed? Closed for security.
            return new \WP_Error('turnstile_config_error', __('CAPTCHA configuration error.', 'logindesignerwp'));
        }

        $response = wp_remote_post('https://challenges.cloudflare.com/turnstile/v0/siteverify', array(
            'body' => array(
                'secret' => $secret,
                'response' => $token,
                'remoteip' => isset($_SERVER['REMOTE_ADDR']) ? $_SERVER['REMOTE_ADDR'] : '',
            ),
        ));

        if (is_wp_error($response)) {
            return new \WP_Error('turnstile_api_error', __('CAPTCHA validation failed (API error).', 'logindesignerwp'));
        }

        $body = wp_remote_retrieve_body($response);
        $result = json_decode($body, true);

        if (empty($result['success'])) {
            return new \WP_Error('turnstile_failed', __('CAPTCHA validation failed.', 'logindesignerwp'));
        }

        return true;
    }
}
