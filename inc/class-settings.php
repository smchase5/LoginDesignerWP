<?php
/**
 * Settings page class for LoginDesignerWP.
 *
 * @package LoginDesignerWP
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

/**
 * Class LoginDesignerWP_Settings
 *
 * Handles admin settings page and registration.
 */
class LoginDesignerWP_Settings {

    /**
     * Option name.
     *
     * @var string
     */
    private $option_name = 'logindesignerwp_settings';

    /**
     * Constructor.
     */
    public function __construct() {
        add_action( 'admin_menu', array( $this, 'add_settings_page' ) );
        add_action( 'admin_init', array( $this, 'register_settings' ) );
        add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_admin_assets' ) );
    }

    /**
     * Add settings page to admin menu.
     */
    public function add_settings_page() {
        add_options_page(
            __( 'LoginDesignerWP', 'logindesignerwp' ),
            __( 'LoginDesignerWP', 'logindesignerwp' ),
            'manage_options',
            'logindesignerwp',
            array( $this, 'render_settings_page' )
        );
    }

    /**
     * Register settings.
     */
    public function register_settings() {
        register_setting(
            'logindesignerwp_settings_group',
            $this->option_name,
            array(
                'type'              => 'array',
                'sanitize_callback' => 'logindesignerwp_sanitize_settings',
                'default'           => logindesignerwp_get_defaults(),
            )
        );
    }

    /**
     * Enqueue admin assets.
     *
     * @param string $hook Current admin page hook.
     */
    public function enqueue_admin_assets( $hook ) {
        if ( 'settings_page_logindesignerwp' !== $hook ) {
            return;
        }

        // WordPress color picker.
        wp_enqueue_style( 'wp-color-picker' );
        wp_enqueue_script( 'wp-color-picker' );

        // Media uploader.
        wp_enqueue_media();

        // Plugin admin styles.
        wp_enqueue_style(
            'logindesignerwp-admin',
            LOGINDESIGNERWP_URL . 'assets/css/admin.css',
            array(),
            LOGINDESIGNERWP_VERSION
        );

        // Plugin admin scripts.
        wp_enqueue_script(
            'logindesignerwp-admin',
            LOGINDESIGNERWP_URL . 'assets/js/admin.js',
            array( 'jquery', 'wp-color-picker', 'jquery-ui-sortable' ),
            LOGINDESIGNERWP_VERSION,
            true
        );
    }

