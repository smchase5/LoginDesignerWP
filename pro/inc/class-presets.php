<?php
/**
 * Design Presets Feature.
 *
 * Provides built-in presets and save/apply functionality.
 *
 * @package LoginDesignerWP_Pro
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Presets management class.
 */
class LoginDesignerWP_Pro_Presets
{

    /**
     * Built-in presets.
     *
     * @var array
     */
    private $built_in_presets = array();

    /**
     * Constructor.
     */
    public function __construct()
    {
        $this->init_presets();

        // Hook into Pro sections rendering.
        add_action('logindesignerwp_render_pro_sections', array($this, 'render_presets_section'));

        // AJAX handlers.
        add_action('wp_ajax_logindesignerwp_apply_preset', array($this, 'ajax_apply_preset'));
        add_action('wp_ajax_logindesignerwp_save_preset', array($this, 'ajax_save_preset'));
        add_action('wp_ajax_logindesignerwp_delete_preset', array($this, 'ajax_delete_preset'));
    }

    /**
     * Initialize built-in presets.
     */
    private function init_presets()
    {
        $this->built_in_presets = array(
            'dark_mode' => array(
                'name' => __('Dark Mode', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'solid',
                    'background_color' => '#0f172a',
                    'form_bg_color' => '#1e293b',
                    'form_border_radius' => 12,
                    'form_border_color' => '#334155',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#e2e8f0',
                    'input_bg_color' => '#0f172a',
                    'input_text_color' => '#f8fafc',
                    'input_border_color' => '#475569',
                    'input_border_focus' => '#3b82f6',
                    'button_bg' => '#3b82f6',
                    'button_bg_hover' => '#2563eb',
                    'button_text_color' => '#ffffff',
                    'button_border_radius' => 8,
                    'below_form_link_color' => '#94a3b8',
                ),
            ),
            'corporate_blue' => array(
                'name' => __('Corporate Blue', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'gradient',
                    'background_gradient_1' => '#1e40af',
                    'background_gradient_2' => '#3b82f6',
                    'form_bg_color' => '#ffffff',
                    'form_border_radius' => 8,
                    'form_border_color' => '#e5e7eb',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#374151',
                    'input_bg_color' => '#f9fafb',
                    'input_text_color' => '#111827',
                    'input_border_color' => '#d1d5db',
                    'input_border_focus' => '#2563eb',
                    'button_bg' => '#1e40af',
                    'button_bg_hover' => '#1e3a8a',
                    'button_text_color' => '#ffffff',
                    'button_border_radius' => 6,
                    'below_form_link_color' => '#6b7280',
                ),
            ),
            'minimal_light' => array(
                'name' => __('Minimal Light', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'solid',
                    'background_color' => '#f8fafc',
                    'form_bg_color' => '#ffffff',
                    'form_border_radius' => 4,
                    'form_border_color' => '#e2e8f0',
                    'form_shadow_enable' => false,
                    'label_text_color' => '#475569',
                    'input_bg_color' => '#ffffff',
                    'input_text_color' => '#1e293b',
                    'input_border_color' => '#cbd5e1',
                    'input_border_focus' => '#0ea5e9',
                    'button_bg' => '#0f172a',
                    'button_bg_hover' => '#1e293b',
                    'button_text_color' => '#ffffff',
                    'button_border_radius' => 4,
                    'below_form_link_color' => '#64748b',
                ),
            ),
            'sunset_gradient' => array(
                'name' => __('Sunset Gradient', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'gradient',
                    'background_gradient_1' => '#f97316',
                    'background_gradient_2' => '#ec4899',
                    'form_bg_color' => '#ffffff',
                    'form_border_radius' => 16,
                    'form_border_color' => '#fecaca',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#1f2937',
                    'input_bg_color' => '#fff7ed',
                    'input_text_color' => '#1f2937',
                    'input_border_color' => '#fed7aa',
                    'input_border_focus' => '#f97316',
                    'button_bg' => '#ea580c',
                    'button_bg_hover' => '#c2410c',
                    'button_text_color' => '#ffffff',
                    'button_border_radius' => 999,
                    'below_form_link_color' => '#78716c',
                ),
            ),
            'forest' => array(
                'name' => __('Forest', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'gradient',
                    'background_gradient_1' => '#14532d',
                    'background_gradient_2' => '#166534',
                    'form_bg_color' => '#f0fdf4',
                    'form_border_radius' => 12,
                    'form_border_color' => '#86efac',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#14532d',
                    'input_bg_color' => '#ffffff',
                    'input_text_color' => '#166534',
                    'input_border_color' => '#bbf7d0',
                    'input_border_focus' => '#22c55e',
                    'button_bg' => '#16a34a',
                    'button_bg_hover' => '#15803d',
                    'button_text_color' => '#ffffff',
                    'button_border_radius' => 8,
                    'below_form_link_color' => '#4ade80',
                ),
            ),
            'midnight' => array(
                'name' => __('Midnight', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'gradient',
                    'background_gradient_1' => '#1e1b4b',
                    'background_gradient_2' => '#312e81',
                    'form_bg_color' => '#0f0a1e',
                    'form_border_radius' => 16,
                    'form_border_color' => '#4c1d95',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#c4b5fd',
                    'input_bg_color' => '#1e1b4b',
                    'input_text_color' => '#f5f3ff',
                    'input_border_color' => '#6d28d9',
                    'input_border_focus' => '#a78bfa',
                    'button_bg' => '#7c3aed',
                    'button_bg_hover' => '#6d28d9',
                    'button_text_color' => '#ffffff',
                    'button_border_radius' => 999,
                    'below_form_link_color' => '#a78bfa',
                ),
            ),
        );
    }

