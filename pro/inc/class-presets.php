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
                    'below_form_link_color' => '#ffffff',
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
                    'below_form_link_color' => '#ffffff',
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
                    'below_form_link_color' => '#bbf7d0',
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
            'ocean' => array(
                'name' => __('Ocean', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'gradient',
                    'background_gradient_1' => '#0891b2',
                    'background_gradient_2' => '#164e63',
                    'form_bg_color' => '#ffffff',
                    'form_border_radius' => 16,
                    'form_border_color' => '#a5f3fc',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#164e63',
                    'input_bg_color' => '#ecfeff',
                    'input_text_color' => '#164e63',
                    'input_border_color' => '#67e8f9',
                    'input_border_focus' => '#22d3ee',
                    'button_bg' => '#0891b2',
                    'button_bg_hover' => '#0e7490',
                    'button_text_color' => '#ffffff',
                    'button_border_radius' => 8,
                    'below_form_link_color' => '#ffffff',
                ),
            ),
            'glassmorphism' => array(
                'name' => __('Glassmorphism', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'gradient',
                    'background_gradient_1' => '#667eea',
                    'background_gradient_2' => '#764ba2',
                    'form_bg_color' => 'rgba(255,255,255,0.15)',
                    'form_border_radius' => 20,
                    'form_border_color' => 'rgba(255,255,255,0.3)',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#ffffff',
                    'input_bg_color' => 'rgba(255,255,255,0.2)',
                    'input_text_color' => '#ffffff',
                    'input_border_color' => 'rgba(255,255,255,0.3)',
                    'input_border_focus' => '#ffffff',
                    'button_bg' => '#ffffff',
                    'button_bg_hover' => '#f0f0f0',
                    'button_text_color' => '#667eea',
                    'button_border_radius' => 999,
                    'below_form_link_color' => '#e0e7ff',
                    // Enable glassmorphism effects
                    'glass_enabled' => true,
                    'glass_blur' => 14,
                    'glass_transparency' => 72,
                    'glass_border' => true,
                ),
            ),
            'neon_glow' => array(
                'name' => __('Neon Glow', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'solid',
                    'background_color' => '#0a0a0a',
                    'form_bg_color' => '#141414',
                    'form_border_radius' => 16,
                    'form_border_color' => '#22d3ee',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#22d3ee',
                    'input_bg_color' => '#0a0a0a',
                    'input_text_color' => '#f0f0f0',
                    'input_border_color' => '#22d3ee',
                    'input_border_focus' => '#06b6d4',
                    'button_bg' => '#22d3ee',
                    'button_bg_hover' => '#06b6d4',
                    'button_text_color' => '#0a0a0a',
                    'button_border_radius' => 8,
                    'below_form_link_color' => '#67e8f9',
                ),
            ),
            'elegant' => array(
                'name' => __('Elegant', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'solid',
                    'background_color' => '#1c1917',
                    'form_bg_color' => '#fafaf9',
                    'form_border_radius' => 8,
                    'form_border_color' => '#d6d3d1',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#44403c',
                    'input_bg_color' => '#ffffff',
                    'input_text_color' => '#1c1917',
                    'input_border_color' => '#a8a29e',
                    'input_border_focus' => '#78716c',
                    'button_bg' => '#78716c',
                    'button_bg_hover' => '#57534e',
                    'button_text_color' => '#ffffff',
                    'button_border_radius' => 4,
                    'below_form_link_color' => '#a8a29e',
                ),
            ),
            'tech' => array(
                'name' => __('Tech', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'solid',
                    'background_color' => '#18181b',
                    'form_bg_color' => '#27272a',
                    'form_border_radius' => 16,
                    'form_border_color' => '#3f3f46',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#a1a1aa',
                    'input_bg_color' => '#18181b',
                    'input_text_color' => '#fafafa',
                    'input_border_color' => '#52525b',
                    'input_border_focus' => '#a855f7',
                    'button_bg' => '#a855f7',
                    'button_bg_hover' => '#9333ea',
                    'button_text_color' => '#ffffff',
                    'button_border_radius' => 8,
                    'below_form_link_color' => '#c4b5fd',
                ),
            ),
            'creative' => array(
                'name' => __('Creative', 'logindesignerwp-pro'),
                'settings' => array(
                    'background_mode' => 'gradient',
                    'background_gradient_1' => '#f97316',
                    'background_gradient_2' => '#ec4899',
                    'form_bg_color' => '#ffffff',
                    'form_border_radius' => 24,
                    'form_border_color' => '#fecdd3',
                    'form_shadow_enable' => true,
                    'label_text_color' => '#831843',
                    'input_bg_color' => '#fff1f2',
                    'input_text_color' => '#831843',
                    'input_border_color' => '#fda4af',
                    'input_border_focus' => '#ec4899',
                    'button_bg' => '#ec4899',
                    'button_bg_hover' => '#db2777',
                    'button_text_color' => '#ffffff',
                    'button_border_radius' => 999,
                    'below_form_link_color' => '#ffffff',
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
                <span class="drag-handle dashicons dashicons-move"></span>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-art"></span>
                    <?php esc_html_e('Design Presets', 'logindesignerwp-pro'); ?>
                    <span class="logindesignerwp-pro-badge">PRO</span>
                </span>
            </h2>

            <div class="logindesignerwp-presets-container">
                <style>
                    .logindesignerwp-presets-grid {
                        display: grid;
                        grid-template-columns: repeat(4, 1fr);
                        gap: 20px;
                        margin-bottom: 20px;
                    }

                    .logindesignerwp-preset-card {
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        overflow: hidden;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        position: relative;
                        background: #fff;
                    }

                    .logindesignerwp-preset-card:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                        border-color: #2271b1;
                    }

                    .logindesignerwp-preset-card.active {
                        border-color: #2271b1;
                        box-shadow: 0 0 0 2px #2271b1;
                    }

                    .logindesignerwp-preset-preview {
                        height: 120px;
                        position: relative;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #f0f0f1;
                    }

                    .logindesignerwp-preset-preview-form {
                        width: 60%;
                        height: 60%;
                        background: #fff;
                        border-radius: 4px;
                        display: flex;
                        flex-direction: column;
                        justify-content: center;
                        align-items: center;
                        padding: 10px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                    }

                    .logindesignerwp-preset-preview-btn {
                        width: 80%;
                        height: 8px;
                        background: #2271b1;
                        border-radius: 2px;
                        margin-top: 5px;
                    }

                    .logindesignerwp-preset-preview-input {
                        width: 80%;
                        height: 6px;
                        background: #f0f0f1;
                        margin-bottom: 5px;
                        border-radius: 2px;
                    }

                    .logindesignerwp-preset-name {
                        padding: 10px;
                        text-align: center;
                        font-weight: 500;
                        border-top: 1px solid #eee;
                    }

                    .logindesignerwp-preset-actions {
                        margin-top: 20px;
                        display: flex;
                        gap: 10px;
                        align-items: center;
                    }
                </style>

                <div id="logindesignerwp-presets-grid" class="logindesignerwp-presets-grid">
                    <?php
                    // Built-in presets
                    foreach ($this->built_in_presets as $key => $preset):
                        $bg = isset($preset['settings']['background_color']) ? $preset['settings']['background_color'] : '#f0f0f1';
                        if (isset($preset['settings']['background_mode']) && $preset['settings']['background_mode'] === 'gradient') {
                            $bg = 'linear-gradient(135deg, ' . $preset['settings']['background_gradient_1'] . ', ' . $preset['settings']['background_gradient_2'] . ')';
                        }
                        $form_bg = isset($preset['settings']['form_bg_color']) ? $preset['settings']['form_bg_color'] : '#fff';
                        $btn_bg = isset($preset['settings']['button_bg']) ? $preset['settings']['button_bg'] : '#2271b1';
                        ?>
                        <div class="logindesignerwp-preset-card" data-preset="<?php echo esc_attr($key); ?>">
                            <div class="logindesignerwp-preset-preview" style="background: <?php echo esc_attr($bg); ?>;">
                                <div class="logindesignerwp-preset-preview-form"
                                    style="background: <?php echo esc_attr($form_bg); ?>;">
                                    <div class="logindesignerwp-preset-preview-input"></div>
                                    <div class="logindesignerwp-preset-preview-input"></div>
                                    <div class="logindesignerwp-preset-preview-btn"
                                        style="background: <?php echo esc_attr($btn_bg); ?>;"></div>
                                </div>
                            </div>
                            <div class="logindesignerwp-preset-name">
                                <?php echo esc_html($preset['name']); ?>
                            </div>
                        </div>
                    <?php endforeach; ?>

                    <?php
                    // Custom presets
                    if (!empty($custom_presets)) {
                        foreach ($custom_presets as $key => $preset):
                            $bg = isset($preset['settings']['background_color']) ? $preset['settings']['background_color'] : '#f0f0f1';
                            if (isset($preset['settings']['background_mode']) && $preset['settings']['background_mode'] === 'gradient') {
                                $bg = 'linear-gradient(135deg, ' . $preset['settings']['background_gradient_1'] . ', ' . $preset['settings']['background_gradient_2'] . ')';
                            }
                            $form_bg = isset($preset['settings']['form_bg_color']) ? $preset['settings']['form_bg_color'] : '#fff';
                            $btn_bg = isset($preset['settings']['button_bg']) ? $preset['settings']['button_bg'] : '#2271b1';
                            ?>
                            <div class="logindesignerwp-preset-card" data-preset="<?php echo esc_attr($key); ?>" data-is-custom="true">
                                <div class="logindesignerwp-preset-preview" style="background: <?php echo esc_attr($bg); ?>;">
                                    <div class="logindesignerwp-preset-preview-form"
                                        style="background: <?php echo esc_attr($form_bg); ?>;">
                                        <div class="logindesignerwp-preset-preview-input"></div>
                                        <div class="logindesignerwp-preset-preview-input"></div>
                                        <div class="logindesignerwp-preset-preview-btn"
                                            style="background: <?php echo esc_attr($btn_bg); ?>;"></div>
                                    </div>
                                </div>
                                <div class="logindesignerwp-preset-name">
                                    <?php echo esc_html($preset['name']); ?>
                                </div>
                            </div>
                        <?php endforeach;
                    }
                    ?>
                </div>

                <div class="logindesignerwp-preset-actions">
                    <input type="hidden" id="logindesignerwp-preset-select" value="">

                    <button type="button" class="button button-primary button-large" id="logindesignerwp-apply-preset" disabled>
                        <?php esc_html_e('Apply Selected Preset', 'logindesignerwp-pro'); ?>
                    </button>

                    <button type="button" class="button button-link button-large" id="logindesignerwp-delete-preset"
                        style="color: #b32d2e; display: none;">
                        <?php esc_html_e('Delete Preset', 'logindesignerwp-pro'); ?>
                    </button>

                    <span class="description" style="margin-left: 10px;">
                        <?php esc_html_e('or save current as new:', 'logindesignerwp-pro'); ?>
                    </span>

                    <input type="text" id="logindesignerwp-preset-name" class="regular-text" style="width: 200px;"
                        placeholder="<?php esc_attr_e('New Preset Name', 'logindesignerwp-pro'); ?>" />
                    <button type="button" class="button" id="logindesignerwp-save-preset">
                        <?php esc_html_e('Save', 'logindesignerwp-pro'); ?>
                    </button>
                </div>

            </div>
        </div>

        <script>
            jQuery(document).ready(function ($) {

                // Instant Preset Application
                $('.logindesignerwp-preset-card').on('click', function () {
                    var $card = $(this);

                    // Don't restart if already processing
                    if ($card.hasClass('is-loading')) return;

                    var preset = $card.data('preset');

                    // Add loading state
                    $card.addClass('is-loading');
                    $card.css('opacity', '0.6');

                    $.post(ajaxurl, {
                        action: 'logindesignerwp_apply_preset',
                        preset: preset,
                        nonce: '<?php echo wp_create_nonce('logindesignerwp_preset_nonce'); ?>'
                    }, function (response) {
                        $card.removeClass('is-loading').css('opacity', '1');

                        if (response.success) {
                            var settings = response.data.settings;
                            var bgImageUrl = response.data.background_image_url || '';

                            // Update all form fields with new settings
                            $.each(settings, function (key, value) {
                                var $field = $('[name="logindesignerwp_settings[' + key + ']"]');
                                if ($field.length) {
                                    if ($field.is(':checkbox')) {
                                        $field.prop('checked', !!value);
                                    } else if ($field.is(':radio')) {
                                        $field.filter('[value="' + value + '"]').prop('checked', true);
                                    } else {
                                        $field.val(value);
                                    }
                                }
                            });

                            // Update Background Image Preview specifically
                            if (response.data.background_image_url) {
                                var $bgParams = $('.logindesignerwp-image-preview');
                                // Find the background image section (usually the one in the background tab)
                                var $bgSection = $('[data-section-id="background"]');
                                var $previewImg = $bgSection.find('.logindesignerwp-image-preview img');
                                var $removeBtn = $bgSection.find('.logindesignerwp-remove-image');

                                if ($previewImg.length) {
                                    $previewImg.attr('src', response.data.background_image_url);
                                    $bgSection.find('.logindesignerwp-image-preview').show();
                                    $removeBtn.show();
                                }

                                // Add URL to settings for batch update
                                settings.background_image = response.data.background_image_url;
                            } else if (settings.background_image_id == 0 || !settings.background_image_id) {
                                // Handle removal
                                var $bgSection = $('[data-section-id="background"]');
                                $bgSection.find('.logindesignerwp-image-preview').hide();
                                $bgSection.find('.logindesignerwp-remove-image').hide();
                                settings.background_image = '';
                            }

                            // Apply preview update using Batch API if available
                            if (typeof window.ldwpUpdatePreviewBatch === 'function') {
                                window.ldwpUpdatePreviewBatch(settings);
                            } else if (typeof window.ldwpApplyPreview === 'function') {
                                setTimeout(function () {
                                    window.ldwpApplyPreview();
                                }, 50);
                            }

                            // Update WordPress color pickers
                            $('.ldwp-color-picker').each(function () {
                                var $input = $(this);
                                var name = $input.attr('name');
                                if (name) {
                                    var settingKey = name.replace('logindesignerwp_settings[', '').replace(']', '');
                                    if (settings.hasOwnProperty(settingKey) && settings[settingKey]) {
                                        $input.val(settings[settingKey]);
                                        var $wpPicker = $input.closest('.wp-picker-container');
                                        if ($wpPicker.length) {
                                            $wpPicker.find('.wp-color-result').css('background-color', settings[settingKey]);
                                            if ($input.data('wp-wpColorPicker')) {
                                                $input.wpColorPicker('color', settings[settingKey]);
                                            }
                                        }
                                    }
                                }
                            });

                            // Update active preset visual
                            $('.logindesignerwp-preset-card').removeClass('active');
                            $card.addClass('active');

                            // Update background mode radios visual state
                            var bgMode = settings.background_mode || 'solid';
                            $('input[name="logindesignerwp_settings[background_mode]"][value="' + bgMode + '"]').prop('checked', true).trigger('change');
                            $('.ldwp-bg-type-option').removeClass('is-active');
                            $('.ldwp-bg-type-option[data-value="' + bgMode + '"]').addClass('is-active');

                            // Apply preview update
                            if (typeof window.ldwpApplyPreview === 'function') {
                                setTimeout(function () {
                                    window.ldwpApplyPreview();
                                }, 50);
                            }

                            // Mark as dirty so "Save" button works if needed
                            $('.logindesignerwp-preview-badge').addClass('is-unsaved');
                        }
                    });
                });




                // Delete preset
                $('#logindesignerwp-delete-preset').on('click', function () {
                    var preset = $('#logindesignerwp-preset-select').val();
                    if (!confirm('<?php echo esc_js(__('Are you sure you want to delete this preset?', 'logindesignerwp-pro')); ?>')) {
                        return;
                    }

                    var $btn = $(this);
                    $btn.prop('disabled', true).text('<?php echo esc_js(__('Deleting...', 'logindesignerwp-pro')); ?>');

                    $.post(ajaxurl, {
                        action: 'logindesignerwp_delete_preset',
                        preset: preset,
                        nonce: '<?php echo wp_create_nonce('logindesignerwp_preset_nonce'); ?>'
                    }, function (response) {
                        if (response.success) {
                            location.reload();
                        } else {
                            alert(response.data);
                            $btn.prop('disabled', false).text('<?php echo esc_js(__('Delete Preset', 'logindesignerwp-pro')); ?>');
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

        // Fix Stickiness: Force disable Glassmorphism if not explicitly enabled in preset
        if (!isset($preset['settings']['glass_enabled'])) {
            $new_settings['glass_enabled'] = 0;
        }

        // Don't save to DB - preview only (client-side application)
        // $new_settings['active_preset'] = $preset_key; 
        // update_option('logindesignerwp_settings', $new_settings);

        // Get Image URL if ID exists for preview
        $bg_image_url = '';
        if (!empty($new_settings['background_image_id'])) {
            $bg_image_url = wp_get_attachment_image_url($new_settings['background_image_id'], 'medium');
        }

        // Return new settings for AJAX update
        wp_send_json_success(array(
            'message' => 'Preset applied!',
            'settings' => $new_settings,
            'preset_name' => $preset['name'],
            'background_image_url' => $bg_image_url
        ));
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
            // Pro Features
            'glassmorphism_enable' => isset($current_settings['glassmorphism_enable']) ? $current_settings['glassmorphism_enable'] : 0,
            'glassmorphism_blur' => isset($current_settings['glassmorphism_blur']) ? $current_settings['glassmorphism_blur'] : 10,
            'glassmorphism_transparency' => isset($current_settings['glassmorphism_transparency']) ? $current_settings['glassmorphism_transparency'] : 20,
            'glassmorphism_border' => isset($current_settings['glassmorphism_border']) ? $current_settings['glassmorphism_border'] : 0,
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
