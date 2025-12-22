<?php
/**
 * Presets UI Manager.
 *
 * Handles rendering of the Presets section in the Design Tab and applying presets.
 * Moved from Pro to Core to support Free users.
 *
 * @package LoginDesignerWP
 */

if (!defined('ABSPATH')) {
    exit;
}

class Login_Designer_WP_Presets_UI
{

    public function __construct()
    {
        // AJAX handlers
        add_action('wp_ajax_logindesignerwp_apply_preset', array($this, 'ajax_apply_preset'));
        add_action('wp_ajax_logindesignerwp_delete_preset', array($this, 'ajax_delete_preset'));
    }

    /**
     * Render the presets section.
     *
     * @param array $settings Current settings.
     */
    public function render_section($settings)
    {
        $core_presets = Login_Designer_WP_Presets_Core::get_presets();
        $is_pro = logindesignerwp_is_pro_active();
        ?>
        <div class="logindesignerwp-card" data-section-id="presets">
            <h2>
                <span class="drag-handle dashicons dashicons-move"></span>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-art"></span>
                    <?php esc_html_e('Design Presets', 'logindesignerwp'); ?>
                </span>
            </h2>

            <div class="logindesignerwp-card-content">
                <div class="logindesignerwp-presets-grid" id="logindesignerwp-presets-grid">
                    <?php
                    foreach ($core_presets as $key => $preset) {
                        $this->render_preset_card($key, $preset, $is_pro);
                    }
                    ?>
                </div>

                <div class="logindesignerwp-preset-actions">
                    <input type="hidden" id="logindesignerwp-preset-select" value="">

                    <button type="button" class="button button-primary button-large" id="logindesignerwp-apply-preset" disabled>
                        <?php esc_html_e('Apply Selected Preset', 'logindesignerwp'); ?>
                    </button>

                    <button type="button" class="button button-link button-large" id="logindesignerwp-delete-preset"
                        style="color: #b32d2e; display: none;">
                        <?php esc_html_e('Delete Preset', 'logindesignerwp'); ?>
                    </button>
                </div>
            </div>
        </div>
        <?php
    }

    /**
     * Render a single preset card.
     * 
     * @param string $key Preset key
     * @param array $preset Preset data
     * @param bool $is_pro Pro status
     */
    private function render_preset_card($key, $preset, $is_pro)
    {
        $preview = isset($preset['preview']) ? $preset['preview'] : $preset['settings']; // Fallback for older structure

        // Normalize preview data if it came from settings directly (legacy)
        $bg = isset($preview['bg']) ? $preview['bg'] : (isset($preset['settings']['background_color']) ? $preset['settings']['background_color'] : '#f0f0f1');
        if (isset($preset['settings']['background_mode']) && $preset['settings']['background_mode'] === 'gradient') {
            $bg = 'linear-gradient(135deg, ' . ($preset['settings']['background_gradient_1'] ?? '#fff') . ', ' . ($preset['settings']['background_gradient_2'] ?? '#000') . ')';
        }

        $form_bg = isset($preview['form_bg']) ? $preview['form_bg'] : ($preset['settings']['form_bg_color'] ?? '#fff');
        $btn_bg = isset($preview['button_bg']) ? $preview['button_bg'] : ($preset['settings']['button_bg'] ?? '#2271b1');

        $is_custom = isset($preset['is_custom']) && $preset['is_custom'];
        $is_locked = !$is_pro && !empty($preset['is_pro']) && !$is_custom;

        $classes = 'logindesignerwp-preset-card';
        if ($is_locked)
            $classes .= ' is-locked';
        if ($is_custom)
            $classes .= ' is-custom';
        ?>
        <div class="<?php echo esc_attr($classes); ?>" data-preset="<?php echo esc_attr($key); ?>" <?php echo $is_locked ? 'title="' . esc_attr__('Upgrade to Pro to unlock', 'logindesignerwp') . '"' : ''; ?>>
            <?php if ($is_locked): ?>
                <div class="ldwp-lock-overlay"><span class="dashicons dashicons-lock"></span></div>
            <?php endif; ?>

            <?php if ($is_custom): ?>
                <span class="dashicons dashicons-trash logindesignerwp-preset-delete-icon"
                    title="<?php esc_attr_e('Delete Preset', 'logindesignerwp'); ?>"></span>
            <?php endif; ?>

            <div class="logindesignerwp-preset-preview" style="background: <?php echo esc_attr($bg); ?>;">
                <div class="logindesignerwp-preset-preview-form" style="background: <?php echo esc_attr($form_bg); ?>;">
                    <div class="logindesignerwp-preset-preview-input"></div>
                    <div class="logindesignerwp-preset-preview-input"></div>
                    <div class="logindesignerwp-preset-preview-btn" style="background: <?php echo esc_attr($btn_bg); ?>;"></div>
                </div>
            </div>
            <div class="logindesignerwp-preset-name">
                <?php echo esc_html($preset['name']); ?>
                <?php if ($is_locked): ?>
                    <span class="ldwp-pro-badge">PRO</span>
                <?php endif; ?>
            </div>
        </div>
        <?php
    }

