/**
 * LoginDesignerWP Admin JavaScript
 *
 * Handles color pickers, media uploads, field toggling, and live preview.
 */
(function ($) {
    'use strict';

    // Cache preview elements
    var $previewBg,
        $previewForm,
        $previewLogo,
        $previewLogoImg,
        $previewLabels,
        $previewInputs,
        $previewButton,
        $previewLinks,
        $previewRemember,
        $previewSocial,
        $previewSocialBtns,
        $previewContainer;

    // Simple object to cache preview values (more reliable than jQuery .data())
    var previewCache = {
        bgMode: '',
        bgColor: '',
        gradient1: '',
        gradient2: '',
        gradient3: '',
        gradientType: 'linear',
        gradientAngle: 135,
        gradientPosition: 'center center',
        bgImage: ''
    };

    /**
     * Preview Status Indicator Module
     * Manages "Live" / "Updating..." state with debounced burst detection
     * Also tracks "Saved" / "Unsaved" state
     */
    var PreviewStatus = (function () {
        var $badge = null;
        var $container = null;
        var $statusText = null;
        var $saveStatus = null;
        var isUpdating = false;
        var isSaved = true;
        var isInitializing = true; // Flag to skip markUnsaved during initial load
        var fallbackTimer = null;
        var doneDebounceTimer = null;

        var config = {
            fallbackMs: 700,
            pulseClass: 'is-pulsing',
            updatingClass: 'is-updating',
            unsavedClass: 'is-unsaved',
            liveText: 'Preview',
            updatingText: 'Syncing…',
            savedText: 'Saved',
            unsavedText: 'Unsaved'
        };

        function init() {
            $badge = $('#ldwp-preview-status');
            $container = $('.logindesignerwp-preview-container');
            $statusText = $badge.find('.ldwp-status-text');
            $saveStatus = $badge.find('.ldwp-save-status');
        }

        function startUpdate() {
            if (!$badge || !$badge.length) return;

            if (!isUpdating) {
                isUpdating = true;
                $badge.addClass(config.updatingClass);
                $statusText.text(config.updatingText);
                triggerPulse();
            }

            // Mark as unsaved when changes are made (but not during initial load)
            if (!isInitializing) {
                markUnsaved();
            }

            // Clear existing timers
            clearTimeout(doneDebounceTimer);
            clearTimeout(fallbackTimer);

            // Set fallback to auto-complete after idle period
            fallbackTimer = setTimeout(function () {
                doneUpdate();
            }, config.fallbackMs);
        }

        function doneUpdate() {
            if (!$badge || !$badge.length) return;

            clearTimeout(doneDebounceTimer);
            clearTimeout(fallbackTimer);

            // Small debounce to prevent flicker
            doneDebounceTimer = setTimeout(function () {
                isUpdating = false;
                $badge.removeClass(config.updatingClass);
                $statusText.text(config.liveText);
            }, 50);
        }

        function triggerPulse() {
            if (!$container || !$container.length) return;

            // Remove class to reset animation
            $container.removeClass(config.pulseClass);
            // Force reflow to restart animation
            void $container[0].offsetWidth;
            // Re-add to trigger animation
            $container.addClass(config.pulseClass);

            // Remove after animation completes
            setTimeout(function () {
                $container.removeClass(config.pulseClass);
            }, 250);
        }

        function markUnsaved() {
            if (!$badge || !$badge.length) return;
            if (isSaved) {
                isSaved = false;
                $badge.addClass(config.unsavedClass);
                $saveStatus.text(config.unsavedText);
            }
        }

        function markSaved() {
            if (!$badge || !$badge.length) return;
            isSaved = true;
            $badge.removeClass(config.unsavedClass);
            $saveStatus.text(config.savedText);
        }

        function finishInitializing() {
            isInitializing = false;
        }

        return {
            init: init,
            start: startUpdate,
            done: doneUpdate,
            markUnsaved: markUnsaved,
            markSaved: markSaved,
            finishInitializing: finishInitializing
        };
    })();

    /**
     * Initialize preview element cache.
     */
    function initPreviewCache() {
        $previewContainer = $('.logindesignerwp-preview-container');
        $previewBg = $('#ldwp-preview-bg');
        $previewForm = $('#ldwp-preview-form');
        $previewLogo = $('#ldwp-preview-logo');
        $previewLogoImg = $('#ldwp-preview-logo-img');
        $previewLabels = $('#ldwp-preview-label-user, #ldwp-preview-label-pass');
        $previewInputs = $('#ldwp-preview-input-user, #ldwp-preview-input-pass');
        $previewButton = $('#ldwp-preview-button');
        $previewLinks = $('#ldwp-preview-links a');
        $previewLinks = $('#ldwp-preview-links a');
        $previewRemember = $('.logindesignerwp-preview-remember label');
        $previewSocial = $('.logindesignerwp-preview-social');
        $previewSocialBtns = $('.ldwp-preview-social-btn');
    }

    /**
     * Initialize color pickers with live preview callbacks.
     */
    function initColorPickers() {
        // Background color
        $('input[name="logindesignerwp_settings[background_color]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('background_color', ui.color.toString());
            }
        });

        // Gradient colors
        $('input[name="logindesignerwp_settings[background_gradient_1]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('background_gradient_1', ui.color.toString());
            }
        });

        $('input[name="logindesignerwp_settings[background_gradient_2]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('background_gradient_2', ui.color.toString());
            }
        });

        $('input[name="logindesignerwp_settings[background_gradient_3]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('background_gradient_3', ui.color.toString());
            }
        });

        // Form colors
        $('input[name="logindesignerwp_settings[form_bg_color]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('form_bg_color', ui.color.toString());
            }
        });

        $('input[name="logindesignerwp_settings[form_border_color]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('form_border_color', ui.color.toString());
            }
        });

        // Label and input colors
        $('input[name="logindesignerwp_settings[label_text_color]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('label_text_color', ui.color.toString());
            }
        });

        $('input[name="logindesignerwp_settings[input_bg_color]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('input_bg_color', ui.color.toString());
            }
        });

        $('input[name="logindesignerwp_settings[input_text_color]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('input_text_color', ui.color.toString());
            }
        });

        $('input[name="logindesignerwp_settings[input_border_color]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('input_border_color', ui.color.toString());
            }
        });

        $('input[name="logindesignerwp_settings[input_border_focus]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('input_border_focus', ui.color.toString());
            }
        });

        // Button colors
        $('input[name="logindesignerwp_settings[button_bg]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('button_bg', ui.color.toString());
            }
        });

        $('input[name="logindesignerwp_settings[button_bg_hover]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('button_bg_hover', ui.color.toString());
            }
        });

        $('input[name="logindesignerwp_settings[button_text_color]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('button_text_color', ui.color.toString());
            }
        });

        // Below form link color
        $('input[name="logindesignerwp_settings[below_form_link_color]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('below_form_link_color', ui.color.toString());
            }
        });

        // Logo background
        $('input[name="logindesignerwp_settings[logo_background_color]"]').wpColorPicker({
            change: function (event, ui) {
                updatePreview('logo_background_color', ui.color.toString());
            }
        });
    }

    /**
     * Initialize media uploaders.
     */
    function initMediaUploaders() {
        var mediaFrame;

        // Upload button click.
        $(document).on('click', '.logindesignerwp-upload-image', function (e) {
            e.preventDefault();

            var $button = $(this);
            var $container = $button.closest('td');
            var $input = $container.find('.logindesignerwp-image-id');
            var $preview = $container.find('.logindesignerwp-image-preview');
            var $removeBtn = $container.find('.logindesignerwp-remove-image');
            var isLogo = $preview.hasClass('logindesignerwp-logo-preview');
            var isBgImage = $input.attr('name').indexOf('background_image') !== -1;

            // Create media frame.
            mediaFrame = wp.media({
                title: 'Select Image',
                button: {
                    text: 'Use Image'
                },
                multiple: false
            });

            // On select.
            mediaFrame.on('select', function () {
                var attachment = mediaFrame.state().get('selection').first().toJSON();

                // Update hidden input.
                $input.val(attachment.id);

                // Update preview in settings.
                var previewUrl = attachment.sizes && attachment.sizes.medium
                    ? attachment.sizes.medium.url
                    : attachment.url;

                $preview.find('img').attr('src', previewUrl);
                $preview.show();
                $removeBtn.show();

                // Update live preview.
                var fullUrl = attachment.sizes && attachment.sizes.full
                    ? attachment.sizes.full.url
                    : attachment.url;

                if (isLogo) {
                    updatePreview('logo_image', fullUrl);
                } else if (isBgImage) {
                    updatePreview('background_image', fullUrl);
                }
            });

            mediaFrame.open();
        });

        // Remove button click.
        $(document).on('click', '.logindesignerwp-remove-image', function (e) {
            e.preventDefault();

            var $button = $(this);
            var $container = $button.closest('td');
            var $input = $container.find('.logindesignerwp-image-id');
            var $preview = $container.find('.logindesignerwp-image-preview');
            var isLogo = $preview.hasClass('logindesignerwp-logo-preview');
            var isBgImage = $input.attr('name').indexOf('background_image') !== -1;

            // Clear input.
            $input.val('0');

            // Hide preview.
            $preview.hide();
            $button.hide();

            // Update live preview.
            if (isLogo) {
                updatePreview('logo_image', '');
            } else if (isBgImage) {
                updatePreview('background_image', '');
            }
        });
    }

    /**
     * Initialize background mode toggling (visual selector).
     */
    function initBackgroundToggle() {
        var $modeInput = $('input.ldwp-bg-mode-value');
        var $selector = $('.ldwp-bg-type-selector');

        function toggleBackgroundOptions() {
            var mode = $modeInput.val();

            // Hide all options.
            $('.logindesignerwp-bg-options').hide();

            // Show selected mode options.
            $('.logindesignerwp-bg-' + mode).show();

            // Update preview.
            updatePreview('background_mode', mode);
        }

        // Initial state.
        toggleBackgroundOptions();

        // Click handler for visual selector cards
        $selector.on('click', '.ldwp-bg-type-option', function () {
            var $option = $(this);
            var value = $option.data('value');

            // Update active state
            $selector.find('.ldwp-bg-type-option').removeClass('is-active');
            $option.addClass('is-active');

            // Update hidden input value
            $modeInput.val(value);

            // Toggle options and update preview
            toggleBackgroundOptions();
        });

        initGradientControls();
        initRandomizer();
    }

    /**
     * Initialize gradient specific controls (type toggle, randomizer).
     */
    function initGradientControls() {
        var $typeSelect = $('select.logindesignerwp-gradient-type');

        $typeSelect.on('change', function () {
            var type = $(this).val();

            // Toggle visibility of specific options
            $('.logindesignerwp-gradient-opt').hide();
            $('.logindesignerwp-gradient-' + type).show();

            // Show/hide the 3rd color picker for mesh gradients
            if (type === 'mesh') {
                $('.logindesignerwp-mesh-color-3').show();
            } else {
                $('.logindesignerwp-mesh-color-3').hide();
            }

            // Update preview immediately
            updatePreview('gradient_type', type);
        });

        // Loop inputs for angle and position
        $('input[name="logindesignerwp_settings[gradient_angle]"]').on('input change', function () {
            updatePreview('gradient_angle', $(this).val());
        });

        $('select[name="logindesignerwp_settings[gradient_position]"]').on('change', function () {
            updatePreview('gradient_position', $(this).val());
        });

        // Blur slider
        $('#logindesignerwp-bg-blur').on('input', function () {
            var val = $(this).val();
            $(this).siblings('.logindesignerwp-range-value').text(val + 'px');
            updatePreview('background_blur', val);
        });
    }

    /**
     * Initialize Gradient Randomizer.
     */
    function initRandomizer() {
        $('.logindesignerwp-randomize-gradient').on('click', function (e) {
            e.preventDefault();

            // Helper to generate random hex
            var randomHex = function () {
                return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
            };

            // Generate two nice contrasting colors
            var col1 = randomHex();
            var col2 = randomHex();

            // If linear, maybe random angle
            var $angleInput = $('input[name="logindesignerwp_settings[gradient_angle]"]');
            var randomAngle = Math.floor(Math.random() * 360);
            $angleInput.val(randomAngle).trigger('input'); // Trigger input so output element updates

            // Update color pickers
            $('input[name="logindesignerwp_settings[background_gradient_1]"]').wpColorPicker('color', col1);
            $('input[name="logindesignerwp_settings[background_gradient_2]"]').wpColorPicker('color', col2);

            // Note: wpColorPicker 'color' method triggers change automatically usually, but we ensure preview updates
        });
    }

    /**
     * Helper to generate Mesh Gradient CSS.
     */
    function generateMeshGradient(c1, c2, c3) {
        // A fluid mesh effect using radial gradients with 3 colors
        c3 = c3 || c1; // Fallback to c1 if c3 not provided
        return 'radial-gradient(at top left, ' + c1 + ', transparent 70%), ' +
            'radial-gradient(at bottom right, ' + c2 + ', transparent 70%), ' +
            'radial-gradient(at top right, ' + c3 + ', transparent 70%), ' +
            'linear-gradient(135deg, ' + c2 + ', ' + c1 + ')';
    }

    /**
     * Initialize number input handlers.
     */
    function initNumberInputs() {
        // Form border radius
        $('input[name="logindesignerwp_settings[form_border_radius]"]').on('input change', function () {
            updatePreview('form_border_radius', $(this).val());
        });

        // Button border radius
        $('input[name="logindesignerwp_settings[button_border_radius]"]').on('input change', function () {
            updatePreview('button_border_radius', $(this).val());
        });

        // Logo width
        $('input[name="logindesignerwp_settings[logo_width]"]').on('input change', function () {
            updatePreview('logo_width', $(this).val());
        });

        // Custom message preview update
        $('textarea[name="logindesignerwp_settings[custom_message]"]').on('input change', function () {
            var value = $(this).val();
            var $customMsg = $('#ldwp-preview-custom-message');
            if (value.trim()) {
                $customMsg.text(value).show();
            } else {
                $customMsg.hide();
            }
            PreviewStatus.startUpdate();
            setTimeout(function () { PreviewStatus.endUpdate(); }, 100);
        });
    }

    /**
     * Initialize corner selector click handlers.
     */
    function initCornerSelectors() {
        // Click handler for corner options
        $(document).on('click', '.ldwp-corner-option', function () {
            var $option = $(this);
            var $selector = $option.closest('.ldwp-corner-selector');
            var settingName = $selector.data('setting');
            var value = $option.data('value');

            // Update active state
            $selector.find('.ldwp-corner-option').removeClass('is-active');
            $option.addClass('is-active');

            // Update hidden input value
            $selector.siblings('.ldwp-corner-value').val(value);

            // Update live preview
            if (settingName && typeof updatePreview === 'function') {
                updatePreview(settingName, value);
            }
        });
    }

    /**
     * Initialize 9-position grid click handlers.
     */
    function initPositionGrid() {
        $(document).on('click', '.ldwp-position-cell', function () {
            var $cell = $(this);
            var posX = $cell.data('x');
            var posY = $cell.data('y');

            // Update active state
            $('.ldwp-position-cell').removeClass('is-active');
            $cell.addClass('is-active');

            // Update hidden inputs
            $('#ldwp-position-x').val(posX);
            $('#ldwp-position-y').val(posY);

            // Update live preview - position the form
            if (typeof updatePreview === 'function') {
                updatePreview('layout_position_x', posX);
                updatePreview('layout_position_y', posY);
            }
        });
    }

    /**
     * Initialize layout style cards click handlers.
     */
    function initStyleCards() {
        $(document).on('click', '.ldwp-style-card', function () {
            var $card = $(this);
            var style = $card.data('style');

            // Update active state
            $('.ldwp-style-card').removeClass('is-active');
            $card.addClass('is-active');

            // Update hidden input
            $('#ldwp-layout-style').val(style);

            // Update live preview
            if (typeof updatePreview === 'function') {
                updatePreview('layout_style', style);
            }
        });
    }

    /**
     * Initialize Logo Controls.
     */
    function initLogoControls() {
        // Logo Height
        $('input[name="logindesignerwp_settings[logo_height]"]').on('input change', function () {
            updatePreview('logo_height', $(this).val());
        });

        // Logo Padding
        $('input[name="logindesignerwp_settings[logo_padding]"]').on('input change', function () {
            updatePreview('logo_padding', $(this).val());
        });

        // Logo Border Radius
        $('input[name="logindesignerwp_settings[logo_border_radius]"]').on('input change', function () {
            updatePreview('logo_border_radius', $(this).val());
        });

        // Logo Bottom Margin
        $('input[name="logindesignerwp_settings[logo_bottom_margin]"]').on('input change', function () {
            updatePreview('logo_bottom_margin', $(this).val());
        });

        // Background color handled by initColorPickers
    }

    /**
     * Initialize checkbox handlers.
     */
    function initCheckboxes() {
        $('input[name="logindesignerwp_settings[form_shadow_enable]"]').on('change', function () {
            updatePreview('form_shadow_enable', $(this).is(':checked'));
        });
    }

    /**
     * Initialize Social Login Controls.
     */
    function initSocialLoginControls() {
        // Layout
        $('#logindesignerwp-social-layout').on('change', function () {
            updatePreview('social_login_layout', $(this).val());
        });

        // Shape
        $('#logindesignerwp-social-shape').on('change', function () {
            updatePreview('social_login_shape', $(this).val());
        });

        // Style
        $('#logindesignerwp-social-style').on('change', function () {
            updatePreview('social_login_style', $(this).val());
        });

        // Toggle Buttons visibility
        function updateSocialContainerVisibility() {
            var google = $('.ldwp-preview-google').is(':visible');
            var github = $('.ldwp-preview-github').is(':visible');
            // Check specific settings value as well to be sure on init
            // But here we rely on the DOM visibility which is set by the toggle
            if (google || github) {
                $('#ldwp-preview-social').show();
            } else {
                $('#ldwp-preview-social').hide();
            }
        }

        $('input[name="logindesignerwp_settings[google_login_enable]"]').on('change', function () {
            var checked = $(this).is(':checked');
            $('.ldwp-preview-google').toggle(checked);
            updateSocialContainerVisibility();
        });

        $('input[name="logindesignerwp_settings[github_login_enable]"]').on('change', function () {
            var checked = $(this).is(':checked');
            $('.ldwp-preview-github').toggle(checked);
            updateSocialContainerVisibility();
        });
    }

    /**
     * Update preview based on setting change.
     * @param {string} setting The setting key
     * @param {string} value The new value
     * @param {boolean} skipRender If true, only updates cache/inputs but skips visual rendering
     */
    function updatePreview(setting, value, skipRender) {
        // Trigger status indicator update
        PreviewStatus.start();

        // If skipRender is undefined, default to false
        skipRender = skipRender || false;

        switch (setting) {
            // Background settings
            case 'background_mode':
                // Cache the mode value and update hidden input
                previewCache.bgMode = value;
                $('input.ldwp-bg-mode-value').val(value);
                if (!skipRender) applyBackgroundPreview();
                break;

            case 'background_color':
                previewCache.bgColor = value;
                $('input[name="logindesignerwp_settings[background_color]"]').val(value);
                if (!skipRender) applyBackgroundPreview();
                break;

            case 'background_gradient_1':
                previewCache.gradient1 = value;
                $('input[name="logindesignerwp_settings[background_gradient_1]"]').val(value);
                if (!skipRender) applyBackgroundPreview();
                break;

            case 'background_gradient_2':
                previewCache.gradient2 = value;
                $('input[name="logindesignerwp_settings[background_gradient_2]"]').val(value);
                if (!skipRender) applyBackgroundPreview();
                break;

            case 'background_gradient_3':
                previewCache.gradient3 = value;
                $('input[name="logindesignerwp_settings[background_gradient_3]"]').val(value);
                if (!skipRender) applyBackgroundPreview();
                break;

            case 'gradient_type':
                previewCache.gradientType = value;
                $('select[name="logindesignerwp_settings[gradient_type]"]').val(value);
                if (!skipRender) applyBackgroundPreview();
                break;

            case 'gradient_angle':
                previewCache.gradientAngle = value;
                $('input[name="logindesignerwp_settings[gradient_angle]"]').val(value);
                if (!skipRender) applyBackgroundPreview();
                break;

            case 'gradient_position':
                previewCache.gradientPosition = value;
                $('select[name="logindesignerwp_settings[gradient_position]"]').val(value);
                if (!skipRender) applyBackgroundPreview();
                break;

            case 'background_image':
                previewCache.bgImage = value;
                $('input[name="logindesignerwp_settings[background_image]"]').val(value);
                if (!skipRender) applyBackgroundPreview();
                break;

            case 'background_blur':
                if (!skipRender) applyBackgroundPreview();
                break;

            // Form container
            case 'form_bg_color':
                if (!skipRender) $previewForm.css('background-color', value);
                break;

            case 'form_border_radius':
                if (!skipRender) $previewForm.css('border-radius', value + 'px');
                break;

            case 'form_border_color':
                if (!skipRender) $previewForm.css('border', '1px solid ' + value);
                break;

            case 'form_shadow_enable':
            case 'form_shadow_color':
                if (!skipRender) {
                    var enableShadow = setting === 'form_shadow_enable' ? value : $('input[name="logindesignerwp_settings[form_shadow_enable]"]').is(':checked');
                    // Check if value is boolean true, string "1", "on", or "true"
                    var isEnabled = enableShadow === true || enableShadow === '1' || enableShadow === 1 || enableShadow === 'true' || enableShadow === 'on';

                    if (isEnabled) {
                        var shadowColor = setting === 'form_shadow_color' ? value : $('input[name="logindesignerwp_settings[form_shadow_color]"]').val();
                        if (!shadowColor) shadowColor = 'rgba(0,0,0,0.25)';
                        $previewForm.css('box-shadow', '0 4px 24px ' + shadowColor);
                    } else {
                        $previewForm.css('box-shadow', 'none');
                    }
                }
                break;

            // Labels and inputs
            case 'label_text_color':
                if (!skipRender) {
                    $previewLabels.css('color', value);
                    $previewRemember.css('color', value);
                }
                break;

            case 'below_form_link_color':
                if (!skipRender) {
                    $previewLinks.css('color', value);
                    $('#ldwp-preview-backtoblog a').css('color', value);
                    $('#ldwp-preview-custom-message').css('color', value);
                }
                break;

            case 'input_bg_color':
                if (!skipRender) $previewInputs.css('background-color', value);
                break;

            case 'input_text_color':
                if (!skipRender) $previewInputs.css('color', value);
                break;

            case 'input_border_color':
                if (!skipRender) $previewInputs.css('border', '1px solid ' + value);
                break;

            case 'input_border_focus':
                // Store for focus state (not applied until focus)
                $previewContainer.data('focus-color', value);
                break;

            // Button
            case 'button_bg':
                if (!skipRender) $previewButton.css('background-color', value);
                $previewContainer.data('button-bg', value);
                break;

            case 'button_bg_hover':
                $previewContainer.data('button-hover', value);
                break;

            case 'button_text_color':
                if (!skipRender) $previewButton.css('color', value);
                break;

            case 'button_border_radius':
                if (!skipRender) $previewButton.css('border-radius', value + 'px');
                break;

            // Logo
            case 'logo_image':
                if (!skipRender) {
                    if (value) {
                        // Show custom logo image
                        if ($previewLogoImg.length) {
                            $previewLogoImg.attr('src', value).show();
                        } else {
                            $previewLogo.find('a').html('<img src="' + value + '" alt="Logo" id="ldwp-preview-logo-img">');
                            $previewLogoImg = $('#ldwp-preview-logo-img');
                        }
                        $('#ldwp-preview-logo-wp').hide();
                    } else {
                        // Show WordPress logo
                        if ($previewLogoImg.length) {
                            $previewLogoImg.hide();
                        }
                        var wpLogo = $('#ldwp-preview-logo-wp');
                        if (wpLogo.length) {
                            wpLogo.show();
                        } else {
                            // Re-add WP logo if it was removed
                            $previewLogo.find('a').html('<svg id="ldwp-preview-logo-wp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.52 122.523" width="84" height="84"><path fill="#2271b1" d="M8.708 61.26c0 20.802 12.089 38.779 29.619 47.298L13.258 39.872a52.354 52.354 0 00-4.55 21.388zM96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501L48.2 93.547l11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z"/><path fill="#2271b1" d="M62.184 65.857l-15.768 45.819a52.552 52.552 0 0032.29-.838 4.693 4.693 0 01-.37-.712L62.184 65.857zM107.376 36.046a42.584 42.584 0 01.358 5.708c0 5.651-1.057 12.002-4.229 19.94l-16.973 49.082c16.519-9.627 27.618-27.628 27.618-48.18 0-9.762-2.499-18.929-6.774-26.55z"/><path fill="#2271b1" d="M61.262 0C27.483 0 0 27.481 0 61.26c0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.265-27.48 61.265-61.263C122.526 27.481 95.04 0 61.262 0zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z"/></svg>');
                        }
                    }
                }
                break;

            case 'logo_width':
                if (!skipRender) {
                    // Check if using image
                    var $img = $previewLogo.find('img');
                    if ($img.length && $img.is(':visible')) {
                        $previewLogo.find('a').css('width', value + 'px');
                        $previewLogo.find('a').css('background-size', 'contain'); // Force recheck
                    } else {
                        // SVG/Default
                        $previewLogo.find('a').css('width', value + 'px');
                        $previewLogo.find('a').css('background-size', value + 'px ' + value + 'px'); // Keep it tight
                    }
                }
                break;

            case 'logo_height':
                var h = (value == 0 || value == '') ? '84px' : value + 'px';
                $previewLogo.find('a').css('height', h);
                // Also update background size cover/contain logic if needed, but 'contain' usually fine
                break;

            case 'logo_padding':
                $previewLogo.find('a').css('padding', value + 'px');
                // Ensure bg clip content box if using background? No, usually padding adds space inside border-box
                // Just standard padding works effectively for 'badge' look
                break;

            case 'logo_border_radius':
                $previewLogo.find('a').css('border-radius', value + 'px');
                break;

            case 'logo_bottom_margin':
                $previewLogo.css('margin-bottom', value + 'px'); // h1 margin
                break;

            case 'logo_background_color':
                $previewLogo.find('a').css('background-color', value);
                // Ensure background-image (logo) sits ON TOP of color. 
                // Default WP CSS puts image in background-image. Color works fine with that.
                break;

            // Social Login
            case 'social_login_layout':
                if ($previewSocial.length) {
                    $previewSocial.attr('data-layout', value);
                }
                break;

            case 'social_login_shape':
                if ($previewSocial.length) {
                    $previewSocial.attr('data-shape', value);
                }
                break;

            case 'social_login_style':
                if ($previewSocial.length) {
                    $previewSocial.attr('data-style', value);
                }
                break;

            // Layout Position (9-grid)
            case 'layout_position_x':
            case 'layout_position_y':
                // Get current X and Y values
                var posX = $('#ldwp-position-x').val() || 'center';
                var posY = $('#ldwp-position-y').val() || 'center';

                // Map to flexbox values
                var justifyMap = { 'left': 'flex-start', 'center': 'center', 'right': 'flex-end' };
                var alignMap = { 'top': 'flex-start', 'center': 'center', 'bottom': 'flex-end' };

                $previewBg.css({
                    'display': 'flex',
                    'flex-direction': 'column',
                    'justify-content': alignMap[posY] || 'center',
                    'align-items': justifyMap[posX] || 'center'
                });
                break;

            // Layout Style (compact/standard/spacious)
            case 'layout_style':
                // Adjust form padding based on style
                var paddingMap = { 'compact': '12px 16px', 'standard': '20px', 'spacious': '28px 32px' };
                var marginMap = { 'compact': '12px', 'standard': '25px', 'spacious': '35px' };

                $previewForm.css('padding', paddingMap[value] || '20px');
                $previewLogo.css('margin-bottom', marginMap[value] || '25px');
                break;
        }
    }

    /**
     * Apply background preview based on current mode.
     * @param {string} [overrideMode] Optional mode to force render (bypassing cache race conditions)
     */
    function applyBackgroundPreview(overrideMode) {
        // Use override first, then previewCache, then fall back to DOM inputs
        var mode = overrideMode || previewCache.bgMode || $('input.ldwp-bg-mode-value').val() || $('input[name="logindesignerwp_settings[background_mode]"]').val();

        var bgColor = previewCache.bgColor || $('input[name="logindesignerwp_settings[background_color]"]').val();
        var gradient1 = previewCache.gradient1 || $('input[name="logindesignerwp_settings[background_gradient_1]"]').val();
        var gradient2 = previewCache.gradient2 || $('input[name="logindesignerwp_settings[background_gradient_2]"]').val();

        // Safety fallbacks to prevent "Invisible Preview" regression
        if (!mode) mode = 'solid';
        if (!bgColor) bgColor = '#ffffff';


        var bgImage = previewCache.bgImage || '';

        // Advanced Gradient Settings - use cache first, then DOM, then defaults
        var gradType = previewCache.gradientType || $('select[name="logindesignerwp_settings[gradient_type]"]').val() || 'linear';
        var gradAngle = previewCache.gradientAngle || $('input[name="logindesignerwp_settings[gradient_angle]"]').val() || '135';
        var gradPos = previewCache.gradientPosition || $('select[name="logindesignerwp_settings[gradient_position]"]').val() || 'center center';

        // Reset background classes
        $previewBg.removeClass('has-blur is-mode-solid is-mode-gradient is-mode-image');
        if (mode) {
            $previewBg.addClass('is-mode-' + mode);
        }

        // Apply styles based on mode
        switch (mode) {
            case 'solid':
                $previewBg.css({
                    'background-color': bgColor,
                    'background-image': 'none',
                    'background-repeat': 'repeat', // Reset
                    'background-size': 'auto',     // Reset
                    'background-position': '0% 0%', // Reset
                    'filter': 'none',
                    '--bg-image': '',
                    '--bg-blur': ''
                });
                break;

            case 'gradient':
                // Validate colors
                var safeG1 = gradient1 || '#ffffff';
                var safeG2 = gradient2 || '#000000';

                var gradientCss = '';
                if (gradType === 'linear') {
                    gradientCss = 'linear-gradient(' + gradAngle + 'deg, ' + safeG1 + ', ' + safeG2 + ')';
                } else if (gradType === 'radial') {
                    gradientCss = 'radial-gradient(circle at ' + gradPos + ', ' + safeG1 + ', ' + safeG2 + ')';
                } else if (gradType === 'mesh') {
                    var gradient3 = $('input[name="logindesignerwp_settings[background_gradient_3]"]').val() || safeG1;
                    var safeG3 = gradient3 || safeG1;
                    gradientCss = generateMeshGradient(safeG1, safeG2, safeG3);
                }

                $previewBg.css({
                    'background-image': gradientCss,
                    'background-color': safeG1, // Fallback
                    'background-repeat': 'no-repeat',
                    'background-size': 'cover',
                    'background-position': 'center',
                    'filter': 'none'
                });
                break;

            case 'image':
                $previewBg.css('background-color', bgColor);

                if (bgImage) {
                    var blurAmount = $('#logindesignerwp-bg-blur').val() || 0;

                    if (parseInt(blurAmount) > 0) {
                        $previewBg.addClass('has-blur');
                        $previewBg.css({
                            '--bg-image': 'url(' + bgImage + ')',
                            '--bg-blur': blurAmount + 'px',
                            '--bg-blur': blurAmount + 'px',
                            'background-image': 'none', // Handled by pseudo-element
                            'background-size': 'cover', // Default
                            'background-repeat': 'no-repeat',
                            'background-position': 'center'
                        });
                    } else {
                        $previewBg.removeClass('has-blur');
                        $previewBg.css({
                            'background-image': 'url(' + bgImage + ')',
                            'background-size': 'cover',
                            'background-position': 'center',
                            'background-repeat': 'no-repeat',
                            'filter': 'none',
                            '--bg-image': '',
                            '--bg-blur': ''
                        });
                    }
                } else {
                    // Image mode but no image URL? Treat as solid
                    $previewBg.css({
                        'background-image': 'none',
                        'background-size': 'auto',
                        'background-repeat': 'repeat',
                        'background-position': '0% 0%'
                    });
                }
                break;
        }
    }

    /**
     * Initialize button hover effect.
     */
    function initButtonHover() {
        $previewButton.on('mouseenter', function () {
            var hoverColor = $previewContainer.data('button-hover') ||
                $('input[name="logindesignerwp_settings[button_bg_hover]"]').val();
            $(this).css('background-color', hoverColor);
        });

        $previewButton.on('mouseleave', function () {
            var bgColor = $previewContainer.data('button-bg') ||
                $('input[name="logindesignerwp_settings[button_bg]"]').val();
            $(this).css('background-color', bgColor);
        });
    }

    /**
     * Apply initial preview styles from current settings.
     */
    function applyInitialPreview() {
        // Get current values
        var settings = {
            form_bg_color: $('input[name="logindesignerwp_settings[form_bg_color]"]').val(),
            form_border_radius: $('input[name="logindesignerwp_settings[form_border_radius]"]').val(),
            form_border_color: $('input[name="logindesignerwp_settings[form_border_color]"]').val(),
            form_shadow_enable: $('input[name="logindesignerwp_settings[form_shadow_enable]"]').is(':checked'),
            label_text_color: $('input[name="logindesignerwp_settings[label_text_color]"]').val(),
            input_bg_color: $('input[name="logindesignerwp_settings[input_bg_color]"]').val(),
            input_text_color: $('input[name="logindesignerwp_settings[input_text_color]"]').val(),
            input_border_color: $('input[name="logindesignerwp_settings[input_border_color]"]').val(),
            button_bg: $('input[name="logindesignerwp_settings[button_bg]"]').val(),
            button_text_color: $('input[name="logindesignerwp_settings[button_text_color]"]').val(),
            button_border_radius: $('input[name="logindesignerwp_settings[button_border_radius]"]').val(),
            below_form_link_color: $('input[name="logindesignerwp_settings[below_form_link_color]"]').val(),
            logo_width: $('input[name="logindesignerwp_settings[logo_width]"]').val(),
            logo_height: $('input[name="logindesignerwp_settings[logo_height]"]').val(),
            logo_padding: $('input[name="logindesignerwp_settings[logo_padding]"]').val(),
            logo_border_radius: $('input[name="logindesignerwp_settings[logo_border_radius]"]').val(),
            logo_bottom_margin: $('input[name="logindesignerwp_settings[logo_bottom_margin]"]').val(),
            logo_background_color: $('input[name="logindesignerwp_settings[logo_background_color]"]').val(),
            social_login_layout: $('select[name="logindesignerwp_settings[social_login_layout]"]').val(),
            social_login_shape: $('select[name="logindesignerwp_settings[social_login_shape]"]').val(),
            social_login_style: $('select[name="logindesignerwp_settings[social_login_style]"]').val(),
            background_blur: $('#logindesignerwp-bg-blur').val()
        };

        // Apply each setting
        for (var key in settings) {
            if (settings.hasOwnProperty(key)) {
                updatePreview(key, settings[key]);
            }
        }

        // Apply background
        applyBackgroundPreview();

        // Mark initialization complete so future changes trigger unsaved state
        PreviewStatus.finishInitializing();

        // Remove loading state from preview
        $('.logindesignerwp-preview-container').removeClass('is-preview-loading');
    }

    /**
     * Initialize sticky preview panel via JavaScript.
     */
    function initStickyPreview() {
        var $previewColumn = $('.logindesignerwp-preview-column');
        var $previewSticky = $('.logindesignerwp-preview-sticky');
        var $settingsColumn = $('.logindesignerwp-settings-column');

        if (!$previewColumn.length || !$previewSticky.length) {
            return;
        }

        var adminBarHeight = $('#wpadminbar').length ? $('#wpadminbar').outerHeight() : 32;
        var topOffset = 50; // Fixed offset from top when sticky

        function updateStickyPosition() {
            var columnTop = $previewColumn.offset().top;
            var scrollTop = $(window).scrollTop();
            var settingsHeight = $settingsColumn.outerHeight();
            var previewHeight = $previewSticky.outerHeight();
            var columnWidth = $previewColumn.width();

            // Calculate boundaries
            var stickyStart = columnTop - topOffset;
            var stickyEnd = columnTop + settingsHeight - previewHeight - topOffset;

            if (scrollTop > stickyStart && scrollTop < stickyEnd) {
                // Sticky state - fixed to top
                $previewSticky.addClass('is-sticky').css({
                    'position': 'fixed',
                    'top': topOffset + 'px',
                    'width': columnWidth + 'px'
                });
            } else if (scrollTop >= stickyEnd) {
                // Bottom state - stick to bottom of container
                $previewSticky.removeClass('is-sticky').css({
                    'position': 'absolute',
                    'top': (settingsHeight - previewHeight) + 'px',
                    'width': columnWidth + 'px'
                });
                $previewColumn.css('position', 'relative');
            } else {
                // Normal state - at top
                $previewSticky.removeClass('is-sticky').css({
                    'position': 'relative',
                    'top': '0',
                    'width': '100%'
                });
            }
        }

        // Bind scroll and resize events
        $(window).on('scroll', updateStickyPosition);
        $(window).on('resize', function () {
            $previewSticky.css('width', $previewColumn.width() + 'px');
            updateStickyPosition();
        });

        // Initial call
        updateStickyPosition();
    }

    /**
     * Initialize Reset to Defaults button.
     */
    function initResetDefaults() {
        $(document).on('click', '.logindesignerwp-reset-defaults', function (e) {
            e.preventDefault();

            // Show confirmation dialog
            var confirmed = confirm(
                'Are you sure you want to reset all login page settings to WordPress defaults?\n\n' +
                'This will remove all your customizations and cannot be undone.'
            );

            if (!confirmed) return;

            var $button = $(this);
            var originalText = $button.html();

            // Set loading state
            $button.prop('disabled', true);
            $button.html('<span class="dashicons dashicons-update dashicons-spin" style="line-height: 1.4; margin-right: 4px;"></span> Resetting...');

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'logindesignerwp_reset_defaults',
                    nonce: logindesignerwp_ajax.nonce
                },
                success: function (response) {
                    if (response.success) {
                        // Show success message and reload page
                        alert('Settings have been reset to WordPress defaults. The page will now reload.');
                        window.location.reload();
                    } else {
                        alert('Error: ' + (response.data || 'Failed to reset settings.'));
                        $button.prop('disabled', false);
                        $button.html(originalText);
                    }
                },
                error: function () {
                    alert('Request failed. Please check your connection and try again.');
                    $button.prop('disabled', false);
                    $button.html(originalText);
                }
            });
        });
    }

    /**
     * Initialize AI Background Generator.
     */
    function initAIGenerator() {
        $(document).on('click', '.logindesignerwp-ai-generate-bg', function (e) {
            e.preventDefault();

            var $button = $(this);
            var $icon = $button.find('.dashicons');
            var $container = $button.closest('td');

            var prompt = window.prompt("Describe the background image you want created by AI:");
            if (!prompt) return;

            // Remove any existing status message
            $container.find('.logindesignerwp-ai-status').remove();

            // Create inline status message with solid blue background
            var $status = $('<div class="logindesignerwp-ai-status" style="margin-top: 10px; padding: 12px 16px; background: #2271b1; color: #fff; border-radius: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px; box-shadow: 0 2px 8px rgba(34, 113, 177, 0.3);"><span class="dashicons dashicons-update" style="animation: rotation 1s infinite linear;"></span><span class="status-text">Generating your image with AI... This may take 15-30 seconds.</span></div>');
            $button.after($status);

            // Set button loading state with spinning icon
            $button.prop('disabled', true);
            $icon.removeClass('dashicons-superhero').addClass('dashicons-update dashicons-spin');

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'logindesignerwp_generate_background',
                    nonce: logindesignerwp_ajax.nonce,
                    prompt: prompt
                },
                success: function (response) {
                    $status.remove();

                    if (response.success) {
                        var data = response.data;

                        // Remove any existing AI notification in preview
                        $('.logindesignerwp-ai-preview-notification').remove();

                        // Show confirmation dialog in preview box with image thumbnail
                        var $previewBox = $previewContainer;
                        var $confirmDialog = $('<div class="logindesignerwp-ai-preview-notification" style="position: absolute; top: 10px; left: 10px; right: 10px; z-index: 100; padding: 16px; background: linear-gradient(135deg, #2271b1, #135e96); color: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(34, 113, 177, 0.4);">' +
                            '<div style="display: flex; gap: 16px; align-items: flex-start;">' +
                            '<div style="flex-shrink: 0; width: 80px; height: 80px; border-radius: 8px; overflow: hidden; border: 2px solid rgba(255,255,255,0.3); box-shadow: 0 2px 8px rgba(0,0,0,0.2);">' +
                            '<img src="' + data.medium_url + '" style="width: 100%; height: 100%; object-fit: cover;">' +
                            '</div>' +
                            '<div style="flex: 1;">' +
                            '<div style="font-weight: 600; font-size: 14px; margin-bottom: 6px;">✨ Image Generated!</div>' +
                            '<div style="font-size: 12px; opacity: 0.9; margin-bottom: 12px;">Use this as your login page background?</div>' +
                            '<div style="display: flex; gap: 8px;">' +
                            '<button type="button" class="ai-bg-apply" style="background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px; transition: all 0.2s;">Yes, Apply It</button>' +
                            '<button type="button" class="ai-bg-cancel" style="background: rgba(255,255,255,0.2); color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-weight: 500; font-size: 13px; transition: all 0.2s;">No Thanks</button>' +
                            '</div>' +
                            '</div>' +
                            '<button type="button" class="ai-bg-close" style="background: none; border: none; color: white; cursor: pointer; padding: 0; font-size: 20px; line-height: 1; opacity: 0.7;">×</button>' +
                            '</div>' +
                            '</div>');

                        $previewBox.css('position', 'relative').prepend($confirmDialog);

                        // Handle "Yes, Apply It" click
                        $confirmDialog.find('.ai-bg-apply').on('click', function () {
                            // Use explicit selectors to find the background image fields
                            var $bgSection = $('.logindesignerwp-bg-image');
                            var $input = $('input[name="logindesignerwp_settings[background_image_id]"]');
                            var $preview = $bgSection.find('.logindesignerwp-image-preview');
                            var $removeBtn = $bgSection.find('.logindesignerwp-remove-image');

                            // Update the hidden input with the new image ID
                            $input.val(data.id);

                            // Update the preview thumbnail
                            $preview.find('img').attr('src', data.medium_url);
                            $preview.show();
                            $removeBtn.show();

                            // Switch to image mode and show the image options
                            $('input[name="logindesignerwp_settings[background_mode]"][value="image"]').prop('checked', true).trigger('change');

                            // Update live preview
                            previewCache.bgImage = data.url;
                            updatePreview('background_image', data.url);

                            // Show success message
                            $confirmDialog.fadeOut(200, function () {
                                $(this).remove();

                                // Show brief success toast in preview
                                var $success = $('<div class="logindesignerwp-ai-preview-notification" style="position: absolute; top: 10px; left: 10px; right: 10px; z-index: 100; padding: 12px 16px; background: #22c55e; color: #fff; border-radius: 8px; display: flex; align-items: center; gap: 10px; font-size: 13px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);"><span class="dashicons dashicons-yes-alt"></span><span>Background applied! Click Save to keep it.</span></div>');
                                $previewBox.prepend($success);

                                setTimeout(function () {
                                    $success.fadeOut(300, function () { $(this).remove(); });
                                }, 4000);
                            });
                        });

                        // Handle "No Thanks" click
                        $confirmDialog.find('.ai-bg-cancel, .ai-bg-close').on('click', function () {
                            $confirmDialog.fadeOut(200, function () { $(this).remove(); });
                        });

                    } else {
                        // Show inline error message
                        var $error = $('<div class="logindesignerwp-ai-status" style="margin-top: 10px; padding: 12px 16px; background: #dc2626; color: #fff; border-radius: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px;"><span class="dashicons dashicons-warning"></span><span>' + (response.data || 'Failed to generate image.') + '</span></div>');
                        $button.after($error);

                        setTimeout(function () {
                            $error.fadeOut(300, function () { $(this).remove(); });
                        }, 4000);
                    }
                },
                error: function () {
                    $status.remove();
                    var $error = $('<div class="logindesignerwp-ai-status" style="margin-top: 10px; padding: 12px 16px; background: #dc2626; color: #fff; border-radius: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px;"><span class="dashicons dashicons-warning"></span><span>Request failed. Please check your connection.</span></div>');
                    $button.after($error);

                    setTimeout(function () {
                        $error.fadeOut(300, function () { $(this).remove(); });
                    }, 4000);
                },
                complete: function () {
                    $button.prop('disabled', false);
                    $icon.removeClass('dashicons-update dashicons-spin').addClass('dashicons-superhero');
                }
            });
        });
    }

    /**
     * Initialize Text to Theme AI functionality.
     */
    function initTextToTheme() {
        $(document).on('click', '.logindesignerwp-ai-text-to-theme', function (e) {
            e.preventDefault();

            var $button = $(this);
            var $icon = $button.find('.dashicons');
            var $card = $button.closest('.logindesignerwp-ai-tool-card');

            var prompt = window.prompt("Describe your ideal login page theme:\n\nExamples:\n• Dark mode with neon green accents\n• Minimal and clean with soft blues\n• Corporate professional with navy and gold\n• Warm sunset gradient feel");
            if (!prompt) return;

            // Remove any existing status message
            $card.find('.logindesignerwp-ai-status').remove();

            // Create inline status message
            var $status = $('<div class="logindesignerwp-ai-status" style="margin-top: 10px; padding: 12px 16px; background: #2271b1; color: #fff; border-radius: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px; box-shadow: 0 2px 8px rgba(34, 113, 177, 0.3);"><span class="dashicons dashicons-update" style="animation: rotation 1s infinite linear;"></span><span class="status-text">Generating your theme with AI...</span></div>');
            $button.after($status);

            // Set button loading state
            $button.prop('disabled', true);
            $icon.removeClass('dashicons-edit').addClass('dashicons-update dashicons-spin');

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'logindesignerwp_generate_theme',
                    nonce: logindesignerwp_ajax.nonce,
                    prompt: prompt
                },
                success: function (response) {
                    $status.remove();

                    if (response.success) {
                        var theme = response.data.theme;

                        // Ask if user wants to include background color
                        var includeBackground = window.confirm(
                            "Theme generated! 🎨\n\n" +
                            "Do you also want to update the page background color?\n\n" +
                            "• Click OK to apply the full theme (including background)\n" +
                            "• Click Cancel to keep your current background"
                        );

                        if (!includeBackground) {
                            // Remove background-related settings from theme
                            delete theme.background_color;
                            delete theme.background_mode;
                        }

                        // Apply theme to form fields and preview
                        applyAITheme(theme);

                        // Show success banner in the preview box
                        // Remove any existing AI notification in preview
                        $('.logindesignerwp-ai-preview-notification').remove();

                        var successMsg = response.data.message || 'Theme applied! Click Save to keep it.';
                        var $previewBox = $previewContainer;
                        var $success = $('<div class="logindesignerwp-ai-preview-notification" style="position: absolute; top: 10px; left: 10px; right: 10px; z-index: 100; padding: 12px 16px; background: #22c55e; color: #fff; border-radius: 8px; display: flex; align-items: flex-start; gap: 10px; font-size: 13px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);"><span class="dashicons dashicons-yes-alt" style="flex-shrink: 0; margin-top: 2px;"></span><span style="flex: 1;">' + successMsg + '</span><button type="button" style="background: none; border: none; color: white; cursor: pointer; padding: 0; font-size: 18px; line-height: 1;" onclick="jQuery(this).parent().fadeOut(200, function(){jQuery(this).remove();})">×</button></div>');
                        $previewBox.css('position', 'relative').prepend($success);

                        setTimeout(function () {
                            $success.fadeOut(300, function () { $(this).remove(); });
                        }, 5000);
                    } else {
                        var $error = $('<div class="logindesignerwp-ai-status" style="margin-top: 10px; padding: 12px 16px; background: #dc2626; color: #fff; border-radius: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px;"><span class="dashicons dashicons-warning"></span><span>' + (response.data || 'Failed to generate theme.') + '</span></div>');
                        $button.after($error);

                        setTimeout(function () {
                            $error.fadeOut(300, function () { $(this).remove(); });
                        }, 4000);
                    }
                },
                error: function () {
                    $status.remove();
                    var $error = $('<div class="logindesignerwp-ai-status" style="margin-top: 10px; padding: 12px 16px; background: #dc2626; color: #fff; border-radius: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px;"><span class="dashicons dashicons-warning"></span><span>Request failed. Please check your connection.</span></div>');
                    $button.after($error);

                    setTimeout(function () {
                        $error.fadeOut(300, function () { $(this).remove(); });
                    }, 4000);
                },
                complete: function () {
                    $button.prop('disabled', false);
                    $icon.removeClass('dashicons-update dashicons-spin').addClass('dashicons-edit');
                }
            });
        });
    }

    /**
     * Initialize Smart Theme (from current background) AI functionality.
     */
    function initSmartTheme() {
        $(document).on('click', '.logindesignerwp-ai-smart-theme', function (e) {
            e.preventDefault();

            var $button = $(this);
            var $icon = $button.find('.dashicons');
            var $card = $button.closest('.logindesignerwp-ai-tool-card');

            // Remove any existing status message
            $card.find('.logindesignerwp-ai-status').remove();

            // Create inline status message
            var $status = $('<div class="logindesignerwp-ai-status" style="margin-top: 10px; padding: 12px 16px; background: #9333ea; color: #fff; border-radius: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px; box-shadow: 0 2px 8px rgba(147, 51, 234, 0.3);"><span class="dashicons dashicons-update" style="animation: rotation 1s infinite linear;"></span><span class="status-text">Analyzing your background...</span></div>');
            $button.after($status);

            // Set button loading state
            $button.prop('disabled', true);
            $icon.removeClass('dashicons-art').addClass('dashicons-update dashicons-spin');

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'logindesignerwp_generate_theme_from_bg',
                    nonce: logindesignerwp_ajax.nonce
                },
                success: function (response) {
                    $status.remove();

                    if (response.success) {
                        var theme = response.data.theme;
                        var explanation = response.data.explanation || '';

                        // Apply theme to form fields and preview
                        applySmartTheme(theme);

                        // Show success banner in the preview box
                        var successMsg = response.data.message || 'Theme applied!';
                        if (explanation) {
                            successMsg += ' 💡 ' + explanation;
                        }

                        // Remove any existing AI notification in preview
                        $('.logindesignerwp-ai-preview-notification').remove();

                        // Add notification to the preview box
                        var $previewBox = $previewContainer;
                        var $success = $('<div class="logindesignerwp-ai-preview-notification" style="position: absolute; top: 10px; left: 10px; right: 10px; z-index: 100; padding: 12px 16px; background: #22c55e; color: #fff; border-radius: 8px; display: flex; align-items: flex-start; gap: 10px; font-size: 13px; box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);"><span class="dashicons dashicons-yes-alt" style="flex-shrink: 0; margin-top: 2px;"></span><span style="flex: 1;">' + successMsg + '</span><button type="button" style="background: none; border: none; color: white; cursor: pointer; padding: 0; font-size: 18px; line-height: 1;" onclick="jQuery(this).parent().fadeOut(200, function(){jQuery(this).remove();})">×</button></div>');
                        $previewBox.css('position', 'relative').prepend($success);

                        // Auto-dismiss after 6 seconds (longer for reading explanation)
                        setTimeout(function () {
                            $success.fadeOut(300, function () { $(this).remove(); });
                        }, 6000);
                    } else {
                        // Show inline error message
                        var $error = $('<div class="logindesignerwp-ai-status" style="margin-top: 10px; padding: 12px 16px; background: #dc2626; color: #fff; border-radius: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px; box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);"><span class="dashicons dashicons-warning"></span><span>' + (response.data || 'Failed to analyze background.') + '</span></div>');
                        $button.after($error);

                        setTimeout(function () {
                            $error.fadeOut(300, function () { $(this).remove(); });
                        }, 4000);
                    }
                },
                error: function () {
                    $status.remove();
                    var $error = $('<div class="logindesignerwp-ai-status" style="margin-top: 10px; padding: 12px 16px; background: #dc2626; color: #fff; border-radius: 6px; display: flex; align-items: center; gap: 10px; font-size: 13px;"><span class="dashicons dashicons-warning"></span><span>Request failed. Please check your connection.</span></div>');
                    $button.after($error);

                    setTimeout(function () {
                        $error.fadeOut(300, function () { $(this).remove(); });
                    }, 4000);
                },
                complete: function () {
                    $button.prop('disabled', false);
                    $icon.removeClass('dashicons-update dashicons-spin').addClass('dashicons-art');
                }
            });
        });
    }

    /**
     * Apply Smart Theme (from background analysis) to form fields and live preview.
     * @param {Object} theme - Theme settings object
     */
    function applySmartTheme(theme) {
        // Map theme keys from the new API response to form field names
        var fieldMappings = {
            'form_bg_color': { field: 'form_bg_color', preview: 'form_bg_color' },
            'form_border_color': { field: 'form_border_color', preview: 'form_border_color' },
            'button_bg': { field: 'button_bg', preview: 'button_bg' },
            'button_text_color': { field: 'button_text_color', preview: 'button_text_color' },
            'label_text_color': { field: 'label_text_color', preview: 'label_text_color' },
            'input_bg_color': { field: 'input_bg_color', preview: 'input_bg_color' },
            'input_text_color': { field: 'input_text_color', preview: 'input_text_color' },
            'input_border_color': { field: 'input_border_color', preview: 'input_border_color' },
            'below_form_link_color': { field: 'below_form_link_color', preview: 'below_form_link_color' }
        };

        // Apply each theme value
        $.each(theme, function (key, value) {
            var mapping = fieldMappings[key];
            if (!mapping) return;

            // Update form field
            var $field = $('[name="logindesignerwp_settings[' + mapping.field + ']"]');
            if ($field.length) {
                $field.val(value);

                // Trigger color picker update if it's a color field
                if (typeof value === 'string' && value.startsWith('#')) {
                    try {
                        $field.wpColorPicker('color', value);
                    } catch (e) {
                        console.log('Color picker update skipped for ' + key);
                    }
                }
            }

            // Update live preview
            if (typeof updatePreview === 'function') {
                updatePreview(mapping.preview, value);
            }
        });

        // Handle form shadow
        if (typeof theme.form_shadow !== 'undefined') {
            var $shadowField = $('[name="logindesignerwp_settings[form_shadow_enable]"]');
            if ($shadowField.length) {
                $shadowField.prop('checked', theme.form_shadow);
                if (typeof updatePreview === 'function') {
                    updatePreview('form_shadow_enable', theme.form_shadow ? '1' : '');
                }
            }
        }
    }

    /**
     * Apply AI-generated theme to form fields and live preview.
     * @param {Object} theme - Theme settings object
     */
    function applyAITheme(theme) {
        // First, validate contrast for all text/background pairs
        var contrastIssues = validateThemeContrast(theme);

        if (contrastIssues.length > 0) {
            var message = 'Contrast issues detected:\n';
            contrastIssues.forEach(function (issue) {
                message += '• ' + issue.pair + ': ' + issue.ratio.toFixed(1) + ':1 (needs 4.5:1)\n';
            });
            message += '\nAuto-adjusting text colors for better readability...';
            console.warn('[LoginDesignerWP AI] ' + message);

            // Auto-fix contrast issues
            contrastIssues.forEach(function (issue) {
                theme[issue.textKey] = getContrastingColor(theme[issue.bgKey]);
            });
        }

        // Map theme keys to form field names and preview updates
        // Field names must match exactly what's in class-settings.php
        var fieldMappings = {
            'background_color': { field: 'background_color', preview: 'background_color' },
            'form_background': { field: 'form_bg_color', preview: 'form_bg_color' },
            'form_border_radius': { field: 'form_border_radius', preview: 'form_border_radius' },
            'label_color': { field: 'label_text_color', preview: 'label_text_color' },
            'input_background': { field: 'input_bg_color', preview: 'input_bg_color' },
            'input_border_color': { field: 'input_border_color', preview: 'input_border_color' },
            'input_text_color': { field: 'input_text_color', preview: 'input_text_color' },
            'button_color': { field: 'button_bg', preview: 'button_bg' },
            'button_text_color': { field: 'button_text_color', preview: 'button_text_color' },
            'button_border_radius': { field: 'button_border_radius', preview: 'button_border_radius' },
            'link_color': { field: 'below_form_link_color', preview: 'below_form_link_color' }
        };

        // Apply each theme value
        $.each(theme, function (key, value) {
            var mapping = fieldMappings[key];
            if (!mapping) return;

            // Update form field
            var $field = $('[name="logindesignerwp_settings[' + mapping.field + ']"]');
            if ($field.length) {
                $field.val(value);

                // Trigger color picker update if it's a color field
                if (typeof value === 'string' && value.startsWith('#')) {
                    $field.wpColorPicker('color', value);
                }
            }

            // Update live preview
            if (typeof updatePreview === 'function') {
                updatePreview(mapping.preview, value);
            }
        });

        // Handle background mode - force to 'solid' when applying a background color
        // (Image mode would ignore the color, and we're not generating images here)
        if (theme.background_color) {
            // Select the "Solid Color" radio button (value="solid")
            var $solidModeField = $('[name="logindesignerwp_settings[background_mode]"][value="solid"]');
            if ($solidModeField.length) {
                $solidModeField.prop('checked', true).trigger('change');
            }

            // Also explicitly update the preview for background mode and color
            if (typeof updatePreview === 'function') {
                updatePreview('background_mode', 'solid');
                updatePreview('background_color', theme.background_color);
            }

            // Update the background color picker
            var $bgColorField = $('[name="logindesignerwp_settings[background_color]"]');
            if ($bgColorField.length) {
                $bgColorField.val(theme.background_color);
                try {
                    $bgColorField.wpColorPicker('color', theme.background_color);
                } catch (e) {
                    console.log('Color picker update failed, but value was set');
                }
            }
        }

        // Handle form shadow
        if (typeof theme.form_shadow !== 'undefined') {
            var $shadowField = $('[name="logindesignerwp_settings[form_shadow_enable]"]');
            if ($shadowField.length) {
                $shadowField.prop('checked', theme.form_shadow);
                if (typeof updatePreview === 'function') {
                    updatePreview('form_shadow_enable', theme.form_shadow ? '1' : '');
                }
            }
        }
    }

    /**
     * Validate contrast ratios for all text/background pairs in a theme.
     * @param {Object} theme - Theme object
     * @returns {Array} Array of contrast issues
     */
    function validateThemeContrast(theme) {
        var issues = [];
        var minRatio = 4.5; // WCAG AA standard for normal text

        // Define text/background pairs to check
        var pairs = [
            { textKey: 'label_color', bgKey: 'form_background', pair: 'Label on Form' },
            { textKey: 'input_text_color', bgKey: 'input_background', pair: 'Input Text on Input' },
            { textKey: 'button_text_color', bgKey: 'button_color', pair: 'Button Text on Button' },
            { textKey: 'link_color', bgKey: 'form_background', pair: 'Link on Form' }
        ];

        pairs.forEach(function (check) {
            var textColor = theme[check.textKey];
            var bgColor = theme[check.bgKey];

            if (textColor && bgColor) {
                var ratio = getContrastRatio(textColor, bgColor);
                if (ratio < minRatio) {
                    issues.push({
                        textKey: check.textKey,
                        bgKey: check.bgKey,
                        pair: check.pair,
                        ratio: ratio
                    });
                }
            }
        });

        return issues;
    }

    /**
     * Calculate WCAG contrast ratio between two colors.
     * @param {string} color1 - Hex color
     * @param {string} color2 - Hex color
     * @returns {number} Contrast ratio
     */
    function getContrastRatio(color1, color2) {
        var lum1 = getLuminance(color1);
        var lum2 = getLuminance(color2);
        var lighter = Math.max(lum1, lum2);
        var darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
    }

    /**
     * Get relative luminance of a color.
     * @param {string} hex - Hex color
     * @returns {number} Luminance value
     */
    function getLuminance(hex) {
        var rgb = hexToRgb(hex);
        if (!rgb) return 0;

        var r = rgb.r / 255;
        var g = rgb.g / 255;
        var b = rgb.b / 255;

        r = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
        g = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
        b = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    /**
     * Convert hex color to RGB.
     * @param {string} hex - Hex color
     * @returns {Object|null} RGB object
     */
    function hexToRgb(hex) {
        if (!hex) return null;
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    /**
     * Get a contrasting color (black or white) for a given background.
     * @param {string} bgColor - Background hex color
     * @returns {string} Contrasting text color
     */
    function getContrastingColor(bgColor) {
        var luminance = getLuminance(bgColor);
        return luminance > 0.179 ? '#1a1a1a' : '#ffffff';
    }

    /**
     * Show a styled toast notification for AI actions.
     * @param {string} type - 'success' or 'error'
     * @param {string} message - The message to display
     */
    function showAIToast(type, message) {
        var bgColor = type === 'success' ? '#2271b1' : '#dc2626';
        var icon = type === 'success' ? 'dashicons-yes-alt' : 'dashicons-warning';

        var $toast = $('<div class="logindesignerwp-ai-toast" style="position: fixed; top: 50px; right: 20px; z-index: 999999; background: ' + bgColor + '; color: #fff; padding: 14px 20px; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.2); display: flex; align-items: center; gap: 10px; font-size: 14px; font-weight: 500; transform: translateX(120%); transition: transform 0.3s ease;"><span class="dashicons ' + icon + '"></span><span>' + message + '</span></div>');

        $('body').append($toast);

        // Animate in
        setTimeout(function () {
            $toast.css('transform', 'translateX(0)');
        }, 50);

        // Auto-dismiss after 4 seconds
        setTimeout(function () {
            $toast.css('transform', 'translateX(120%)');
            setTimeout(function () {
                $toast.remove();
            }, 300);
        }, 4000);
    }

    /**
     * Initialize tab navigation.
     */
    function initTabs() {
        var $tabs = $('.logindesignerwp-tab');
        var $contents = $('.logindesignerwp-tab-content');
        var $wrap = $('.logindesignerwp-wrap');

        // Remove loading state to reveal content with fade
        // Use requestAnimationFrame to ensure CSS transition works
        requestAnimationFrame(function () {
            $wrap.removeClass('is-loading');
        });

        // Sync localStorage with cookie if they differ (cookie is source of truth for PHP)
        var lastTab = localStorage.getItem('ldwp_active_tab');
        var cookieTab = getCookie('ldwp_active_tab');
        if (lastTab && lastTab !== cookieTab) {
            // Update cookie to match localStorage
            setCookie('ldwp_active_tab', lastTab, 365);
        }

        // Handle tab clicks
        $tabs.on('click', function (e) {
            e.preventDefault();
            var $tab = $(this);
            var tabId = $tab.data('tab');

            // Update active states
            $tabs.removeClass('active');
            $contents.removeClass('active').hide(); // Force hide

            $tab.addClass('active');
            $('#tab-' + tabId).addClass('active').show(); // Force show

            // Save to localStorage AND cookie (for PHP server-side rendering)
            localStorage.setItem('ldwp_active_tab', tabId);
            setCookie('ldwp_active_tab', tabId, 365);
        });
    }

    /**
     * Set a cookie.
     */
    function setCookie(name, value, days) {
        var expires = '';
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = '; expires=' + date.toUTCString();
        }
        document.cookie = name + '=' + (value || '') + expires + '; path=/';
    }

    /**
     * Get a cookie value.
     */
    function getCookie(name) {
        var nameEQ = name + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }


    /**
     * Initialize collapsible settings sections.
     */
    function initCollapsibleSections() {
        // Only target cards in the Design tab form
        var $cards = $('#logindesignerwp-settings-form .logindesignerwp-card');

        // Add toggle indicator to each card header
        $cards.each(function () {
            var $card = $(this);
            var $header = $card.find('h2').first();
            var cardId = $card.attr('data-section-id');

            // Add toggle indicator if not already present
            if ($header.find('.toggle-indicator').length === 0) {
                $header.append('<span class="dashicons dashicons-arrow-down-alt2 toggle-indicator"></span>');
            }

            // Wrap content if not already wrapped (fallback for older structure, though PHP handles this now)
            if ($card.find('.logindesignerwp-card-content').length === 0) {
                $header.nextAll().wrapAll('<div class="logindesignerwp-card-content"></div>');
            }

            // Restore collapsed state from localStorage
            if (cardId && localStorage.getItem('ldwp_collapsed_' + cardId) === 'true') {
                $card.addClass('collapsed');
            }
        });

        // Handle click on card header (but not on drag handle)
        $(document).on('click', '#logindesignerwp-settings-form .logindesignerwp-card h2', function (e) {
            // Don't toggle if clicking on drag handle, button, or link
            if ($(e.target).closest('.drag-handle, button, a, input').length) {
                return;
            }

            var $card = $(this).closest('.logindesignerwp-card');
            var cardId = $card.attr('data-section-id');

            $card.toggleClass('collapsed');

            // Save state to localStorage
            if (cardId) {
                localStorage.setItem('ldwp_collapsed_' + cardId, $card.hasClass('collapsed'));
            }
        });
    }

    /**
     * Initialize sortable sections for drag-to-reorder.
     */
    /**
     * Initialize Glassmorphism preview handlers.
     */
    function initGlassmorphismPreview() {
        var $glassEnabled = $('input[name="logindesignerwp_settings[glass_enabled]"]');
        var $glassBlur = $('input[name="logindesignerwp_settings[glass_blur]"]');
        var $glassTransparency = $('input[name="logindesignerwp_settings[glass_transparency]"]');
        var $glassBorder = $('input[name="logindesignerwp_settings[glass_border]"]');

        function hexToRgb(hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });

            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 255, g: 255, b: 255 }; // Default to white if invalid
        }

        function updateGlassPreview() {
            var isEnabled = $glassEnabled.is(':checked');
            var blur = $glassBlur.val();
            var transparency = $glassTransparency.val();
            var hasBorder = $glassBorder.is(':checked');
            var baseColorVal = $('input[name="logindesignerwp_settings[form_bg_color]"]').val();
            var baseColor = baseColorVal ? baseColorVal : '#ffffff';

            if (isEnabled) {
                // Calculate opacity (inverted transparency)
                var opacity = 1 - (parseInt(transparency) / 100);

                // Convert hex to rgb for rgba string
                var rgb = hexToRgb(baseColor);
                var rgba = 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')';

                $previewForm.css({
                    'background-color': rgba,
                    'backdrop-filter': 'blur(' + blur + 'px)',
                    '-webkit-backdrop-filter': 'blur(' + blur + 'px)'
                });

                if (hasBorder) {
                    $previewForm.css('border', '1px solid rgba(255, 255, 255, 0.2)');
                } else {
                    // Revert to standard border color if glass border is off
                    var borderColor = $('input[name="logindesignerwp_settings[form_border_color]"]').val();
                    $previewForm.css('border', '1px solid ' + borderColor);
                }

            } else {
                // Remove glass styles and revert to standard background/border
                var standardBg = $('input[name="logindesignerwp_settings[form_bg_color]"]').val();
                var standardBorder = $('input[name="logindesignerwp_settings[form_border_color]"]').val();

                $previewForm.css({
                    'background-color': standardBg,
                    'backdrop-filter': '',
                    '-webkit-backdrop-filter': ''
                });

                $previewForm.css('border', '1px solid ' + standardBorder);
            }
        }

        // Attach listeners
        $glassEnabled.on('change', updateGlassPreview);
        $glassBlur.on('input change', updateGlassPreview);
        $glassTransparency.on('input change', updateGlassPreview);
        $glassBorder.on('change', updateGlassPreview);

        // Also update when form background color changes, if glass is enabled
        $('input[name="logindesignerwp_settings[form_bg_color]"]').on('change keyup', function () {
            if ($glassEnabled.is(':checked')) {
                updateGlassPreview();
            }
        });
        // Also update when form border color changes, if glass is disabled or glass border is unchecked
        $('input[name="logindesignerwp_settings[form_border_color]"]').on('change keyup', function () {
            if (!$glassEnabled.is(':checked') || !$glassBorder.is(':checked')) {
                // The ColorPicker change event handles the standard update, 
                // but we need to ensure Glass logic doesn't override it incorrectly or vice versa.
                // Actually standard updatePreview handles this fine for non-glass cases.
            }
        });

        // Run once on init
        setTimeout(updateGlassPreview, 200); // Slight delay to ensure color pickers are ready
    }

    /**
     * Initialize sortable sections.
     */
    function initSortableSections() {
        var $form = $('#logindesignerwp-settings-form');
        var $actionsDiv = $form.find('.logindesignerwp-actions');

        if ($form.length === 0) {
            return;
        }

        var $allCards = $form.find('.logindesignerwp-card');
        var $lockedSections = $form.find('.logindesignerwp-pro-locked');
        var hasLockedSections = $lockedSections.length > 0;

        // When Pro is NOT active (locked sections present), we need to:
        // 1. Clear any saved order so PHP order is used (free sections first)
        // 2. Still allow drag-drop for reordering free sections
        // 3. Keep locked sections at the bottom
        if (hasLockedSections) {
            localStorage.removeItem('ldwp_section_order');

            // Ensure all .logindesignerwp-card items come before locked sections
            $allCards.each(function () {
                var $card = $(this);
                var $firstLocked = $form.find('.logindesignerwp-pro-locked').first();
                if ($firstLocked.length && $card.index() > $firstLocked.index()) {
                    $firstLocked.before($card);
                }
            });
        } else {
            // Restore saved order from localStorage (Pro is active)
            var savedOrder = localStorage.getItem('ldwp_section_order');

            if (savedOrder) {
                try {
                    var order = JSON.parse(savedOrder);

                    // Reorder cards based on saved order
                    order.forEach(function (sectionId) {
                        var $card = $allCards.filter('[data-section-id="' + sectionId + '"]');
                        if ($card.length) {
                            $actionsDiv.before($card);
                        }
                    });
                } catch (e) {
                    // Invalid JSON, ignore
                }
            }

            // Ensure any cards not in saved order (e.g. new ones) are also before actions
            $allCards.each(function () {
                if (!$(this).next().is($actionsDiv) && !$(this).next().hasClass('logindesignerwp-card')) {
                    $actionsDiv.before($(this));
                }
            });
        }

        // Make cards sortable - drag-drop always works for .logindesignerwp-card elements
        $form.sortable({
            items: '.logindesignerwp-card', // Only sort actual cards, not locked sections
            handle: '.drag-handle',
            placeholder: 'logindesignerwp-card ui-sortable-placeholder',
            tolerance: 'pointer',
            cursor: 'grabbing',
            opacity: 0.9,
            update: function () {
                // Only save order if Pro is active (no locked sections)
                if (!hasLockedSections) {
                    var order = [];
                    $form.find('.logindesignerwp-card').each(function () {
                        var sectionId = $(this).attr('data-section-id');
                        if (sectionId) {
                            order.push(sectionId);
                        }
                    });
                    localStorage.setItem('ldwp_section_order', JSON.stringify(order));
                }
            }
        });
    }



    /**
     * Initialize AJAX save for settings form.
     */
    function initAjaxSave() {
        var $form = $('.logindesignerwp-settings-column form').not('#logindesignerwp-ai-settings-form, #logindesignerwp-social-settings-form');
        var $submitBtn = $form.find('#submit');

        if ($form.length === 0) {
            return;
        }

        $form.on('submit', function (e) {
            e.preventDefault();

            // Add spinner
            var $spinner = $('<span class="spinner is-active" style="float:none; margin-left: 5px;"></span>');
            $submitBtn.prop('disabled', true).after($spinner);

            // Append action and nonce for AJAX handler
            var serializedData = $form.serialize();
            serializedData += '&action=logindesignerwp_save_settings';
            serializedData += '&nonce=' + (window.logindesignerwp_ajax ? window.logindesignerwp_ajax.nonce : '');

            // Send AJAX request
            $.post(ajaxurl, serializedData, function (response) {
                $spinner.remove();
                $submitBtn.prop('disabled', false);

                if (response.success) {
                    // Mark as saved
                    PreviewStatus.markSaved();

                    // Show success toast
                    var $notice = $('<div class="notice notice-success is-dismissible" style="position: fixed; top: 40px; right: 20px; z-index: 9999; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"><p>' + (response.data.message || 'Settings saved') + '</p></div>');
                    $('body').append($notice);
                    setTimeout(function () {
                        $notice.fadeOut(function () { $(this).remove(); });
                    }, 3000);
                } else {
                    alert(response.data || 'Error saving settings.');
                }
            }).fail(function () {
                $spinner.remove();
                $submitBtn.prop('disabled', false);
                alert('Ajax error. Please try again.');
            });
        });
    }

    /**
     * Initialize AI Settings AJAX save.
     */
    function initAISettingsSave() {
        var $form = $('#logindesignerwp-ai-settings-form');
        var $submitBtn = $form.find('#submit');

        if ($form.length === 0) {
            return;
        }

        $form.on('submit', function (e) {
            e.preventDefault();

            var $spinner = $('<span class="spinner is-active" style="float:none; margin-left: 5px;"></span>');
            $submitBtn.prop('disabled', true).after($spinner);

            var serializedData = $form.serialize();
            serializedData += '&action=logindesignerwp_save_ai_settings';
            serializedData += '&nonce=' + (window.logindesignerwp_ajax ? window.logindesignerwp_ajax.nonce : '');

            $.post(ajaxurl, serializedData, function (response) {
                $spinner.remove();
                $submitBtn.prop('disabled', false);

                if (response.success) {
                    // Update badge on Settings tab
                    var $badge = $('.logindesignerwp-ai-active-badge');
                    if (response.data.active) {
                        if ($badge.length === 0) {
                            $('.logindesignerwp-card-title-wrapper').append('<span class="logindesignerwp-ai-active-badge" style="background:#46b450; color:white; padding:2px 8px; border-radius:100px; font-size:10px; margin-left:10px; vertical-align:middle; text-transform:uppercase;">Active</span>');
                        }
                    } else {
                        $badge.remove();
                    }

                    // Update AI Tools card on Design tab dynamically
                    var $aiCard = $('[data-section-id="ai_tools"]');
                    if ($aiCard.length) {
                        var $warningBox = $aiCard.find('[style*="fff8e5"]'); // Yellow warning box
                        var $activeBadge = $aiCard.find('h2 span[style*="22c55e"]'); // Green "Active" badge
                        var $aiButtons = $aiCard.find('.logindesignerwp-ai-generate-bg, .logindesignerwp-ai-smart-theme, .logindesignerwp-ai-text-to-theme');

                        if (response.data.active) {
                            // Hide warning, show badge, enable buttons
                            $warningBox.slideUp(200);
                            if ($activeBadge.length === 0) {
                                $aiCard.find('.logindesignerwp-pro-badge').after(
                                    '<span style="background:#22c55e;color:white;padding:2px 8px;border-radius:100px;font-size:10px;margin-left:5px;vertical-align:middle;text-transform:uppercase;">Active</span>'
                                );
                            }
                            $aiButtons.prop('disabled', false);
                        } else {
                            // Show warning, remove badge, disable buttons
                            $warningBox.slideDown(200);
                            $activeBadge.remove();
                            $aiButtons.prop('disabled', true);
                        }
                    }

                    var $notice = $('<div class="notice notice-success is-dismissible" style="position: fixed; top: 40px; right: 20px; z-index: 9999; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"><p>' + (response.data.message || 'Settings saved') + '</p></div>');
                    $('body').append($notice);
                    setTimeout(function () {
                        $notice.fadeOut(function () { $(this).remove(); });
                    }, 3000);
                } else {
                    alert(response.data || 'Error saving settings.');
                }
            }).fail(function () {
                $spinner.remove();
                $submitBtn.prop('disabled', false);
                alert('Ajax error. Please try again.');
            });
        });
    }

    /**
     * Initialize Social Settings AJAX save.
     */
    function initSocialSettingsSave() {
        var $form = $('#logindesignerwp-social-settings-form');
        var $submitBtn = $form.find('#submit');

        if ($form.length === 0) {
            return;
        }

        $form.on('submit', function (e) {
            e.preventDefault();

            var $spinner = $('<span class="spinner is-active" style="float:none; margin-left: 5px;"></span>');
            $submitBtn.prop('disabled', true).after($spinner);

            var serializedData = $form.serialize();
            serializedData += '&action=logindesignerwp_save_social_settings';
            // serializedData += '&nonce=' + (window.logindesignerwp_ajax ? window.logindesignerwp_ajax.nonce : '');

            $.post(ajaxurl, serializedData, function (response) {
                $spinner.remove();
                $submitBtn.prop('disabled', false);

                if (response.success) {
                    var $notice = $('<div class="notice notice-success is-dismissible" style="position: fixed; top: 40px; right: 20px; z-index: 9999; box-shadow: 0 2px 5px rgba(0,0,0,0.1);"><p>' + (response.data.message || 'Settings saved') + '</p></div>');
                    $('body').append($notice);
                    setTimeout(function () {
                        $notice.fadeOut(function () { $(this).remove(); });
                    }, 3000);
                } else {
                    alert(response.data || 'Error saving settings.');
                }
            }).fail(function () {
                $spinner.remove();
                $submitBtn.prop('disabled', false);
                alert('Ajax error. Please try again.');
            });
        });
    }



    /**
     * Document ready.
     */
    $(document).ready(function () {
        // Only initialize if we're on the settings page
        if ($('.logindesignerwp-wrap').length === 0) {
            return;
        }

        initPreviewCache();
        PreviewStatus.init();
        initColorPickers();
        initMediaUploaders();
        initBackgroundToggle();
        initNumberInputs();
        initCornerSelectors();
        initPositionGrid();
        initStyleCards();
        initCheckboxes();
        initButtonHover();
        initStickyPreview();
        initTabs();
        initCollapsibleSections();
        initSortableSections();
        initAjaxSave();
        initGlassmorphismPreview();
        initLogoControls();
        initSocialLoginControls();
        initAIGenerator();
        initTextToTheme();
        initSmartTheme();
        initAISettingsSave();
        initSocialSettingsSave();
        initResetDefaults();


        // Expose functions globally for preset AJAX updates
        window.ldwpApplyPreview = applyInitialPreview;
        window.ldwpUpdatePreview = updatePreview;

        /**
         * Atomic Batch Update
         * Updates multiple settings silently, then triggers ONE single render.
         * Fixes race conditions with presets.
         */
        window.ldwpUpdatePreviewBatch = function (settings) {
            console.log('LDWP: Batch Updating ' + Object.keys(settings).length + ' settings...');

            // 1. Silent Update: Update all Cache and Input values without rendering
            $.each(settings, function (key, value) {
                updatePreview(key, value, true); // skipRender = true
            });

            // 2. Explicitly determine the mode for this batch
            // Use the setting value if present, otherwise fallback to cache/default
            var explicitMode = settings['background_mode'] || previewCache.bgMode || 'solid';

            // 3. Background Render: Trigger ONE heavy background calculation with EXPLICIT mode
            // Pass the mode directly to avoid cache/DOM race conditions
            applyBackgroundPreview(explicitMode);

            // 4. Fast CSS Render: Apply simple CSS updates for non-background elements
            var backgroundKeys = [
                'background_mode', 'background_color', 'background_image',
                'background_gradient_1', 'background_gradient_2', 'background_gradient_3',
                'gradient_type', 'gradient_angle', 'gradient_position', 'background_blur'
            ];

            $.each(settings, function (key, value) {
                if (backgroundKeys.indexOf(key) === -1) {
                    updatePreview(key, value, false);
                }
            });

            console.log('LDWP: Batch Update Complete');
        };

        // Apply initial preview after a short delay to ensure color pickers are ready
        setTimeout(applyInitialPreview, 100);
    });

})(jQuery);
