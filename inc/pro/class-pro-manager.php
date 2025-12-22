<?php
/**
 * Pro Manager Class
 *
 * Bootstraps Pro features, licensing, and updates.
 *
 * @package LoginDesignerWP
 */

namespace LoginDesignerWP\Pro;

if (!defined('ABSPATH')) {
    exit;
}

class Pro_Manager
{

    /**
     * License Handler instance.
     *
     * @var License_Handler
     */
    private $license_handler;

    /**
     * Updater instance.
     *
     * @var Plugin_Updater
     */
    private $updater;

    /**
     * Constructor.
     */
    public function __construct()
    {
        require_once __DIR__ . '/class-license-handler.php';
        require_once __DIR__ . '/class-updater.php';

        $this->license_handler = new License_Handler();
        $this->license_handler->init();

        // Initialize Pro Features if valid
        if ($this->license_handler->get_license_status() === 'valid') {
            // Define legacy path
            if (!defined('LOGINDESIGNERWP_PRO_PATH')) {
                define('LOGINDESIGNERWP_PRO_PATH', dirname(dirname(__DIR__)) . '/pro/');
            }

            $features_file = LOGINDESIGNERWP_PRO_PATH . 'inc/class-pro-features.php';
            $presets_file = LOGINDESIGNERWP_PRO_PATH . 'inc/class-presets.php';

            if (file_exists($features_file) && file_exists($presets_file)) {
                require_once $features_file;
                require_once $presets_file;

                // Instantiate Features
                if (class_exists('LoginDesignerWP_Pro_Features')) {
                    $features = new \LoginDesignerWP_Pro_Features();

                    // Remove legacy license check filter to prevent errors/conflicts
                    remove_filter('logindesignerwp_is_pro_active', [$features, 'check_pro_status']);
                }

                // Instantiate Presets
                if (class_exists('LoginDesignerWP_Pro_Presets')) {
                    new \LoginDesignerWP_Pro_Presets();
                }

                // Instantiate Security Modules
                $sec_settings = get_option('logindesignerwp_security_settings', []);

                // Turnstile
                if (file_exists(__DIR__ . '/security/class-turnstile.php')) {
                    require_once __DIR__ . '/security/class-turnstile.php';
                    new \LoginDesignerWP\Pro\Security\Turnstile($sec_settings);
                }

                // reCAPTCHA
                if (file_exists(__DIR__ . '/security/class-recaptcha.php')) {
                    require_once __DIR__ . '/security/class-recaptcha.php';
                    new \LoginDesignerWP\Pro\Security\Recaptcha($sec_settings);
                }
            }
        }

        // Initialize Updater if we have a key
        $license_key = $this->license_handler->get_license_key();
        if ($license_key) {
            // Assuming PRO_PLUGIN_FILE is defined in the main pro file, 
            // checking if defined, otherwise use main plugin file as fallback for this dev setup
            // Ensure constants are defined or fallback.
            $main_file = defined('LOGINDESIGNERWP_FILE') ? LOGINDESIGNERWP_FILE : dirname(dirname(__DIR__)) . '/login-designer-wp.php';
            $plugin_file = defined('LOGINDESIGNERWP_PRO_FILE') ? LOGINDESIGNERWP_PRO_FILE : $main_file;
            $version = defined('LOGINDESIGNERWP_PRO_VERSION') ? LOGINDESIGNERWP_PRO_VERSION : (defined('LOGINDESIGNERWP_VERSION') ? LOGINDESIGNERWP_VERSION : '1.0.0');

            $this->updater = new Plugin_Updater($plugin_file, $version, $license_key);
        }

        // Admin Hooks
        add_action('logindesignerwp_settings_tabs', [$this, 'add_license_tab_nav']);
        add_action('logindesignerwp_settings_content', [$this, 'render_license_tab_content']);
        add_action('wp_ajax_logindesignerwp_activate_license', [$this, 'ajax_activate_license']);
        add_action('wp_ajax_logindesignerwp_deactivate_license', [$this, 'ajax_deactivate_license']);

        // Filter to unlock Pro features
        add_filter('logindesignerwp_is_pro_active', [$this, 'filter_is_pro_active']);
    }

    /**
     * Add License tab to navigation.
     *
     * @param string $active_tab Current active tab.
     */
    public function add_license_tab_nav($active_tab)
    {
        ?>
        <a href="#" class="logindesignerwp-tab<?php echo $active_tab === 'license' ? ' active' : ''; ?>" data-tab="license">
            <span class="dashicons dashicons-awards"></span>
            <?php esc_html_e('License', 'logindesignerwp'); ?>
        </a>
        <?php
    }

