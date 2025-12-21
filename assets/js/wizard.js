/**
 * LoginDesignerWP Design Wizard
 * Modal-based step-by-step wizard for customizing login page
 */
(function ($) {
    'use strict';

    // Default settings - captured for resetting
    var defaultSettings = {
        preset: null,
        // Background - Solid
        background_mode: 'solid',
        background_color: '#f0f0f1',
        // Background - Gradient
        gradient_type: 'linear',
        gradient_angle: 135,
        gradient_position: 'center center',
        background_gradient_1: '#667eea',
        background_gradient_2: '#764ba2',
        // Background - Image
        background_image_id: 0,
        background_image_url: '',
        background_image_size: 'cover',
        background_image_pos: 'center',
        background_image_repeat: 'no-repeat',
        background_blur: 0,
        // Form settings (from presets)
        form_bg_color: '#ffffff',
        form_border_radius: 0,
        form_border_color: '#c3c4c7',
        label_text_color: '#1e1e1e',
        form_shadow_enable: 0,
        form_shadow_color: 'rgba(0,0,0,0.25)',
        input_bg_color: '#ffffff',
        input_text_color: '#1e1e1e',
        input_border_color: '#8c8f94',
        button_bg: '#2271b1',
        button_bg_hover: '#135e96',
        button_text_color: '#ffffff',
        button_border_radius: 3,
        // Logo settings
        logo_id: 0,
        logo_url: '',
        logo_width: 84,
        logo_height: 84,
        logo_border_radius: 0,
        logo_bottom_margin: 0,
        logo_background_color: ''
    };

    // Wizard state
    var wizard = {
        currentStep: 1,
        totalSteps: 3,
        isPro: false,
        settings: $.extend(true, {}, defaultSettings)
    };

    /**
     * Update the live preview panel using the global updatePreview function from admin.js
     * @param {string} setting - The setting key to update
     * @param {*} value - The value to set
     */
    function updateLivePreview(setting, value) {
        if (typeof window.ldwpUpdatePreview === 'function') {
            window.ldwpUpdatePreview(setting, value);
        }
    }

    /**
     * Apply all wizard settings to the live preview
     */
    function syncAllSettingsToPreview() {
        var s = wizard.settings;

        // Create batch object compatible with admin.js updatePreview
        var batch = $.extend({}, s);

        // Remap keys where wizard settings differ from preview setting names
        if (s.background_mode === 'image') {
            batch.background_image = s.background_image_url || '';
        } else {
            batch.background_image = ''; // Ensure it's cleared if not image mode
        }

        if (s.logo_url) {
            batch.logo_image = s.logo_url;
        }

        // Set defaults for gradients if missing (prevents glitches)
        if (!batch.gradient_type) batch.gradient_type = 'linear';
        if (!batch.gradient_angle) batch.gradient_angle = 135;
        if (!batch.gradient_position) batch.gradient_position = 'center center';

        // Use Atomic Batch Update if available (fixes race conditions)
        if (typeof window.ldwpUpdatePreviewBatch === 'function') {
            window.ldwpUpdatePreviewBatch(batch);
        } else {
            // Fallback for safety (though admin.js should be updated)
            $.each(batch, function (key, value) {
                updateLivePreview(key, value);
            });
        }
    }

    // Preset definitions
    var presets = {
        // Free presets
        'modern-light': {
            name: 'Modern Light',
            pro: false,
            settings: {
                background_mode: 'solid',
                background_color: '#f8fafc',
                form_bg_color: '#ffffff',
                form_border_radius: 12,
                form_border_color: '#e2e8f0',
                label_text_color: '#334155',
                input_bg_color: '#ffffff',
                input_text_color: '#1e293b',
                input_border_color: '#cbd5e1',
                button_bg: '#3b82f6',
                button_bg_hover: '#2563eb',
                button_text_color: '#ffffff',
                button_border_radius: 8
            }
        },
        'modern-dark': {
            name: 'Modern Dark',
            pro: false,
            settings: {
                background_mode: 'solid',
                background_color: '#0f172a',
                form_bg_color: '#1e293b',
                form_border_radius: 12,
                form_border_color: '#334155',
                label_text_color: '#e2e8f0',
                input_bg_color: '#0f172a',
                input_text_color: '#f1f5f9',
                input_border_color: '#475569',
                button_bg: '#3b82f6',
                button_bg_hover: '#2563eb',
                button_text_color: '#ffffff',
                button_border_radius: 8
            }
        },
        'minimal': {
            name: 'Minimal',
            pro: false,
            settings: {
                background_mode: 'solid',
                background_color: '#ffffff',
                form_bg_color: '#ffffff',
                form_border_radius: 0,
                form_border_color: '#e5e7eb',
                label_text_color: '#111827',
                input_bg_color: '#f9fafb',
                input_text_color: '#111827',
                input_border_color: '#d1d5db',
                button_bg: '#111827',
                button_bg_hover: '#374151',
                button_text_color: '#ffffff',
                button_border_radius: 4
            }
        },
        // Pro presets
        'glassmorphism': {
            name: 'Glassmorphism',
            pro: true,
            settings: {
                background_mode: 'gradient',
                background_gradient_1: '#667eea',
                background_gradient_2: '#764ba2',
                gradient_type: 'linear',
                gradient_angle: 135,
                gradient_position: 'center center',
                form_bg_color: 'rgba(255,255,255,0.15)',
                form_border_radius: 20,
                form_border_color: 'rgba(255,255,255,0.3)',
                label_text_color: '#ffffff',
                input_bg_color: 'rgba(255,255,255,0.2)',
                input_text_color: '#ffffff',
                input_border_color: 'rgba(255,255,255,0.3)',
                button_bg: '#ffffff',
                button_bg_hover: '#f0f0f0',
                button_text_color: '#667eea',
                button_border_radius: 999
            }
        },
        'neon-glow': {
            name: 'Neon Glow',
            pro: true,
            settings: {
                background_mode: 'solid',
                background_color: '#0a0a0a',
                form_bg_color: '#141414',
                form_border_radius: 16,
                form_border_color: '#22d3ee',
                label_text_color: '#22d3ee',
                input_bg_color: '#0a0a0a',
                input_text_color: '#f0f0f0',
                input_border_color: '#22d3ee',
                button_bg: '#22d3ee',
                button_bg_hover: '#06b6d4',
                button_text_color: '#0a0a0a',
                button_border_radius: 8
            }
        },
        'corporate': {
            name: 'Corporate',
            pro: true,
            settings: {
                background_mode: 'solid',
                background_color: '#1e3a5f',
                form_bg_color: '#ffffff',
                form_border_radius: 4,
                form_border_color: '#d1d5db',
                label_text_color: '#1f2937',
                input_bg_color: '#f9fafb',
                input_text_color: '#111827',
                input_border_color: '#9ca3af',
                button_bg: '#1e3a5f',
                button_bg_hover: '#0f2744',
                button_text_color: '#ffffff',
                button_border_radius: 4
            }
        },
        'creative': {
            name: 'Creative',
            pro: true,
            settings: {
                background_mode: 'gradient',
                background_gradient_1: '#f97316',
                background_gradient_2: '#ec4899',
                gradient_type: 'linear',
                gradient_angle: 135,
                gradient_position: 'center center',
                form_bg_color: '#ffffff',
                form_border_radius: 24,
                form_border_color: '#fecdd3',
                label_text_color: '#831843',
                input_bg_color: '#fff1f2',
                input_text_color: '#831843',
                input_border_color: '#fda4af',
                button_bg: '#ec4899',
                button_bg_hover: '#db2777',
                button_text_color: '#ffffff',
                button_border_radius: 999
            }
        },
        'ocean': {
            name: 'Ocean',
            pro: true,
            settings: {
                background_mode: 'gradient',
                background_gradient_1: '#0891b2',
                background_gradient_2: '#164e63',
                gradient_type: 'linear',
                gradient_angle: 135,
                gradient_position: 'center center',
                form_bg_color: '#ffffff',
                form_border_radius: 16,
                form_border_color: '#a5f3fc',
                label_text_color: '#164e63',
                input_bg_color: '#ecfeff',
                input_text_color: '#164e63',
                input_border_color: '#67e8f9',
                button_bg: '#0891b2',
                button_bg_hover: '#0e7490',
                button_text_color: '#ffffff',
                button_border_radius: 8
            }
        },
        'sunset': {
            name: 'Sunset',
            pro: true,
            settings: {
                background_mode: 'gradient',
                background_gradient_1: '#ff6b6b',
                background_gradient_2: '#feca57',
                gradient_type: 'linear',
                gradient_angle: 135,
                gradient_position: 'center center',
                form_bg_color: '#fffbeb',
                form_border_radius: 20,
                form_border_color: '#fde68a',
                label_text_color: '#92400e',
                input_bg_color: '#ffffff',
                input_text_color: '#78350f',
                input_border_color: '#fcd34d',
                button_bg: '#f59e0b',
                button_bg_hover: '#d97706',
                button_text_color: '#000000',
                button_border_radius: 12
            }
        },
        'forest': {
            name: 'Forest',
            pro: true,
            settings: {
                background_mode: 'solid',
                background_color: '#14532d',
                form_bg_color: '#f0fdf4',
                form_border_radius: 12,
                form_border_color: '#86efac',
                label_text_color: '#14532d',
                input_bg_color: '#ffffff',
                input_text_color: '#166534',
                input_border_color: '#4ade80',
                button_bg: '#16a34a',
                button_bg_hover: '#15803d',
                button_text_color: '#ffffff',
                button_border_radius: 8
            }
        },
        'elegant': {
            name: 'Elegant',
            pro: true,
            settings: {
                background_mode: 'solid',
                background_color: '#1c1917',
                form_bg_color: '#fafaf9',
                form_border_radius: 8,
                form_border_color: '#d6d3d1',
                label_text_color: '#44403c',
                input_bg_color: '#ffffff',
                input_text_color: '#1c1917',
                input_border_color: '#a8a29e',
                button_bg: '#78716c',
                button_bg_hover: '#57534e',
                button_text_color: '#ffffff',
                button_border_radius: 4
            }
        },
        'tech': {
            name: 'Tech',
            pro: true,
            settings: {
                background_mode: 'solid',
                background_color: '#18181b',
                form_bg_color: '#27272a',
                form_border_radius: 16,
                form_border_color: '#3f3f46',
                label_text_color: '#a1a1aa',
                input_bg_color: '#18181b',
                input_text_color: '#fafafa',
                input_border_color: '#52525b',
                button_bg: '#a855f7',
                button_bg_hover: '#9333ea',
                button_text_color: '#ffffff',
                button_border_radius: 8
            }
        }
    };

    // Initialize wizard
    function init() {
        console.log('LDWP Wizard: Initializing...');

        // Check if Pro is active
        wizard.isPro = typeof logindesignerwp_wizard !== 'undefined' && logindesignerwp_wizard.isPro;

        // Bind events
        bindEvents();

        console.log('LDWP Wizard: Ready. Button found:', $('.ldwp-start-wizard-btn').length);
        console.log('LDWP Wizard: Modal found:', $('.ldwp-wizard-overlay').length);
    }

    // Bind event handlers
    function bindEvents() {
        // Open wizard - inline version
        $(document).on('click', '.ldwp-start-wizard-btn', openInlineWizard);

        // Exit wizard button
        $(document).on('click', '.ldwp-wizard-exit-btn', function (e) {
            e.preventDefault();
            closeInlineWizard();
        });

        // Navigation - inline version
        $(document).on('click', '.ldwp-wizard-next', nextStep);
        $(document).on('click', '.ldwp-wizard-prev', prevStep);
        $(document).on('click', '.ldwp-wizard-apply', applySettings);

        // Preset selection
        $(document).on('click', '.ldwp-wizard-preset:not(.is-locked)', selectPreset);

        // Background type selector (visual)
        $(document).on('click', '.ldwp-wizard-bg-type-option', function () {
            var $option = $(this);
            var $selector = $option.closest('.ldwp-wizard-bg-type-selector');
            var value = $option.data('value');

            // Update active state
            $selector.find('.ldwp-wizard-bg-type-option').removeClass('is-active');
            $option.addClass('is-active');

            // Update wizard state
            wizard.settings.background_mode = value;

            // Show/hide panels
            $('.ldwp-wizard-bg-panel').removeClass('is-active');
            $('.ldwp-wizard-bg-panel[data-panel="' + value + '"]').addClass('is-active');

            // Update live preview
            updateLivePreview('background_mode', value);
        });

        // Gradient type selector (show/hide angle vs position)
        $(document).on('change', '.ldwp-wizard-select[data-setting="gradient_type"]', function () {
            var type = $(this).val();
            wizard.settings.gradient_type = type;

            if (type === 'radial') {
                $('.ldwp-wizard-gradient-linear-opt').hide();
                $('.ldwp-wizard-gradient-radial-opt').show();
            } else {
                $('.ldwp-wizard-gradient-linear-opt').show();
                $('.ldwp-wizard-gradient-radial-opt').hide();
            }

            // Update live preview
            updateLivePreview('gradient_type', type);
        });

        // Gradient randomize button
        $(document).on('click', '.ldwp-wizard-randomize-btn', function () {
            var randomColor1 = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            var randomColor2 = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

            wizard.settings.background_gradient_1 = randomColor1;
            wizard.settings.background_gradient_2 = randomColor2;

            // Update inputs
            var $panel = $(this).closest('.ldwp-wizard-bg-panel');
            $panel.find('[data-setting="background_gradient_1"]').val(randomColor1).trigger('change');
            $panel.find('[data-setting="background_gradient_2"]').val(randomColor2).trigger('change');

            // Update live preview
            updateLivePreview('background_gradient_1', randomColor1);
            updateLivePreview('background_gradient_2', randomColor2);
        });

        // Color pickers in wizard
        $(document).on('change', '.ldwp-wizard-color', function () {
            var $input = $(this);
            var setting = $input.data('setting');
            var value = $input.val();
            if (setting && wizard.settings.hasOwnProperty(setting)) {
                wizard.settings[setting] = value;
                updateLivePreview(setting, value);
            }
        });

        // Select dropdowns
        $(document).on('change', '.ldwp-wizard-select', function () {
            var $select = $(this);
            var setting = $select.data('setting');
            var value = $select.val();
            if (setting && wizard.settings.hasOwnProperty(setting)) {
                wizard.settings[setting] = value;
            }
        });

        // Number inputs
        $(document).on('change input', '.ldwp-wizard-number', function () {
            var $input = $(this);
            var setting = $input.data('setting');
            var value = parseInt($input.val(), 10);
            if (setting && wizard.settings.hasOwnProperty(setting)) {
                wizard.settings[setting] = value;
                updateLivePreview(setting, value);
            }
        });

        // Range sliders with value display
        $(document).on('input', '.ldwp-wizard-range', function () {
            var $input = $(this);
            var setting = $input.data('setting');
            var value = parseInt($input.val(), 10);
            var $valueDisplay = $input.closest('.ldwp-wizard-range-wrapper').find('.ldwp-wizard-range-value');

            // Update display
            if (setting === 'gradient_angle') {
                $valueDisplay.text(value + '°');
            } else if (setting === 'background_blur' || setting === 'logo_bottom_margin') {
                $valueDisplay.text(value + 'px');
            } else {
                $valueDisplay.text(value);
            }

            // Update wizard state
            if (setting && wizard.settings.hasOwnProperty(setting)) {
                wizard.settings[setting] = value;
                updateLivePreview(setting, value);
            }
        });

        // Corner selector (visual)
        $(document).on('click', '.ldwp-wizard-corner-option', function () {
            var $option = $(this);
            var $selector = $option.closest('.ldwp-wizard-corner-selector');
            var setting = $selector.data('setting');
            var value = parseInt($option.data('value'), 10);

            // Update active state
            $selector.find('.ldwp-wizard-corner-option').removeClass('is-active');
            $option.addClass('is-active');

            // Update wizard state
            if (setting && wizard.settings.hasOwnProperty(setting)) {
                wizard.settings[setting] = value;
                updateLivePreview(setting, value);
            }
        });

        // Logo upload button
        $(document).on('click', '.ldwp-wizard-logo-btn', function (e) {
            e.preventDefault();
            uploadLogo();
        });

        // Logo remove button
        $(document).on('click', '.ldwp-wizard-logo-remove', function (e) {
            e.preventDefault();
            wizard.settings.logo_id = 0;
            wizard.settings.logo_url = '';

            // Reset UI
            $('.ldwp-wizard-logo-thumb-img').attr('src', '').hide();
            $('.ldwp-wizard-logo-placeholder').show();
            $(this).hide(); // Hide remove button

            updateLivePreview('logo_image', '');
        });

        // Background image upload
        $(document).on('click', '.ldwp-wizard-image-btn', function () {
            uploadBackgroundImage();
        });

        // Background image remove
        $(document).on('click', '.ldwp-wizard-image-remove', function () {
            wizard.settings.background_image_id = 0;
            wizard.settings.background_image_url = '';
            $('.ldwp-wizard-image-preview').hide();
            updateLivePreview('background_image', '');
        });

        // AI Generate button (Pro)
        $(document).on('click', '.ldwp-wizard-ai-generate-btn', function () {
            aiGenerateBackground($(this));
        });

        // Step navigation via dots
        $(document).on('click', '.ldwp-wizard-dot', function () {
            var step = parseInt($(this).data('step'), 10);
            if (step && step <= wizard.currentStep + 1 && step >= 1) {
                wizard.currentStep = step;
                updateStepDisplay();
            }
        });
    }


    // Open wizard modal
    function openWizard() {
        wizard.currentStep = 1;
        updateStepDisplay();
        $('.ldwp-wizard-overlay').addClass('is-open');

        // Initialize color pickers if not already done
        initColorPickers();

        // Sync UI inputs with current settings (e.g. Logo Thumb)
        updateAllInputs();
    }

    // Initialize WordPress color pickers on wizard color inputs
    function initColorPickers() {
        $('.ldwp-wizard-color').each(function () {
            var $input = $(this);
            if (!$input.hasClass('wp-color-picker')) {
                $input.wpColorPicker({
                    change: function (event, ui) {
                        var $el = $(this);
                        var setting = $el.data('setting');
                        var val = ui.color.toString();

                        // Direct validation update
                        $el.val(val);

                        // Trigger input to fire updateColor or generic listener
                        $el.trigger('input');

                        // Immediate preview update for logo background
                        if (setting === 'logo_background_color') {
                            var isEnabled = $('input[data-setting="logo_background_enable"]').is(':checked');
                            if (isEnabled) {
                                $('.ldwp-wizard-logo-img').css('background-color', val);
                            }
                        }
                    },
                    clear: function () {
                        var $el = $(this).prev(); // Input is hidden previous sibling
                        $el.val('').trigger('change');
                        if ($el.data('setting') === 'logo_background_color') {
                            $('.ldwp-wizard-logo-img').css('background-color', 'transparent');
                        }
                    }
                });
            }
        });

        // Initialize Toggle Switch
        // Unbind first to prevent duplicate listeners if init is called multiple times
        $('.ldwp-wizard-toggle').off('change.wizard').on('change.wizard', function () {
            var $toggle = $(this);
            var setting = $toggle.data('setting');
            var isChecked = $toggle.is(':checked');
            var value = isChecked ? 1 : 0;

            if (setting === 'logo_background_enable') {
                if (isChecked) {
                    $('.ldwp-wizard-logo-bg-group').slideDown(200);

                    // Apply current values to preview
                    var color = $('input[data-setting="logo_background_color"]').val();
                    var padding = $('input[data-setting="logo_padding"]').val();

                    $('.ldwp-wizard-logo-img').css({
                        'background-color': color || 'transparent',
                        'padding': (padding || 0) + 'px'
                    });
                } else {
                    $('.ldwp-wizard-logo-bg-group').slideUp(200);

                    // Remove styles from preview
                    $('.ldwp-wizard-logo-img').css({
                        'background-color': 'transparent',
                        'padding': '0px'
                    });
                }
            }

            if (setting && wizard.settings.hasOwnProperty(setting)) {
                wizard.settings[setting] = value;
            }
        });

        // Set initial state of toggle group based on checkbox
        $('.ldwp-wizard-toggle[data-setting="logo_background_enable"]').each(function () {
            if ($(this).is(':checked')) {
                $('.ldwp-wizard-logo-bg-group').show();
            } else {
                $('.ldwp-wizard-logo-bg-group').hide();
            }
        });
    }

    // Close wizard modal
    function closeWizard() {
        $('.ldwp-wizard-overlay').removeClass('is-open');
    }

    // Open inline wizard (shows wizard, hides settings cards)
    function openInlineWizard() {
        wizard.currentStep = 1;
        $('.ldwp-wizard-inline').addClass('is-visible').show();
        $('.ldwp-settings-cards').hide();
        $('body').addClass('ldwp-wizard-active'); // Enable Focus Mode
        updateStepDisplay();
        initColorPickers();
    }

    // Close inline wizard (hides wizard, shows settings cards)
    function closeInlineWizard() {
        $('.ldwp-wizard-inline').removeClass('is-visible').hide();
        $('.ldwp-settings-cards').show();
        $('body').removeClass('ldwp-wizard-active'); // Disable Focus Mode
        // Ensure any random styles are cleared if needed, but CSS handles transition
    }

    // Upload background image
    function uploadBackgroundImage() {
        var mediaUploader = wp.media({
            title: 'Choose Background Image',
            button: { text: 'Use this image' },
            multiple: false
        });

        mediaUploader.on('select', function () {
            var attachment = mediaUploader.state().get('selection').first().toJSON();
            wizard.settings.background_image_id = attachment.id;
            wizard.settings.background_image_url = attachment.url;

            // Update wizard preview
            $('.ldwp-wizard-image-preview img').attr('src', attachment.url);
            $('.ldwp-wizard-image-preview').show();

            // Update live preview
            updateLivePreview('background_image', attachment.url);
        });

        mediaUploader.open();
    }

    // AI Generate Background (Pro)
    function aiGenerateBackground($button) {
        var prompt = window.prompt('Describe the background image you want AI to generate:');
        if (!prompt) return;

        var $container = $button.closest('.ldwp-wizard-upload-buttons');

        // Show loading state
        $button.prop('disabled', true).text('Generating...');

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'logindesignerwp_generate_background',
                nonce: $('input[name="logindesignerwp_nonce"]').val() || (typeof logindesignerwp_ajax !== 'undefined' ? logindesignerwp_ajax.nonce : ''),
                prompt: prompt
            },
            success: function (response) {
                $button.prop('disabled', false).html('<span class="dashicons dashicons-superhero"></span> AI Generate');

                if (response.success) {
                    wizard.settings.background_image_id = response.data.id;
                    wizard.settings.background_image_url = response.data.url;

                    // Update wizard preview
                    $('.ldwp-wizard-image-preview img').attr('src', response.data.medium_url || response.data.url);
                    $('.ldwp-wizard-image-preview').show();

                    // Update live preview
                    updateLivePreview('background_image', response.data.url);
                } else {
                    alert(response.data || 'Failed to generate image.');
                }
            },
            error: function () {
                $button.prop('disabled', false).html('<span class="dashicons dashicons-superhero"></span> AI Generate');
                alert('Request failed. Please try again.');
            }
        });
    }


    // Go to next step
    function nextStep() {
        if (wizard.currentStep < wizard.totalSteps) {
            wizard.currentStep++;
            updateStepDisplay();
        } else if (wizard.currentStep === wizard.totalSteps) {
            // If on final step, Next button hits this.
            // But UI should show Apply button instead.
            // Just in case, try to apply if somehow clicked.
            applySettings();
        }
    }

    // Go to previous step
    function prevStep() {
        if (wizard.currentStep > 1) {
            wizard.currentStep--;
            updateStepDisplay();
        }
    }

    // Update step display
    function updateStepDisplay() {
        // Update step indicator
        $('.ldwp-wizard-step-indicator').text('Step ' + wizard.currentStep + ' of ' + wizard.totalSteps);

        // Show/hide steps
        $('.ldwp-wizard-step').removeClass('is-active');
        $('.ldwp-wizard-step[data-step="' + wizard.currentStep + '"]').addClass('is-active');

        // Update dots
        $('.ldwp-wizard-dot').each(function (index) {
            var $dot = $(this);
            $dot.removeClass('is-active is-complete');
            if (index + 1 === wizard.currentStep) {
                $dot.addClass('is-active');
            } else if (index + 1 < wizard.currentStep) {
                $dot.addClass('is-complete');
            }
        });

        // Update nav buttons
        var $prevBtn = $('.ldwp-wizard-btn-prev');
        var $nextBtn = $('.ldwp-wizard-btn-next');
        var $applyBtn = $('.ldwp-wizard-btn-apply');

        if (wizard.currentStep === 1) {
            $prevBtn.css('visibility', 'hidden'); // Use visibility to maintain layout spacing if needed, OR hide()
            // To match User request "no back buttons", implying they want to see them.
            // If we use hide(), it removes it from layout.
            // The template uses style="visibility: hidden;".
            // Let's use CSS visibility to toggle.
        } else {
            $prevBtn.css('visibility', 'visible');
            $prevBtn.show(); // Ensure display is not none
        }

        if (wizard.currentStep === wizard.totalSteps) {
            $nextBtn.hide();
            $applyBtn.show();
        } else {
            $nextBtn.show();
            $applyBtn.hide();
        }

        // Update logo preview background when on step 3 (Logo & Branding)
        // Update logo preview background when on step 3 (Logo & Branding)
        if (wizard.currentStep === 3) {
            var s = wizard.settings;
            var bgStyle = s.background_mode === 'gradient'
                ? 'linear-gradient(135deg, ' + s.background_gradient_1 + ', ' + s.background_gradient_2 + ')'
                : s.background_color;

            // Apply background to the logo section to show realistic preview
            $('.ldwp-wizard-logo-section').css({
                'background': bgStyle,
                'padding': '30px',
                'border-radius': '12px'
            });

            // Style the logo upload area to look like the form background
            $('.ldwp-wizard-logo-upload-area').css({
                'background': s.form_bg_color,
                'border-radius': (s.form_border_radius || 4) + 'px'
            });

            // Apply logo-specific styles to the image
            // Only apply background/padding if enabled
            var isBgEnabled = !!s.logo_background_enable;

            var logoStyles = {
                'border-radius': (s.logo_border_radius || 0) + 'px',
                'background-color': isBgEnabled ? (s.logo_background_color || 'transparent') : 'transparent',
                'padding': isBgEnabled ? ((s.logo_padding || 0) + 'px') : '0px'
            };

            $('.ldwp-wizard-logo-img').css(logoStyles);
        }

        // Update preview on final step
        if (wizard.currentStep === wizard.totalSteps) {
            updateFinalPreview();
        }
    }

    // Select a preset
    function selectPreset() {
        var $preset = $(this);
        var presetId = $preset.data('preset');

        if (!presets[presetId]) return;

        // Update selection UI
        $('.ldwp-wizard-preset').removeClass('is-selected');
        $preset.addClass('is-selected');

        // Merge preset settings on top of FRESH defaults
        // This ensures previous preset settings (ghost data) are cleared
        wizard.settings = $.extend(true, {}, defaultSettings, presets[presetId].settings);
        wizard.settings.preset = presetId; // Store preset ID, not name

        // Sync to preview
        syncAllSettingsToPreview();

        // Sync to inputs (UI)
        updateAllInputs();
    }

    // Update all inputs from wizard state
    function updateAllInputs() {
        // 1. Update Background Mode Visual Selector
        var bgMode = wizard.settings.background_mode || 'solid';
        $('.ldwp-wizard-bg-type-option').removeClass('is-active');
        $('.ldwp-wizard-bg-type-option[data-value="' + bgMode + '"]').addClass('is-active');

        // Show/Hide Panels
        $('.ldwp-wizard-bg-panel').removeClass('is-active');
        $('.ldwp-wizard-bg-panel[data-panel="' + bgMode + '"]').addClass('is-active');

        // 2. Update Colors
        updateColorInputs();

        // 3. Update Range Sliders & Text
        $('.ldwp-wizard-range').each(function () {
            var $input = $(this);
            var setting = $input.data('setting');
            if (setting && wizard.settings.hasOwnProperty(setting)) {
                var val = wizard.settings[setting];
                $input.val(val);
                // Update display text
                var $display = $input.closest('.ldwp-wizard-range-wrapper').find('.ldwp-wizard-range-value');
                if (setting === 'gradient_angle') $display.text(val + '°');
                else if (['background_blur', 'logo_bottom_margin', 'logo_border_radius', 'logo_padding'].includes(setting)) $display.text(val + 'px');
                else $display.text(val);
            }
        });

        // 4. Update Number Inputs (Width/Height)
        $('.ldwp-wizard-number').each(function () {
            var $input = $(this);
            var setting = $input.data('setting');
            if (setting && wizard.settings.hasOwnProperty(setting)) {
                $input.val(wizard.settings[setting]);
            }
        });

        // 5. Update Toggles
        $('.ldwp-wizard-toggle').each(function () {
            var $input = $(this);
            var setting = $input.data('setting');
            if (setting && wizard.settings.hasOwnProperty(setting)) {
                var isChecked = !!wizard.settings[setting];
                $input.prop('checked', isChecked);
                // Trigger change to update UI groups (like showing logo background options)
                $input.trigger('change.wizard');
            }
        });

        // 6. Update Gradient Type (Radial/Linear)
        if (wizard.settings.gradient_type) {
            var $gradSelect = $('.ldwp-wizard-select[data-setting="gradient_type"]');
            $gradSelect.val(wizard.settings.gradient_type).trigger('change');
        }

        // 7. Update Logo Image (Compact UI)
        if (wizard.settings.logo_url) {
            $('.ldwp-wizard-logo-thumb-img').attr('src', wizard.settings.logo_url).show();
            $('.ldwp-wizard-logo-placeholder').hide();
            $('.ldwp-wizard-logo-remove').show();
        } else {
            $('.ldwp-wizard-logo-thumb-img').attr('src', '').hide();
            $('.ldwp-wizard-logo-placeholder').show();
            $('.ldwp-wizard-logo-remove').hide();
        }
    }

    // Update color inputs from wizard state
    function updateColorInputs() {
        // Dynamic update for ALL color inputs based on data-setting
        $('.ldwp-wizard-color').each(function () {
            var $input = $(this);
            var setting = $input.data('setting');

            if (setting && wizard.settings.hasOwnProperty(setting)) {
                var colorVal = wizard.settings[setting];

                // Update input value
                $input.val(colorVal);

                // Update WP Color Picker UI if initialized
                if ($input.data('wpWpColorPicker')) {
                    $input.wpColorPicker('color', colorVal);
                }
            }
        });
    }

    // Update a color from picker
    function updateColor() {
        var $input = $(this);
        var setting = $input.data('setting');
        var value = $input.val();

        // Special handling for logo background color immediate update
        if (setting === 'logo_background_color') {
            // Only apply if toggle is on or if we force it? 
            // If user is picking a color, they probably want to see it.
            // But if toggle is off, maybe we shouldn't?
            // Let's assume picking a color implies enabling it, or just show it.
            // But better to check toggle state logic if we want strictness.
            var isEnabled = $('input[data-setting="logo_background_enable"]').is(':checked');
            if (isEnabled || value) { // If value is being set, show it
                $('.ldwp-wizard-logo-img').css('background-color', value);
            }
        }

        if (setting && wizard.settings.hasOwnProperty(setting)) {
            wizard.settings[setting] = value;
            updateLivePreview(setting, value);
        }
    }

    // Update number/range inputs
    function updateInput() {
        var $input = $(this);
        var setting = $input.data('setting');
        var value = $input.val();

        // Update range value display
        if ($input.hasClass('ldwp-wizard-range')) {
            $input.siblings('.ldwp-wizard-range-value').text(value + 'px');
        }

        // Live update for wizard logo preview
        if (setting === 'logo_width') {
            $('.ldwp-wizard-logo-img').attr('width', value); // Update attribute for immediate effect if needed or CSS
            $('.ldwp-wizard-logo-img').css('width', value + 'px');
        }
        if (setting === 'logo_height') {
            $('.ldwp-wizard-logo-img').attr('height', value);
            $('.ldwp-wizard-logo-img').css('height', value + 'px');
        }
        if (setting === 'logo_border_radius') {
            var radius = parseInt(value);
            // If value is 50, usually circle, but let's stick to px unless UI specifies unit.
            // The UI sets data-value="50" for Circle. 
            // Logic: if 50 and context implies circle, use %. But here simple px or % logic:
            $('.ldwp-wizard-logo-img').css('border-radius', radius > 40 ? '50%' : radius + 'px');
        }
        if (setting === 'logo_padding') {
            $('.ldwp-wizard-logo-img').css('padding', value + 'px');
        }

        if (setting && wizard.settings.hasOwnProperty(setting)) {
            wizard.settings[setting] = value;
            updateLivePreview(setting, value);
        }
    }

    // Upload logo
    var logoUploader; // Persistent variable for uploader

    function uploadLogo() {
        if (logoUploader) {
            logoUploader.open();
            return;
        }

        logoUploader = wp.media({
            title: 'Choose Logo',
            button: { text: 'Use this logo' },
            multiple: false
        });

        logoUploader.on('select', function () {
            var attachment = logoUploader.state().get('selection').first().toJSON();
            wizard.settings.logo_id = attachment.id;
            wizard.settings.logo_url = attachment.url;

            // Update wizard preview
            // Update wizard preview (Compact UI)
            $('.ldwp-wizard-logo-thumb-img').attr('src', attachment.url).show();
            $('.ldwp-wizard-logo-placeholder').hide();
            $('.ldwp-wizard-logo-remove').show(); // Show remove button

            // Update live preview
            updateLivePreview('logo_image', attachment.url);
        });

        logoUploader.open();
    }

    // Update final preview
    function updateFinalPreview() {
        var $preview = $('.ldwp-wizard-final-preview-box');
        var $container = $('.ldwp-wizard-final-preview');
        var s = wizard.settings;

        // Apply background to container
        var bgStyle = '';
        var bgImage = 'none';
        var bgSize = '';
        var bgPos = '';
        var bgRepeat = '';

        if (s.background_mode === 'gradient') {
            var type = s.gradient_type || 'linear';
            var angle = s.gradient_angle || 135;
            var pos = s.gradient_position || 'center center';
            var g1 = s.background_gradient_1;
            var g2 = s.background_gradient_2;

            if (type === 'linear') {
                bgStyle = 'linear-gradient(' + angle + 'deg, ' + g1 + ', ' + g2 + ')';
            } else if (type === 'radial') {
                bgStyle = 'radial-gradient(circle at ' + pos + ', ' + g1 + ', ' + g2 + ')';
            } else {
                bgStyle = 'linear-gradient(' + angle + 'deg, ' + g1 + ', ' + g2 + ')';
            }
        } else if (s.background_mode === 'image') {
            bgStyle = s.background_color; // Fallback color
            if (s.background_image_url) {
                bgImage = 'url(' + s.background_image_url + ')';
                bgSize = 'cover';
                bgPos = 'center';
                bgRepeat = 'no-repeat';
            }
        } else {
            bgStyle = s.background_color;
        }

        $container.css({
            'background': bgStyle,
            'background-image': bgImage,
            'background-size': bgSize,
            'background-position': bgPos,
            'background-repeat': bgRepeat
        });

        // Apply form styles
        var formStyles = {
            'background-color': s.form_bg_color,
            'border-radius': (s.form_border_radius || 4) + 'px',
            'border': '1px solid ' + (s.form_border_color || '#c3c4c7'),
            'padding': '24px'
        };

        if (s.form_shadow_enable) {
            formStyles['box-shadow'] = '0 4px 24px ' + (s.form_shadow_color || 'rgba(0,0,0,0.25)');
        } else {
            formStyles['box-shadow'] = 'none';
        }

        $preview.css(formStyles);

        // Update logo - show uploaded logo or default WP icon (logo is now outside the form box)
        var $logoContainer = $container.find('.preview-logo');
        $logoContainer.css('text-align', 'center'); // Ensure container is centered
        if (s.logo_url) {
            $logoContainer.html('<img src="' + s.logo_url + '" style="max-width: 84px; max-height: 84px; display: inline-block;">');
        } else {
            // Default WordPress-style icon
            $logoContainer.html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.52 122.523" width="84" height="84" style="display: inline-block;"><circle fill="#2271b1" cx="61.26" cy="61.26" r="61.26"/><path fill="#fff" d="M61.262 8.805c28.939 0 52.455 23.516 52.455 52.455s-23.516 52.455-52.455 52.455S8.807 90.199 8.807 61.26 32.323 8.805 61.262 8.805z"/><path fill="#2271b1" d="M61.262 14.805c25.663 0 46.455 20.792 46.455 46.455s-20.792 46.455-46.455 46.455S14.807 86.923 14.807 61.26s20.792-46.455 46.455-46.455z"/></svg>');
        }

        // Apply logo background color
        // Apply logo background color
        // Apply logo background color
        if (s.logo_background_color && (s.logo_background_enable == 1 || s.logo_background_enable === '1' || s.logo_background_enable === true)) {
            $logoContainer.find('img, svg').css('background-color', s.logo_background_color);
        } else {
            $logoContainer.find('img, svg').css('background-color', 'transparent');
        }

        // Apply logo padding if set
        if (s.logo_padding) {
            // Check if user wants padding even without bg? 
            // The padding control is inside the BG group, so implies it's tied to BG.
            // But if we hide the group, user implies "No BG features".
            if (!s.logo_background_enable || s.logo_background_enable == '0') {
                $logoContainer.find('img, svg').css('padding', '0');
            } else {
                $logoContainer.find('img, svg').css('padding', s.logo_padding + 'px');
            }
        }

        // Style labels
        $preview.find('.preview-label').css('color', s.label_text_color);

        // Style inputs
        $preview.find('.preview-input').css({
            'background-color': s.input_bg_color,
            'color': s.input_text_color,
            'border': '1px solid ' + (s.input_border_color || '#8c8f94'),
            'border-radius': '4px'
        });

        // Style button
        $preview.find('.preview-button').css({
            'background-color': s.button_bg,
            'color': s.button_text_color,
            'border-radius': (s.button_border_radius || 3) + 'px'
        });

        // Update summary section
        var presetName = wizard.settings.preset ? presets[wizard.settings.preset].name : 'Custom';
        $('.ldwp-wizard-summary-preset').text(presetName);
        $('.ldwp-wizard-summary-bg').css('background', bgStyle);
        $('.ldwp-wizard-summary-form').css('background-color', s.form_bg_color);
        $('.ldwp-wizard-summary-button').css('background-color', s.button_bg);
    }

    // Apply settings to the main form
    function applySettings() {
        var s = wizard.settings;

        // Update background mode
        // Try radio buttons first
        var $bgModeRadio = $('input[name="logindesignerwp_settings[background_mode]"][value="' + s.background_mode + '"]');
        if ($bgModeRadio.length) {
            $bgModeRadio.prop('checked', true).trigger('change');
        }
        // Also update visual selector if present
        var $bgTypeSelector = $('.ldwp-bg-type-selector, .logindesignerwp-bg-type-selector');
        if ($bgTypeSelector.length) {
            $bgTypeSelector.find('.ldwp-bg-type-option, label').removeClass('is-active');
            $bgTypeSelector.find('[data-value="' + s.background_mode + '"]').addClass('is-active');
        }

        // Background color
        $('input[name="logindesignerwp_settings[background_color]"]').val(s.background_color).trigger('change');

        // Gradient settings
        $('input[name="logindesignerwp_settings[background_gradient_1]"]').val(s.background_gradient_1).trigger('change');
        $('input[name="logindesignerwp_settings[background_gradient_2]"]').val(s.background_gradient_2).trigger('change');
        $('select[name="logindesignerwp_settings[gradient_type]"]').val(s.gradient_type).trigger('change');
        $('input[name="logindesignerwp_settings[gradient_angle]"]').val(s.gradient_angle).trigger('input');
        $('select[name="logindesignerwp_settings[gradient_position]"]').val(s.gradient_position).trigger('change');

        // Image settings
        if (s.background_image_id) {
            $('input[name="logindesignerwp_settings[background_image_id]"]').val(s.background_image_id);
            var $imgPreview = $('.logindesignerwp-image-preview');
            if ($imgPreview.length && s.background_image_url) {
                $imgPreview.html('<img src="' + s.background_image_url + '" style="max-width: 200px;">').show();
            }
        }
        $('select[name="logindesignerwp_settings[background_image_size]"]').val(s.background_image_size).trigger('change');
        $('select[name="logindesignerwp_settings[background_image_pos]"]').val(s.background_image_pos).trigger('change');
        $('select[name="logindesignerwp_settings[background_image_repeat]"]').val(s.background_image_repeat).trigger('change');
        $('input[name="logindesignerwp_settings[background_blur]"]').val(s.background_blur).trigger('input');

        // Form settings
        $('input[name="logindesignerwp_settings[form_bg_color]"]').val(s.form_bg_color).trigger('change');
        $('input[name="logindesignerwp_settings[form_border_radius]"]').val(s.form_border_radius).trigger('input');
        $('input[name="logindesignerwp_settings[form_border_color]"]').val(s.form_border_color).trigger('change');

        $('input[name="logindesignerwp_settings[label_text_color]"]').val(s.label_text_color).trigger('change');
        $('input[name="logindesignerwp_settings[input_bg_color]"]').val(s.input_bg_color).trigger('change');
        $('input[name="logindesignerwp_settings[input_text_color]"]').val(s.input_text_color).trigger('change');
        $('input[name="logindesignerwp_settings[input_border_color]"]').val(s.input_border_color).trigger('change');

        $('input[name="logindesignerwp_settings[button_bg]"]').val(s.button_bg).trigger('change');
        $('input[name="logindesignerwp_settings[button_bg_hover]"]').val(s.button_bg_hover).trigger('change');
        $('input[name="logindesignerwp_settings[button_text_color]"]').val(s.button_text_color).trigger('change');
        $('input[name="logindesignerwp_settings[button_border_radius]"]').val(s.button_border_radius).trigger('input');

        // Logo settings
        if (s.logo_id) {
            $('input[name="logindesignerwp_settings[logo_id]"]').val(s.logo_id);
            var $logoPreview = $('.logindesignerwp-logo-preview');
            if ($logoPreview.length && s.logo_url) {
                $logoPreview.html('<img src="' + s.logo_url + '" style="max-width: 200px;">').show();
            }
        }
        $('input[name="logindesignerwp_settings[logo_width]"]').val(s.logo_width).trigger('input');
        $('input[name="logindesignerwp_settings[logo_height]"]').val(s.logo_height).trigger('input');
        $('input[name="logindesignerwp_settings[logo_border_radius]"]').val(s.logo_border_radius).trigger('input');
        $('input[name="logindesignerwp_settings[logo_bottom_margin]"]').val(s.logo_bottom_margin).trigger('input');

        // Logo padding (needs to be added to main settings?)
        // If it exists in main settings, update it.
        var $logoPadding = $('input[name="logindesignerwp_settings[logo_padding]"]');
        if ($logoPadding.length) {
            $logoPadding.val(s.logo_padding).trigger('input');
        }

        // Handle Logo Background Color based on enable toggle
        var logoBgColor = s.logo_background_color;

        // If toggle exists in wizard but is off, clear color. 
        // Note: s.logo_background_enable might be string "1" or number 1 or undefined.
        // If I haven't added it to defaultSettings, it might be undefined initially.
        // Let's check checked state of the toggle input directly or rely on wizard.settings.
        // The toggle handler updates wizard.settings.logo_background_enable.

        if (!s.logo_background_enable || s.logo_background_enable == '0') {
            logoBgColor = ''; // Clear it
        }

        $('input[name="logindesignerwp_settings[logo_background_color]"]').val(logoBgColor).trigger('change');

        // Also ensure we update the LIVE preview immediately
        if (typeof window.updatePreview === 'function') {
            updatePreview('logo_background_color', logoBgColor);
            // Verify this key matches what class-settings.php expects/renders
        }

        // Also persist the toggle if main settings has it (optional feature for future)
        // $('input[name="logindesignerwp_settings[logo_background_enable]"]').prop('checked', !!s.logo_background_enable);

        // Update color pickers
        $('.wp-color-picker').each(function () {
            var $picker = $(this);
            var name = $picker.attr('name');
            if (name) {
                try {
                    $picker.wpColorPicker('color', $picker.val());
                } catch (e) {
                    // Color picker not initialized
                }
            }
        });

        // Force update preview with precise Wizard settings (bypassing potential color picker Hex conversion issues)
        // This ensures Glassmorphism (RGBA) and other sensitive styles render correctly immediately
        if (typeof window.updatePreview === 'function') {
            updatePreview('form_bg_color', s.form_bg_color);
            updatePreview('form_border_color', s.form_border_color);
            updatePreview('input_bg_color', s.input_bg_color);
            updatePreview('input_border_color', s.input_border_color);
            updatePreview('button_bg', s.button_bg);
            updatePreview('button_bg_hover', s.button_bg_hover);
            updatePreview('label_text_color', s.label_text_color);
            updatePreview('background_color', s.background_color);
            // Re-apply background mode to ensure correct layers
            updatePreview('background_mode', s.background_mode);
        }

        // Close inline wizard
        closeInlineWizard();

        // Show success toast
        var $toast = $('<div class="ldwp-wizard-toast">✨ Design applied! Click Save to keep your changes.</div>');
        $toast.css({
            'position': 'fixed',
            'bottom': '20px',
            'right': '20px',
            'background': '#22c55e',
            'color': 'white',
            'padding': '16px 24px',
            'border-radius': '8px',
            'font-size': '14px',
            'font-weight': '500',
            'box-shadow': '0 4px 12px rgba(34, 197, 94, 0.4)',
            'z-index': '100001',
            'animation': 'slideIn 0.3s ease'
        });
        $('body').append($toast);

        setTimeout(function () {
            $toast.fadeOut(300, function () { $(this).remove(); });
        }, 4000);
    }


    // Initialize on document ready
    $(document).ready(init);

})(jQuery);
