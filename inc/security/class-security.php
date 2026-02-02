<?php
/**
 * Security Manager Class
 *
 * Handles Bot Protection features including Honeypot, Time-based checks,
 * and integration with Pro Captcha providers.
 *
 * @package LoginDesignerWP
 */

if (!defined('ABSPATH')) {
    exit;
}

class LoginDesignerWP_Security
{

    /**
     * Option name.
     */
    const OPTION_NAME = 'logindesignerwp_security_settings';

    /**
     * Instance.
     *
     * @var LoginDesignerWP_Security
     */
    private static $instance = null;

    /**
     * Get instance.
     *
     * @return LoginDesignerWP_Security
     */
    public static function get_instance()
    {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor.
     */
    public function __construct()
    {
        // Admin UI
        add_action('admin_init', array($this, 'register_settings'));
        add_action('logindesignerwp_settings_tabs', array($this, 'render_tab_nav'));
        add_action('logindesignerwp_settings_content', array($this, 'render_tab_content'));
        add_action('wp_ajax_logindesignerwp_save_security_settings', array($this, 'ajax_save_settings'));

        // Frontend Protection
        add_action('login_form', array($this, 'render_challenges'));
        add_action('register_form', array($this, 'render_challenges'));
        add_action('lostpassword_form', array($this, 'render_challenges'));

        // Validation hooks
        add_filter('authenticate', array($this, 'validate_login'), 21, 3); // 20 is standard user validation
        add_filter('registration_errors', array($this, 'validate_registration'), 10, 3);
        add_action('lostpassword_post', array($this, 'validate_lostpassword'));
    }

    /**
     * Get settings.
     */
    public function get_settings()
    {
        $defaults = array(
            'enabled' => false,
            'method' => 'basic', // basic, turnstile, recaptcha
            'basic_honeypot' => true,
            'basic_min_time' => 2, // seconds
            'recaptcha_site_key' => '',
            'recaptcha_secret' => '',
            'turnstile_site_key' => '',
            'turnstile_secret' => '',
        );

        $settings = get_option(self::OPTION_NAME, array());
        return wp_parse_args($settings, $defaults);
    }

    /**
     * Register settings.
     */
    public function register_settings()
    {
        register_setting('logindesignerwp_security_group', self::OPTION_NAME);
    }

    /**
     * Render Tab Navigation.
     *
     * @param string $active_tab Current active tab.
     */
    public function render_tab_nav($active_tab)
    {
        ?>
        <a href="#" class="logindesignerwp-tab<?php echo $active_tab === 'security' ? ' active' : ''; ?>" data-tab="security">
            <span class="dashicons dashicons-shield"></span>
            <?php esc_html_e('Security', 'logindesignerwp'); ?>
        </a>
        <?php
    }

    /**
     * Render Tab Content.
     *
     * @param string $active_tab Current active tab.
     */
    public function render_tab_content($active_tab)
    {
        $s = $this->get_settings();
        $is_pro = apply_filters( 'logindesignerwp_is_pro_active', false );
        ?>
        <div class="logindesignerwp-tab-content<?php echo $active_tab === 'security' ? ' active' : ''; ?>" id="tab-security"
            <?php echo $active_tab !== 'security' ? ' style="display:none"' : ''; ?>>
            <div class="logindesignerwp-card">
                <h2>
                    <span class="logindesignerwp-card-title-wrapper">
                        <span class="dashicons dashicons-shield"></span>
                        <?php esc_html_e('Bot Protection', 'logindesignerwp'); ?>
                    </span>
                </h2>
                <div class="logindesignerwp-card-content">
                    <div id="ldwp-security-container">
                        <table class="form-table">
                            <!-- Enable Toggle -->
                            <tr>
                                <th scope="row"><?php esc_html_e('Enable Protection', 'logindesignerwp'); ?></th>
                                <td>
                                    <label class="ldwp-toggle">
                                        <input type="checkbox" name="enabled" value="1" <?php checked($s['enabled']); ?>>
                                        <span class="ldwp-toggle-slider"></span>
                                    </label>
                                    <p class="description">
                                        <?php esc_html_e('Enable Bot Protection features.', 'logindesignerwp'); ?>
                                    </p>
                                </td>
                            </tr>

                            <!-- Protection Method -->
                            <tr class="ldwp-security-options" <?php echo !$s['enabled'] ? 'style="display:none"' : ''; ?>>
                                <th scope="row"><?php esc_html_e('Protection Method', 'logindesignerwp'); ?></th>
                                <td>
                                    <select name="method" id="ldwp-security-method">
                                        <option value="basic" <?php selected($s['method'], 'basic'); ?>>
                                            <?php esc_html_e('Basic (Free)', 'logindesignerwp'); ?>
                                        </option>
                                        <option value="turnstile" <?php selected( $s['method'], 'turnstile' ); ?> <?php echo ! $is_pro ? 'disabled' : ''; ?>>
                                            <?php esc_html_e( 'Cloudflare Turnstile (Pro)', 'logindesignerwp' ); ?>
                                        </option>
                                        <option value="recaptcha" <?php selected( $s['method'], 'recaptcha' ); ?> <?php echo ! $is_pro ? 'disabled' : ''; ?>>
                                            <?php esc_html_e( 'Google reCAPTCHA (Pro)', 'logindesignerwp' ); ?>
                                        </option>
                                    </select>
                                    <?php if ( ! $is_pro ): ?>
                                        <p class="description">
                                            <a href="https://timetomakessomemoney.com"
                                                target="_blank"><?php esc_html_e('Upgrade to Pro', 'logindesignerwp'); ?></a>
                                            <?php esc_html_e('to unlock Turnstile and reCAPTCHA.', 'logindesignerwp'); ?>
                                        </p>
                                    <?php endif; ?>
                                </td>
                            </tr>

                            <!-- Basic Settings -->
                            <tr class="ldwp-method-settings ldwp-method-basic" <?php echo ( !$s['enabled'] || $s['method'] !== 'basic' ) ? 'style="display:none"' : ''; ?>>
                                <th scope="row"><?php esc_html_e( 'Basic Settings', 'logindesignerwp' ); ?></th>
                                <td>
                                    <fieldset>
                                        <label>
                                            <input type="checkbox" name="basic_honeypot" value="1" <?php checked( $s['basic_honeypot'] ); ?>>
                                            <?php esc_html_e( 'Enable Honeypot', 'logindesignerwp' ); ?>
                                        </label>
                                        <p class="description"><?php esc_html_e( 'Adds a hidden field that bots will fill out, but humans won\'t.', 'logindesignerwp' ); ?></p>
                                        <br>
                                        <label>
                                            <?php esc_html_e( 'Minimum Submission Time (seconds)', 'logindesignerwp' ); ?>
                                            <input type="number" name="basic_min_time" value="<?php echo esc_attr( $s['basic_min_time'] ); ?>" min="0" max="60" class="small-text">
                                        </label>
                                        <p class="description"><?php esc_html_e( 'Block forms submitted faster than this time.', 'logindesignerwp' ); ?></p>
                                        <br>
                                        <label>
                                            <input type="checkbox" name="basic_math" value="1" <?php checked( $s['basic_math'] ); ?>>
                                            <?php esc_html_e( 'Enable Math Challenge', 'logindesignerwp' ); ?>
                                        </label>
                                        <p class="description"><?php esc_html_e( 'Ask users to solve a simple math problem.', 'logindesignerwp' ); ?></p>
                                    </fieldset>
                                </td>
                            </tr>

                            <!-- Turnstile Settings -->
                            <tr class="ldwp-method-settings ldwp-method-turnstile" <?php echo ( !$s['enabled'] || $s['method'] !== 'turnstile' ) ? 'style="display:none"' : ''; ?>>
                                <th scope="row"><?php esc_html_e( 'Cloudflare Turnstile', 'logindesignerwp' ); ?></th>
                                <td>
                                    <p>
                                        <label><?php esc_html_e( 'Site Key', 'logindesignerwp' ); ?></label><br>
                                        <input type="text" name="turnstile_site_key" value="<?php echo esc_attr( $s['turnstile_site_key'] ); ?>" class="regular-text">
                                    </p>
                                    <p>
                                        <label><?php esc_html_e( 'Secret Key', 'logindesignerwp' ); ?></label><br>
                                        <input type="password" name="turnstile_secret" value="<?php echo esc_attr( $s['turnstile_secret'] ); ?>" class="regular-text">
                                    </p>
                                    <p class="description">
                                        <?php printf( 
                                            /* translators: %s: Link to Cloudflare */
                                            esc_html__( 'Get your keys from %s.', 'logindesignerwp' ), 
                                            '<a href="https://dash.cloudflare.com/?to=/:account/turnstile" target="_blank">Cloudflare Dashboard</a>' 
                                        ); ?>
                                    </p>
                                </td>
                            </tr>

                            <!-- reCAPTCHA Settings -->
                            <tr class="ldwp-method-settings ldwp-method-recaptcha" <?php echo ( !$s['enabled'] || $s['method'] !== 'recaptcha' ) ? 'style="display:none"' : ''; ?>>
                                <th scope="row"><?php esc_html_e( 'Google reCAPTCHA (v2)', 'logindesignerwp' ); ?></th>
                                <td>
                                    <p>
                                        <label><?php esc_html_e( 'Site Key', 'logindesignerwp' ); ?></label><br>
                                        <input type="text" name="recaptcha_site_key" value="<?php echo esc_attr( $s['recaptcha_site_key'] ); ?>" class="regular-text">
                                    </p>
                                    <p>
                                        <label><?php esc_html_e( 'Secret Key', 'logindesignerwp' ); ?></label><br>
                                        <input type="password" name="recaptcha_secret" value="<?php echo esc_attr( $s['recaptcha_secret'] ); ?>" class="regular-text">
                                    </p>
                                    <p class="description">
                                        <?php printf( 
                                            /* translators: %s: Link to Google */
                                            esc_html__( 'Get your keys from %s.', 'logindesignerwp' ), 
                                            '<a href="https://www.google.com/recaptcha/admin/create" target="_blank">Google reCAPTCHA Admin</a>' 
                                        ); ?>
                                    </p>
                                </td>
                            </tr>

                            <!-- Save Button -->
                            <tr>
                                <th scope="row"></th>
                                <td>
                                    <button type="button" class="button button-primary" id="ldwp-save-security">
                                        <?php esc_html_e('Save Security Settings', 'logindesignerwp'); ?>
                                    </button>
                                    <span class="spinner" id="ldwp-security-spinner"></span>
                                    <span id="ldwp-security-message" style="margin-left: 10px;"></span>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>

            <script>
                jQuery(document).ready(function ($) {
                    // Toggle Logic
                    $('input[name="enabled"]').on('change', function () {
                        if ($(this).is(':checked')) {
                            $('.ldwp-security-options').slideDown();
                            $('#ldwp-security-method').trigger('change');
                        } else {
                            $('.ldwp-security-options, .ldwp-method-settings').slideUp();
                        }
                    });

                    // Method Switcher
                    $('#ldwp-security-method').on('change', function () {
                        var method = $(this).val();
                        $('.ldwp-method-settings').hide();
                        if ($('input[name="enabled"]').is(':checked')) {
                            $('.ldwp-method-' + method).show();
                        }
                    });

                    // Save
                    $('#ldwp-save-security').on('click', function (e) {
                        e.preventDefault();
                        var $btn = $(this);
                        var $spinner = $('#ldwp-security-spinner');
                        var $msg = $('#ldwp-security-message');
                        var data = $('#ldwp-security-container :input').serialize();

                        $btn.prop('disabled', true);
                        $spinner.addClass('is-active');
                        $msg.text('');

                        $.post(ajaxurl, {
                            action: 'logindesignerwp_save_security_settings',
                            nonce: '<?php echo wp_create_nonce('logindesignerwp_security_nonce'); ?>',
                            data: data
                        }, function (response) {
                            $btn.prop('disabled', false);
                            $spinner.removeClass('is-active');
                            if (response.success) {
                                $msg.text('<?php esc_html_e('Settings saved.', 'logindesignerwp'); ?>').css('color', 'green');
                            } else {
                                $msg.text('<?php esc_html_e('Error saving settings.', 'logindesignerwp'); ?>').css('color', 'red');
                            }
                        });
                    });
                });
            </script>
        </div>
        <?php
    }

    /**
     * AJAX Save Settings.
     */
    public function ajax_save_settings()
    {
        check_ajax_referer('logindesignerwp_security_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error();
        }

        parse_str($_POST['data'], $data);

        $settings = array(
            'enabled' => isset($data['enabled']),
            'method' => sanitize_text_field($data['method']),
            'basic_honeypot' => isset($data['basic_honeypot']),
            'basic_min_time' => absint($data['basic_min_time']),
            'basic_math'     => isset( $data['basic_math'] ),
            'turnstile_site_key' => sanitize_text_field( $data['turnstile_site_key'] ?? '' ),
            'turnstile_secret'   => sanitize_text_field( $data['turnstile_secret'] ?? '' ),
            'recaptcha_site_key' => sanitize_text_field( $data['recaptcha_site_key'] ?? '' ),
            'recaptcha_secret'   => sanitize_text_field( $data['recaptcha_secret'] ?? '' ),
        );

        // Merge with existing to keep keys we didn't send (if any)
        $existing = get_option(self::OPTION_NAME, array());
        $final = array_merge($existing, $settings);

        update_option(self::OPTION_NAME, $final);
        wp_send_json_success();
    }

    /* -------------------------------------------------------------------------- */
    /*                                Frontend Logic                              */
    /* -------------------------------------------------------------------------- */

    /**
     * Render Challenges (Honeypot / Timestamp).
     */
    public function render_challenges()
    {
        $s = $this->get_settings();
        if (!$s['enabled'])
            return;

        // Basic Protection
        if ($s['method'] === 'basic') {
            if ($s['basic_honeypot']) {
                // Randomized name could be better, but fixed for now
                // Style: position absolute, opacity 0, pointer-events none - better than display:none
                echo '<div style="position: absolute; left: -9999px; opacity: 0;">
                    <label for="ldwp_hp_check">Please leave this field empty</label>
                    <input type="text" name="ldwp_hp_check" id="ldwp_hp_check" value="" autocomplete="off" tabindex="-1">
                </div>';
            }

            // Timestamp
            echo '<input type="hidden" name="ldwp_time_check" value="' . time() . '">';

            // Math Challenge
            if ( ! empty( $s['basic_math'] ) ) {
                $num1 = rand( 1, 9 );
                $num2 = rand( 1, 9 );
                $sum = $num1 + $num2;
                echo '<p class="ldwp-math-challenge" style="margin-bottom: 20px;">
                    <label for="ldwp_math_answer" style="margin-bottom: 5px; display: block; font-weight: 600;">' . sprintf( __( '%d + %d = ?', 'logindesignerwp' ), $num1, $num2 ) . '</label>
                    <input type="text" name="ldwp_math_answer" id="ldwp_math_answer" class="input" size="5" style="width: 80px !important; min-width: 80px !important;" required autocomplete="off">
                    <input type="hidden" name="ldwp_math_hash" value="' . wp_hash( $sum ) . '">
                </p>';
            }
        }

        // Pro Hooks
        do_action( 'logindesignerwp_render_captcha', $s );
    }

    /**
     * Validate Login.
     */
    public function validate_login( $user, $username, $password ) {
        // If already failed, skip
        if ( is_wp_error( $user ) ) return $user;

        $check = $this->run_validation();
        if ( is_wp_error( $check ) ) {
            return $check;
        }

        return $user;
    }

    /**
     * Validate Registration.
     */
    public function validate_registration( $errors, $sanitized_user_login, $user_email ) {
        $check = $this->run_validation();
        if ( is_wp_error( $check ) ) {
            $errors->add( 'bot_detected', $check->get_error_message() );
        }
        return $errors;
    }

    /**
     * Validate Lost Password.
     */
    public function validate_lostpassword() {
        $check = $this->run_validation();
        if ( is_wp_error( $check ) ) {
            wp_die( $check->get_error_message() );
        }
    }

    /**
     * Run Core Validation Logic.
     * 
     * @return bool|WP_Error True if valid, WP_Error if bot detected.
     */
    private function run_validation() {
        $s = $this->get_settings();
        if ( ! $s['enabled'] ) return true;

        // Basic
        if ( $s['method'] === 'basic' ) {
            // 1. Honeypot check
            if ( $s['basic_honeypot'] && ! empty( $_POST['ldwp_hp_check'] ) ) {
                return new WP_Error( 'bot_detected', __( 'Security check failed (honeypot).', 'logindesignerwp' ) );
            }

            // 2. Time check
            if ( isset( $_POST['ldwp_time_check'] ) ) {
                $submitted_time = intval( $_POST['ldwp_time_check'] );
                $current_time = time();
                $min_time = max( 1, $s['basic_min_time'] );
                
                // If submitted instantly (< min_time) -> Bot
                // OR if submitted from the future (clock skew handled implicitly by server time) -> Bot
                if ( ( $current_time - $submitted_time ) < $min_time ) {
                    return new WP_Error( 'too_fast', __( 'You submitted the form too fast. Please try again.', 'logindesignerwp' ) );
                }
            } else {
                // strict check if math enabled, loose otherwise
            }

            // 3. Math Challenge Check
            if ( ! empty( $s['basic_math'] ) ) {
                $answer = isset( $_POST['ldwp_math_answer'] ) ? intval( $_POST['ldwp_math_answer'] ) : null;
                $hash   = isset( $_POST['ldwp_math_hash'] ) ? sanitize_text_field( $_POST['ldwp_math_hash'] ) : '';

                if ( null === $answer || empty( $hash ) ) {
                     return new WP_Error( 'math_missing', __( 'Please solve the math problem.', 'logindesignerwp' ) );
                }

                if ( wp_hash( $answer ) !== $hash ) {
                    return new WP_Error( 'math_wrong', __( 'Incorrect math answer.', 'logindesignerwp' ) );
                }
            }
        }

        // Pro Hooks
        $pro_validation = apply_filters( 'logindesignerwp_validate_captcha', true, $s );
        if (is_wp_error($pro_validation)) {
            return $pro_validation;
        }

        return true;
    }
    /**
     * Log security events (Minimal, for critical failures).
     *
     * @param string $message Log message.
     */
    private function log_event( $message ) {
        if ( defined( 'WP_DEBUG' ) && WP_DEBUG ) {
            error_log( '[LoginDesignerWP Security] ' . $message );
        }
    }
}
