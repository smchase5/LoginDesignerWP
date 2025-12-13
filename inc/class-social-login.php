<?php
/**
 * Social Login class for LoginDesignerWP.
 *
 * @package LoginDesignerWP
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class LoginDesignerWP_Social_Login
 *
 * Handles Social Login settings and functionality.
 */
class LoginDesignerWP_Social_Login
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
        $this->settings = logindesignerwp_get_settings();

        // Hook into login page (below form, not inside).
        add_action('login_footer', array($this, 'render_social_buttons'));
        add_action('init', array($this, 'handle_social_request'));
    }

    /**
     * Render social login buttons.
     */
    public function render_social_buttons()
    {
        // Social login is a Pro feature - don't render if Pro is not active.
        if (!logindesignerwp_is_pro_active()) {
            return;
        }

        // Check if any provider is enabled.
        if (empty($this->settings['google_login_enable']) && empty($this->settings['github_login_enable'])) {
            return;
        }

        $layout = $this->settings['social_login_layout'] ?? 'column';
        $shape = $this->settings['social_login_shape'] ?? 'rounded';
        $style = $this->settings['social_login_style'] ?? 'branding';

        $wrapper_classes = array('logindesignerwp-social-login');
        $wrapper_classes[] = 'logindesignerwp-layout-' . $layout;

        $btn_classes = array('logindesignerwp-social-btn');
        $btn_classes[] = 'logindesignerwp-shape-' . $shape;
        $btn_classes[] = 'logindesignerwp-style-' . $style;

        ?>
        <div class="<?php echo esc_attr(implode(' ', $wrapper_classes)); ?>">
            <div class="logindesignerwp-social-divider">
                <span><?php esc_html_e('or', 'logindesignerwp'); ?></span>
            </div>
            <div class="logindesignerwp-social-buttons">
                <?php if (!empty($this->settings['google_login_enable'])): ?>
                    <a href="<?php echo esc_url(site_url('wp-login.php') . '?action=ldwp_social_login&provider=google'); ?>"
                        class="<?php echo esc_attr(implode(' ', $btn_classes)); ?> logindesignerwp-google">
                        <span class="dashicons dashicons-google"></span>
                        <span><?php esc_html_e('Google', 'logindesignerwp'); ?></span>
                    </a>
                <?php endif; ?>

                <?php if (!empty($this->settings['github_login_enable'])): ?>
                    <a href="<?php echo esc_url(site_url('wp-login.php') . '?action=ldwp_social_login&provider=github'); ?>"
                        class="<?php echo esc_attr(implode(' ', $btn_classes)); ?> logindesignerwp-github">
                        <span class="dashicons dashicons-admin-network"></span>
                        <span><?php esc_html_e('GitHub', 'logindesignerwp'); ?></span>
                    </a>
                <?php endif; ?>
            </div>
        </div>
        <style>
            /* Container positioning - match form width and center */
            .logindesignerwp-social-login {
                position: relative;
                max-width: 320px;
                margin: 20px auto 0;
                padding: 0 20px;
                box-sizing: border-box;
            }

            /* Divider with lines */
            .logindesignerwp-social-divider {
                display: flex;
                align-items: center;
                margin-bottom: 16px;
            }

            .logindesignerwp-social-divider::before,
            .logindesignerwp-social-divider::after {
                content: '';
                flex: 1;
                border-bottom: 1px solid rgba(255, 255, 255, 0.3);
            }

            .logindesignerwp-social-divider span {
                padding: 0 12px;
                font-size: 13px;
                color: rgba(255, 255, 255, 0.7);
                text-transform: lowercase;
                font-style: italic;
            }

            /* Button container */
            .logindesignerwp-social-buttons {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }

            .logindesignerwp-layout-row .logindesignerwp-social-buttons {
                flex-direction: row;
            }

            /* Individual buttons */
            .logindesignerwp-social-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                padding: 12px 16px;
                border: 1px solid #ddd;
                border-radius: 6px;
                text-decoration: none;
                color: #333;
                background-color: #fff;
                font-weight: 500;
                font-size: 14px;
                transition: all 0.2s ease;
                box-sizing: border-box;
            }

            .logindesignerwp-social-btn:hover {
                opacity: 0.9;
                transform: translateY(-1px);
                text-decoration: none;
            }

            /* Shapes */
            .logindesignerwp-shape-rounded {
                border-radius: 6px;
            }

            .logindesignerwp-shape-pill {
                border-radius: 999px;
            }

            .logindesignerwp-shape-square {
                border-radius: 0;
            }

            /* Styles - Branding */
            .logindesignerwp-style-branding.logindesignerwp-google {
                background-color: #fff;
                color: #333;
                border-color: #ddd;
            }

            .logindesignerwp-style-branding.logindesignerwp-github {
                background-color: #24292e;
                color: #fff;
                border-color: #24292e;
            }

            .logindesignerwp-social-btn .dashicons {
                font-size: 18px;
                width: 18px;
                height: 18px;
            }

            /* Move social buttons to correct position via JS on load */
        </style>
        <script>
            document.addEventListener('DOMContentLoaded', function () {
                var socialContainer = document.querySelector('.logindesignerwp-social-login');
                var loginNav = document.querySelector('#login #nav');
                if (socialContainer && loginNav) {
                    // Insert after the nav links (Lost password, Back to site)
                    loginNav.parentNode.insertBefore(socialContainer, loginNav.nextSibling);
                }
            });
        </script>
        <?php
    }

    /**
     * Handle social login requests (init hook).
     */
    public function handle_social_request()
    {
        if (isset($_GET['action']) && $_GET['action'] === 'ldwp_social_login') {
            $provider = isset($_GET['provider']) ? sanitize_text_field($_GET['provider']) : '';
            if (empty($provider)) {
                return;
            }

            if ($provider === 'google') {
                $this->handle_google_login();
            } elseif ($provider === 'github') {
                $this->handle_github_login();
            }
        }

        if (isset($_GET['action']) && $_GET['action'] === 'ldwp_social_callback') {
            $provider = isset($_GET['provider']) ? sanitize_text_field($_GET['provider']) : '';
            if (empty($provider)) {
                wp_die('Invalid provider.');
            }

            if ($provider === 'google') {
                $this->handle_google_callback();
            } elseif ($provider === 'github') {
                $this->handle_github_callback();
            }
        }
    }

    /**
     * Get the redirect URI for the provider.
     */
    private function get_redirect_url($provider)
    {
        return site_url('wp-login.php?action=ldwp_social_callback&provider=' . $provider);
    }

    /**
     * Handle Google Login Redirect.
     */
    private function handle_google_login()
    {
        $auth_mode = $this->settings['google_auth_mode'] ?? 'proxy';

        if ($auth_mode === 'proxy') {
            // Proxy Mode: Redirect to LoginDesigner OAuth proxy
            $proxy_url = $this->settings['social_proxy_url'] ?? 'https://auth.logindesigner.com';
            $state = wp_create_nonce('ldwp_proxy_google');

            $params = array(
                'site' => site_url(),
                'callback' => site_url('wp-login.php?action=ldwp_proxy_callback&provider=google'),
                'state' => $state,
            );

            $url = trailingslashit($proxy_url) . 'google?' . http_build_query($params);
            wp_redirect($url);
            exit;
        }

        // Custom Mode: Direct OAuth with user's credentials
        if (empty($this->settings['google_client_id'])) {
            wp_die('Google Client ID not configured.');
        }

        $state = wp_create_nonce('ldwp_google_login');
        $params = array(
            'client_id' => $this->settings['google_client_id'],
            'redirect_uri' => $this->get_redirect_url('google'),
            'response_type' => 'code',
            'scope' => 'email profile',
            'state' => $state,
            'access_type' => 'offline',
            'prompt' => 'consent'
        );

        $url = 'https://accounts.google.com/o/oauth2/v2/auth?' . http_build_query($params);
        wp_redirect($url);
        exit;
    }

    /**
     * Handle GitHub Login Redirect.
     */
    private function handle_github_login()
    {
        if (empty($this->settings['github_client_id'])) {
            wp_die('GitHub Client ID not configured.');
        }

        $state = wp_create_nonce('ldwp_github_login');
        $params = array(
            'client_id' => $this->settings['github_client_id'],
            'redirect_uri' => $this->get_redirect_url('github'), // GitHub sometimes strict with params, but WP Login URL usually OK
            'scope' => 'user:email',
            'state' => $state,
        );

        $url = 'https://github.com/login/oauth/authorize?' . http_build_query($params);
        wp_redirect($url);
        exit;
    }

    /**
     * Handle Google Callback.
     */
    private function handle_google_callback()
    {
        if (isset($_GET['error'])) {
            wp_die('Login failed: ' . sanitize_text_field($_GET['error']));
        }

        if (!isset($_GET['code']) || !isset($_GET['state'])) {
            wp_die('Invalid request.');
        }

        if (!wp_verify_nonce($_GET['state'], 'ldwp_google_login')) {
            wp_die('Session expired. Please try again.');
        }

        $code = sanitize_text_field($_GET['code']);

        // Exchange code for token
        $response = wp_remote_post('https://oauth2.googleapis.com/token', array(
            'body' => array(
                'client_id' => $this->settings['google_client_id'],
                'client_secret' => $this->settings['google_client_secret'],
                'redirect_uri' => $this->get_redirect_url('google'),
                'grant_type' => 'authorization_code',
                'code' => $code
            )
        ));

        if (is_wp_error($response)) {
            wp_die('Token exchange failed: ' . $response->get_error_message());
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (empty($data['access_token'])) {
            wp_die('Failed to retrieve access token.');
        }

        $token = $data['access_token'];

        // Get User Info
        $user_response = wp_remote_get('https://www.googleapis.com/oauth2/v2/userinfo', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $token
            )
        ));

        if (is_wp_error($user_response)) {
            wp_die('Failed to fetch user info.');
        }

        $user_info = json_decode(wp_remote_retrieve_body($user_response), true);

        // Connect/Login User
        $this->login_or_connect_user($user_info, 'google');
    }

    /**
     * Handle GitHub Callback.
     */
    private function handle_github_callback()
    {
        if (isset($_GET['error'])) {
            wp_die('Login failed: ' . sanitize_text_field($_GET['error']));
        }

        if (!isset($_GET['code']) || !isset($_GET['state'])) {
            wp_die('Invalid request.');
        }

        if (!wp_verify_nonce($_GET['state'], 'ldwp_github_login')) {
            wp_die('Session expired. Please try again.');
        }

        $code = sanitize_text_field($_GET['code']);

        // Exchange code for token
        $response = wp_remote_post('https://github.com/login/oauth/access_token', array(
            'headers' => array('Accept' => 'application/json'),
            'body' => array(
                'client_id' => $this->settings['github_client_id'],
                'client_secret' => $this->settings['github_client_secret'],
                'code' => $code,
                'redirect_uri' => $this->get_redirect_url('github')
            )
        ));

        if (is_wp_error($response)) {
            wp_die('Token exchange failed: ' . $response->get_error_message());
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (empty($data['access_token'])) {
            wp_die('Failed to retrieve access token.');
        }

        $token = $data['access_token'];

        // Get User Info
        $user_response = wp_remote_get('https://api.github.com/user', array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $token,
                'Accept' => 'application/json'
            )
        ));

        if (is_wp_error($user_response)) {
            wp_die('Failed to fetch user info.');
        }

        $user_info = json_decode(wp_remote_retrieve_body($user_response), true);

        // GitHub doesn't always return email in public profile if private.
        // We might need to fetch emails separately.
        if (empty($user_info['email'])) {
            $email_response = wp_remote_get('https://api.github.com/user/emails', array(
                'headers' => array(
                    'Authorization' => 'Bearer ' . $token,
                    'Accept' => 'application/json'
                )
            ));

            if (!is_wp_error($email_response)) {
                $emails = json_decode(wp_remote_retrieve_body($email_response), true);
                if (is_array($emails)) {
                    foreach ($emails as $email) {
                        if ($email['primary'] && $email['verified']) {
                            $user_info['email'] = $email['email'];
                            break;
                        }
                    }
                }
            }
        }

        $this->login_or_connect_user($user_info, 'github');
    }

    /**
     * Login or Connect User.
     */
    private function login_or_connect_user($user_info, $provider)
    {
        $email = isset($user_info['email']) ? sanitize_email($user_info['email']) : '';

        if (empty($email)) {
            wp_die('Could not retrieve email address from provider.');
        }

        // Check if user exists
        $user = get_user_by('email', $email);

        if (!$user) {
            // Create user
            $username = $this->generate_username($email, $user_info);
            $password = wp_generate_password();

            $user_id = wp_create_user($username, $password, $email);

            if (is_wp_error($user_id)) {
                wp_die('Registration failed: ' . $user_id->get_error_message());
            }

            $user = get_user_by('id', $user_id);

            // Store provider info meta
            update_user_meta($user_id, 'ldwp_social_provider', $provider);
            update_user_meta($user_id, 'ldwp_social_id', $user_info['id'] ?? '');
        }

        // Log in user
        wp_set_current_user($user->ID, $user->user_login);
        wp_set_auth_cookie($user->ID);
        do_action('wp_login', $user->user_login, $user);

        // Redirect to admin or home
        wp_safe_redirect(admin_url());
        exit;
    }

    /**
     * Generate a unique username.
     */
    private function generate_username($email, $user_info)
    {
        $username = '';

        if (!empty($user_info['name'])) {
            $username = sanitize_user(str_replace(' ', '', $user_info['name']), true);
        }

        if (empty($username)) {
            $parts = explode('@', $email);
            $username = sanitize_user($parts[0], true);
        }

        // Ensure uniqueness
        $original_username = $username;
        $i = 1;
        while (username_exists($username)) {
            $username = $original_username . $i;
            $i++;
        }

        return $username;
    }

    /**
     * Render the Social Login settings tab content.
     */
    public function render_settings_tab()
    {
        if (!logindesignerwp_is_pro_active()) {
            $upgrade_url = 'https://logindesigner.com/pricing/?utm_source=plugin&utm_medium=social_tab&utm_campaign=social_login_locked';
            ?>
            <div class="logindesignerwp-pro-locked" style="margin-top: 20px;">
                <div class="logindesignerwp-pro-locked-header">
                    <h2 class="logindesignerwp-pro-locked-title">
                        <span class="dashicons dashicons-share"></span>
                        <?php esc_html_e('Social Login', 'logindesignerwp'); ?>
                    </h2>
                    <span class="logindesignerwp-pro-badge">
                        <span class="dashicons dashicons-star-filled"></span>
                        <?php esc_html_e('Pro', 'logindesignerwp'); ?>
                    </span>
                </div>
                <div class="logindesignerwp-pro-locked-content" style="padding: 40px; text-align: center;">
                    <p
                        style="font-size: 16px; margin-bottom: 30px; line-height: 1.6; max-width: 600px; margin-left: auto; margin-right: auto;">
                        <?php esc_html_e('Enable one-click login for your users with Google and GitHub. Eliminate password fatigue and increase conversions with seamless social authentication.', 'logindesignerwp'); ?>
                    </p>
                    <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 30px; opacity: 0.6;">
                        <div
                            style="border: 1px solid #ddd; padding: 10px 20px; border-radius: 4px; display: flex; align-items: center; gap: 10px; background: #fff;">
                            <span class="dashicons dashicons-google"></span>
                            <?php esc_html_e('Sign in with Google', 'logindesignerwp'); ?>
                        </div>
                        <div
                            style="border: 1px solid #ddd; padding: 10px 20px; border-radius: 4px; display: flex; align-items: center; gap: 10px; background: #fff;">
                            <span class="dashicons dashicons-admin-network"></span>
                            <?php esc_html_e('Sign in with GitHub', 'logindesignerwp'); ?>
                        </div>
                    </div>
                </div>
                <div class="logindesignerwp-pro-locked-footer">
                    <a href="<?php echo esc_url($upgrade_url); ?>" class="logindesignerwp-pro-upgrade-btn" target="_blank">
                        <span class="dashicons dashicons-unlock"></span>
                        <?php esc_html_e('Upgrade to Pro to Unlock Social Login', 'logindesignerwp'); ?>
                    </a>
                </div>
            </div>
            <?php
            return;
        }

        ?>
        <div class="logindesignerwp-settings-container">
            <?php
            $this->settings = logindesignerwp_get_settings();
            ?>
            <div class="logindesignerwp-social-settings-content">
                <div class="logindesignerwp-card" data-section-id="google_login">
                    <h2>
                        <span class="logindesignerwp-card-title-wrapper">
                            <span class="dashicons dashicons-google"></span>
                            <?php esc_html_e('Google Login', 'logindesignerwp'); ?>
                        </span>
                    </h2>
                    <div class="logindesignerwp-card-content">
                        <table class="form-table">
                            <tr>
                                <th scope="row"><?php esc_html_e('Enable Google Login', 'logindesignerwp'); ?></th>
                                <td>
                                    <label class="logindesignerwp-switch">
                                        <input type="checkbox" name="logindesignerwp_settings[google_login_enable]" value="1"
                                            <?php checked(1, $this->settings['google_login_enable']); ?>>
                                        <span class="logindesignerwp-slider round"></span>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php esc_html_e('Setup Mode', 'logindesignerwp'); ?></th>
                                <td>
                                    <fieldset>
                                        <label style="display: block; margin-bottom: 8px;">
                                            <input type="radio" name="logindesignerwp_settings[google_auth_mode]" value="proxy"
                                                <?php checked($this->settings['google_auth_mode'], 'proxy'); ?>>
                                            <strong><?php esc_html_e('Quick Setup', 'logindesignerwp'); ?></strong>
                                            <span style="color: #666;"> —
                                                <?php esc_html_e('No credentials needed. Uses LoginDesigner proxy.', 'logindesignerwp'); ?></span>
                                        </label>
                                        <label style="display: block;">
                                            <input type="radio" name="logindesignerwp_settings[google_auth_mode]" value="custom"
                                                <?php checked($this->settings['google_auth_mode'], 'custom'); ?>>
                                            <strong><?php esc_html_e('Use My Own Credentials', 'logindesignerwp'); ?></strong>
                                            <span style="color: #666;"> —
                                                <?php esc_html_e('For advanced users with their own OAuth app.', 'logindesignerwp'); ?></span>
                                        </label>
                                    </fieldset>
                                </td>
                            </tr>
                        </table>

                        <!-- Quick Setup Success Message -->
                        <div class="ldwp-google-proxy-mode" <?php echo $this->settings['google_auth_mode'] !== 'proxy' ? 'style="display:none;"' : ''; ?>>
                            <div
                                style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px; padding: 12px 16px; margin: 16px 0; display: flex; align-items: center; gap: 10px;">
                                <span class="dashicons dashicons-yes-alt" style="color: #28a745; font-size: 24px;"></span>
                                <div>
                                    <strong
                                        style="color: #155724;"><?php esc_html_e('Google Login is ready!', 'logindesignerwp'); ?></strong>
                                    <p style="margin: 4px 0 0; color: #155724; font-size: 13px;">
                                        <?php esc_html_e('No configuration needed. Just enable and save.', 'logindesignerwp'); ?>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Custom Credentials Fields -->
                        <div class="ldwp-google-custom-mode" <?php echo $this->settings['google_auth_mode'] !== 'custom' ? 'style="display:none;"' : ''; ?>>
                            <table class="form-table">
                                <tr>
                                    <th scope="row"><?php esc_html_e('Client ID', 'logindesignerwp'); ?></th>
                                    <td>
                                        <input type="text" class="regular-text"
                                            name="logindesignerwp_settings[google_client_id]"
                                            value="<?php echo esc_attr($this->settings['google_client_id']); ?>">
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><?php esc_html_e('Client Secret', 'logindesignerwp'); ?></th>
                                    <td>
                                        <input type="password" class="regular-text"
                                            name="logindesignerwp_settings[google_client_secret]"
                                            value="<?php echo esc_attr($this->settings['google_client_secret']); ?>">
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row"><?php esc_html_e('Redirect URI', 'logindesignerwp'); ?></th>
                                    <td>
                                        <code><?php echo esc_url(site_url('wp-login.php') . '?action=ldwp_social_callback&provider=google'); ?></code>
                                        <p class="description">
                                            <?php esc_html_e('Add this URL to your OAuth Consent Screen settings in Google Cloud Console.', 'logindesignerwp'); ?>
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </div>

                        <script>
                            (function () {
                                document.querySelectorAll('input[name="logindesignerwp_settings[google_auth_mode]"]').forEach(function (radio) {
                                    radio.addEventListener('change', function () {
                                        var proxyDiv = document.querySelector('.ldwp-google-proxy-mode');
                                        var customDiv = document.querySelector('.ldwp-google-custom-mode');
                                        if (this.value === 'proxy') {
                                            proxyDiv.style.display = 'block';
                                            customDiv.style.display = 'none';
                                        } else {
                                            proxyDiv.style.display = 'none';
                                            customDiv.style.display = 'block';
                                        }
                                    });
                                });
                            })();
                        </script>
                    </div>
                </div>

                <div class="logindesignerwp-card" data-section-id="github_login">
                    <h2>
                        <span class="logindesignerwp-card-title-wrapper">
                            <span class="dashicons dashicons-github"></span>
                            <!-- Utilizing generic icon if specific github one isn't available, but dashicons usually doesn't have brand icons except wordpress/google/facebook/twitter. Typically plugins use SVG or fontawesome. Let's use generic or look for a match. Dashicons has 'admin-network' which looks kinda like a git graph or 'editor-code'. Let's stick to standard dashicons for now, maybe finding a better SVG later. Actually, for settings UI, let's use 'admin-site' or similar if github specific is missing. Wait, there is no dashicons-github. I'll use 'admin-site' or just no icon. -->
                            <!-- Actually Google dashicon exists? 'dashicons-google'. Let's check generic. Using 'admin-links' for now if unsure. -->
                            <?php esc_html_e('GitHub Login', 'logindesignerwp'); ?>
                        </span>
                    </h2>
                    <div class="logindesignerwp-card-content">
                        <table class="form-table">
                            <tr>
                                <th scope="row"><?php esc_html_e('Enable GitHub Login', 'logindesignerwp'); ?></th>
                                <td>
                                    <label class="logindesignerwp-switch">
                                        <input type="checkbox" name="logindesignerwp_settings[github_login_enable]" value="1"
                                            <?php checked(1, $this->settings['github_login_enable']); ?>>
                                        <span class="logindesignerwp-slider round"></span>
                                    </label>
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php esc_html_e('Client ID', 'logindesignerwp'); ?></th>
                                <td>
                                    <input type="text" class="regular-text" name="logindesignerwp_settings[github_client_id]"
                                        value="<?php echo esc_attr($this->settings['github_client_id']); ?>">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php esc_html_e('Client Secret', 'logindesignerwp'); ?></th>
                                <td>
                                    <input type="password" class="regular-text"
                                        name="logindesignerwp_settings[github_client_secret]"
                                        value="<?php echo esc_attr($this->settings['github_client_secret']); ?>">
                                </td>
                            </tr>
                            <tr>
                                <th scope="row"><?php esc_html_e('Callback URL', 'logindesignerwp'); ?></th>
                                <td>
                                    <code><?php echo esc_url(site_url('wp-login.php') . '?action=ldwp_social_login&provider=github'); ?></code>
                                    <p class="description">
                                        <?php esc_html_e('Add this as the Authorization Callback URL in your GitHub OAuth App settings.', 'logindesignerwp'); ?>
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>


            </div>

            <!-- Social Tab Actions -->
            <?php wp_nonce_field('logindesignerwp_save_nonce', 'nonce', false); ?>
            <div class="logindesignerwp-actions" style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd;">
                <?php submit_button(__('Save Changes', 'logindesignerwp'), 'primary', 'submit', false); ?>
            </div>

        </div>
        <?php
    }
}