    /**
     * Get all presets (built-in + custom).
     *
     * @return array All presets.
     */
    public function get_all_presets()
    {
        $custom_presets = get_option('logindesignerwp_custom_presets', array());
        return array_merge($this->built_in_presets, $custom_presets);
    }

    /**
     * Render presets section in settings.
     *
     * @param array $settings Current settings.
     */
    public function render_presets_section($settings)
    {
        $presets = $this->get_all_presets();
        $custom_presets = get_option('logindesignerwp_custom_presets', array());
        ?>
        <div class="logindesignerwp-card" data-section-id="presets">
            <h2>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-art"></span>
                    <?php esc_html_e('Design Presets', 'logindesignerwp-pro'); ?>
                    <span class="logindesignerwp-pro-badge">PRO</span>
                </span>
            </h2>

            <table class="form-table">
                <tr>
                    <th scope="row"><?php esc_html_e('Apply Preset', 'logindesignerwp-pro'); ?></th>
                    <td>
                        <select id="logindesignerwp-preset-select" class="regular-text">
                            <option value=""><?php esc_html_e('— Select a preset —', 'logindesignerwp-pro'); ?></option>
                            <optgroup label="<?php esc_attr_e('Built-in Presets', 'logindesignerwp-pro'); ?>">
                                <?php foreach ($this->built_in_presets as $key => $preset): ?>
                                    <option value="<?php echo esc_attr($key); ?>">
                                        <?php echo esc_html($preset['name']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </optgroup>
                            <?php if (!empty($custom_presets)): ?>
                                <optgroup label="<?php esc_attr_e('Custom Presets', 'logindesignerwp-pro'); ?>">
                                    <?php foreach ($custom_presets as $key => $preset): ?>
                                        <option value="<?php echo esc_attr($key); ?>">
                                            <?php echo esc_html($preset['name']); ?>
                                        </option>
                                    <?php endforeach; ?>
                                </optgroup>
                            <?php endif; ?>
                        </select>
                        <button type="button" class="button button-primary" id="logindesignerwp-apply-preset">
                            <?php esc_html_e('Apply', 'logindesignerwp-pro'); ?>
                        </button>
                        <p class="description">
                            <?php esc_html_e('Select a preset and click Apply to update all settings at once.', 'logindesignerwp-pro'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row"><?php esc_html_e('Save Current as Preset', 'logindesignerwp-pro'); ?></th>
                    <td>
                        <input type="text" id="logindesignerwp-preset-name" class="regular-text"
                            placeholder="<?php esc_attr_e('My Custom Preset', 'logindesignerwp-pro'); ?>" />
                        <button type="button" class="button" id="logindesignerwp-save-preset">
                            <?php esc_html_e('Save Preset', 'logindesignerwp-pro'); ?>
                        </button>
                        <p class="description">
                            <?php esc_html_e('Save your current settings as a reusable preset.', 'logindesignerwp-pro'); ?>
                        </p>
                    </td>
                </tr>
            </table>
        </div>

        <script>
            jQuery(document).ready(function ($) {
                // Apply preset
                $('#logindesignerwp-apply-preset').on('click', function () {
                    var preset = $('#logindesignerwp-preset-select').val();
                    if (!preset) {
                        alert('<?php echo esc_js(__('Please select a preset.', 'logindesignerwp-pro')); ?>');
                        return;
                    }

                    var $btn = $(this);
                    $btn.prop('disabled', true).text('<?php echo esc_js(__('Applying...', 'logindesignerwp-pro')); ?>');

                    $.post(ajaxurl, {
                        action: 'logindesignerwp_apply_preset',
                        preset: preset,
                        nonce: '<?php echo wp_create_nonce('logindesignerwp_preset_nonce'); ?>'
                    }, function (response) {
                        if (response.success) {
                            location.reload();
                        } else {
                            alert(response.data);
                            $btn.prop('disabled', false).text('<?php echo esc_js(__('Apply', 'logindesignerwp-pro')); ?>');
                        }
                    });
                });

                // Save preset
                $('#logindesignerwp-save-preset').on('click', function () {
                    var name = $('#logindesignerwp-preset-name').val();
                    if (!name) {
                        alert('<?php echo esc_js(__('Please enter a preset name.', 'logindesignerwp-pro')); ?>');
                        return;
                    }

                    var $btn = $(this);
                    $btn.prop('disabled', true).text('<?php echo esc_js(__('Saving...', 'logindesignerwp-pro')); ?>');

                    $.post(ajaxurl, {
                        action: 'logindesignerwp_save_preset',
                        name: name,
                        nonce: '<?php echo wp_create_nonce('logindesignerwp_preset_nonce'); ?>'
                    }, function (response) {
                        if (response.success) {
                            alert('<?php echo esc_js(__('Preset saved!', 'logindesignerwp-pro')); ?>');
                            location.reload();
                        } else {
                            alert(response.data);
                        }
                        $btn.prop('disabled', false).text('<?php echo esc_js(__('Save Preset', 'logindesignerwp-pro')); ?>');
                    });
                });
            });
        </script>
        <?php
    }

    /**
     * AJAX handler for applying preset.
     */
    public function ajax_apply_preset()
    {
        check_ajax_referer('logindesignerwp_preset_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied.');
        }

        $preset_key = isset($_POST['preset']) ? sanitize_text_field($_POST['preset']) : '';
        $all_presets = $this->get_all_presets();

        if (!isset($all_presets[$preset_key])) {
            wp_send_json_error('Preset not found.');
        }

        $preset = $all_presets[$preset_key];
        $current_settings = logindesignerwp_get_settings();

        // Merge preset settings with current settings.
        $new_settings = array_merge($current_settings, $preset['settings']);
        $new_settings['active_preset'] = $preset_key;

        update_option('logindesignerwp_settings', $new_settings);

        wp_send_json_success('Preset applied!');
    }

    /**
     * AJAX handler for saving preset.
     */
    public function ajax_save_preset()
    {
        check_ajax_referer('logindesignerwp_preset_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied.');
        }

        $name = isset($_POST['name']) ? sanitize_text_field($_POST['name']) : '';

        if (empty($name)) {
            wp_send_json_error('Please enter a preset name.');
        }

        // Get current settings.
        $current_settings = logindesignerwp_get_settings();

        // Extract only the styling settings (not Pro-specific ones).
        $preset_settings = array(
            'background_mode' => $current_settings['background_mode'],
            'background_color' => $current_settings['background_color'],
            'background_gradient_1' => $current_settings['background_gradient_1'],
            'background_gradient_2' => $current_settings['background_gradient_2'],
            'form_bg_color' => $current_settings['form_bg_color'],
            'form_border_radius' => $current_settings['form_border_radius'],
            'form_border_color' => $current_settings['form_border_color'],
            'form_shadow_enable' => $current_settings['form_shadow_enable'],
            'label_text_color' => $current_settings['label_text_color'],
            'input_bg_color' => $current_settings['input_bg_color'],
            'input_text_color' => $current_settings['input_text_color'],
            'input_border_color' => $current_settings['input_border_color'],
            'input_border_focus' => $current_settings['input_border_focus'],
            'button_bg' => $current_settings['button_bg'],
            'button_bg_hover' => $current_settings['button_bg_hover'],
            'button_text_color' => $current_settings['button_text_color'],
            'button_border_radius' => $current_settings['button_border_radius'],
            'below_form_link_color' => $current_settings['below_form_link_color'],
        );

        // Generate unique key.
        $key = 'custom_' . sanitize_key($name) . '_' . time();

        // Get existing custom presets.
        $custom_presets = get_option('logindesignerwp_custom_presets', array());

        // Add new preset.
        $custom_presets[$key] = array(
            'name' => $name,
            'settings' => $preset_settings,
        );

        update_option('logindesignerwp_custom_presets', $custom_presets);

        wp_send_json_success('Preset saved!');
    }

    /**
     * AJAX handler for deleting preset.
     */
    public function ajax_delete_preset()
    {
        check_ajax_referer('logindesignerwp_preset_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error('Permission denied.');
        }

        $preset_key = isset($_POST['preset']) ? sanitize_text_field($_POST['preset']) : '';

        // Can only delete custom presets.
        if (strpos($preset_key, 'custom_') !== 0) {
            wp_send_json_error('Cannot delete built-in presets.');
        }

        $custom_presets = get_option('logindesignerwp_custom_presets', array());

        if (isset($custom_presets[$preset_key])) {
            unset($custom_presets[$preset_key]);
            update_option('logindesignerwp_custom_presets', $custom_presets);
        }

        wp_send_json_success('Preset deleted.');
    }
}
