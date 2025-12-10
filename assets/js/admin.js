/**
 * LoginDesignerWP Admin JavaScript
 *
 * Handles color pickers, media uploads, and field toggling.
 */
(function ($) {
    'use strict';

    /**
     * Initialize color pickers.
     */
    function initColorPickers() {
        $('.logindesignerwp-color-picker').wpColorPicker();
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

                // Update preview.
                var previewUrl = attachment.sizes && attachment.sizes.medium
                    ? attachment.sizes.medium.url
                    : attachment.url;

                $preview.find('img').attr('src', previewUrl);
                $preview.show();
                $removeBtn.show();
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

            // Clear input.
            $input.val('0');

            // Hide preview.
            $preview.hide();
            $button.hide();
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
        }

        // Initial state.
        toggleBackgroundOptions();

        // On change.
        $modeInputs.on('change', toggleBackgroundOptions);
    }

    /**
     * Document ready.
     */
    $(document).ready(function () {
        initColorPickers();
        initMediaUploaders();
        initBackgroundToggle();
    });

})(jQuery);
