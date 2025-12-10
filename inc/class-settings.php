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
            array( 'jquery', 'wp-color-picker' ),
            LOGINDESIGNERWP_VERSION,
            true
        );
    }

    /**
     * Render settings page.
     */
    public function render_settings_page() {
        $settings = logindesignerwp_get_settings();
        ?>
        <div class="wrap logindesignerwp-wrap">
            <h1><?php esc_html_e( 'LoginDesignerWP', 'logindesignerwp' ); ?></h1>
            <p class="description"><?php esc_html_e( 'Customize your WordPress login screen with simple, lightweight controls.', 'logindesignerwp' ); ?></p>

            <form method="post" action="options.php">
                <?php settings_fields( 'logindesignerwp_settings_group' ); ?>

                <?php $this->render_background_section( $settings ); ?>
                <?php $this->render_form_section( $settings ); ?>
                <?php $this->render_logo_section( $settings ); ?>

                <div class="logindesignerwp-actions">
                    <?php submit_button( __( 'Save Changes', 'logindesignerwp' ), 'primary', 'submit', false ); ?>
                    <a href="<?php echo esc_url( wp_login_url() ); ?>" target="_blank" class="button button-secondary">
                        <?php esc_html_e( 'Open Login Page', 'logindesignerwp' ); ?>
                    </a>
                </div>
            </form>
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
        <div class="logindesignerwp-card">
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
        <div class="logindesignerwp-card">
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
        <div class="logindesignerwp-card">
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
}
