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
        $previewContainer;

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
        $previewRemember = $('.logindesignerwp-preview-remember label');
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
     * Initialize background mode toggling.
     */
    function initBackgroundToggle() {
        var $modeInputs = $('input[name="logindesignerwp_settings[background_mode]"]');

        function toggleBackgroundOptions() {
            var mode = $modeInputs.filter(':checked').val();

            // Hide all options.
            $('.logindesignerwp-bg-options').hide();

            // Show selected mode options.
            $('.logindesignerwp-bg-' + mode).show();

            // Update preview.
            updatePreview('background_mode', mode);
        }

        // Initial state.
        toggleBackgroundOptions();

        // On change.
        $modeInputs.on('change', toggleBackgroundOptions);

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
    function generateMeshGradient(c1, c2) {
        // A fluid mesh effect using radial gradients
        return 'radial-gradient(at top left, ' + c1 + ', transparent 70%), ' +
            'radial-gradient(at bottom right, ' + c2 + ', transparent 70%), ' +
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
     * Update preview based on setting change.
     */
    function updatePreview(setting, value) {
        switch (setting) {
            // Background settings
            case 'background_mode':
                applyBackgroundPreview();
                break;

            case 'background_color':
                $previewContainer.data('bg-color', value);
                applyBackgroundPreview();
                break;

            case 'background_gradient_1':
                $previewContainer.data('gradient-1', value);
                applyBackgroundPreview();
                break;

            case 'background_gradient_2':
                $previewContainer.data('gradient-2', value);
                applyBackgroundPreview();
                break;

            case 'gradient_type':
            case 'gradient_angle':
            case 'gradient_position':
                applyBackgroundPreview();
                break;

            case 'background_image':
                $previewContainer.data('bg-image', value);
                applyBackgroundPreview();
                break;

            // Form container
            case 'form_bg_color':
                $previewForm.css('background-color', value);
                break;

            case 'form_border_radius':
                $previewForm.css('border-radius', value + 'px');
                break;

            case 'form_border_color':
                $previewForm.css('border', '1px solid ' + value);
                break;

            case 'form_shadow_enable':
                if (value) {
                    $previewForm.css('box-shadow', '0 4px 24px rgba(0,0,0,0.25)');
                } else {
                    $previewForm.css('box-shadow', 'none');
                }
                break;

            // Labels and inputs
            case 'label_text_color':
                $previewLabels.css('color', value);
                $previewRemember.css('color', value);
                break;

            case 'below_form_link_color':
                $previewLinks.css('color', value);
                break;

            case 'input_bg_color':
                $previewInputs.css('background-color', value);
                break;

            case 'input_text_color':
                $previewInputs.css('color', value);
                break;

            case 'input_border_color':
                $previewInputs.css('border', '1px solid ' + value);
                break;

            case 'input_border_focus':
                // Store for focus state (not applied until focus)
                $previewContainer.data('focus-color', value);
                break;

            // Button
            case 'button_bg':
                $previewButton.css('background-color', value);
                $previewContainer.data('button-bg', value);
                break;

            case 'button_bg_hover':
                $previewContainer.data('button-hover', value);
                break;

            case 'button_text_color':
                $previewButton.css('color', value);
                break;

            case 'button_border_radius':
                $previewButton.css('border-radius', value + 'px');
                break;

            // Logo
            case 'logo_image':
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
                        $previewLogo.find('a').html('<svg id="ldwp-preview-logo-wp" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 122.52 122.523" width="84" height="84"><path fill="#fff" d="M8.708 61.26c0 20.802 12.089 38.779 29.619 47.298L13.258 39.872a52.354 52.354 0 00-4.55 21.388zM96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501L48.2 93.547l11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z"/><path fill="#fff" d="M62.184 65.857l-15.768 45.819a52.552 52.552 0 0032.29-.838 4.693 4.693 0 01-.37-.712L62.184 65.857zM107.376 36.046a42.584 42.584 0 01.358 5.708c0 5.651-1.057 12.002-4.229 19.94l-16.973 49.082c16.519-9.627 27.618-27.628 27.618-48.18 0-9.762-2.499-18.929-6.774-26.55z"/><path fill="#fff" d="M61.262 0C27.483 0 0 27.481 0 61.26c0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.265-27.48 61.265-61.263C122.526 27.481 95.04 0 61.262 0zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z"/></svg>');
                    }
                }
                break;

            case 'logo_width':
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
        }
    }

    /**
     * Apply background preview based on current mode.
     */
    function applyBackgroundPreview() {
        var mode = $('input[name="logindesignerwp_settings[background_mode]"]:checked').val();

        // Use cached data for live updates to avoid timing issues with color picker
        var bgColor = $previewContainer.data('bg-color') || $('input[name="logindesignerwp_settings[background_color]"]').val();
        var gradient1 = $previewContainer.data('gradient-1') || $('input[name="logindesignerwp_settings[background_gradient_1]"]').val();
        var gradient2 = $previewContainer.data('gradient-2') || $('input[name="logindesignerwp_settings[background_gradient_2]"]').val();

        var bgImage = $previewContainer.data('bg-image') || '';

        // Advanced Gradient Settings
        var gradType = $('select[name="logindesignerwp_settings[gradient_type]"]').val() || 'linear';
        var gradAngle = $('input[name="logindesignerwp_settings[gradient_angle]"]').val() || '135';
        var gradPos = $('select[name="logindesignerwp_settings[gradient_position]"]').val() || 'center center';

        // Reset background
        $previewBg.css({
            'background': '',
            'background-color': '',
            'background-image': '',
            'background-size': '',
            'background-position': '',
            'background-repeat': ''
        });

        switch (mode) {
            case 'solid':
                $previewBg.css('background-color', bgColor);
                break;

            case 'gradient':
                var gradientCss = '';
                if (gradType === 'linear') {
                    gradientCss = 'linear-gradient(' + gradAngle + 'deg, ' + gradient1 + ', ' + gradient2 + ')';
                } else if (gradType === 'radial') {
                    gradientCss = 'radial-gradient(circle at ' + gradPos + ', ' + gradient1 + ', ' + gradient2 + ')';
                } else if (gradType === 'mesh') {
                    gradientCss = generateMeshGradient(gradient1, gradient2);
                }

                $previewBg.css('background', gradientCss);
                break;

            case 'image':
                $previewBg.css('background-color', bgColor);
                if (bgImage) {
                    $previewBg.css({
                        'background-image': 'url(' + bgImage + ')',
                        'background-size': 'cover',
                        'background-position': 'center',
                        'background-repeat': 'no-repeat'
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
            logo_background_color: $('input[name="logindesignerwp_settings[logo_background_color]"]').val()
        };

        // Apply each setting
        for (var key in settings) {
            if (settings.hasOwnProperty(key)) {
                updatePreview(key, settings[key]);
            }
        }

        // Apply background
        applyBackgroundPreview();
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
        var topOffset = adminBarHeight + 20; // Admin bar + padding

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
                $previewSticky.css({
                    'position': 'fixed',
                    'top': topOffset + 'px',
                    'width': columnWidth + 'px'
                });
            } else if (scrollTop >= stickyEnd) {
                // Bottom state - stick to bottom of container
                $previewSticky.css({
                    'position': 'absolute',
                    'top': (settingsHeight - previewHeight) + 'px',
                    'width': columnWidth + 'px'
                });
                $previewColumn.css('position', 'relative');
            } else {
                // Normal state - at top
                $previewSticky.css({
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
     * Document ready.
     */
    $(document).ready(function () {
        // Only initialize if we're on the settings page
        if ($('.logindesignerwp-wrap').length === 0) {
            return;
        }

        initPreviewCache();
        initColorPickers();
        initMediaUploaders();
        initBackgroundToggle();
        initNumberInputs();
        initCheckboxes();
        initButtonHover();
        initStickyPreview();
        initTabs();
        initCollapsibleSections();
        initSortableSections();
        initGlassmorphismPreview();
        initLogoControls();

        // Apply initial preview after a short delay to ensure color pickers are ready
        setTimeout(applyInitialPreview, 100);
    });

    /**
     * Initialize tab navigation.
     */
    function initTabs() {
        var $tabs = $('.logindesignerwp-tab');
        var $contents = $('.logindesignerwp-tab-content');

        if ($tabs.length === 0) {
            return;
        }

        // Restore active tab from localStorage
        var savedTab = localStorage.getItem('ldwp_active_tab');
        if (savedTab) {
            $tabs.removeClass('active');
            $contents.removeClass('active');
            $tabs.filter('[data-tab="' + savedTab + '"]').addClass('active');
            $('#tab-' + savedTab).addClass('active');
        }

        // Handle tab clicks
        $tabs.on('click', function (e) {
            e.preventDefault();
            var $tab = $(this);
            var tabId = $tab.data('tab');

            // Update active states
            $tabs.removeClass('active');
            $contents.removeClass('active');
            $tab.addClass('active');
            $('#tab-' + tabId).addClass('active');

            // Save to localStorage
            localStorage.setItem('ldwp_active_tab', tabId);
        });
    }

    /**
     * Initialize collapsible settings sections.
     */
    function initCollapsibleSections() {
        var $cards = $('.logindesignerwp-card');

        // Add toggle indicator to each card header
        $cards.each(function () {
            var $card = $(this);
            var $header = $card.find('h2').first();
            var cardId = $card.attr('data-section-id');

            // Add toggle indicator if not already present
            if ($header.find('.toggle-indicator').length === 0) {
                $header.append('<span class="dashicons dashicons-arrow-down-alt2 toggle-indicator"></span>');
            }

            // Wrap content if not already wrapped
            if ($card.find('.logindesignerwp-card-content').length === 0) {
                $header.nextAll().wrapAll('<div class="logindesignerwp-card-content"></div>');
            }

            // Restore collapsed state from localStorage
            if (cardId && localStorage.getItem('ldwp_collapsed_' + cardId) === 'true') {
                $card.addClass('collapsed');
            }
        });

        // Handle click on card header (but not on drag handle)
        $(document).on('click', '.logindesignerwp-card h2', function (e) {
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
     * Start the sortables.
     */
    function initSortableSections() {
        var $settingsColumn = $('.logindesignerwp-settings-column');
        var $form = $settingsColumn.find('form');

        if ($form.length === 0) {
            return;
        }

        // Add drag handles to card headers (only for free sections, not Pro locked)
        $('.logindesignerwp-card:not(.logindesignerwp-pro-locked) h2').each(function () {
            var $header = $(this);
            if ($header.find('.drag-handle').length === 0) {
                $header.prepend('<span class="dashicons dashicons-move drag-handle" title="Drag to reorder"></span>');
            }
        });

        // Restore saved order from localStorage (only for free sections)
        var savedOrder = localStorage.getItem('ldwp_section_order');
        var $freeCards = $form.find('.logindesignerwp-card:not(.logindesignerwp-pro-locked)');
        var $proCards = $form.find('.logindesignerwp-pro-locked');
        var $actionsDiv = $form.find('.logindesignerwp-actions');

        if (savedOrder) {
            try {
                var order = JSON.parse(savedOrder);

                // Reorder only free cards based on saved order
                order.forEach(function (sectionId) {
                    var $card = $freeCards.filter('[data-section-id="' + sectionId + '"]');
                    if ($card.length) {
                        $proCards.first().before($card);
                    }
                });
            } catch (e) {
                // Invalid JSON, ignore
            }
        }

        // Ensure Pro sections are always at the bottom (before actions)
        $proCards.each(function () {
            $actionsDiv.before($(this));
        });

        // Make cards sortable (exclude Pro locked sections)
        $form.sortable({
            items: '.logindesignerwp-card:not(.logindesignerwp-pro-locked)',
            handle: '.drag-handle',
            placeholder: 'logindesignerwp-card ui-sortable-placeholder',
            tolerance: 'pointer',
            cursor: 'grabbing',
            opacity: 0.9,
            update: function () {
                // Save new order to localStorage
                var order = [];
                $form.find('.logindesignerwp-card').each(function () {
                    var sectionId = $(this).attr('data-section-id');
                    if (sectionId) {
                        order.push(sectionId);
                    }
                });
                localStorage.setItem('ldwp_section_order', JSON.stringify(order));
            }
        });
    }

})(jQuery);
