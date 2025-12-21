<?php
/**
 * Render the Inline Design Wizard (Improved 3-Step Flow).
 *
 * Steps:
 * 1. Pick a Preset
 * 2. Customize Background (Solid/Gradient/Image)
 * 3. Logo Setup (Upload, bg color, spacing, roundness)
 *
 * @package LoginDesignerWP
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

$is_pro = function_exists('logindesignerwp_is_pro_active') && logindesignerwp_is_pro_active();
?>
<!-- Inline Design Wizard -->
<div class="ldwp-wizard-inline" style="display: none;">
    <!-- Wizard Header -->
    <div class="ldwp-wizard-inline-header">
        <div class="ldwp-wizard-inline-title">
            <span class="dashicons dashicons-admin-customizer"></span>
            <h3><?php esc_html_e('Design Wizard', 'logindesignerwp'); ?></h3>
            <span class="ldwp-wizard-step-badge">Step <span class="ldwp-step-current">1</span> of 3</span>
        </div>
        <button type="button" class="ldwp-wizard-exit-btn"
            title="<?php esc_attr_e('Exit Wizard', 'logindesignerwp'); ?>">
            <span class="dashicons dashicons-no-alt"></span>
            <?php esc_html_e('Exit', 'logindesignerwp'); ?>
        </button>
    </div>

    <!-- Progress Bar -->
    <div class="ldwp-wizard-progress">
        <div class="ldwp-wizard-progress-bar" style="width: 33%;"></div>
    </div>

    <!-- Wizard Steps Container -->
    <div class="ldwp-wizard-steps">

        <!-- Step 1: Pick a Preset -->
        <div class="ldwp-wizard-step is-active" data-step="1">
            <div class="ldwp-wizard-step-header">
                <h4><?php esc_html_e('Pick a Preset', 'logindesignerwp'); ?></h4>
                <p><?php esc_html_e('Select a style to start customizing. Watch the preview update instantly!', 'logindesignerwp'); ?>
                </p>
            </div>
            <div class="ldwp-wizard-step-content">
                <div class="ldwp-wizard-presets">
                    <!-- Free Presets -->
                    <div class="ldwp-wizard-preset" data-preset="modern-light">
                        <div class="ldwp-wizard-preset-preview" style="background: #f8fafc;">
                            <div class="mini-form" style="background: #fff; border: 1px solid #e2e8f0;">
                                <div class="mini-input" style="background: #f1f5f9;"></div>
                                <div class="mini-input" style="background: #f1f5f9;"></div>
                                <div class="mini-button" style="background: #3b82f6;"></div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Modern Light', 'logindesignerwp'); ?>
                        </div>
                    </div>
                    <div class="ldwp-wizard-preset" data-preset="modern-dark">
                        <div class="ldwp-wizard-preset-preview" style="background: #0f172a;">
                            <div class="mini-form" style="background: #1e293b; border: 1px solid #334155;">
                                <div class="mini-input" style="background: #0f172a;"></div>
                                <div class="mini-input" style="background: #0f172a;"></div>
                                <div class="mini-button" style="background: #3b82f6;"></div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Modern Dark', 'logindesignerwp'); ?>
                        </div>
                    </div>
                    <div class="ldwp-wizard-preset" data-preset="minimal">
                        <div class="ldwp-wizard-preset-preview" style="background: #fff;">
                            <div class="mini-form" style="background: #fff; border: 1px solid #e5e7eb;">
                                <div class="mini-input" style="background: #f9fafb;"></div>
                                <div class="mini-input" style="background: #f9fafb;"></div>
                                <div class="mini-button" style="background: #111827;"></div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Minimal', 'logindesignerwp'); ?></div>
                    </div>

                    <!-- Pro Presets -->
                    <div class="ldwp-wizard-preset <?php echo $is_pro ? '' : 'is-locked'; ?>"
                        data-preset="glassmorphism">
                        <?php if (!$is_pro): ?>
                            <div class="ldwp-wizard-preset-lock"><span class="dashicons dashicons-lock"></span> Pro</div>
                        <?php endif; ?>
                        <div class="ldwp-wizard-preset-preview"
                            style="background: linear-gradient(135deg, #667eea, #764ba2);">
                            <div class="mini-form"
                                style="background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);">
                                <div class="mini-input" style="background: rgba(255,255,255,0.2);"></div>
                                <div class="mini-input" style="background: rgba(255,255,255,0.2);"></div>
                                <div class="mini-button" style="background: #fff;"></div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Glassmorphism', 'logindesignerwp'); ?>
                        </div>
                    </div>
                    <div class="ldwp-wizard-preset <?php echo $is_pro ? '' : 'is-locked'; ?>" data-preset="neon-glow">
                        <?php if (!$is_pro): ?>
                            <div class="ldwp-wizard-preset-lock"><span class="dashicons dashicons-lock"></span> Pro</div>
                        <?php endif; ?>
                        <div class="ldwp-wizard-preset-preview" style="background: #0a0a0a;">
                            <div class="mini-form"
                                style="background: #1a1a2e; border: 1px solid #00d4ff; box-shadow: 0 0 10px rgba(0,212,255,0.3);">
                                <div class="mini-input" style="background: #16213e;"></div>
                                <div class="mini-input" style="background: #16213e;"></div>
                                <div class="mini-button" style="background: linear-gradient(90deg, #00d4ff, #00ff88);">
                                </div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Neon Glow', 'logindesignerwp'); ?></div>
                    </div>
                    <div class="ldwp-wizard-preset <?php echo $is_pro ? '' : 'is-locked'; ?>" data-preset="sunset">
                        <?php if (!$is_pro): ?>
                            <div class="ldwp-wizard-preset-lock"><span class="dashicons dashicons-lock"></span> Pro</div>
                        <?php endif; ?>
                        <div class="ldwp-wizard-preset-preview"
                            style="background: linear-gradient(135deg, #ff6b6b, #feca57, #ff9ff3);">
                            <div class="mini-form" style="background: rgba(255,255,255,0.95); border-radius: 12px;">
                                <div class="mini-input" style="background: #fff4f4;"></div>
                                <div class="mini-input" style="background: #fff4f4;"></div>
                                <div class="mini-button" style="background: linear-gradient(90deg, #ff6b6b, #feca57);">
                                </div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Sunset', 'logindesignerwp'); ?></div>
                    </div>

                    <!-- Corporate -->
                    <div class="ldwp-wizard-preset <?php echo $is_pro ? '' : 'is-locked'; ?>" data-preset="corporate">
                        <?php if (!$is_pro): ?>
                            <div class="ldwp-wizard-preset-lock"><span class="dashicons dashicons-lock"></span> Pro</div>
                        <?php endif; ?>
                        <div class="ldwp-wizard-preset-preview" style="background: #1e3a5f;">
                            <div class="mini-form" style="background: #fff; border: 1px solid #d1d5db;">
                                <div class="mini-input" style="background: #f9fafb;"></div>
                                <div class="mini-input" style="background: #f9fafb;"></div>
                                <div class="mini-button" style="background: #1e3a5f;"></div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Corporate', 'logindesignerwp'); ?></div>
                    </div>

                    <!-- Creative -->
                    <div class="ldwp-wizard-preset <?php echo $is_pro ? '' : 'is-locked'; ?>" data-preset="creative">
                        <?php if (!$is_pro): ?>
                            <div class="ldwp-wizard-preset-lock"><span class="dashicons dashicons-lock"></span> Pro</div>
                        <?php endif; ?>
                        <div class="ldwp-wizard-preset-preview"
                            style="background: linear-gradient(135deg, #f97316, #ec4899);">
                            <div class="mini-form" style="background: #fff; border-radius: 24px;">
                                <div class="mini-input" style="background: #fff1f2;"></div>
                                <div class="mini-input" style="background: #fff1f2;"></div>
                                <div class="mini-button" style="background: #ec4899; border-radius: 999px;"></div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Creative', 'logindesignerwp'); ?></div>
                    </div>

                    <!-- Ocean -->
                    <div class="ldwp-wizard-preset <?php echo $is_pro ? '' : 'is-locked'; ?>" data-preset="ocean">
                        <?php if (!$is_pro): ?>
                            <div class="ldwp-wizard-preset-lock"><span class="dashicons dashicons-lock"></span> Pro</div>
                        <?php endif; ?>
                        <div class="ldwp-wizard-preset-preview"
                            style="background: linear-gradient(135deg, #0891b2, #164e63);">
                            <div class="mini-form" style="background: #fff; border: 1px solid #a5f3fc;">
                                <div class="mini-input" style="background: #ecfeff;"></div>
                                <div class="mini-input" style="background: #ecfeff;"></div>
                                <div class="mini-button" style="background: #0891b2;"></div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Ocean', 'logindesignerwp'); ?></div>
                    </div>

                    <!-- Forest -->
                    <div class="ldwp-wizard-preset <?php echo $is_pro ? '' : 'is-locked'; ?>" data-preset="forest">
                        <?php if (!$is_pro): ?>
                            <div class="ldwp-wizard-preset-lock"><span class="dashicons dashicons-lock"></span> Pro</div>
                        <?php endif; ?>
                        <div class="ldwp-wizard-preset-preview" style="background: #14532d;">
                            <div class="mini-form" style="background: #f0fdf4; border: 1px solid #86efac;">
                                <div class="mini-input" style="background: #fff;"></div>
                                <div class="mini-input" style="background: #fff;"></div>
                                <div class="mini-button" style="background: #16a34a;"></div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Forest', 'logindesignerwp'); ?></div>
                    </div>

                    <!-- Elegant -->
                    <div class="ldwp-wizard-preset <?php echo $is_pro ? '' : 'is-locked'; ?>" data-preset="elegant">
                        <?php if (!$is_pro): ?>
                            <div class="ldwp-wizard-preset-lock"><span class="dashicons dashicons-lock"></span> Pro</div>
                        <?php endif; ?>
                        <div class="ldwp-wizard-preset-preview" style="background: #1c1917;">
                            <div class="mini-form" style="background: #fafaf9; border: 1px solid #d6d3d1;">
                                <div class="mini-input" style="background: #fff;"></div>
                                <div class="mini-input" style="background: #fff;"></div>
                                <div class="mini-button" style="background: #78716c;"></div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Elegant', 'logindesignerwp'); ?></div>
                    </div>

                    <!-- Tech -->
                    <div class="ldwp-wizard-preset <?php echo $is_pro ? '' : 'is-locked'; ?>" data-preset="tech">
                        <?php if (!$is_pro): ?>
                            <div class="ldwp-wizard-preset-lock"><span class="dashicons dashicons-lock"></span> Pro</div>
                        <?php endif; ?>
                        <div class="ldwp-wizard-preset-preview" style="background: #18181b;">
                            <div class="mini-form" style="background: #27272a; border: 1px solid #3f3f46;">
                                <div class="mini-input" style="background: #18181b;"></div>
                                <div class="mini-input" style="background: #18181b;"></div>
                                <div class="mini-button" style="background: #a855f7;"></div>
                            </div>
                        </div>
                        <div class="ldwp-wizard-preset-name"><?php esc_html_e('Tech', 'logindesignerwp'); ?></div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Step 2: Customize Background -->
        <div class="ldwp-wizard-step" data-step="2">
            <div class="ldwp-wizard-step-header">
                <h4><?php esc_html_e('Customize Background', 'logindesignerwp'); ?></h4>
                <p><?php esc_html_e('Choose your background style and customize it.', 'logindesignerwp'); ?></p>
            </div>
            <div class="ldwp-wizard-step-content">
                <!-- Background Type Selector - Visual Style -->
                <div class="ldwp-wizard-bg-type-selector" data-setting="background_mode">
                    <label class="ldwp-wizard-bg-type-option is-active" data-value="solid">
                        <div class="ldwp-wizard-bg-type-preview ldwp-wizard-bg-type-solid"></div>
                        <span><?php esc_html_e('Solid', 'logindesignerwp'); ?></span>
                    </label>
                    <label class="ldwp-wizard-bg-type-option" data-value="gradient">
                        <div class="ldwp-wizard-bg-type-preview ldwp-wizard-bg-type-gradient"></div>
                        <span><?php esc_html_e('Gradient', 'logindesignerwp'); ?></span>
                    </label>
                    <label class="ldwp-wizard-bg-type-option" data-value="image">
                        <div class="ldwp-wizard-bg-type-preview ldwp-wizard-bg-type-image"></div>
                        <span><?php esc_html_e('Image', 'logindesignerwp'); ?></span>
                    </label>
                </div>

                <!-- Solid Color Options -->
                <div class="ldwp-wizard-bg-panel is-active" data-panel="solid">
                    <div class="ldwp-wizard-control-row">
                        <label><?php esc_html_e('Background Color', 'logindesignerwp'); ?></label>
                        <input type="text" class="ldwp-wizard-color" data-setting="background_color" value="#f0f0f1">
                    </div>
                </div>

                <!-- Gradient Options -->
                <div class="ldwp-wizard-bg-panel" data-panel="gradient">
                    <div class="ldwp-wizard-control-row">
                        <label><?php esc_html_e('Gradient Type', 'logindesignerwp'); ?></label>
                        <div class="ldwp-wizard-control-group">
                            <select class="ldwp-wizard-select" data-setting="gradient_type">
                                <option value="linear"><?php esc_html_e('Linear', 'logindesignerwp'); ?></option>
                                <option value="radial"><?php esc_html_e('Radial', 'logindesignerwp'); ?></option>
                            </select>
                            <button type="button" class="ldwp-wizard-randomize-btn"
                                title="<?php esc_attr_e('Randomize Colors', 'logindesignerwp'); ?>">
                                <span class="dashicons dashicons-randomize"></span>
                            </button>
                        </div>
                    </div>

                    <!-- Linear Angle -->
                    <div class="ldwp-wizard-control-row ldwp-wizard-gradient-linear-opt">
                        <label><?php esc_html_e('Angle', 'logindesignerwp'); ?></label>
                        <div class="ldwp-wizard-range-wrapper">
                            <input type="range" class="ldwp-wizard-range" data-setting="gradient_angle" min="0"
                                max="360" value="135">
                            <span class="ldwp-wizard-range-value">135°</span>
                        </div>
                    </div>

                    <!-- Radial Position -->
                    <div class="ldwp-wizard-control-row ldwp-wizard-gradient-radial-opt" style="display:none;">
                        <label><?php esc_html_e('Position', 'logindesignerwp'); ?></label>
                        <select class="ldwp-wizard-select" data-setting="gradient_position">
                            <option value="center center"><?php esc_html_e('Center', 'logindesignerwp'); ?></option>
                            <option value="top left"><?php esc_html_e('Top Left', 'logindesignerwp'); ?></option>
                            <option value="top center"><?php esc_html_e('Top Center', 'logindesignerwp'); ?></option>
                            <option value="top right"><?php esc_html_e('Top Right', 'logindesignerwp'); ?></option>
                            <option value="center left"><?php esc_html_e('Center Left', 'logindesignerwp'); ?></option>
                            <option value="center right"><?php esc_html_e('Center Right', 'logindesignerwp'); ?>
                            </option>
                            <option value="bottom left"><?php esc_html_e('Bottom Left', 'logindesignerwp'); ?></option>
                            <option value="bottom center"><?php esc_html_e('Bottom Center', 'logindesignerwp'); ?>
                            </option>
                            <option value="bottom right"><?php esc_html_e('Bottom Right', 'logindesignerwp'); ?>
                            </option>
                        </select>
                    </div>

                    <div class="ldwp-wizard-control-row">
                        <label><?php esc_html_e('Start Color', 'logindesignerwp'); ?></label>
                        <input type="text" class="ldwp-wizard-color" data-setting="background_gradient_1"
                            value="#667eea">
                    </div>
                    <div class="ldwp-wizard-control-row">
                        <label><?php esc_html_e('End Color', 'logindesignerwp'); ?></label>
                        <input type="text" class="ldwp-wizard-color" data-setting="background_gradient_2"
                            value="#764ba2">
                    </div>
                </div>

                <!-- Image Options -->
                <div class="ldwp-wizard-bg-panel" data-panel="image">
                    <!-- Image Upload Area -->
                    <div class="ldwp-wizard-image-upload">
                        <div class="ldwp-wizard-image-preview" style="display: none;">
                            <img src="" alt="Background preview">
                            <button type="button" class="ldwp-wizard-image-remove">&times;</button>
                        </div>
                        <div class="ldwp-wizard-upload-buttons">
                            <button type="button" class="ldwp-wizard-image-btn button">
                                <span class="dashicons dashicons-upload"></span>
                                <?php esc_html_e('Select Image', 'logindesignerwp'); ?>
                            </button>
                            <?php if ($is_pro): ?>
                                <button type="button" class="button ldwp-wizard-ai-generate-btn">
                                    <span class="dashicons dashicons-superhero"></span>
                                    <?php esc_html_e('AI Generate', 'logindesignerwp'); ?>
                                </button>
                            <?php endif; ?>
                        </div>
                    </div>

                    <!-- Image Settings -->
                    <div class="ldwp-wizard-image-settings">
                        <div class="ldwp-wizard-control-row">
                            <label><?php esc_html_e('Size', 'logindesignerwp'); ?></label>
                            <select class="ldwp-wizard-select" data-setting="background_image_size">
                                <option value="cover"><?php esc_html_e('Cover', 'logindesignerwp'); ?></option>
                                <option value="contain"><?php esc_html_e('Contain', 'logindesignerwp'); ?></option>
                                <option value="auto"><?php esc_html_e('Auto', 'logindesignerwp'); ?></option>
                            </select>
                        </div>
                        <div class="ldwp-wizard-control-row">
                            <label><?php esc_html_e('Position', 'logindesignerwp'); ?></label>
                            <select class="ldwp-wizard-select" data-setting="background_image_pos">
                                <option value="center"><?php esc_html_e('Center', 'logindesignerwp'); ?></option>
                                <option value="top"><?php esc_html_e('Top', 'logindesignerwp'); ?></option>
                                <option value="bottom"><?php esc_html_e('Bottom', 'logindesignerwp'); ?></option>
                            </select>
                        </div>
                        <div class="ldwp-wizard-control-row">
                            <label><?php esc_html_e('Repeat', 'logindesignerwp'); ?></label>
                            <select class="ldwp-wizard-select" data-setting="background_image_repeat">
                                <option value="no-repeat"><?php esc_html_e('No Repeat', 'logindesignerwp'); ?></option>
                                <option value="repeat"><?php esc_html_e('Repeat', 'logindesignerwp'); ?></option>
                            </select>
                        </div>
                        <div class="ldwp-wizard-control-row">
                            <label><?php esc_html_e('Blur', 'logindesignerwp'); ?></label>
                            <div class="ldwp-wizard-range-wrapper">
                                <input type="range" class="ldwp-wizard-range" data-setting="background_blur" min="0"
                                    max="20" value="0">
                                <span class="ldwp-wizard-range-value">0px</span>
                            </div>
                        </div>

                        <!-- Color Overlay -->
                        <div class="ldwp-wizard-control-row ldwp-wizard-toggle-row">
                            <label><?php esc_html_e('Color Overlay', 'logindesignerwp'); ?></label>
                            <div style="flex: 0 0 40px; width: 40px;">
                                <label class="ldwp-wizard-switch">
                                    <input type="checkbox" class="ldwp-wizard-toggle"
                                        data-setting="background_overlay_enable" value="1">
                                    <span class="ldwp-wizard-slider round"></span>
                                </label>
                            </div>
                        </div>
                        <div class="ldwp-wizard-overlay-options" style="display: none;">
                            <div class="ldwp-wizard-control-row">
                                <label><?php esc_html_e('Overlay Color', 'logindesignerwp'); ?></label>
                                <div class="ldwp-wizard-color-wrapper">
                                    <input type="text" class="ldwp-wizard-color" data-setting="background_overlay_color"
                                        value="#000000">
                                </div>
                            </div>
                            <div class="ldwp-wizard-control-row">
                                <label><?php esc_html_e('Opacity', 'logindesignerwp'); ?></label>
                                <div class="ldwp-wizard-range-wrapper">
                                    <input type="range" class="ldwp-wizard-range"
                                        data-setting="background_overlay_opacity" min="0" max="100" value="50">
                                    <span class="ldwp-wizard-range-value">50%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Pro Feature: AI Background Teaser (Free users only) -->
                <?php if (!$is_pro): ?>
                    <div class="ldwp-wizard-pro-teaser">
                        <div class="ldwp-wizard-pro-teaser-icon">
                            <span class="dashicons dashicons-superhero"></span>
                        </div>
                        <div class="ldwp-wizard-pro-teaser-content">
                            <h5><?php esc_html_e('AI Background Generator', 'logindesignerwp'); ?></h5>
                            <p><?php esc_html_e('Generate unique backgrounds with AI. Describe what you want!', 'logindesignerwp'); ?>
                            </p>
                        </div>
                        <span class="ldwp-wizard-pro-badge">PRO</span>
                    </div>
                <?php endif; ?>

                <!-- Collapsible Fine-tune Colors Section -->
                <div class="ldwp-wizard-collapsible">
                    <button type="button" class="ldwp-wizard-collapsible-toggle">
                        <span class="dashicons dashicons-admin-appearance"></span>
                        <?php esc_html_e('Fine-tune Colors', 'logindesignerwp'); ?>
                        <span class="ldwp-wizard-collapsible-arrow dashicons dashicons-arrow-down-alt2"></span>
                    </button>
                    <div class="ldwp-wizard-collapsible-content" style="display: none;">
                        <!-- Form Colors -->
                        <div class="ldwp-wizard-color-group">
                            <h5><?php esc_html_e('Form', 'logindesignerwp'); ?></h5>
                            <div class="ldwp-wizard-control-row">
                                <label><?php esc_html_e('Form Background', 'logindesignerwp'); ?></label>
                                <input type="text" class="ldwp-wizard-color" data-setting="form_bg_color"
                                    value="#ffffff">
                            </div>
                            <div class="ldwp-wizard-control-row">
                                <label><?php esc_html_e('Form Border', 'logindesignerwp'); ?></label>
                                <input type="text" class="ldwp-wizard-color" data-setting="form_border_color"
                                    value="#e5e7eb">
                            </div>
                        </div>

                        <!-- Input Colors -->
                        <div class="ldwp-wizard-color-group">
                            <h5><?php esc_html_e('Inputs', 'logindesignerwp'); ?></h5>
                            <div class="ldwp-wizard-control-row">
                                <label><?php esc_html_e('Label Color', 'logindesignerwp'); ?></label>
                                <input type="text" class="ldwp-wizard-color" data-setting="label_text_color"
                                    value="#1e1e1e">
                            </div>
                            <div class="ldwp-wizard-control-row">
                                <label><?php esc_html_e('Input Background', 'logindesignerwp'); ?></label>
                                <input type="text" class="ldwp-wizard-color" data-setting="input_bg_color"
                                    value="#ffffff">
                            </div>
                            <div class="ldwp-wizard-control-row">
                                <label><?php esc_html_e('Input Text', 'logindesignerwp'); ?></label>
                                <input type="text" class="ldwp-wizard-color" data-setting="input_text_color"
                                    value="#1e1e1e">
                            </div>
                            <div class="ldwp-wizard-control-row">
                                <label><?php esc_html_e('Input Border', 'logindesignerwp'); ?></label>
                                <input type="text" class="ldwp-wizard-color" data-setting="input_border_color"
                                    value="#d1d5db">
                            </div>
                        </div>

                        <!-- Button Colors -->
                        <div class="ldwp-wizard-color-group">
                            <h5><?php esc_html_e('Button', 'logindesignerwp'); ?></h5>
                            <div class="ldwp-wizard-control-row">
                                <label><?php esc_html_e('Button Color', 'logindesignerwp'); ?></label>
                                <input type="text" class="ldwp-wizard-color" data-setting="button_bg" value="#2271b1">
                            </div>
                            <div class="ldwp-wizard-control-row">
                                <label><?php esc_html_e('Button Text', 'logindesignerwp'); ?></label>
                                <input type="text" class="ldwp-wizard-color" data-setting="button_text_color"
                                    value="#ffffff">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>


        <!-- Step 3: Logo Setup -->
        <div class="ldwp-wizard-step" data-step="3">
            <div class="ldwp-wizard-step-header">
                <h4><?php esc_html_e('Logo Setup', 'logindesignerwp'); ?></h4>
                <p><?php esc_html_e('Upload your logo and customize how it appears.', 'logindesignerwp'); ?></p>
            </div>
            <div class="ldwp-wizard-step-content">
                <!-- Logo Upload (Compact) -->
                <div class="ldwp-wizard-control-row ldwp-wizard-logo-compact-row">
                    <div class="ldwp-wizard-logo-thumb-wrapper">
                        <!-- Placeholder Icon -->
                        <div class="ldwp-wizard-logo-placeholder">
                            <span class="dashicons dashicons-format-image"></span>
                        </div>
                        <!-- Actual Thumb (Hidden by default) -->
                        <img src="" class="ldwp-wizard-logo-thumb-img" style="display:none;">
                    </div>
                    <div class="ldwp-wizard-logo-controls">
                        <label><?php esc_html_e('Custom Logo', 'logindesignerwp'); ?></label>
                        <div class="ldwp-wizard-logo-actions">
                            <button type="button"
                                class="button ldwp-wizard-logo-btn"><?php esc_html_e('Select Logo', 'logindesignerwp'); ?></button>
                            <button type="button" class="button-link ldwp-wizard-logo-remove"
                                style="display:none; color: #b32d2e;"><?php esc_html_e('Remove', 'logindesignerwp'); ?></button>
                        </div>
                    </div>
                </div>

                <!-- Logo Options -->
                <div class="ldwp-wizard-logo-options">

                    <!-- Main Logo Settings (Dimensions & Styling Combined) -->
                    <div class="ldwp-wizard-group">
                        <h4 class="ldwp-wizard-group-title"><?php esc_html_e('Logo Settings', 'logindesignerwp'); ?>
                        </h4>

                        <!-- Width / Height Grid -->
                        <div class="ldwp-wizard-grid-2 ldwp-wizard-control-row">
                            <div class="ldwp-wizard-control-col">
                                <label><?php esc_html_e('Width', 'logindesignerwp'); ?></label>
                                <div class="ldwp-wizard-input-wrapper">
                                    <input type="number" class="ldwp-wizard-number" data-setting="logo_width" value="84"
                                        min="20" max="500">
                                    <span class="ldwp-wizard-unit">px</span>
                                </div>
                            </div>
                            <div class="ldwp-wizard-control-col">
                                <label><?php esc_html_e('Height', 'logindesignerwp'); ?></label>
                                <div class="ldwp-wizard-input-wrapper">
                                    <input type="number" class="ldwp-wizard-number" data-setting="logo_height"
                                        value="84" min="20" max="500">
                                    <span class="ldwp-wizard-unit">px</span>
                                </div>
                            </div>
                        </div>

                        <!-- Radius / Margin Grid -->
                        <div class="ldwp-wizard-grid-2 ldwp-wizard-control-row">
                            <div class="ldwp-wizard-control-col">
                                <label><?php esc_html_e('Corner Radius', 'logindesignerwp'); ?></label>
                                <div class="ldwp-wizard-range-wrapper">
                                    <input type="range" class="ldwp-wizard-range" data-setting="logo_border_radius"
                                        min="0" max="100" value="0">
                                    <span class="ldwp-wizard-range-value">0px</span>
                                </div>
                            </div>
                            <div class="ldwp-wizard-control-col">
                                <label><?php esc_html_e('Bottom Margin', 'logindesignerwp'); ?></label>
                                <div class="ldwp-wizard-range-wrapper">
                                    <input type="range" class="ldwp-wizard-range" data-setting="logo_bottom_margin"
                                        min="0" max="100" value="0">
                                    <span class="ldwp-wizard-range-value">0px</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Background Group -->
                    <div class="ldwp-wizard-group">
                        <div class="ldwp-wizard-control-row ldwp-wizard-toggle-row">
                            <div>
                                <label
                                    class="ldwp-wizard-label-lg"><?php esc_html_e('Logo Background', 'logindesignerwp'); ?></label>
                            </div>
                            <!-- Fixed Width Wrapper for Toggle -->
                            <div style="flex: 0 0 40px; width: 40px;">
                                <label class="ldwp-wizard-switch">
                                    <input type="checkbox" class="ldwp-wizard-toggle"
                                        data-setting="logo_background_enable" value="1">
                                    <span class="ldwp-wizard-slider round"></span>
                                </label>
                            </div>
                        </div>

                        <!-- Nested Background Options (Hidden by default) -->
                        <div class="ldwp-wizard-logo-bg-group" style="display: none;">

                            <!-- Color / Padding Grid -->
                            <div class="ldwp-wizard-grid-2">
                                <!-- Background Color -->
                                <div class="ldwp-wizard-control-col">
                                    <label><?php esc_html_e('Color', 'logindesignerwp'); ?></label>
                                    <div class="ldwp-wizard-color-wrapper">
                                        <input type="text" class="ldwp-wizard-color"
                                            data-setting="logo_background_color" value="#ffffff">
                                    </div>
                                </div>

                                <!-- Padding -->
                                <div class="ldwp-wizard-control-col">
                                    <label><?php esc_html_e('Padding', 'logindesignerwp'); ?></label>
                                    <div class="ldwp-wizard-input-wrapper" style="width: 100%;">
                                        <input type="number" class="ldwp-wizard-number" data-setting="logo_padding"
                                            min="0" max="50" value="10">
                                        <span class="ldwp-wizard-unit">px</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                <!-- Pro Features Teaser -->
                <?php if (!$is_pro): ?>
                    <div class="ldwp-wizard-pro-teasers">
                        <div class="ldwp-wizard-pro-teaser-mini">
                            <span class="dashicons dashicons-layout"></span>
                            <span><?php esc_html_e('Advanced Layout Options', 'logindesignerwp'); ?></span>
                            <span class="ldwp-pro-tag">PRO</span>
                        </div>
                        <div class="ldwp-wizard-pro-teaser-mini">
                            <span class="dashicons dashicons-admin-appearance"></span>
                            <span><?php esc_html_e('Glassmorphism Effects', 'logindesignerwp'); ?></span>
                            <span class="ldwp-pro-tag">PRO</span>
                        </div>
                        <div class="ldwp-wizard-pro-teaser-mini">
                            <span class="dashicons dashicons-share-alt"></span>
                            <span><?php esc_html_e('Social Login Styling', 'logindesignerwp'); ?></span>
                            <span class="ldwp-pro-tag">PRO</span>
                        </div>
                    </div>
                <?php endif; ?>

                <!-- Ready Message -->
                <div class="ldwp-wizard-summary">
                    <span class="dashicons dashicons-yes-alt"></span>
                    <h5><?php esc_html_e('Looking Good!', 'logindesignerwp'); ?></h5>
                    <p><?php esc_html_e('Click "Apply Design" to save your changes.', 'logindesignerwp'); ?></p>
                </div>
            </div>
        </div>
    </div>

    <!-- Wizard Footer -->
    <div class="ldwp-wizard-inline-footer">
        <button type="button" class="ldwp-wizard-btn ldwp-wizard-btn-secondary ldwp-wizard-prev"
            style="visibility: hidden;">
            <span class="dashicons dashicons-arrow-left-alt2"></span>
            <?php esc_html_e('Back', 'logindesignerwp'); ?>
        </button>
        <div class="ldwp-wizard-dots">
            <div class="ldwp-wizard-dot is-active" data-step="1"></div>
            <div class="ldwp-wizard-dot" data-step="2"></div>
            <div class="ldwp-wizard-dot" data-step="3"></div>
        </div>
        <div class="ldwp-wizard-footer-actions">
            <button type="button" class="ldwp-wizard-btn ldwp-wizard-btn-primary ldwp-wizard-next">
                <?php esc_html_e('Next', 'logindesignerwp'); ?>
                <span class="dashicons dashicons-arrow-right-alt2"></span>
            </button>
            <button type="button" class="ldwp-wizard-btn ldwp-wizard-btn-success ldwp-wizard-apply"
                style="display: none;">
                <span class="dashicons dashicons-yes"></span>
                <?php esc_html_e('Apply Design', 'logindesignerwp'); ?>
            </button>
        </div>
    </div>
</div>

<!-- Cancel Confirmation Modal -->
<div class="ldwp-wizard-cancel-modal" style="display: none;">
    <div class="ldwp-wizard-cancel-dialog">
        <h4><?php esc_html_e('Exit Design Wizard?', 'logindesignerwp'); ?></h4>
        <p><?php esc_html_e('Your unsaved changes will be lost. Are you sure you want to exit?', 'logindesignerwp'); ?>
        </p>
        <div class="ldwp-wizard-cancel-actions">
            <button type="button"
                class="button ldwp-wizard-cancel-stay"><?php esc_html_e('Keep Editing', 'logindesignerwp'); ?></button>
            <button type="button"
                class="button button-primary ldwp-wizard-cancel-confirm"><?php esc_html_e('Exit Wizard', 'logindesignerwp'); ?></button>
        </div>
    </div>
</div>