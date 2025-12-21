<?php
/**
 * Pro Features Enablement.
 *
 * Hooks into Free plugin to enable Pro features when licensed.
 *
 * @package LoginDesignerWP_Pro
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Pro features class.
 */
class LoginDesignerWP_Pro_Features
{

    /**
     * Constructor.
     */
    public function __construct()
    {
        // Hook into Pro detection filter.
        add_filter('logindesignerwp_is_pro_active', array($this, 'check_pro_status'));

        // Extend default settings.
        add_filter('logindesignerwp_default_settings', array($this, 'extend_defaults'));

        // Extend sanitization.
        add_filter('logindesignerwp_sanitize_settings', array($this, 'sanitize_pro_settings'), 10, 2);

        // Hook into Pro sections rendering.
        add_action('logindesignerwp_render_pro_sections', array($this, 'render_glassmorphism_section'));
        add_action('logindesignerwp_render_pro_sections', array($this, 'render_layout_section'));
        add_action('logindesignerwp_render_pro_sections', array($this, 'render_redirects_section'));
        add_action('logindesignerwp_render_pro_sections', array($this, 'render_advanced_section'));

        // Pro CSS generation.
        add_action('logindesignerwp_login_styles', array($this, 'output_pro_css'));

        // Custom message on login page.
        add_action('login_footer', array($this, 'render_custom_message'));

        // Redirect handlers.
        add_filter('login_redirect', array($this, 'handle_login_redirect'), 10, 3);
        add_action('wp_logout', array($this, 'handle_logout_redirect'));

        // Import/Export AJAX.
        add_action('wp_ajax_logindesignerwp_export_settings', array($this, 'ajax_export_settings'));
        add_action('wp_ajax_logindesignerwp_import_settings', array($this, 'ajax_import_settings'));
    }

    /**
     * Check if Pro is active and licensed.
     *
     * @param bool $is_active Current Pro status.
     * @return bool True if Pro is active.
     */
    public function check_pro_status($is_active)
    {
        // Get license instance and check validity.
        $license = new LoginDesignerWP_Pro_License();
        return $license->is_valid();
    }

