/**
 * LoginDesignerWP Design Wizard
 * Modal-based step-by-step wizard for customizing login page
 */
(function ($) {
    'use strict';

    // Wizard state
    var wizard = {
        currentStep: 1,
        totalSteps: 5,
        isPro: false,
        settings: {
            preset: null,
            background_mode: 'solid',
            background_color: '#f0f0f1',
            background_gradient_1: '#f0f0f1',
            background_gradient_2: '#c3c4c7',
            form_bg_color: '#ffffff',
            form_border_radius: 0,
            form_border_color: '#c3c4c7',
            label_text_color: '#1e1e1e',
            input_bg_color: '#ffffff',
            input_text_color: '#1e1e1e',
            input_border_color: '#8c8f94',
            button_bg: '#2271b1',
            button_bg_hover: '#135e96',
            button_text_color: '#ffffff',
            button_border_radius: 3,
            logo_id: 0,
            logo_url: '',
            logo_bg_color: 'transparent'
        }
    };

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
        // Open wizard
        $(document).on('click', '.ldwp-start-wizard-btn', openWizard);

        // Close wizard
        $(document).on('click', '.ldwp-wizard-close, .ldwp-wizard-overlay', function (e) {
            if (e.target === this) {
                closeWizard();
            }
        });

        // Navigation
        $(document).on('click', '.ldwp-wizard-btn-next', nextStep);
        $(document).on('click', '.ldwp-wizard-btn-prev', prevStep);
        $(document).on('click', '.ldwp-wizard-btn-apply', applySettings);

        // Preset selection
        $(document).on('click', '.ldwp-wizard-preset:not(.is-locked)', selectPreset);

        // Color pickers in wizard
        $(document).on('change', '.ldwp-wizard-color', updateColor);

        // Logo upload
        $(document).on('click', '.ldwp-wizard-logo-upload-btn', uploadLogo);

        // Corner selector clicks
        $(document).on('click', '.ldwp-corner-option', function () {
            var $option = $(this);
            var $selector = $option.closest('.ldwp-corner-selector');
            var setting = $selector.data('setting');
            var value = parseInt($option.data('value'), 10);

            // Update active state
            $selector.find('.ldwp-corner-option').removeClass('is-active');
            $option.addClass('is-active');

            // Update wizard state
            if (setting && wizard.settings.hasOwnProperty(setting)) {
                wizard.settings[setting] = value;
            }
        });

        // ESC key to close
        $(document).on('keydown', function (e) {
            if (e.key === 'Escape' && $('.ldwp-wizard-overlay.is-open').length) {
                closeWizard();
            }
        });
    }

    // Open wizard modal
    function openWizard() {
        wizard.currentStep = 1;
        updateStepDisplay();
        $('.ldwp-wizard-overlay').addClass('is-open');
        $('body').css('overflow', 'hidden');

        // Initialize color pickers if not already done
        initColorPickers();
    }

    // Initialize WordPress color pickers on wizard color inputs
    function initColorPickers() {
        $('.ldwp-wizard-color').each(function () {
            var $input = $(this);
            if (!$input.hasClass('wp-color-picker')) {
                $input.wpColorPicker({
                    change: function (event, ui) {
                        var setting = $(event.target).data('setting');
                        var color = ui.color.toString();
                        if (setting && wizard.settings.hasOwnProperty(setting)) {
                            wizard.settings[setting] = color;
                        }
                    }
                });
            }
        });
    }

    // Close wizard modal
    function closeWizard() {
        $('.ldwp-wizard-overlay').removeClass('is-open');
        $('body').css('overflow', '');
    }

    // Go to next step
    function nextStep() {
        if (wizard.currentStep < wizard.totalSteps) {
            wizard.currentStep++;
            updateStepDisplay();
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
            $prevBtn.hide();
        } else {
            $prevBtn.show();
        }

        if (wizard.currentStep === wizard.totalSteps) {
            $nextBtn.hide();
            $applyBtn.show();
        } else {
            $nextBtn.show();
            $applyBtn.hide();
        }

        // Update logo preview background when on step 4 (Logo & Branding)
        if (wizard.currentStep === 4) {
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

            // Style the logo upload area with the forms settings
            $('.ldwp-wizard-logo-upload').css({
                'background': s.form_bg_color,
                'border-radius': (s.form_border_radius || 4) + 'px'
            });
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

        // Store preset
        wizard.settings.preset = presetId;

        // Apply preset settings to wizard state
        var presetSettings = presets[presetId].settings;
        $.extend(wizard.settings, presetSettings);

        // Update color inputs to reflect preset
        updateColorInputs();
    }

    // Update color inputs from wizard state
    function updateColorInputs() {
        $('input[name="wizard_background_color"]').val(wizard.settings.background_color);
        $('input[name="wizard_form_bg_color"]').val(wizard.settings.form_bg_color);
        $('input[name="wizard_button_bg"]').val(wizard.settings.button_bg);
        $('input[name="wizard_label_text_color"]').val(wizard.settings.label_text_color);
        $('input[name="wizard_input_bg_color"]').val(wizard.settings.input_bg_color);
        $('input[name="wizard_input_text_color"]').val(wizard.settings.input_text_color);

        // Trigger color pickers to update if they exist
        $('.ldwp-wizard-color').each(function () {
            var $input = $(this);
            if ($input.data('wpWpColorPicker')) {
                $input.wpColorPicker('color', $input.val());
            }
        });
    }

    // Update a color from picker
    function updateColor() {
        var $input = $(this);
        var setting = $input.data('setting');
        var value = $input.val();

        if (setting && wizard.settings.hasOwnProperty(setting)) {
            wizard.settings[setting] = value;
        }
    }

    // Upload logo
    function uploadLogo() {
        var mediaUploader;

        if (mediaUploader) {
            mediaUploader.open();
            return;
        }

        mediaUploader = wp.media({
            title: 'Choose Logo',
            button: { text: 'Use this logo' },
            multiple: false
        });

        mediaUploader.on('select', function () {
            var attachment = mediaUploader.state().get('selection').first().toJSON();
            wizard.settings.logo_id = attachment.id;
            wizard.settings.logo_url = attachment.url;

            // Update preview
            $('.ldwp-wizard-logo-preview').html('<img src="' + attachment.url + '" alt="Logo">');
            $('.ldwp-wizard-logo-preview').show();
        });

        mediaUploader.open();
    }

    // Update final preview
    function updateFinalPreview() {
        var $preview = $('.ldwp-wizard-final-preview-box');
        var $container = $('.ldwp-wizard-final-preview');
        var s = wizard.settings;

        // Apply background to container
        var bgStyle = s.background_mode === 'gradient'
            ? 'linear-gradient(135deg, ' + s.background_gradient_1 + ', ' + s.background_gradient_2 + ')'
            : s.background_color;
        $container.css('background', bgStyle);

        // Apply form styles
        $preview.css({
            'background-color': s.form_bg_color,
            'border-radius': (s.form_border_radius || 4) + 'px',
            'border': '1px solid ' + (s.form_border_color || '#c3c4c7'),
            'padding': '24px'
        });

        // Update logo - show uploaded logo or default WP icon (logo is now outside the form box)
        var $logoContainer = $container.find('.preview-logo');
        $logoContainer.css('text-align', 'center'); // Ensure container is centered
        if (s.logo_url) {
            $logoContainer.html('<img src="' + s.logo_url + '" style="max-width: 84px; max-height: 84px; display: inline-block;">');
        } else {
            // Default WordPress-style icon
            $logoContainer.html('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.52 122.523" width="84" height="84" style="display: inline-block;"><circle fill="#2271b1" cx="61.26" cy="61.26" r="61.26"/><path fill="#fff" d="M61.262 8.805c28.939 0 52.455 23.516 52.455 52.455s-23.516 52.455-52.455 52.455S8.807 90.199 8.807 61.26 32.323 8.805 61.262 8.805z"/><path fill="#2271b1" d="M61.262 14.805c25.663 0 46.455 20.792 46.455 46.455s-20.792 46.455-46.455 46.455S14.807 86.923 14.807 61.26s20.792-46.455 46.455-46.455z"/></svg>');
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

        // Update main form inputs
        $('input[name="logindesignerwp_settings[background_mode]"][value="' + s.background_mode + '"]').prop('checked', true).trigger('change');
        $('input[name="logindesignerwp_settings[background_color]"]').val(s.background_color).trigger('change');
        $('input[name="logindesignerwp_settings[background_gradient_1]"]').val(s.background_gradient_1).trigger('change');
        $('input[name="logindesignerwp_settings[background_gradient_2]"]').val(s.background_gradient_2).trigger('change');

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

        // Handle logo settings
        if (s.logo_id) {
            $('input[name="logindesignerwp_settings[logo_id]"]').val(s.logo_id);
            // Update the logo preview in the main form if it exists
            var $logoPreview = $('.logindesignerwp-logo-preview');
            if ($logoPreview.length && s.logo_url) {
                $logoPreview.html('<img src="' + s.logo_url + '" style="max-width: 200px;">');
            }
        }

        // Apply logo background color if there's an input for it
        if (s.logo_bg_color && s.logo_bg_color !== 'transparent') {
            $('input[name="logindesignerwp_settings[logo_bg_color]"]').val(s.logo_bg_color).trigger('change');
        }

        // Update color pickers
        $('.wp-color-picker').each(function () {
            var $picker = $(this);
            var name = $picker.attr('name');
            if (name) {
                $picker.wpColorPicker('color', $picker.val());
            }
        });

        // Close wizard and show success
        closeWizard();

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
