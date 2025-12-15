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
                <!-- Background Type Selector -->
                <div class="ldwp-wizard-bg-types">
                    <button type="button" class="ldwp-wizard-bg-type is-active" data-type="solid">
                        <span class="dashicons dashicons-admin-appearance"></span>
                        <?php esc_html_e('Solid Color', 'logindesignerwp'); ?>
                    </button>
                    <button type="button" class="ldwp-wizard-bg-type" data-type="gradient">
                        <span class="dashicons dashicons-art"></span>
                        <?php esc_html_e('Gradient', 'logindesignerwp'); ?>
                    </button>
                    <button type="button" class="ldwp-wizard-bg-type" data-type="image">
                        <span class="dashicons dashicons-format-image"></span>
                        <?php esc_html_e('Image', 'logindesignerwp'); ?>
                    </button>
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
                        <label><?php esc_html_e('Start Color', 'logindesignerwp'); ?></label>
                        <input type="text" class="ldwp-wizard-color" data-setting="gradient_start" value="#667eea">
                    </div>
                    <div class="ldwp-wizard-control-row">
                        <label><?php esc_html_e('End Color', 'logindesignerwp'); ?></label>
                        <input type="text" class="ldwp-wizard-color" data-setting="gradient_end" value="#764ba2">
                    </div>
                    <div class="ldwp-wizard-control-row">
                        <label><?php esc_html_e('Direction', 'logindesignerwp'); ?></label>
                        <select class="ldwp-wizard-select" data-setting="gradient_direction">
                            <option value="135deg"><?php esc_html_e('Diagonal ↘', 'logindesignerwp'); ?></option>
                            <option value="to right"><?php esc_html_e('Horizontal →', 'logindesignerwp'); ?></option>
                            <option value="to bottom"><?php esc_html_e('Vertical ↓', 'logindesignerwp'); ?></option>
                            <option value="45deg"><?php esc_html_e('Diagonal ↗', 'logindesignerwp'); ?></option>
                        </select>
                    </div>
                </div>

                <!-- Image Options -->
                <div class="ldwp-wizard-bg-panel" data-panel="image">
                    <div class="ldwp-wizard-image-upload">
                        <div class="ldwp-wizard-image-preview" style="display: none;">
                            <img src="" alt="Background preview">
                            <button type="button" class="ldwp-wizard-image-remove">&times;</button>
                        </div>
                        <button type="button" class="ldwp-wizard-image-btn button">
                            <span class="dashicons dashicons-upload"></span>
                            <?php esc_html_e('Select Background Image', 'logindesignerwp'); ?>
                        </button>
                    </div>
                </div>

                <!-- Pro Feature: AI Background -->
                <?php if (!$is_pro): ?>
                    <div class="ldwp-wizard-pro-teaser">
                        <div class="ldwp-wizard-pro-teaser-icon">
                            <span class="dashicons dashicons-admin-site-alt3"></span>
                        </div>
                        <div class="ldwp-wizard-pro-teaser-content">
                            <h5><?php esc_html_e('AI Background Generator', 'logindesignerwp'); ?></h5>
                            <p><?php esc_html_e('Generate unique backgrounds with AI. Describe what you want!', 'logindesignerwp'); ?>
                            </p>
                        </div>
                        <span class="ldwp-wizard-pro-badge">PRO</span>
                    </div>
                <?php endif; ?>
            </div>
        </div>

        <!-- Step 3: Logo Setup -->
        <div class="ldwp-wizard-step" data-step="3">
            <div class="ldwp-wizard-step-header">
                <h4><?php esc_html_e('Logo Setup', 'logindesignerwp'); ?></h4>
                <p><?php esc_html_e('Upload your logo and customize how it appears.', 'logindesignerwp'); ?></p>
            </div>
            <div class="ldwp-wizard-step-content">
                <!-- Logo Upload -->
                <div class="ldwp-wizard-logo-section">
                    <div class="ldwp-wizard-logo-upload-area">
                        <span class="dashicons dashicons-format-image"></span>
                        <p><?php esc_html_e('Drop your logo here or click to upload', 'logindesignerwp'); ?></p>
                        <button type="button"
                            class="button ldwp-wizard-logo-btn"><?php esc_html_e('Select Logo', 'logindesignerwp'); ?></button>
                    </div>
                    <div class="ldwp-wizard-logo-preview-area" style="display: none;">
                        <img src="" alt="Logo preview" class="ldwp-wizard-logo-img">
                        <button type="button"
                            class="button ldwp-wizard-logo-remove"><?php esc_html_e('Remove', 'logindesignerwp'); ?></button>
                    </div>
                </div>

                <!-- Logo Options -->
                <div class="ldwp-wizard-logo-options">
                    <div class="ldwp-wizard-control-row">
                        <label><?php esc_html_e('Logo Background', 'logindesignerwp'); ?></label>
                        <input type="text" class="ldwp-wizard-color" data-setting="logo_bg_color" value="">
                        <span
                            class="ldwp-wizard-hint"><?php esc_html_e('Leave empty for transparent', 'logindesignerwp'); ?></span>
                    </div>
                    <div class="ldwp-wizard-control-row">
                        <label><?php esc_html_e('Spacing (px)', 'logindesignerwp'); ?></label>
                        <input type="range" class="ldwp-wizard-range" data-setting="logo_padding" min="0" max="50"
                            value="20">
                        <span class="ldwp-wizard-range-value">20</span>
                    </div>
                    <div class="ldwp-wizard-control-row">
                        <label><?php esc_html_e('Roundness (px)', 'logindesignerwp'); ?></label>
                        <input type="range" class="ldwp-wizard-range" data-setting="logo_border_radius" min="0" max="50"
                            value="0">
                        <span class="ldwp-wizard-range-value">0</span>
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