    /**
     * Output Pro CSS styles.
     *
     * @param array $settings Current settings.
     */
    public function output_pro_css($settings)
    {
        $css = "";

        // Glassmorphism
        if (!empty($settings['glass_enabled'])) {
            $blur = intval($settings['glass_blur']);
            // Convert transparency (0-100) to opacity (1.0-0.0).
            $opacity = 1 - (intval($settings['glass_transparency']) / 100);
            $bg_color_rgb = $this->hex_to_rgb($settings['form_bg_color']);
            $bg_rgba = "rgba({$bg_color_rgb[0]}, {$bg_color_rgb[1]}, {$bg_color_rgb[2]}, {$opacity})";

            $css .= "/* Glassmorphism */\n";
            $css .= "body.login div#login form#loginform,\n";
            $css .= "body.login div#login form#registerform,\n";
            $css .= "body.login div#login form#lostpasswordform {\n";
            $css .= "    background: {$bg_rgba} !important;\n";
            $css .= "    backdrop-filter: blur({$blur}px) !important;\n";
            $css .= "    -webkit-backdrop-filter: blur({$blur}px) !important;\n";

            if (!empty($settings['glass_border'])) {
                $css .= "    border: 1px solid rgba(255, 255, 255, 0.2) !important;\n";
            }
            $css .= "}\n";
        }

        // Layout Options
        // 9-Position Grid
        $pos_x = isset($settings['layout_position_x']) ? $settings['layout_position_x'] : 'center';
        $pos_y = isset($settings['layout_position_y']) ? $settings['layout_position_y'] : 'center';

        // Map positions to flexbox values
        $justify_map = array('left' => 'flex-start', 'center' => 'center', 'right' => 'flex-end');
        $align_map = array('top' => 'flex-start', 'center' => 'center', 'bottom' => 'flex-end');

        $justify = isset($justify_map[$pos_x]) ? $justify_map[$pos_x] : 'center';
        $align = isset($align_map[$pos_y]) ? $align_map[$pos_y] : 'center';

        // Only apply custom positioning if not default center-center
        if ($pos_x !== 'center' || $pos_y !== 'center') {
            $css .= "/* Layout Position */\n";
            $css .= "body.login {\n";
            $css .= "    display: flex !important;\n";
            $css .= "    flex-direction: column !important;\n";
            $css .= "    align-items: {$justify} !important;\n";
            $css .= "    justify-content: {$align} !important;\n";
            $css .= "    min-height: 100vh !important;\n";
            $css .= "    padding: 5% 10% !important;\n";
            $css .= "    box-sizing: border-box !important;\n";
            $css .= "}\n";
            $css .= "body.login div#login {\n";
            $css .= "    position: relative !important;\n";
            $css .= "    margin: 0 !important;\n";
            $css .= "    padding: 0 !important;\n";
            $css .= "    width: 100% !important;\n";
            $css .= "    max-width: 400px !important;\n";
            $css .= "}\n";
            $css .= "html, body { height: 100% !important; margin: 0 !important; }\n";
        }

        // Layout Style - Compact/Standard/Spacious with balanced spacing
        if ($settings['layout_style'] === 'compact') {
            $css .= "/* Compact Layout */\n";
            $css .= "#loginform, #registerform, #lostpasswordform { padding: 16px 20px !important; }\n";
            $css .= "#login h1 { margin-bottom: 12px !important; }\n";
            $css .= "#loginform p, #registerform p { margin-bottom: 12px !important; }\n";
        } elseif ($settings['layout_style'] === 'spacious') {
            $css .= "/* Spacious Layout */\n";
            $css .= "#loginform, #registerform, #lostpasswordform { padding: 32px 36px !important; }\n";
            $css .= "#login h1 { margin-bottom: 32px !important; }\n";
            $css .= "#loginform p, #registerform p { margin-bottom: 20px !important; }\n";
            $css .= "#loginform .input, #registerform .input { padding: 8px 12px !important; font-size: 15px !important; }\n";
        }

        // Hide Footer Links
        if (!empty($settings['hide_footer_links'])) {
            $css .= "/* Hide Footer Links */\n";
            $css .= "#login #nav, #login #backtoblog, .privacy-policy-page-link { display: none !important; }\n";
        }

        // Custom CSS
        if (!empty($settings['custom_css'])) {
            $css .= "/* Custom CSS */\n";
            $css .= $settings['custom_css'] . "\n";
        }

        echo $css;
    }

    /**
     * Handle login redirect.
     *
     * @param string $redirect_to Requested redirect URL.
     * @param string $request Requested redirect URL (raw).
     * @param WP_User $user User object.
     * @return string Redirect URL.
     */
    public function handle_login_redirect($redirect_to, $request, $user)
    {
        $settings = logindesignerwp_get_settings();
        if (!empty($settings['redirect_login']) && !is_wp_error($user)) {
            return $settings['redirect_login'];
        }
        return $redirect_to;
    }

    /**
     * Handle logout redirect.
     */
    public function handle_logout_redirect()
    {
        $settings = logindesignerwp_get_settings();
        if (!empty($settings['redirect_logout'])) {
            wp_redirect($settings['redirect_logout']);
            exit;
        }
    }

    /**
     * Render custom message on login page.
     */
    public function render_custom_message()
    {
        $settings = logindesignerwp_get_settings();
        if (!empty($settings['custom_message'])) {
            $link_color = !empty($settings['below_form_link_color']) ? $settings['below_form_link_color'] : '#50575e';
            echo '<div id="logindesignerwp-custom-message" style="color: ' . esc_attr($link_color) . '; text-align: center; margin-top: 16px; font-size: 13px;">';
            echo wp_kses_post(nl2br($settings['custom_message']));
            echo '</div>';
        }
    }

