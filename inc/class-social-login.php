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
        // Direct OAuth with user's credentials
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
            $google_active = !empty($this->settings['google_login_enable']) && !empty($this->settings['google_client_id']);
            $github_active = !empty($this->settings['github_login_enable']) && !empty($this->settings['github_client_id']);
            ?>

            <!-- Google Login Card -->
            <form id="logindesignerwp-google-settings-form" class="logindesignerwp-social-provider-form">
                <?php wp_nonce_field('logindesignerwp_save_nonce', 'nonce', false); ?>
                <input type="hidden" name="provider" value="google">

                <div class="logindesignerwp-card ldwp-social-card" data-section-id="google_login">
                    <!-- Card Header -->
                    <div class="ldwp-social-card-header">
                        <div class="ldwp-social-card-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" style="margin-right: 8px;">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                            <?php esc_html_e('Google Login', 'logindesignerwp'); ?>
                        </div>
                        <div class="ldwp-social-card-badges">
                            <span class="ldwp-badge ldwp-badge-pro">Pro</span>
                            <label class="ldwp-status-toggle">
                                <input type="checkbox" name="logindesignerwp_settings[google_login_enable]" value="1"
                                    <?php checked(1, $this->settings['google_login_enable']); ?>>
                                <span class="ldwp-status-pill <?php echo $google_active ? 'active' : 'inactive'; ?>">
                                    <?php echo $google_active ? esc_html__('Active', 'logindesignerwp') : esc_html__('Inactive', 'logindesignerwp'); ?>
                                </span>
                            </label>
                        </div>
                    </div>

                    <!-- Description -->
                    <p class="ldwp-social-card-description">
                        <?php esc_html_e('Allow users to log in with their Google account. Requires a Google Cloud project with OAuth credentials.', 'logindesignerwp'); ?>
                        <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener"><?php esc_html_e('Get credentials', 'logindesignerwp'); ?></a>
                    </p>

                    <!-- Configuration Section -->
                    <div class="ldwp-social-config">
                        <h4><?php esc_html_e('Configuration', 'logindesignerwp'); ?></h4>

                        <div class="ldwp-field-row">
                            <label><?php esc_html_e('Client ID', 'logindesignerwp'); ?></label>
                            <input type="text" class="regular-text" name="logindesignerwp_settings[google_client_id]"
                                value="<?php echo esc_attr($this->settings['google_client_id']); ?>"
                                placeholder="your-client-id.apps.googleusercontent.com">
                            <p class="description"><?php esc_html_e('Found in your Google Cloud Console under OAuth 2.0 Client IDs.', 'logindesignerwp'); ?></p>
                        </div>

                        <div class="ldwp-field-row">
                            <label><?php esc_html_e('Client Secret', 'logindesignerwp'); ?></label>
                            <input type="password" class="regular-text" name="logindesignerwp_settings[google_client_secret]"
                                value="<?php echo esc_attr($this->settings['google_client_secret']); ?>">
                        </div>

                        <div class="ldwp-field-row">
                            <label><?php esc_html_e('Redirect URI', 'logindesignerwp'); ?></label>
                            <div class="ldwp-copy-field">
                                <code id="google-redirect-uri"><?php echo esc_url(site_url('wp-login.php') . '?action=ldwp_social_callback&provider=google'); ?></code>
                                <button type="button" class="button ldwp-copy-btn" data-target="google-redirect-uri">
                                    <span class="dashicons dashicons-admin-page"></span>
                                </button>
                            </div>
                            <p class="description"><?php esc_html_e('Add this URL as an Authorized Redirect URI in your Google Cloud Console.', 'logindesignerwp'); ?></p>
                        </div>
                    </div>

                    <!-- Setup Instructions -->
                    <details class="ldwp-setup-instructions">
                        <summary><?php esc_html_e('Setup Instructions', 'logindesignerwp'); ?></summary>
                        <ol>
                            <li><?php printf(
                                /* translators: %s: link to Google Cloud Console */
                                esc_html__('Go to the %s and create a new project (or select an existing one).', 'logindesignerwp'),
                                '<a href="https://console.cloud.google.com/" target="_blank" rel="noopener">Google Cloud Console</a>'
                            ); ?></li>
                            <li><?php esc_html_e('Navigate to APIs & Services → Credentials.', 'logindesignerwp'); ?></li>
                            <li><?php esc_html_e('Click "Create Credentials" → "OAuth client ID".', 'logindesignerwp'); ?></li>
                            <li><?php esc_html_e('Select "Web application" as the application type.', 'logindesignerwp'); ?></li>
                            <li><?php esc_html_e('Add the Redirect URI shown above to "Authorized redirect URIs".', 'logindesignerwp'); ?></li>
                            <li><?php esc_html_e('Copy the Client ID and Client Secret and paste them above.', 'logindesignerwp'); ?></li>
                            <li><?php esc_html_e('Configure your OAuth Consent Screen if you haven\'t already.', 'logindesignerwp'); ?></li>
                        </ol>
                    </details>

                    <!-- Save Button -->
                    <div class="ldwp-social-card-footer">
                        <button type="submit" class="button button-primary">
                            <?php esc_html_e('Save Google Settings', 'logindesignerwp'); ?>
                        </button>
                    </div>
                </div>
            </form>

            <!-- GitHub Login Card -->
            <form id="logindesignerwp-github-settings-form" class="logindesignerwp-social-provider-form">
                <?php wp_nonce_field('logindesignerwp_save_nonce', 'nonce', false); ?>
                <input type="hidden" name="provider" value="github">

                <div class="logindesignerwp-card ldwp-social-card" data-section-id="github_login" style="margin-top: 20px;">
                    <!-- Card Header -->
                    <div class="ldwp-social-card-header">
                        <div class="ldwp-social-card-title">
                            <svg width="20" height="20" viewBox="0 0 24 24" style="margin-right: 8px;">
                                <path fill="#24292e" d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            <?php esc_html_e('GitHub Login', 'logindesignerwp'); ?>
                        </div>
                        <div class="ldwp-social-card-badges">
                            <span class="ldwp-badge ldwp-badge-pro">Pro</span>
                            <label class="ldwp-status-toggle">
                                <input type="checkbox" name="logindesignerwp_settings[github_login_enable]" value="1"
                                    <?php checked(1, $this->settings['github_login_enable']); ?>>
                                <span class="ldwp-status-pill <?php echo $github_active ? 'active' : 'inactive'; ?>">
                                    <?php echo $github_active ? esc_html__('Active', 'logindesignerwp') : esc_html__('Inactive', 'logindesignerwp'); ?>
                                </span>
                            </label>
                        </div>
                    </div>

                    <!-- Description -->
                    <p class="ldwp-social-card-description">
                        <?php esc_html_e('Allow users to log in with their GitHub account. Great for developer-focused sites.', 'logindesignerwp'); ?>
                        <a href="https://github.com/settings/developers" target="_blank" rel="noopener"><?php esc_html_e('Get credentials', 'logindesignerwp'); ?></a>
                    </p>

                    <!-- Configuration Section -->
                    <div class="ldwp-social-config">
                        <h4><?php esc_html_e('Configuration', 'logindesignerwp'); ?></h4>

                        <div class="ldwp-field-row">
                            <label><?php esc_html_e('Client ID', 'logindesignerwp'); ?></label>
                            <input type="text" class="regular-text" name="logindesignerwp_settings[github_client_id]"
                                value="<?php echo esc_attr($this->settings['github_client_id']); ?>">
                            <p class="description"><?php esc_html_e('Found in your GitHub OAuth App settings.', 'logindesignerwp'); ?></p>
                        </div>

                        <div class="ldwp-field-row">
                            <label><?php esc_html_e('Client Secret', 'logindesignerwp'); ?></label>
                            <input type="password" class="regular-text" name="logindesignerwp_settings[github_client_secret]"
                                value="<?php echo esc_attr($this->settings['github_client_secret']); ?>">
                        </div>

                        <div class="ldwp-field-row">
                            <label><?php esc_html_e('Callback URL', 'logindesignerwp'); ?></label>
                            <div class="ldwp-copy-field">
                                <code id="github-callback-url"><?php echo esc_url(site_url('wp-login.php') . '?action=ldwp_social_callback&provider=github'); ?></code>
                                <button type="button" class="button ldwp-copy-btn" data-target="github-callback-url">
                                    <span class="dashicons dashicons-admin-page"></span>
                                </button>
                            </div>
                            <p class="description"><?php esc_html_e('Add this as the Authorization Callback URL in your GitHub OAuth App.', 'logindesignerwp'); ?></p>
                        </div>
                    </div>

                    <!-- Setup Instructions -->
                    <details class="ldwp-setup-instructions">
                        <summary><?php esc_html_e('Setup Instructions', 'logindesignerwp'); ?></summary>
                        <ol>
                            <li><?php printf(
                                /* translators: %s: link to GitHub Developer Settings */
                                esc_html__('Go to %s.', 'logindesignerwp'),
                                '<a href="https://github.com/settings/developers" target="_blank" rel="noopener">GitHub Developer Settings</a>'
                            ); ?></li>
                            <li><?php esc_html_e('Click "New OAuth App" (or select an existing one).', 'logindesignerwp'); ?></li>
                            <li><?php printf(
                                /* translators: %s: site URL */
                                esc_html__('Set the Homepage URL to: %s', 'logindesignerwp'),
                                '<code>' . esc_url(home_url()) . '</code>'
                            ); ?></li>
                            <li><?php esc_html_e('Add the Callback URL shown above.', 'logindesignerwp'); ?></li>
                            <li><?php esc_html_e('Copy the Client ID and generate a new Client Secret.', 'logindesignerwp'); ?></li>
                            <li><?php esc_html_e('Paste both values above and save.', 'logindesignerwp'); ?></li>
                        </ol>
                    </details>

                    <!-- Save Button -->
                    <div class="ldwp-social-card-footer">
                        <button type="submit" class="button button-primary">
                            <?php esc_html_e('Save GitHub Settings', 'logindesignerwp'); ?>
                        </button>
                    </div>
                </div>
            </form>

        </div>

        <style>
        /* Social Card Styles */
        .ldwp-social-card {
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 0;
        }

        .ldwp-social-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 16px 20px;
            border-bottom: 1px solid #eee;
            background: #fafafa;
            border-radius: 8px 8px 0 0;
        }

        .ldwp-social-card-title {
            display: flex;
            align-items: center;
            font-size: 16px;
            font-weight: 600;
            color: #1e1e1e;
        }

        .ldwp-social-card-badges {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .ldwp-badge {
            padding: 4px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .ldwp-badge-pro {
            background: #1e1e1e;
            color: #fff;
        }

        .ldwp-status-toggle input[type="checkbox"] {
            display: none;
        }

        .ldwp-status-pill {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 100px;
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .ldwp-status-pill.active {
            background: #46b450;
            color: #fff;
        }

        .ldwp-status-pill.inactive {
            background: #ddd;
            color: #666;
        }

        .ldwp-status-toggle:hover .ldwp-status-pill {
            opacity: 0.8;
        }

        .ldwp-social-card-description {
            padding: 16px 20px 0;
            margin: 0;
            color: #666;
            font-size: 14px;
            line-height: 1.5;
        }

        .ldwp-social-card-description a {
            color: #2271b1;
            text-decoration: none;
        }

        .ldwp-social-card-description a:hover {
            text-decoration: underline;
        }

        .ldwp-social-config {
            padding: 20px;
        }

        .ldwp-social-config h4 {
            margin: 0 0 16px;
            font-size: 14px;
            font-weight: 600;
            color: #1e1e1e;
        }

        .ldwp-field-row {
            margin-bottom: 16px;
        }

        .ldwp-field-row label {
            display: block;
            font-weight: 500;
            margin-bottom: 6px;
            color: #1e1e1e;
        }

        .ldwp-field-row input.regular-text {
            width: 100%;
            max-width: 400px;
        }

        .ldwp-field-row .description {
            margin-top: 4px;
            color: #666;
            font-size: 13px;
        }

        .ldwp-copy-field {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .ldwp-copy-field code {
            flex: 1;
            max-width: 400px;
            padding: 8px 12px;
            background: #f5f5f5;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 12px;
            word-break: break-all;
        }

        .ldwp-copy-btn {
            padding: 4px 8px !important;
            min-height: auto !important;
        }

        .ldwp-copy-btn .dashicons {
            font-size: 16px;
            width: 16px;
            height: 16px;
        }

        .ldwp-setup-instructions {
            margin: 0 20px 20px;
            padding: 16px;
            background: #f9f9f9;
            border-radius: 6px;
            border: 1px solid #eee;
        }

        .ldwp-setup-instructions summary {
            cursor: pointer;
            font-weight: 600;
            color: #2271b1;
            font-size: 14px;
        }

        .ldwp-setup-instructions summary:hover {
            color: #135e96;
        }

        .ldwp-setup-instructions ol {
            margin: 16px 0 0 20px;
            padding: 0;
            color: #444;
            line-height: 1.8;
        }

        .ldwp-setup-instructions ol li {
            margin-bottom: 8px;
        }

        .ldwp-setup-instructions code {
            background: #fff;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 12px;
        }

        .ldwp-social-card-footer {
            padding: 16px 20px;
            border-top: 1px solid #eee;
            background: #fafafa;
            border-radius: 0 0 8px 8px;
        }
        </style>

        <script>
        (function($) {
            // Toggle status pill text and class
            $('.ldwp-status-toggle input[type="checkbox"]').on('change', function() {
                var $pill = $(this).siblings('.ldwp-status-pill');
                if (this.checked) {
                    $pill.removeClass('inactive').addClass('active').text('<?php echo esc_js(__('Active', 'logindesignerwp')); ?>');
                } else {
                    $pill.removeClass('active').addClass('inactive').text('<?php echo esc_js(__('Inactive', 'logindesignerwp')); ?>');
                }
            });

            // Copy button functionality
            $('.ldwp-copy-btn').on('click', function() {
                var targetId = $(this).data('target');
                var $code = $('#' + targetId);
                var text = $code.text();

                navigator.clipboard.writeText(text).then(function() {
                    var $btn = $(this);
                    $btn.find('.dashicons').removeClass('dashicons-admin-page').addClass('dashicons-yes');
                    setTimeout(function() {
                        $btn.find('.dashicons').removeClass('dashicons-yes').addClass('dashicons-admin-page');
                    }, 2000);
                }.bind(this));
            });

            // Individual form submission via AJAX
            $('.logindesignerwp-social-provider-form').on('submit', function(e) {
                e.preventDefault();

                var $form = $(this);
                var $submitBtn = $form.find('button[type="submit"]');
                var originalText = $submitBtn.text();
                var provider = $form.find('input[name="provider"]').val();

                $submitBtn.prop('disabled', true).text('<?php echo esc_js(__('Saving...', 'logindesignerwp')); ?>');

                var formData = $form.serialize();
                formData += '&action=logindesignerwp_save_social_settings';

                $.post(ajaxurl, formData, function(response) {
                    $submitBtn.prop('disabled', false).text(originalText);

                    if (response.success) {
                        // Update status pill if credentials are now complete
                        var $card = $form.find('.ldwp-social-card');
                        var $pill = $card.find('.ldwp-status-pill');
                        var $checkbox = $card.find('.ldwp-status-toggle input[type="checkbox"]');

                        // Show success notice
                        var $notice = $('<div class="notice notice-success is-dismissible" style="position: fixed; top: 40px; right: 20px; z-index: 9999; padding: 10px 15px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"><p>' + (response.data.message || 'Settings saved!') + '</p></div>');
                        $('body').append($notice);
                        setTimeout(function() {
                            $notice.fadeOut(function() { $(this).remove(); });
                        }, 3000);
                    } else {
                        alert(response.data || 'Error saving settings.');
                    }
                }).fail(function() {
                    $submitBtn.prop('disabled', false).text(originalText);
                    alert('Ajax error. Please try again.');
                });
            });
        })(jQuery);
        </script>
        <?php
    }
}