    /**
     * Render settings page.
     */
    public function render_settings_page() {
        $settings = logindesignerwp_get_settings();
        
        // Get image URLs for preview.
        $bg_image_url = $settings['background_image_id'] ? wp_get_attachment_image_url( $settings['background_image_id'], 'full' ) : '';
        $logo_url     = $settings['logo_id'] ? wp_get_attachment_image_url( $settings['logo_id'], 'medium' ) : '';
        ?>
        <div class="wrap logindesignerwp-wrap">
            <h1><?php esc_html_e( 'LoginDesignerWP', 'logindesignerwp' ); ?></h1>
            <p class="description"><?php esc_html_e( 'Customize your WordPress login screen with simple, lightweight controls.', 'logindesignerwp' ); ?></p>

            <div class="logindesignerwp-layout">
                <!-- Settings Column -->
                <div class="logindesignerwp-settings-column">
                    <form method="post" action="options.php" id="logindesignerwp-settings-form">
                        <?php settings_fields( 'logindesignerwp_settings_group' ); ?>

                        <?php $this->render_background_section( $settings ); ?>
                        <?php $this->render_form_section( $settings ); ?>
                        <?php $this->render_logo_section( $settings ); ?>

                        <!-- Pro Locked Sections -->
                        <?php $this->render_pro_locked_sections(); ?>

                        <div class="logindesignerwp-actions">
                            <?php submit_button( __( 'Save Changes', 'logindesignerwp' ), 'primary', 'submit', false ); ?>
                            <a href="<?php echo esc_url( wp_login_url() ); ?>" target="_blank" class="button button-secondary">
                                <?php esc_html_e( 'Open Login Page', 'logindesignerwp' ); ?>
                            </a>
                        </div>
                    </form>
                </div>

                <!-- Preview Column -->
                <div class="logindesignerwp-preview-column">
                    <div class="logindesignerwp-preview-sticky">
                        <div class="logindesignerwp-preview-container" 
                             data-bg-image="<?php echo esc_url( $bg_image_url ); ?>"
                             data-logo-url="<?php echo esc_url( $logo_url ); ?>">
                            <span class="logindesignerwp-preview-badge"><?php esc_html_e( 'Live Preview', 'logindesignerwp' ); ?></span>
                            <!-- Preview Background -->
                            <div class="logindesignerwp-preview-bg" id="ldwp-preview-bg">
                                <!-- Preview Login Box -->
                                <div class="logindesignerwp-preview-login" id="ldwp-preview-login">
                                    <!-- Logo -->
                                    <div class="logindesignerwp-preview-logo" id="ldwp-preview-logo">
                                        <a href="#">
                                            <?php if ( $logo_url ) : ?>
                                                <img src="<?php echo esc_url( $logo_url ); ?>" alt="Logo" id="ldwp-preview-logo-img">
                                            <?php else : ?>
                                                <svg id="ldwp-preview-logo-wp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.52 122.523" width="84" height="84">
                                                    <path fill="#fff" d="M8.708 61.26c0 20.802 12.089 38.779 29.619 47.298L13.258 39.872a52.354 52.354 0 00-4.55 21.388zM96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501L48.2 93.547l11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z"/>
                                                    <path fill="#fff" d="M62.184 65.857l-15.768 45.819a52.552 52.552 0 0032.29-.838 4.693 4.693 0 01-.37-.712L62.184 65.857zM107.376 36.046a42.584 42.584 0 01.358 5.708c0 5.651-1.057 12.002-4.229 19.94l-16.973 49.082c16.519-9.627 27.618-27.628 27.618-48.18 0-9.762-2.499-18.929-6.774-26.55z"/>
                                                    <path fill="#fff" d="M61.262 0C27.483 0 0 27.481 0 61.26c0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.265-27.48 61.265-61.263C122.526 27.481 95.04 0 61.262 0zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z"/>
                                                </svg>
                                            <?php endif; ?>
                                        </a>
                                    </div>

                                    <!-- Form -->
                                    <div class="logindesignerwp-preview-form" id="ldwp-preview-form">
                                        <div class="logindesignerwp-preview-field">
                                            <label id="ldwp-preview-label-user"><?php esc_html_e( 'Username or Email', 'logindesignerwp' ); ?></label>
                                            <input type="text" id="ldwp-preview-input-user" readonly>
                                        </div>
                                        <div class="logindesignerwp-preview-field">
                                            <label id="ldwp-preview-label-pass"><?php esc_html_e( 'Password', 'logindesignerwp' ); ?></label>
                                            <input type="password" id="ldwp-preview-input-pass" value="••••••••" readonly>
                                        </div>
                                        <div class="logindesignerwp-preview-remember">
                                            <label><input type="checkbox" checked readonly> <?php esc_html_e( 'Remember Me', 'logindesignerwp' ); ?></label>
                                        </div>
                                        <button type="button" id="ldwp-preview-button"><?php esc_html_e( 'Log In', 'logindesignerwp' ); ?></button>
                                    </div>

                                    <!-- Links -->
                                    <div class="logindesignerwp-preview-links" id="ldwp-preview-links">
                                        <a href="#"><?php esc_html_e( 'Lost your password?', 'logindesignerwp' ); ?></a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Preview Actions -->
                        <div class="logindesignerwp-preview-actions">
                            <button type="submit" form="logindesignerwp-settings-form" class="button button-primary">
                                <?php esc_html_e( 'Save Changes', 'logindesignerwp' ); ?>
                            </button>
                            <a href="<?php echo esc_url( wp_login_url() ); ?>" target="_blank" class="button button-secondary">
                                <?php esc_html_e( 'Open Login Page', 'logindesignerwp' ); ?>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Render background section.
     *
     * @param array $settings Current settings.
     */
    private function render_background_section( $settings ) {
        ?>
        <div class="logindesignerwp-card" data-section-id="background">
            <h2><?php esc_html_e( 'Background', 'logindesignerwp' ); ?></h2>

            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e( 'Background Type', 'logindesignerwp' ); ?></th>
                    <td>
                        <fieldset>
                            <label>
                                <input type="radio" name="<?php echo esc_attr( $this->option_name ); ?>[background_mode]" value="solid" <?php checked( $settings['background_mode'], 'solid' ); ?>>
                                <?php esc_html_e( 'Solid Color', 'logindesignerwp' ); ?>
                            </label><br>
                            <label>
                                <input type="radio" name="<?php echo esc_attr( $this->option_name ); ?>[background_mode]" value="gradient" <?php checked( $settings['background_mode'], 'gradient' ); ?>>
                                <?php esc_html_e( 'Gradient', 'logindesignerwp' ); ?>
                            </label><br>
                            <label>
                                <input type="radio" name="<?php echo esc_attr( $this->option_name ); ?>[background_mode]" value="image" <?php checked( $settings['background_mode'], 'image' ); ?>>
                                <?php esc_html_e( 'Image', 'logindesignerwp' ); ?>
                            </label>
                        </fieldset>
                    </td>
                </tr>
            </table>

            <!-- Solid Color Options -->
            <div class="logindesignerwp-bg-options logindesignerwp-bg-solid" <?php echo $settings['background_mode'] !== 'solid' ? 'style="display:none;"' : ''; ?>>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Background Color', 'logindesignerwp' ); ?></th>
                        <td>
                            <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[background_color]" value="<?php echo esc_attr( $settings['background_color'] ); ?>">
                            <p class="description"><?php esc_html_e( 'This color fills the entire background of the login page.', 'logindesignerwp' ); ?></p>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Gradient Options -->
            <div class="logindesignerwp-bg-options logindesignerwp-bg-gradient" <?php echo $settings['background_mode'] !== 'gradient' ? 'style="display:none;"' : ''; ?>>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Gradient Start', 'logindesignerwp' ); ?></th>
                        <td>
                            <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[background_gradient_1]" value="<?php echo esc_attr( $settings['background_gradient_1'] ); ?>">
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Gradient End', 'logindesignerwp' ); ?></th>
                        <td>
                            <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[background_gradient_2]" value="<?php echo esc_attr( $settings['background_gradient_2'] ); ?>">
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Image Options -->
            <div class="logindesignerwp-bg-options logindesignerwp-bg-image" <?php echo $settings['background_mode'] !== 'image' ? 'style="display:none;"' : ''; ?>>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Background Image', 'logindesignerwp' ); ?></th>
                        <td>
                            <?php $image_url = $settings['background_image_id'] ? wp_get_attachment_image_url( $settings['background_image_id'], 'medium' ) : ''; ?>
                            <div class="logindesignerwp-image-preview" <?php echo ! $image_url ? 'style="display:none;"' : ''; ?>>
                                <img src="<?php echo esc_url( $image_url ); ?>" alt="">
                            </div>
                            <input type="hidden" class="logindesignerwp-image-id" name="<?php echo esc_attr( $this->option_name ); ?>[background_image_id]" value="<?php echo esc_attr( $settings['background_image_id'] ); ?>">
                            <button type="button" class="button logindesignerwp-upload-image"><?php esc_html_e( 'Select Image', 'logindesignerwp' ); ?></button>
                            <button type="button" class="button logindesignerwp-remove-image" <?php echo ! $image_url ? 'style="display:none;"' : ''; ?>><?php esc_html_e( 'Remove', 'logindesignerwp' ); ?></button>
                            <p class="description"><?php esc_html_e( 'If you set a background image, it will appear behind the login form.', 'logindesignerwp' ); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Image Size', 'logindesignerwp' ); ?></th>
                        <td>
                            <select name="<?php echo esc_attr( $this->option_name ); ?>[background_image_size]">
                                <option value="cover" <?php selected( $settings['background_image_size'], 'cover' ); ?>><?php esc_html_e( 'Cover', 'logindesignerwp' ); ?></option>
                                <option value="contain" <?php selected( $settings['background_image_size'], 'contain' ); ?>><?php esc_html_e( 'Contain', 'logindesignerwp' ); ?></option>
                                <option value="auto" <?php selected( $settings['background_image_size'], 'auto' ); ?>><?php esc_html_e( 'Auto', 'logindesignerwp' ); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Image Position', 'logindesignerwp' ); ?></th>
                        <td>
                            <select name="<?php echo esc_attr( $this->option_name ); ?>[background_image_pos]">
                                <option value="center" <?php selected( $settings['background_image_pos'], 'center' ); ?>><?php esc_html_e( 'Center', 'logindesignerwp' ); ?></option>
                                <option value="top" <?php selected( $settings['background_image_pos'], 'top' ); ?>><?php esc_html_e( 'Top', 'logindesignerwp' ); ?></option>
                                <option value="bottom" <?php selected( $settings['background_image_pos'], 'bottom' ); ?>><?php esc_html_e( 'Bottom', 'logindesignerwp' ); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Image Repeat', 'logindesignerwp' ); ?></th>
                        <td>
                            <select name="<?php echo esc_attr( $this->option_name ); ?>[background_image_repeat]">
                                <option value="no-repeat" <?php selected( $settings['background_image_repeat'], 'no-repeat' ); ?>><?php esc_html_e( 'No Repeat', 'logindesignerwp' ); ?></option>
                                <option value="repeat" <?php selected( $settings['background_image_repeat'], 'repeat' ); ?>><?php esc_html_e( 'Repeat', 'logindesignerwp' ); ?></option>
                            </select>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <?php
    }

    /**
     * Render form section.
     *
     * @param array $settings Current settings.
     */
    private function render_form_section( $settings ) {
        ?>
        <div class="logindesignerwp-card" data-section-id="form">
            <h2><?php esc_html_e( 'Login Form', 'logindesignerwp' ); ?></h2>

            <h3><?php esc_html_e( 'Form Container', 'logindesignerwp' ); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e( 'Background Color', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[form_bg_color]" value="<?php echo esc_attr( $settings['form_bg_color'] ); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Border Radius', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="number" name="<?php echo esc_attr( $this->option_name ); ?>[form_border_radius]" value="<?php echo esc_attr( $settings['form_border_radius'] ); ?>" min="0" max="50" step="1"> px
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Border Color', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[form_border_color]" value="<?php echo esc_attr( $settings['form_border_color'] ); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Box Shadow', 'logindesignerwp' ); ?></th>
                    <td>
                        <label>
                            <input type="checkbox" name="<?php echo esc_attr( $this->option_name ); ?>[form_shadow_enable]" value="1" <?php checked( $settings['form_shadow_enable'] ); ?>>
                            <?php esc_html_e( 'Enable box shadow', 'logindesignerwp' ); ?>
                        </label>
                    </td>
                </tr>
            </table>

            <h3><?php esc_html_e( 'Fields & Labels', 'logindesignerwp' ); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e( 'Label Text Color', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[label_text_color]" value="<?php echo esc_attr( $settings['label_text_color'] ); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Input Background', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[input_bg_color]" value="<?php echo esc_attr( $settings['input_bg_color'] ); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Input Text Color', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[input_text_color]" value="<?php echo esc_attr( $settings['input_text_color'] ); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Input Border Color', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[input_border_color]" value="<?php echo esc_attr( $settings['input_border_color'] ); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Input Focus Color', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[input_border_focus]" value="<?php echo esc_attr( $settings['input_border_focus'] ); ?>">
                    </td>
                </tr>
            </table>

            <h3><?php esc_html_e( 'Button', 'logindesignerwp' ); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e( 'Button Background', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[button_bg]" value="<?php echo esc_attr( $settings['button_bg'] ); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Button Hover Background', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[button_bg_hover]" value="<?php echo esc_attr( $settings['button_bg_hover'] ); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Button Text Color', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[button_text_color]" value="<?php echo esc_attr( $settings['button_text_color'] ); ?>">
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Button Border Radius', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="number" name="<?php echo esc_attr( $this->option_name ); ?>[button_border_radius]" value="<?php echo esc_attr( $settings['button_border_radius'] ); ?>" min="0" max="999" step="1"> px
                        <p class="description"><?php esc_html_e( 'Use 999 for fully rounded (pill) buttons.', 'logindesignerwp' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Below Form Link Color', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="logindesignerwp-color-picker" name="<?php echo esc_attr( $this->option_name ); ?>[below_form_link_color]" value="<?php echo esc_attr( $settings['below_form_link_color'] ); ?>" data-preview-target="below-form-links">
                        <p class="description"><?php esc_html_e( 'Color for "Lost your password?" and "Back to site" links.', 'logindesignerwp' ); ?></p>
                    </td>
                </tr>
            </table>
        </div>
        <?php
    }

    /**
     * Render logo section.
     *
     * @param array $settings Current settings.
     */
    private function render_logo_section( $settings ) {
        ?>
        <div class="logindesignerwp-card" data-section-id="logo">
            <h2><?php esc_html_e( 'Logo', 'logindesignerwp' ); ?></h2>

            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e( 'Custom Logo', 'logindesignerwp' ); ?></th>
                    <td>
                        <?php $logo_url = $settings['logo_id'] ? wp_get_attachment_image_url( $settings['logo_id'], 'medium' ) : ''; ?>
                        <div class="logindesignerwp-image-preview logindesignerwp-logo-preview" <?php echo ! $logo_url ? 'style="display:none;"' : ''; ?>>
                            <img src="<?php echo esc_url( $logo_url ); ?>" alt="">
                        </div>
                        <input type="hidden" class="logindesignerwp-image-id" name="<?php echo esc_attr( $this->option_name ); ?>[logo_id]" value="<?php echo esc_attr( $settings['logo_id'] ); ?>">
                        <button type="button" class="button logindesignerwp-upload-image"><?php esc_html_e( 'Select Logo', 'logindesignerwp' ); ?></button>
                        <button type="button" class="button logindesignerwp-remove-image" <?php echo ! $logo_url ? 'style="display:none;"' : ''; ?>><?php esc_html_e( 'Remove', 'logindesignerwp' ); ?></button>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Logo Width', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="number" name="<?php echo esc_attr( $this->option_name ); ?>[logo_width]" value="<?php echo esc_attr( $settings['logo_width'] ); ?>" min="50" max="500" step="1"> px
                        <p class="description"><?php esc_html_e( 'Logo width is a maximum; the image will scale down on smaller screens.', 'logindesignerwp' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Logo Link URL', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="url" class="regular-text" name="<?php echo esc_attr( $this->option_name ); ?>[logo_url]" value="<?php echo esc_attr( $settings['logo_url'] ); ?>" placeholder="<?php echo esc_attr( home_url() ); ?>">
                        <p class="description"><?php esc_html_e( 'Leave empty to link to your homepage.', 'logindesignerwp' ); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e( 'Logo Title', 'logindesignerwp' ); ?></th>
                    <td>
                        <input type="text" class="regular-text" name="<?php echo esc_attr( $this->option_name ); ?>[logo_title]" value="<?php echo esc_attr( $settings['logo_title'] ); ?>" placeholder="<?php echo esc_attr( get_bloginfo( 'name' ) ); ?>">
                        <p class="description"><?php esc_html_e( 'Leave empty to use your site name.', 'logindesignerwp' ); ?></p>
                    </td>
                </tr>
            </table>
        </div>
        <?php
    }

    /**
     * Render all Pro locked sections.
     */
    private function render_pro_locked_sections() {
        $upgrade_url = 'https://frontierwp.com/logindesignerwp-pro';
        ?>
        
        <!-- Glassmorphism Section -->
        <div class="logindesignerwp-pro-locked">
            <div class="logindesignerwp-pro-locked-header">
                <h2 class="logindesignerwp-pro-locked-title">
                    <span class="dashicons dashicons-lock"></span>
                    <?php esc_html_e( 'Glassmorphism Effects', 'logindesignerwp' ); ?>
                </h2>
                <span class="logindesignerwp-pro-badge">
                    <span class="dashicons dashicons-star-filled"></span>
                    <?php esc_html_e( 'Pro', 'logindesignerwp' ); ?>
                </span>
            </div>
            <div class="logindesignerwp-pro-locked-content">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Blur Strength', 'logindesignerwp' ); ?></th>
                        <td><input type="range" min="0" max="20" value="8" disabled> <span>8px</span></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Transparency', 'logindesignerwp' ); ?></th>
                        <td><input type="range" min="0" max="100" value="80" disabled> <span>80%</span></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Glass Border', 'logindesignerwp' ); ?></th>
                        <td><input type="checkbox" disabled checked> <?php esc_html_e( 'Enable frosted border effect', 'logindesignerwp' ); ?></td>
                    </tr>
                </table>
            </div>
            <div class="logindesignerwp-pro-locked-footer">
                <a href="<?php echo esc_url( $upgrade_url ); ?>" class="logindesignerwp-pro-upgrade-btn" target="_blank">
                    <span class="dashicons dashicons-unlock"></span>
                    <?php esc_html_e( 'Unlock with LoginDesignerWP Pro', 'logindesignerwp' ); ?>
                </a>
                <p class="logindesignerwp-pro-upgrade-text"><?php esc_html_e( 'Create stunning glass-like form effects', 'logindesignerwp' ); ?></p>
            </div>
        </div>

        <!-- Layout Options Section -->
        <div class="logindesignerwp-pro-locked">
            <div class="logindesignerwp-pro-locked-header">
                <h2 class="logindesignerwp-pro-locked-title">
                    <span class="dashicons dashicons-lock"></span>
                    <?php esc_html_e( 'Layout Options', 'logindesignerwp' ); ?>
                </h2>
                <span class="logindesignerwp-pro-badge">
                    <span class="dashicons dashicons-star-filled"></span>
                    <?php esc_html_e( 'Pro', 'logindesignerwp' ); ?>
                </span>
            </div>
            <div class="logindesignerwp-pro-locked-content">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Form Position', 'logindesignerwp' ); ?></th>
                        <td>
                            <select disabled>
                                <option><?php esc_html_e( 'Center', 'logindesignerwp' ); ?></option>
                                <option><?php esc_html_e( 'Left', 'logindesignerwp' ); ?></option>
                                <option><?php esc_html_e( 'Right', 'logindesignerwp' ); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Layout Style', 'logindesignerwp' ); ?></th>
                        <td>
                            <select disabled>
                                <option><?php esc_html_e( 'Standard', 'logindesignerwp' ); ?></option>
                                <option><?php esc_html_e( 'Compact', 'logindesignerwp' ); ?></option>
                                <option><?php esc_html_e( 'Spacious', 'logindesignerwp' ); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Hide Footer Links', 'logindesignerwp' ); ?></th>
                        <td><input type="checkbox" disabled> <?php esc_html_e( 'Hide "Back to site" and privacy links', 'logindesignerwp' ); ?></td>
                    </tr>
                </table>
            </div>
            <div class="logindesignerwp-pro-locked-footer">
                <a href="<?php echo esc_url( $upgrade_url ); ?>" class="logindesignerwp-pro-upgrade-btn" target="_blank">
                    <span class="dashicons dashicons-unlock"></span>
                    <?php esc_html_e( 'Unlock with LoginDesignerWP Pro', 'logindesignerwp' ); ?>
                </a>
                <p class="logindesignerwp-pro-upgrade-text"><?php esc_html_e( 'Position and style your login form', 'logindesignerwp' ); ?></p>
            </div>
        </div>

        <!-- Presets Section -->
        <div class="logindesignerwp-pro-locked">
            <div class="logindesignerwp-pro-locked-header">
                <h2 class="logindesignerwp-pro-locked-title">
                    <span class="dashicons dashicons-lock"></span>
                    <?php esc_html_e( 'Design Presets', 'logindesignerwp' ); ?>
                </h2>
                <span class="logindesignerwp-pro-badge">
                    <span class="dashicons dashicons-star-filled"></span>
                    <?php esc_html_e( 'Pro', 'logindesignerwp' ); ?>
                </span>
            </div>
            <div class="logindesignerwp-pro-locked-content">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Choose Preset', 'logindesignerwp' ); ?></th>
                        <td>
                            <select disabled style="min-width: 200px;">
                                <option><?php esc_html_e( 'Dark Glass', 'logindesignerwp' ); ?></option>
                                <option><?php esc_html_e( 'Minimal Light', 'logindesignerwp' ); ?></option>
                                <option><?php esc_html_e( 'Neon Gradient', 'logindesignerwp' ); ?></option>
                                <option><?php esc_html_e( 'Corporate Blue', 'logindesignerwp' ); ?></option>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Save Current', 'logindesignerwp' ); ?></th>
                        <td><button type="button" class="button" disabled><?php esc_html_e( 'Save as Preset', 'logindesignerwp' ); ?></button></td>
                    </tr>
                </table>
            </div>
            <div class="logindesignerwp-pro-locked-footer">
                <a href="<?php echo esc_url( $upgrade_url ); ?>" class="logindesignerwp-pro-upgrade-btn" target="_blank">
                    <span class="dashicons dashicons-unlock"></span>
                    <?php esc_html_e( 'Unlock with LoginDesignerWP Pro', 'logindesignerwp' ); ?>
                </a>
                <p class="logindesignerwp-pro-upgrade-text"><?php esc_html_e( 'One-click beautiful designs', 'logindesignerwp' ); ?></p>
            </div>
        </div>

        <!-- Redirects Section -->
        <div class="logindesignerwp-pro-locked">
            <div class="logindesignerwp-pro-locked-header">
                <h2 class="logindesignerwp-pro-locked-title">
                    <span class="dashicons dashicons-lock"></span>
                    <?php esc_html_e( 'Redirects & Behavior', 'logindesignerwp' ); ?>
                </h2>
                <span class="logindesignerwp-pro-badge">
                    <span class="dashicons dashicons-star-filled"></span>
                    <?php esc_html_e( 'Pro', 'logindesignerwp' ); ?>
                </span>
            </div>
            <div class="logindesignerwp-pro-locked-content">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e( 'After Login Redirect', 'logindesignerwp' ); ?></th>
                        <td><input type="text" class="regular-text" placeholder="/my-account/" disabled></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'After Logout Redirect', 'logindesignerwp' ); ?></th>
                        <td><input type="text" class="regular-text" placeholder="/" disabled></td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Custom Message', 'logindesignerwp' ); ?></th>
                        <td><textarea rows="2" class="large-text" placeholder="Need help? Contact support..." disabled></textarea></td>
                    </tr>
                </table>
            </div>
            <div class="logindesignerwp-pro-locked-footer">
                <a href="<?php echo esc_url( $upgrade_url ); ?>" class="logindesignerwp-pro-upgrade-btn" target="_blank">
                    <span class="dashicons dashicons-unlock"></span>
                    <?php esc_html_e( 'Unlock with LoginDesignerWP Pro', 'logindesignerwp' ); ?>
                </a>
                <p class="logindesignerwp-pro-upgrade-text"><?php esc_html_e( 'Control where users go after login/logout', 'logindesignerwp' ); ?></p>
            </div>
        </div>

        <!-- Advanced Tools Section -->
        <div class="logindesignerwp-pro-locked">
            <div class="logindesignerwp-pro-locked-header">
                <h2 class="logindesignerwp-pro-locked-title">
                    <span class="dashicons dashicons-lock"></span>
                    <?php esc_html_e( 'Advanced Tools', 'logindesignerwp' ); ?>
                </h2>
                <span class="logindesignerwp-pro-badge">
                    <span class="dashicons dashicons-star-filled"></span>
                    <?php esc_html_e( 'Pro', 'logindesignerwp' ); ?>
                </span>
            </div>
            <div class="logindesignerwp-pro-locked-content">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Export / Import', 'logindesignerwp' ); ?></th>
                        <td>
                            <button type="button" class="button" disabled><?php esc_html_e( 'Export Settings', 'logindesignerwp' ); ?></button>
                            <button type="button" class="button" disabled><?php esc_html_e( 'Import Settings', 'logindesignerwp' ); ?></button>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e( 'Custom CSS', 'logindesignerwp' ); ?></th>
                        <td><textarea rows="4" class="large-text code" placeholder="/* Add your custom CSS here */" disabled></textarea></td>
                    </tr>
                </table>
            </div>
            <div class="logindesignerwp-pro-locked-footer">
                <a href="<?php echo esc_url( $upgrade_url ); ?>" class="logindesignerwp-pro-upgrade-btn" target="_blank">
                    <span class="dashicons dashicons-unlock"></span>
                    <?php esc_html_e( 'Unlock with LoginDesignerWP Pro', 'logindesignerwp' ); ?>
                </a>
                <p class="logindesignerwp-pro-upgrade-text"><?php esc_html_e( 'Export settings and add custom CSS', 'logindesignerwp' ); ?></p>
            </div>
        </div>

        <?php
    }
}
