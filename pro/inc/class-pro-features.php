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
        // Position
        if ($settings['layout_position'] === 'left' || $settings['layout_position'] === 'right') {
            $align = $settings['layout_position'] === 'left' ? 'flex-start' : 'flex-end';
            $css .= "/* Layout Position */\n";
            $css .= "body.login {\n";
            $css .= "    display: flex !important;\n";
            $css .= "    align-items: center !important;\n";
            $css .= "    justify-content: {$align} !important;\n";
            $css .= "    padding: 0 10% !important;\n";
            $css .= "}\n";
            $css .= "body.login div#login {\n";
            $css .= "    position: relative !important;\n";
            $css .= "    margin: 0 !important;\n";
            $css .= "    padding: 0 !important;\n";
            $css .= "    width: 100% !important;\n";
            $css .= "    max-width: 400px !important;\n";
            $css .= "}\n";
            // Disable default padding on body
            $css .= "html, body { height: 100% !important; }\n";
        }

        // Compact/Spacious
        if ($settings['layout_style'] === 'compact') {
            $css .= "/* Compact Layout */\n";
            $css .= "#loginform, #registerform, #lostpasswordform { padding: 20px !important; }\n";
            $css .= "#login h1 { margin-bottom: 10px !important; }\n";
        } elseif ($settings['layout_style'] === 'spacious') {
            $css .= "/* Spacious Layout */\n";
            $css .= "#loginform, #registerform, #lostpasswordform { padding: 40px !important; }\n";
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
        $content = file_get_contents($file['tmp_name']);
        $data = json_decode($content, true);

        if (!$data || !isset($data['settings'])) {
            wp_send_json_error('Invalid JSON file.');
        }

        // Update settings.
        update_option('logindesignerwp_settings', $data['settings']);

        // Update custom presets if present.
        if (isset($data['custom_presets'])) {
            update_option('logindesignerwp_custom_presets', $data['custom_presets']);
        }

        wp_send_json_success('Settings imported successfully.');
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
            'layout_position' => 'center',
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
        if (isset($input['layout_position'])) {
            $settings['layout_position'] = sanitize_text_field($input['layout_position']);
        }
        if (isset($input['layout_style'])) {
            $settings['layout_style'] = sanitize_text_field($input['layout_style']);
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
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-filter"></span>
                    <?php esc_html_e('Glassmorphism Effects', 'logindesignerwp-pro'); ?>
                    <span class="logindesignerwp-pro-badge">PRO</span>
                </span>
            </h2>
            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e('Enable Glass Effect', 'logindesignerwp-pro'); ?></th>
                    <td>
                        <label>
                            <input type="checkbox" name="logindesignerwp_settings[glass_enabled]" value="1" <?php checked($settings['glass_enabled']); ?>>
                            <?php esc_html_e('Enable glassmorphism effect', 'logindesignerwp-pro'); ?>
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
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-layout"></span>
                    <?php esc_html_e('Layout Options', 'logindesignerwp-pro'); ?>
                    <span class="logindesignerwp-pro-badge">PRO</span>
                </span>
            </h2>
            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e('Form Position', 'logindesignerwp-pro'); ?></th>
                    <td>
                        <select name="logindesignerwp_settings[layout_position]">
                            <option value="center" <?php selected($settings['layout_position'], 'center'); ?>>
                                <?php esc_html_e('Center', 'logindesignerwp-pro'); ?>
                            </option>
                            <option value="left" <?php selected($settings['layout_position'], 'left'); ?>>
                                <?php esc_html_e('Left', 'logindesignerwp-pro'); ?>
                            </option>
                            <option value="right" <?php selected($settings['layout_position'], 'right'); ?>>
                                <?php esc_html_e('Right', 'logindesignerwp-pro'); ?>
                            </option>
                        </select>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Layout Style', 'logindesignerwp-pro'); ?></th>
                    <td>
                        <select name="logindesignerwp_settings[layout_style]">
                            <option value="standard" <?php selected($settings['layout_style'], 'standard'); ?>>
                                <?php esc_html_e('Standard', 'logindesignerwp-pro'); ?>
                            </option>
                            <option value="compact" <?php selected($settings['layout_style'], 'compact'); ?>>
                                <?php esc_html_e('Compact', 'logindesignerwp-pro'); ?>
                            </option>
                            <option value="spacious" <?php selected($settings['layout_style'], 'spacious'); ?>>
                                <?php esc_html_e('Spacious', 'logindesignerwp-pro'); ?>
                            </option>
                        </select>
                    </td>
                </tr>
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
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-randomize"></span>
                    <?php esc_html_e('Redirects & Behavior', 'logindesignerwp-pro'); ?>
                    <span class="logindesignerwp-pro-badge">PRO</span>
                </span>
            </h2>
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
                        <p class="description"><?php esc_html_e('Displayed below the login form.', 'logindesignerwp-pro'); ?>
                        </p>
                    </td>
                </tr>
            </table>
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
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-hammer"></span>
                    <?php esc_html_e('Advanced Tools', 'logindesignerwp-pro'); ?>
                    <span class="logindesignerwp-pro-badge">PRO</span>
                </span>
            </h2>
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