    /**
     * AJAX handler for exporting settings.
     */
    public function ajax_export_settings()
    {
        check_ajax_referer('logindesignerwp_export_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_die('Permission denied.');
        }

        $settings = logindesignerwp_get_settings();
        $custom_presets = get_option('logindesignerwp_custom_presets', array());

        $export_data = array(
            'settings' => $settings,
            'custom_presets' => $custom_presets,
            'exported_at' => date('Y-m-d H:i:s'),
            'version' => LOGINDESIGNERWP_VERSION,
        );

        $filename = 'logindesignerwp-settings-' . date('Y-m-d') . '.json';

        header('Content-Type: application/json');
        header('Content-Disposition: attachment; filename="' . $filename . '"');
        echo json_encode($export_data, JSON_PRETTY_PRINT);
        exit;
    }

    /**
     * AJAX handler for importing settings.
     */
    public function ajax_import_settings()
    {
        check_ajax_referer('logindesignerwp_import_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied.');
        }

        if (empty($_FILES['import_file'])) {
            wp_send_json_error('No file uploaded.');
        }

        $file = $_FILES['import_file'];

        // Validate file type.
        $file_type = wp_check_filetype($file['name']);
        if ($file_type['ext'] !== 'json') {
            wp_send_json_error(__('Invalid file type. Please upload a JSON file.', 'logindesignerwp-pro'));
        }

        $content = file_get_contents($file['tmp_name']);
        $data = json_decode($content, true);

        if (!$data || !isset($data['settings'])) {
            wp_send_json_error('Invalid JSON file.');
        }

        // Sanitize settings through the standard sanitizer.
        $sanitized_settings = logindesignerwp_sanitize_settings($data['settings']);
        update_option('logindesignerwp_settings', $sanitized_settings);

        // Update custom presets if present, with sanitization.
        if (isset($data['custom_presets']) && is_array($data['custom_presets'])) {
            $sanitized_presets = array();
            foreach ($data['custom_presets'] as $key => $preset) {
                if (!is_array($preset)) {
                    continue;
                }
                $sanitized_presets[sanitize_key($key)] = array(
                    'name' => sanitize_text_field($preset['name'] ?? ''),
                    'settings' => logindesignerwp_sanitize_settings($preset['settings'] ?? array()),
                );
            }
            update_option('logindesignerwp_custom_presets', $sanitized_presets);
        }

