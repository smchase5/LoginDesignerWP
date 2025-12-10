<?php
/**
 * Pro License Management.
 *
 * Handles license key validation and activation.
 * For development, this uses a stub that always returns valid.
 *
 * @package LoginDesignerWP_Pro
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * License management class.
 */
class LoginDesignerWP_Pro_License {

    /**
     * Option name for storing license data.
     *
     * @var string
     */
    private $option_name = 'logindesignerwp_pro_license';

    /**
     * Instance of this class.
     *
     * @var LoginDesignerWP_Pro_License
     */
    private static $instance = null;

    /**
     * Get the single instance of this class.
     *
     * @return LoginDesignerWP_Pro_License
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor.
     */
    public function __construct() {
        if ( null !== self::$instance && self::$instance !== $this ) {
            return;
        }
        self::$instance = $this;

        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'logindesignerwp_render_settings_tab', array( $this, 'render_license_field' ) );
        add_action( 'wp_ajax_logindesignerwp_activate_license', array( $this, 'ajax_activate_license' ) );
        add_action( 'wp_ajax_logindesignerwp_deactivate_license', array( $this, 'ajax_deactivate_license' ) );
    }

    /**
     * Register license settings.
     */
    public function register_settings() {
        register_setting( 'logindesignerwp_pro_license_group', $this->option_name, array(
            'sanitize_callback' => array( $this, 'sanitize_license' ),
        ) );
    }

    /**
     * Sanitize license input.
     *
     * @param array $input Raw input.
     * @return array Sanitized input.
     */
    public function sanitize_license( $input ) {
        $sanitized = array();
        
        if ( isset( $input['license_key'] ) ) {
            $sanitized['license_key'] = sanitize_text_field( $input['license_key'] );
        }
        
        if ( isset( $input['status'] ) ) {
            $sanitized['status'] = sanitize_text_field( $input['status'] );
        }
        
        return $sanitized;
    }

    /**
     * Get license data.
     *
     * @return array License data.
     */
    public function get_license_data() {
        $defaults = array(
            'license_key' => '',
            'status'      => 'inactive',
        );
        
        return wp_parse_args( get_option( $this->option_name, array() ), $defaults );
    }

    /**
     * Check if license is valid.
     *
     * @return bool True if license is valid.
     */
    public function is_valid() {
        $license = $this->get_license_data();
        
        // For development: any non-empty license key is valid.
        // TODO: Replace with actual API validation.
        return ! empty( $license['license_key'] ) && 'active' === $license['status'];
    }

    /**
     * Render license field in settings.
     */
    public function render_license_field() {
        $license = $this->get_license_data();
        $is_active = $this->is_valid();
        ?>
        <div class="logindesignerwp-card" data-section-id="license" style="border-left: 4px solid <?php echo $is_active ? '#22c55e' : '#f59e0b'; ?>;">
            <h2>
                <span class="dashicons dashicons-admin-network"></span>
                <?php esc_html_e( 'Pro License', 'logindesignerwp-pro' ); ?>
                <?php if ( $is_active ) : ?>
                    <span style="background: #22c55e; color: #fff; font-size: 11px; padding: 2px 8px; border-radius: 3px; margin-left: 8px;">
                        <?php esc_html_e( 'Active', 'logindesignerwp-pro' ); ?>
                    </span>
                <?php endif; ?>
            </h2>
            
            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e( 'License Key', 'logindesignerwp-pro' ); ?></th>
                    <td>
                        <input type="text" 
                               id="logindesignerwp-license-key"
                               class="regular-text" 
                               value="<?php echo esc_attr( $license['license_key'] ); ?>"
                               placeholder="<?php esc_attr_e( 'Enter your license key', 'logindesignerwp-pro' ); ?>"
                               <?php echo $is_active ? 'readonly' : ''; ?>
                        />
                        
                        <?php if ( $is_active ) : ?>
                            <button type="button" class="button" id="logindesignerwp-deactivate-license">
                                <?php esc_html_e( 'Deactivate', 'logindesignerwp-pro' ); ?>
                            </button>
                        <?php else : ?>
                            <button type="button" class="button button-primary" id="logindesignerwp-activate-license">
                                <?php esc_html_e( 'Activate', 'logindesignerwp-pro' ); ?>
                            </button>
                        <?php endif; ?>
                        
                        <p class="description" id="logindesignerwp-license-message"></p>
                    </td>
                </tr>
            </table>
        </div>
        
        <script>
        jQuery(document).ready(function($) {
            $('#logindesignerwp-activate-license').on('click', function() {
                var $btn = $(this);
                var licenseKey = $('#logindesignerwp-license-key').val();
                
                if (!licenseKey) {
                    $('#logindesignerwp-license-message').html('<span style="color: #dc2626;">Please enter a license key.</span>');
                    return;
                }
                
                $btn.prop('disabled', true).text('Activating...');
                
                $.post(ajaxurl, {
                    action: 'logindesignerwp_activate_license',
                    license_key: licenseKey,
                    nonce: '<?php echo wp_create_nonce( 'logindesignerwp_license_nonce' ); ?>'
                }, function(response) {
                    if (response.success) {
                        location.reload();
                    } else {
                        $('#logindesignerwp-license-message').html('<span style="color: #dc2626;">' + response.data + '</span>');
                        $btn.prop('disabled', false).text('Activate');
                    }
                });
            });
            
            $('#logindesignerwp-deactivate-license').on('click', function() {
                var $btn = $(this);
                $btn.prop('disabled', true).text('Deactivating...');
                
                $.post(ajaxurl, {
                    action: 'logindesignerwp_deactivate_license',
                    nonce: '<?php echo wp_create_nonce( 'logindesignerwp_license_nonce' ); ?>'
                }, function(response) {
                    location.reload();
                });
            });
        });
        </script>
        <?php
    }

    /**
     * AJAX handler for license activation.
     */
    public function ajax_activate_license() {
        check_ajax_referer( 'logindesignerwp_license_nonce', 'nonce' );
        
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Permission denied.' );
        }
        
        $license_key = isset( $_POST['license_key'] ) ? sanitize_text_field( $_POST['license_key'] ) : '';
        
        if ( empty( $license_key ) ) {
            wp_send_json_error( 'Please enter a license key.' );
        }
        
        // TODO: Replace with actual API call to validate license.
        // For development, any non-empty key is valid.
        $is_valid = ! empty( $license_key );
        
        if ( $is_valid ) {
            update_option( $this->option_name, array(
                'license_key' => $license_key,
                'status'      => 'active',
            ) );
            wp_send_json_success( 'License activated!' );
        } else {
            wp_send_json_error( 'Invalid license key.' );
        }
    }

    /**
     * AJAX handler for license deactivation.
     */
    public function ajax_deactivate_license() {
        check_ajax_referer( 'logindesignerwp_license_nonce', 'nonce' );
        
        if ( ! current_user_can( 'manage_options' ) ) {
            wp_send_json_error( 'Permission denied.' );
        }
        
        update_option( $this->option_name, array(
            'license_key' => '',
            'status'      => 'inactive',
        ) );
        
        wp_send_json_success( 'License deactivated.' );
    }
}
