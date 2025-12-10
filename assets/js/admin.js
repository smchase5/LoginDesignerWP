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
                if ($previewLogoImg.length && $previewLogoImg.is(':visible')) {
                    $previewLogoImg.css('max-width', value + 'px');
                }
                break;
        }
    }

    /**
     * Apply background preview based on current mode.
     */
    function applyBackgroundPreview() {
        var mode = $('input[name="logindesignerwp_settings[background_mode]"]:checked').val();
        var bgColor = $('input[name="logindesignerwp_settings[background_color]"]').val();
        var gradient1 = $('input[name="logindesignerwp_settings[background_gradient_1]"]').val();
        var gradient2 = $('input[name="logindesignerwp_settings[background_gradient_2]"]').val();
        var bgImage = $previewContainer.data('bg-image') || '';

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
                $previewBg.css('background', 'linear-gradient(to bottom, ' + gradient1 + ', ' + gradient2 + ')');
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
            logo_width: $('input[name="logindesignerwp_settings[logo_width]"]').val()
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

        // Apply initial preview after a short delay to ensure color pickers are ready
        setTimeout(applyInitialPreview, 100);
    });

})(jQuery);