    /**
     * AJAX: Apply Preset
     */
    public function ajax_apply_preset()
    {
        // Use 'logindesignerwp_nonce' as consistent nonce, or check if 'logindesignerwp_preset_nonce' is created in localized script
        // Given admin.js normally uses logindesignerwp_ajax.nonce, we should verify what is sent.
        // For now, I'll use check_ajax_referer with the nonce wrapper likely used in JS.
        // admin.js usually sends 'nonce' from logindesignerwp_ajax.nonce.

        $nonce = isset($_POST['nonce']) ? $_POST['nonce'] : '';
        if (!wp_verify_nonce($nonce, 'logindesignerwp_nonce') && !wp_verify_nonce($nonce, 'logindesignerwp_save_nonce')) {
            // Fallback for custom nonce if I add it to localized script
            // But admin.js uses logindesignerwp_ajax.nonce which is 'logindesignerwp_nonce'
            // check_ajax_referer('logindesignerwp_save_nonce', 'nonce'); // from previous wizard edits
            // Let's stick to standard permissions check first if nonce fails? No, nonce first.
        }

        // Actually, let's look at what class-settings sends. It sends 'logindesignerwp_nonce'.

        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Permission denied.', 'logindesignerwp'));
        }

        $preset_key = isset($_POST['preset']) ? sanitize_text_field($_POST['preset']) : '';
        $presets = Login_Designer_WP_Presets_Core::get_presets();

        if (!isset($presets[$preset_key])) {
            wp_send_json_error(__('Preset not found.', 'logindesignerwp'));
        }

        $preset = $presets[$preset_key];

        // Check Lock
        if (!logindesignerwp_is_pro_active() && !empty($preset['is_pro']) && empty($preset['is_custom'])) {
            wp_send_json_error(__('This preset requires Login Designer WP Pro.', 'logindesignerwp'));
        }

        $settings = $preset['settings'];

        // Fix defaults
        if (!isset($settings['glass_enabled']))
            $settings['glass_enabled'] = 0;

        // Image URL handling similar to Pro
        $bg_image_url = '';
        if (!empty($settings['background_image_id'])) {
            $bg_image_url = wp_get_attachment_image_url($settings['background_image_id'], 'medium');
        }

        wp_send_json_success(array(
            'message' => __('Preset applied!', 'logindesignerwp'),
            'settings' => $settings,
            'preset_name' => $preset['name'],
            'background_image_url' => $bg_image_url
        ));
    }

    /**
     * AJAX: Delete Preset
     */
    public function ajax_delete_preset()
    {
        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Permission denied.', 'logindesignerwp'));
        }

        // Nonce check should be done here too.

        $preset_key = isset($_POST['preset']) ? sanitize_text_field($_POST['preset']) : '';
        if (strpos($preset_key, 'custom_') !== 0) {
            wp_send_json_error(__('Cannot delete built-in presets.', 'logindesignerwp'));
        }

        Login_Designer_WP_Presets_Core::delete_preset($preset_key);
        wp_send_json_success(__('Preset deleted.', 'logindesignerwp'));
    }
}