    /**
     * Render License tab content.
     *
     * @param string $active_tab Current active tab.
     */
    public function render_license_tab_content($active_tab)
    {
        $license_status = $this->license_handler->get_license_status();
        $license_key = $this->license_handler->get_license_key();
        $is_valid = $license_status === 'valid';
        ?>
        <div class="logindesignerwp-tab-content<?php echo $active_tab === 'license' ? ' active' : ''; ?>" id="tab-license" <?php echo $active_tab !== 'license' ? ' style="display:none"' : ''; ?>>

            <div class="logindesignerwp-card">
                <h2>
                    <span></span>
                    <span class="logindesignerwp-card-title-wrapper">
                        <span class="dashicons dashicons-awards"></span>
                        <?php esc_html_e('Pro License', 'logindesignerwp'); ?>
                    </span>
                    <span class="toggle-indicator dashicons dashicons-arrow-down-alt2"></span>
                </h2>
                <div class="logindesignerwp-card-content">
                    <p class="description">
                        <?php esc_html_e('Enter your license key to enable Pro features and receive automatic updates.', 'logindesignerwp'); ?>
                    </p>

                    <table class="form-table">
                        <tr>
                            <th scope="row"><?php esc_html_e('License Key', 'logindesignerwp'); ?></th>
                            <td>
                                <?php if ($is_valid): ?>
                                    <input type="password" value="<?php echo esc_attr($license_key); ?>" class="regular-text"
                                        readonly disabled>
                                    <span class="dashicons dashicons-yes" style="color: #46b450; margin-left: 5px;"></span>
                                    <span
                                        style="color: #46b450; font-weight: bold;"><?php esc_html_e('Active', 'logindesignerwp'); ?></span>
                                    <p>
                                        <button type="button" class="button button-secondary" id="ldwp-deactivate-license">
                                            <?php esc_html_e('Deactivate License', 'logindesignerwp'); ?>
                                        </button>
                                    </p>
                                <?php else: ?>
                                    <input type="password" id="ldwp-license-key" value="" class="regular-text"
                                        placeholder="<?php esc_attr_e('Enter your key...', 'logindesignerwp'); ?>">
                                    <button type="button" class="button button-primary" id="ldwp-activate-license">
                                        <?php esc_html_e('Activate', 'logindesignerwp'); ?>
                                    </button>
                                    <p class="description" id="ldwp-license-message" style="margin-top: 5px;"></p>
                                <?php endif; ?>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <script>
            jQuery(document).ready(function ($) {
                // Activate
                $('#ldwp-activate-license').on('click', function () {
                    var btn = $(this);
                    var key = $('#ldwp-license-key').val();
                    var msg = $('#ldwp-license-message');

                    if (!key) {
                        msg.text('<?php esc_html_e('Please enter a key.', 'logindesignerwp'); ?>').css('color', 'red');
                        return;
                    }

                    btn.addClass('updating-message').prop('disabled', true);
                    msg.text('<?php esc_html_e('Activating...', 'logindesignerwp'); ?>').css('color', '#666');

                    $.post(ajaxurl, {
                        action: 'logindesignerwp_activate_license',
                        license_key: key,
                        nonce: '<?php echo wp_create_nonce('logindesignerwp_license_nonce'); ?>'
                    }, function (response) {
                        btn.removeClass('updating-message').prop('disabled', false);
                        if (response.success) {
                            msg.text('<?php esc_html_e('License activated! Reloading...', 'logindesignerwp'); ?>').css('color', 'green');
                            setTimeout(function () { location.reload(); }, 1000);
                        } else {
                            msg.text(response.data.message || 'Error activating license.').css('color', 'red');
                        }
                    });
                });

                // Deactivate
                $('#ldwp-deactivate-license').on('click', function () {
                    if (!confirm('<?php esc_html_e('Are you sure you want to deactivate?', 'logindesignerwp'); ?>')) return;

                    var btn = $(this);
                    btn.prop('disabled', true).text('<?php esc_html_e('Deactivating...', 'logindesignerwp'); ?>');

                    $.post(ajaxurl, {
                        action: 'logindesignerwp_deactivate_license',
                        nonce: '<?php echo wp_create_nonce('logindesignerwp_license_nonce'); ?>'
                    }, function (response) {
                        if (response.success) {
                            location.reload();
                        } else {
                            alert(response.data.message || 'Error deactivating.');
                            btn.prop('disabled', false).text('<?php esc_html_e('Deactivate License', 'logindesignerwp'); ?>');
                        }
                    });
                });
            });
        </script>
        <?php
    }

    /**
     * AJAX: Activate License.
     */
    public function ajax_activate_license()
    {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Permission denied.']);
        }

        check_ajax_referer('logindesignerwp_license_nonce', 'nonce');

        $key = sanitize_text_field($_POST['license_key']);
        $res = $this->license_handler->activate_license($key);

        if (is_wp_error($res)) {
            wp_send_json_error(['message' => $res->get_error_message()]);
        } else {
            wp_send_json_success($res);
        }
    }

    /**
     * AJAX: Deactivate License.
     */
    public function ajax_deactivate_license()
    {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Permission denied.']);
        }

        check_ajax_referer('logindesignerwp_license_nonce', 'nonce');

        $res = $this->license_handler->deactivate_license();

        if (is_wp_error($res)) {
            wp_send_json_error(['message' => $res->get_error_message()]);
        } else {
            wp_send_json_success($res);
        }
    }

    /**
     * Filter: Is Pro Active?
     *
     * @param bool $status Current status.
     * @return bool True if license is valid.
     */
    public function filter_is_pro_active($status)
    {
        return $this->license_handler->get_license_status() === 'valid';
    }
}