        wp_send_json_success(__('Settings imported successfully.', 'logindesignerwp-pro'));
    }

    /**
     * Helper: Hex to RGB.
     * 
     * @param string $hex Hex color.
     * @return array RGB values.
     */
    private function hex_to_rgb($hex)
    {
        $hex = str_replace('#', '', $hex);
        if (strlen($hex) == 3) {
            $r = hexdec(substr($hex, 0, 1) . substr($hex, 0, 1));
            $g = hexdec(substr($hex, 1, 1) . substr($hex, 1, 1));
            $b = hexdec(substr($hex, 2, 1) . substr($hex, 2, 1));
        } else {
            $r = hexdec(substr($hex, 0, 2));
            $g = hexdec(substr($hex, 2, 2));
            $b = hexdec(substr($hex, 4, 2));
        }
        return array($r, $g, $b);
    }


    /**
     * Extend default settings with Pro options.
     *
     * @param array $defaults Default settings.
     * @return array Extended defaults.
     */
    public function extend_defaults($defaults)
    {
        $pro_defaults = array(
            // Current preset (if any).
            'active_preset' => '',

            // Glassmorphism settings.
            'glass_enabled' => false,
            'glass_blur' => 10,
            'glass_transparency' => 80,
            'glass_border' => true,

            // Layout settings.
            'layout_position_x' => 'center',
            'layout_position_y' => 'center',
            'layout_style' => 'standard',
            'hide_footer_links' => false,

            // Redirect settings.
            'redirect_login' => '',
            'redirect_logout' => '',
            'custom_message' => '',

            // Advanced tools.
            'custom_css' => '',
        );

        return array_merge($defaults, $pro_defaults);
    }

    /**
     * Sanitize Pro-specific settings.
     *
     * @param array $settings Settings to sanitize.
     * @return array Sanitized settings.
     */
    /**
     * Sanitize Pro-specific settings.
     *
     * @param array $settings Settings to sanitize.
     * @param array $input Raw input.
     * @return array Sanitized settings.
     */
    public function sanitize_pro_settings($settings, $input = array())
    {
        // Sanitize active preset.
        if (isset($input['active_preset'])) {
            $settings['active_preset'] = sanitize_text_field($input['active_preset']);
        }

        // Sanitize glassmorphism settings.
        if (isset($input['glass_enabled'])) {
            $settings['glass_enabled'] = (bool) $input['glass_enabled'];
        } else {
            $settings['glass_enabled'] = false;
        }

        if (isset($input['glass_blur'])) {
            $settings['glass_blur'] = absint($input['glass_blur']);
        }
        if (isset($input['glass_transparency'])) {
            $settings['glass_transparency'] = min(100, max(0, absint($input['glass_transparency'])));
        }
        if (isset($input['glass_border'])) {
            $settings['glass_border'] = (bool) $input['glass_border'];
        } else {
            $settings['glass_border'] = false;
        }

        // Sanitize layout settings.
        if (isset($input['layout_position_x'])) {
            $allowed_x = array('left', 'center', 'right');
            $settings['layout_position_x'] = in_array($input['layout_position_x'], $allowed_x, true) ? $input['layout_position_x'] : 'center';
        }
        if (isset($input['layout_position_y'])) {
            $allowed_y = array('top', 'center', 'bottom');
            $settings['layout_position_y'] = in_array($input['layout_position_y'], $allowed_y, true) ? $input['layout_position_y'] : 'center';
        }
        if (isset($input['layout_style'])) {
            $allowed_styles = array('compact', 'standard', 'spacious');
            $settings['layout_style'] = in_array($input['layout_style'], $allowed_styles, true) ? $input['layout_style'] : 'standard';
        }
        if (isset($input['hide_footer_links'])) {
            $settings['hide_footer_links'] = (bool) $input['hide_footer_links'];
        } else {
            $settings['hide_footer_links'] = false;
        }

        // Sanitize redirect settings.
        if (isset($input['redirect_login'])) {
            $settings['redirect_login'] = esc_url_raw($input['redirect_login']);
        }
        if (isset($input['redirect_logout'])) {
            $settings['redirect_logout'] = esc_url_raw($input['redirect_logout']);
        }
        if (isset($input['custom_message'])) {
            $settings['custom_message'] = sanitize_textarea_field($input['custom_message']);
        }

        // Sanitize custom CSS.
        if (isset($input['custom_css'])) {
            $settings['custom_css'] = wp_strip_all_tags($input['custom_css']);
        }

        return $settings;
    }

    /**
     * Render Glassmorphism section.
     *
     * @param array $settings Current settings.
     */
    public function render_glassmorphism_section($settings)
    {
        ?>
        <div class="logindesignerwp-card" data-section-id="glassmorphism">
            <h2>
                <span class="drag-handle dashicons dashicons-move"></span>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-filter"></span>
                    <?php esc_html_e('Glassmorphism Effects', 'logindesignerwp-pro'); ?>
                    <span class="logindesignerwp-pro-badge">PRO</span>
                </span>
            </h2>
            <div class="logindesignerwp-card-content">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Enable Glass Effect', 'logindesignerwp-pro'); ?></th>
                        <td>
                            <label class="ldwp-toggle">
                                <input type="checkbox" name="logindesignerwp_settings[glass_enabled]" value="1" <?php checked($settings['glass_enabled']); ?>>
                                <span class="ldwp-toggle-slider"></span>
                                <span
                                    class="ldwp-toggle-label"><?php esc_html_e('Enable glassmorphism effect', 'logindesignerwp-pro'); ?></span>
                            </label>
                            <p class="description">
                                <?php esc_html_e('Requires a background image to be visible.', 'logindesignerwp-pro'); ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Blur Strength', 'logindesignerwp-pro'); ?></th>
                        <td>
                            <input type="range" name="logindesignerwp_settings[glass_blur]" min="0" max="20"
                                value="<?php echo esc_attr($settings['glass_blur']); ?>"
                                oninput="this.nextElementSibling.value = this.value + 'px'">
                            <output><?php echo esc_html($settings['glass_blur']); ?>px</output>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Transparency', 'logindesignerwp-pro'); ?></th>
                        <td>
                            <input type="range" name="logindesignerwp_settings[glass_transparency]" min="0" max="100"
                                value="<?php echo esc_attr($settings['glass_transparency']); ?>"
                                oninput="this.nextElementSibling.value = this.value + '%'">
                            <output><?php echo esc_html($settings['glass_transparency']); ?>%</output>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Glass Border', 'logindesignerwp-pro'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="logindesignerwp_settings[glass_border]" value="1" <?php checked($settings['glass_border']); ?>>
                                <?php esc_html_e('Enable frosted border effect', 'logindesignerwp-pro'); ?>
                            </label>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <?php
    }

    /**
     * Render Layout section.
     *
     * @param array $settings Current settings.
     */
    public function render_layout_section($settings)
    {
        ?>
        <div class="logindesignerwp-card" data-section-id="layout">
            <h2>
                <span class="drag-handle dashicons dashicons-move"></span>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-layout"></span>
                    <?php esc_html_e('Layout Options', 'logindesignerwp-pro'); ?>
                    <span class="logindesignerwp-pro-badge">PRO</span>
                </span>
            </h2>
            <div class="logindesignerwp-card-content">
                <!-- Form Position: 9-position grid -->
                <h3><?php esc_html_e('Form Position', 'logindesignerwp-pro'); ?></h3>
                <p class="description" style="margin-bottom: 12px;">
                    <?php esc_html_e('Choose where the login form appears on the page.', 'logindesignerwp-pro'); ?>
                </p>

                <input type="hidden" name="logindesignerwp_settings[layout_position_x]" id="ldwp-position-x"
                    value="<?php echo esc_attr($settings['layout_position_x']); ?>">
                <input type="hidden" name="logindesignerwp_settings[layout_position_y]" id="ldwp-position-y"
                    value="<?php echo esc_attr($settings['layout_position_y']); ?>">

                <div class="ldwp-position-grid">
                    <?php
                    $positions = array(
                        'top-left' => array('x' => 'left', 'y' => 'top'),
                        'top-center' => array('x' => 'center', 'y' => 'top'),
                        'top-right' => array('x' => 'right', 'y' => 'top'),
                        'center-left' => array('x' => 'left', 'y' => 'center'),
                        'center-center' => array('x' => 'center', 'y' => 'center'),
                        'center-right' => array('x' => 'right', 'y' => 'center'),
                        'bottom-left' => array('x' => 'left', 'y' => 'bottom'),
                        'bottom-center' => array('x' => 'center', 'y' => 'bottom'),
                        'bottom-right' => array('x' => 'right', 'y' => 'bottom'),
                    );
                    foreach ($positions as $key => $pos):
                        $is_active = ($settings['layout_position_x'] === $pos['x'] && $settings['layout_position_y'] === $pos['y']);
                        ?>
                        <div class="ldwp-position-cell<?php echo $is_active ? ' is-active' : ''; ?>"
                            data-x="<?php echo esc_attr($pos['x']); ?>" data-y="<?php echo esc_attr($pos['y']); ?>">
                            <div class="ldwp-position-preview ldwp-pos-<?php echo esc_attr($key); ?>">
                                <div class="ldwp-mini-form"></div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>

                <!-- Layout Style: Visual cards -->
                <h3 style="margin-top: 28px;"><?php esc_html_e('Layout Style', 'logindesignerwp-pro'); ?></h3>
                <p class="description" style="margin-bottom: 12px;">
                    <?php esc_html_e('Adjust the form spacing and padding.', 'logindesignerwp-pro'); ?>
                </p>

                <input type="hidden" name="logindesignerwp_settings[layout_style]" id="ldwp-layout-style"
                    value="<?php echo esc_attr($settings['layout_style']); ?>">

                <div class="ldwp-style-cards">
                    <div class="ldwp-style-card<?php echo $settings['layout_style'] === 'compact' ? ' is-active' : ''; ?>"
                        data-style="compact">
                        <div class="ldwp-style-preview ldwp-style-compact">
                            <div class="ldwp-style-form">
                                <div class="ldwp-style-field"></div>
                                <div class="ldwp-style-field"></div>
                                <div class="ldwp-style-btn"></div>
                            </div>
                        </div>
                        <span class="ldwp-style-label"><?php esc_html_e('Compact', 'logindesignerwp-pro'); ?></span>
                    </div>
                    <div class="ldwp-style-card<?php echo $settings['layout_style'] === 'standard' ? ' is-active' : ''; ?>"
                        data-style="standard">
                        <div class="ldwp-style-preview ldwp-style-standard">
                            <div class="ldwp-style-form">
                                <div class="ldwp-style-field"></div>
                                <div class="ldwp-style-field"></div>
                                <div class="ldwp-style-btn"></div>
                            </div>
                        </div>
                        <span class="ldwp-style-label"><?php esc_html_e('Standard', 'logindesignerwp-pro'); ?></span>
                    </div>
                    <div class="ldwp-style-card<?php echo $settings['layout_style'] === 'spacious' ? ' is-active' : ''; ?>"
                        data-style="spacious">
                        <div class="ldwp-style-preview ldwp-style-spacious">
                            <div class="ldwp-style-form">
                                <div class="ldwp-style-field"></div>
                                <div class="ldwp-style-field"></div>
                                <div class="ldwp-style-btn"></div>
                            </div>
                        </div>
                        <span class="ldwp-style-label"><?php esc_html_e('Spacious', 'logindesignerwp-pro'); ?></span>
                    </div>
                </div>

                <!-- Hide Footer Links -->
                <table class="form-table" style="margin-top: 16px;">
                    <tr>
                        <th scope="row"><?php esc_html_e('Hide Footer Links', 'logindesignerwp-pro'); ?></th>
                        <td>
                            <label>
                                <input type="checkbox" name="logindesignerwp_settings[hide_footer_links]" value="1" <?php checked($settings['hide_footer_links']); ?>>
                                <?php esc_html_e('Hide "Back to site" and privacy links', 'logindesignerwp-pro'); ?>
                            </label>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <?php
    }

    /**
     * Render Redirects section.
     *
     * @param array $settings Current settings.
     */
    public function render_redirects_section($settings)
    {
        ?>
        <div class="logindesignerwp-card" data-section-id="redirects">
            <h2>
                <span class="drag-handle dashicons dashicons-move"></span>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-migrate"></span>
                    <?php esc_html_e('Redirects & Behavior', 'logindesignerwp-pro'); ?>
                    <span class="logindesignerwp-pro-badge">PRO</span>
                </span>
            </h2>
            <div class="logindesignerwp-card-content">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('After Login Redirect', 'logindesignerwp-pro'); ?></th>
                        <td>
                            <input type="url" class="regular-text" name="logindesignerwp_settings[redirect_login]"
                                value="<?php echo esc_attr($settings['redirect_login']); ?>"
                                placeholder="<?php echo esc_attr(home_url('/my-account/')); ?>">
                            <p class="description">
                                <?php esc_html_e('Leave empty for default WordPress behavior.', 'logindesignerwp-pro'); ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('After Logout Redirect', 'logindesignerwp-pro'); ?></th>
                        <td>
                            <input type="url" class="regular-text" name="logindesignerwp_settings[redirect_logout]"
                                value="<?php echo esc_attr($settings['redirect_logout']); ?>"
                                placeholder="<?php echo esc_attr(home_url()); ?>">
                            <p class="description">
                                <?php esc_html_e('Leave empty for default WordPress behavior.', 'logindesignerwp-pro'); ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Custom Message', 'logindesignerwp-pro'); ?></th>
                        <td>
                            <textarea name="logindesignerwp_settings[custom_message]" rows="2" class="large-text"
                                placeholder="<?php esc_html_e('Need help? Contact support...', 'logindesignerwp-pro'); ?>"><?php echo esc_textarea($settings['custom_message']); ?></textarea>
                            <p class="description">
                                <?php esc_html_e('Displayed below the login form.', 'logindesignerwp-pro'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
        </div>
        <?php
    }

    /**
     * Render Advanced Tools section.
     *
     * @param array $settings Current settings.
     */
    public function render_advanced_section($settings)
    {
        ?>
        <div class="logindesignerwp-card" data-section-id="advanced">
            <h2>
                <span class="drag-handle dashicons dashicons-move"></span>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-admin-tools"></span>
                    <?php esc_html_e('Advanced Tools', 'logindesignerwp-pro'); ?>
                    <span class="logindesignerwp-pro-badge">PRO</span>
                </span>
            </h2>
            <div class="logindesignerwp-card-content">
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('Export / Import', 'logindesignerwp-pro'); ?></th>
                        <td>
                            <button type="button" class="button"
                                id="logindesignerwp-export"><?php esc_html_e('Export Settings', 'logindesignerwp-pro'); ?></button>
                            <button type="button" class="button"
                                id="logindesignerwp-import-trigger"><?php esc_html_e('Import Settings', 'logindesignerwp-pro'); ?></button>
                            <input type="file" id="logindesignerwp-import-file" style="display:none;" accept=".json">
                            <p class="description">
                                <?php esc_html_e('Export your settings to JSON or import from another site.', 'logindesignerwp-pro'); ?>
                            </p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row"><?php esc_html_e('Custom CSS', 'logindesignerwp-pro'); ?></th>
                        <td>
                            <textarea name="logindesignerwp_settings[custom_css]" rows="6" class="large-text code"
                                placeholder="/* Add your custom CSS here */"><?php echo esc_textarea($settings['custom_css']); ?></textarea>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <script>
            jQuery(document).ready(function ($) {
                // Export
                $('#logindesignerwp-export').on('click', function () {
                    window.location.href = ajaxurl + '?action=logindesignerwp_export_settings&nonce=<?php echo wp_create_nonce('logindesignerwp_export_nonce'); ?>';
                });

                // Import
                $('#logindesignerwp-import-trigger').on('click', function () {
                    $('#logindesignerwp-import-file').click();
                });

                $('#logindesignerwp-import-file').on('change', function () {
                    var file = this.files[0];
                    if (!file) return;

                    var formData = new FormData();
                    formData.append('action', 'logindesignerwp_import_settings');
                    formData.append('nonce', '<?php echo wp_create_nonce('logindesignerwp_import_nonce'); ?>');
                    formData.append('import_file', file);

                    var $btn = $('#logindesignerwp-import-trigger');
                    $btn.prop('disabled', true).text('Importing...');

                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: formData,
                        processData: false,
                        contentType: false,
                        success: function (response) {
                            if (response.success) {
                                alert('Settings imported successfully!');
                                location.reload();
                            } else {
                                alert('Import failed: ' + response.data);
                                $btn.prop('disabled', false).text('Import Settings');
                            }
                        },
                        error: function () {
                            alert('Import failed. Please try again.');
                            $btn.prop('disabled', false).text('Import Settings');
                        }
                    });
                });
            });
        </script>
        <?php
    }
}
