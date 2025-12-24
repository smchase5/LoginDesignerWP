<?php
/**
 * AI Integration class for LoginDesignerWP.
 *
 * @package LoginDesignerWP
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class LoginDesignerWP_AI
 *
 * Handles AI settings and API interactions.
 */
class LoginDesignerWP_AI
{

    /**
     * Option name.
     *
     * @var string
     */
    private $option_name = 'logindesignerwp_ai';

    /**
     * Constructor.
     */
    public function __construct()
    {
        add_action('admin_init', array($this, 'register_settings'));
        add_action('logindesignerwp_render_settings_tab', array($this, 'render_ai_settings'));
        add_action('logindesignerwp_render_ai_tools_section', array($this, 'render_ai_tools_card'));
        add_action('wp_ajax_logindesignerwp_generate_background', array($this, 'ajax_generate_background'));
        add_action('wp_ajax_logindesignerwp_generate_theme', array($this, 'ajax_generate_theme'));
        add_action('wp_ajax_logindesignerwp_generate_theme_from_bg', array($this, 'ajax_generate_theme_from_background'));
        add_action('wp_ajax_logindesignerwp_save_ai_settings', array($this, 'ajax_save_settings'));
    }

    /**
     * AJAX: Save AI settings.
     */
    public function ajax_save_settings()
    {
        check_ajax_referer('logindesignerwp_save_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Permission denied.', 'logindesignerwp'));
        }

        $input = isset($_POST['logindesignerwp_ai']) ? $_POST['logindesignerwp_ai'] : array();
        $clean = $this->sanitize_settings($input);

        update_option($this->option_name, $clean);

        wp_send_json_success(array(
            'message' => __('AI Settings saved successfully.', 'logindesignerwp'),
            'active' => !empty($clean['openai_key']),
        ));
    }

    /**
     * Register settings.
     */
    public function register_settings()
    {
        register_setting(
            'logindesignerwp_ai_group', // Option group
            $this->option_name,         // Option name
            array(
                'type' => 'array',
                'sanitize_callback' => array($this, 'sanitize_settings'),
            )
        );

        add_settings_section(
            'logindesignerwp_ai_main',
            __('AI Configuration', 'logindesignerwp'),
            null,
            'logindesignerwp_ai_page' // Match this with do_settings_sections
        );

        add_settings_field(
            'openai_key',
            __('OpenAI API Key', 'logindesignerwp'),
            array($this, 'render_api_key_field'),
            'logindesignerwp_ai_page', // Match this with do_settings_sections
            'logindesignerwp_ai_main'
        );
    }

    /**
     * AJAX: Generate background image.
     */
    public function ajax_generate_background()
    {
        check_ajax_referer('logindesignerwp_save_nonce', 'nonce');

        if (!current_user_can('upload_files')) {
            wp_send_json_error(__('Permission denied.', 'logindesignerwp'));
        }

        $prompt = isset($_POST['prompt']) ? sanitize_text_field($_POST['prompt']) : '';
        if (empty($prompt)) {
            wp_send_json_error(__('Please provide a description.', 'logindesignerwp'));
        }

        $settings = $this->get_settings();
        $api_key = $settings['openai_key'];

        if (empty($api_key)) {
            wp_send_json_error(__('OpenAI API Key is missing. Please configure it in the Settings tab.', 'logindesignerwp'));
        }

        // Call OpenAI Images API
        $image_quality = isset($settings['image_quality']) ? $settings['image_quality'] : 'high';
        $image_model = isset($settings['image_model']) ? $settings['image_model'] : 'gpt-image-1.5';

        // Helper to perform the request
        $perform_request = function ($model) use ($api_key, $prompt, $image_quality) {
            // Determine quality param based on model
            $request_quality = $image_quality;
            if ($model === 'dall-e-3') {
                // DALL-E 3 only supports 'hd' and 'standard'
                $request_quality = ($image_quality === 'high') ? 'hd' : 'standard';
            }

            return wp_remote_post('https://api.openai.com/v1/images/generations', array(
                'headers' => array(
                    'Content-Type' => 'application/json',
                    'Authorization' => 'Bearer ' . $api_key,
                ),
                'body' => json_encode(array(
                    'model' => $model,
                    'prompt' => $prompt,
                    'n' => 1,
                    // DALL-E 3 supports 1792x1024, GPT-Image supports 1536x1024. 
                    'size' => ($model === 'dall-e-3') ? '1792x1024' : '1536x1024',
                    'quality' => $request_quality,
                )),
                'timeout' => 60,
            ));
        };

        // Fallback chain definition
        $fallback_chain = array('gpt-image-1.5', 'gpt-image-1', 'gpt-image-1-mini', 'dall-e-3');

        // Find start index based on selected model
        $start_index = array_search($image_model, $fallback_chain);
        if ($start_index === false) {
            $start_index = 0; // Default to start if unknown model
        }

        $response = null;
        $success = false;
        $last_error_message = '';
        $data = null; // Initialize $data for later use

        // Iterate through models starting from user selection
        for ($i = $start_index; $i < count($fallback_chain); $i++) {
            $current_model = $fallback_chain[$i];
            $response = $perform_request($current_model);

            if (is_wp_error($response)) {
                $last_error_message = $response->get_error_message();
                continue; // Network error, maybe try next or just fail? Usually network is fatal, but we'll try next just in case.
            }

            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);

            // Check for success
            if (!empty($data['data'][0]['url'])) {
                $success = true;
                break; // We got an image!
            }

            // Check for specific verification error to trigger fallback
            if (isset($data['error'])) {
                $last_error_message = $data['error']['message'];
                // Only fallback on "verified" errors. If it's a content policy violation, don't retry.
                if (stripos($data['error']['message'], 'verified') !== false) {
                    continue; // Try next model in chain
                } else {
                    break; // Stop on other errors (like content policy)
                }
            }
        }

        if (!$success) {
            wp_send_json_error($last_error_message ? $last_error_message : __('No image returned from AI.', 'logindesignerwp'));
        }

        // Processing success (rest of code is unchanged, just need $data populated)
        $image_url = $data['data'][0]['url'];

        // Download and attach image
        $attachment_id = $this->upload_image_from_url($image_url, $prompt);

        if (is_wp_error($attachment_id)) {
            wp_send_json_error($attachment_id->get_error_message());
        }

        $url = wp_get_attachment_image_url($attachment_id, 'full');
        $medium_url = wp_get_attachment_image_url($attachment_id, 'medium');

        wp_send_json_success(array(
            'id' => $attachment_id,
            'url' => $url,
            'medium_url' => $medium_url,
            'message' => __('Image generated successfully!', 'logindesignerwp'),
        ));
    }

    /**
     * Upload image from URL to Media Library.
     *
     * @param string $url Image URL.
     * @param string $desc Description (for title/alt).
     * @return int|WP_Error Attachment ID or error.
     */
    private function upload_image_from_url($url, $desc)
    {
        require_once(ABSPATH . 'wp-admin/includes/media.php');
        require_once(ABSPATH . 'wp-admin/includes/file.php');
        require_once(ABSPATH . 'wp-admin/includes/image.php');

        // Sideload the image
        $desc = sanitize_text_field($desc);
        $file_array = array();
        $file_array['name'] = 'ai-bg-' . sanitize_title(substr($desc, 0, 20)) . '.png';
        $file_array['tmp_name'] = download_url($url);

        if (is_wp_error($file_array['tmp_name'])) {
            return $file_array['tmp_name'];
        }

        $id = media_handle_sideload($file_array, 0, $desc);

        // If error storing permanently, unlink
        if (is_wp_error($id)) {
            @unlink($file_array['tmp_name']);
            return $id;
        }

        return $id;
    }

    /**
     * AJAX: Generate theme from text description.
     */
    public function ajax_generate_theme()
    {
        check_ajax_referer('logindesignerwp_save_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Permission denied.', 'logindesignerwp'));
        }

        $prompt = isset($_POST['prompt']) ? sanitize_text_field($_POST['prompt']) : '';
        if (empty($prompt)) {
            wp_send_json_error(__('Please provide a theme description.', 'logindesignerwp'));
        }

        $settings = $this->get_settings();
        $api_key = $settings['openai_key'];

        if (empty($api_key)) {
            wp_send_json_error(__('OpenAI API Key is missing. Please configure it in the Settings tab.', 'logindesignerwp'));
        }

        // System prompt for theme generation
        $system_prompt = 'You are a professional UI designer. Generate a login page theme based on the user\'s description. 

IMPORTANT: The "link_color" is for links that appear OUTSIDE the form, directly on the page background (like "Lost your password?" and "Back to site"). It MUST contrast with the "background_color", NOT the form_background. For dark backgrounds use light link colors, for light backgrounds use dark link colors.

Return ONLY valid JSON with these exact keys (no explanation, just JSON):
{
  "background_color": "#hexcolor",
  "background_mode": "color",
  "form_background": "#hexcolor",
  "form_border_radius": number (0-50),
  "form_shadow": true or false,
  "label_color": "#hexcolor",
  "input_background": "#hexcolor",
  "input_border_color": "#hexcolor",
  "input_border_radius": number (0-20),
  "input_text_color": "#hexcolor",
  "button_color": "#hexcolor",
  "button_text_color": "#hexcolor",
  "button_border_radius": number (0-30),
  "link_color": "#hexcolor (MUST contrast with background_color)"
}
Choose colors that work well together and match the mood/theme described. Ensure good contrast for accessibility.';

        // Call GPT-4
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $api_key,
            ),
            'body' => json_encode(array(
                'model' => 'gpt-4o-mini',
                'messages' => array(
                    array('role' => 'system', 'content' => $system_prompt),
                    array('role' => 'user', 'content' => 'Create a theme for: ' . $prompt),
                ),
                'temperature' => 0.7,
                'max_tokens' => 500,
            )),
            'timeout' => 30,
        ));

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (isset($data['error'])) {
            wp_send_json_error($data['error']['message']);
        }

        if (empty($data['choices'][0]['message']['content'])) {
            wp_send_json_error(__('No response from AI.', 'logindesignerwp'));
        }

        $ai_content = $data['choices'][0]['message']['content'];

        // Try to parse JSON from response (handle markdown code blocks)
        $ai_content = preg_replace('/```json\s*/', '', $ai_content);
        $ai_content = preg_replace('/```\s*/', '', $ai_content);
        $ai_content = trim($ai_content);

        $theme = json_decode($ai_content, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($theme)) {
            wp_send_json_error(__('Failed to parse AI response. Please try again.', 'logindesignerwp'));
        }

        // Validate and sanitize theme values
        $valid_theme = array();
        $color_keys = array(
            'background_color',
            'form_background',
            'label_color',
            'input_background',
            'input_border_color',
            'input_text_color',
            'button_color',
            'button_text_color',
            'link_color'
        );

        foreach ($color_keys as $key) {
            if (isset($theme[$key]) && preg_match('/^#[a-fA-F0-9]{6}$/', $theme[$key])) {
                $valid_theme[$key] = $theme[$key];
            }
        }

        // Number values
        if (isset($theme['form_border_radius'])) {
            $valid_theme['form_border_radius'] = max(0, min(50, intval($theme['form_border_radius'])));
        }
        if (isset($theme['input_border_radius'])) {
            $valid_theme['input_border_radius'] = max(0, min(20, intval($theme['input_border_radius'])));
        }
        if (isset($theme['button_border_radius'])) {
            $valid_theme['button_border_radius'] = max(0, min(30, intval($theme['button_border_radius'])));
        }

        // Boolean values
        if (isset($theme['form_shadow'])) {
            $valid_theme['form_shadow'] = (bool) $theme['form_shadow'];
        }

        // Background mode
        $valid_theme['background_mode'] = 'color';

        wp_send_json_success(array(
            'theme' => $valid_theme,
            'message' => __('Theme generated successfully! Preview updated.', 'logindesignerwp'),
        ));
    }

    /**
     * AJAX: Generate theme from current background settings.
     */
    public function ajax_generate_theme_from_background()
    {
        check_ajax_referer('logindesignerwp_save_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(__('Permission denied.', 'logindesignerwp'));
        }

        $ai_settings = $this->get_settings();
        $api_key = $ai_settings['openai_key'];

        if (empty($api_key)) {
            wp_send_json_error(__('OpenAI API Key is missing. Please configure it in the Settings tab.', 'logindesignerwp'));
        }

        // Get current design settings
        $settings = logindesignerwp_get_settings();
        $bg_mode = $settings['background_mode'];

        // Build context based on background mode
        $context = '';
        $use_vision = false;
        $image_url = '';

        switch ($bg_mode) {
            case 'color':
                $context = sprintf(
                    'The login page has a solid background color: %s',
                    $settings['background_color']
                );
                break;

            case 'gradient':
                $gradient_type = $settings['gradient_type'] ?? 'linear';
                $context = sprintf(
                    'The login page has a %s gradient background going from %s to %s',
                    $gradient_type,
                    $settings['background_gradient_1'],
                    $settings['background_gradient_2']
                );
                if (!empty($settings['background_gradient_3'])) {
                    $context .= ' with a third color: ' . $settings['background_gradient_3'];
                }
                break;

            case 'image':
                if (!empty($settings['background_image_id'])) {
                    // Get the file path for the image (not URL) so we can read it locally
                    $image_path = get_attached_file($settings['background_image_id']);

                    if ($image_path && file_exists($image_path)) {
                        // Read the image and convert to base64
                        $image_data = file_get_contents($image_path);
                        $image_mime = wp_check_filetype($image_path)['type'] ?? 'image/jpeg';
                        $image_base64 = base64_encode($image_data);
                        $image_data_url = 'data:' . $image_mime . ';base64,' . $image_base64;

                        $use_vision = true;
                        $context = 'Analyze this login page background image and suggest colors that complement it.';
                    } else {
                        wp_send_json_error(__('Could not load the background image file. Please try again.', 'logindesignerwp'));
                    }
                } else {
                    wp_send_json_error(__('No background image is set. Please select a background first.', 'logindesignerwp'));
                }
                break;

            default:
                wp_send_json_error(__('Please set a background (color, gradient, or image) first.', 'logindesignerwp'));
        }

        // System prompt for theme generation
        $system_prompt = 'You are a professional UI/UX designer specializing in login page design. Based on the background described or shown, generate a cohesive color scheme for the login form elements.

Consider:
- Contrast and readability (WCAG accessibility guidelines)
- Visual harmony with the background
- Modern, professional appearance
- Form should be clearly visible against the background
- IMPORTANT: The "below_form_link_color" is for links that appear OUTSIDE the form, directly on the page background. It must have high contrast with the PAGE BACKGROUND, not the form background. For dark backgrounds use light colors, for light backgrounds use dark colors.

Return ONLY valid JSON with these exact keys (no markdown, no explanation, just JSON):
{
  "form_bg_color": "#hexcolor",
  "form_border_color": "#hexcolor",
  "button_bg": "#hexcolor",
  "button_text_color": "#hexcolor",
  "label_text_color": "#hexcolor",
  "input_bg_color": "#hexcolor",
  "input_text_color": "#hexcolor",
  "input_border_color": "#hexcolor",
  "below_form_link_color": "#hexcolor (MUST contrast with PAGE background)",
  "form_shadow": true or false,
  "explanation": "Brief 1-2 sentence explanation of why these colors work well"
}';

        // Prepare API request
        if ($use_vision) {
            // Use GPT-4 Vision for image analysis
            $messages = array(
                array('role' => 'system', 'content' => $system_prompt),
                array(
                    'role' => 'user',
                    'content' => array(
                        array('type' => 'text', 'text' => $context),
                        array(
                            'type' => 'image_url',
                            'image_url' => array('url' => $image_data_url)
                        )
                    )
                )
            );
            $model = 'gpt-4o'; // GPT-4o has vision capabilities
        } else {
            // Use standard GPT-4 for color/gradient
            $messages = array(
                array('role' => 'system', 'content' => $system_prompt),
                array('role' => 'user', 'content' => $context)
            );
            $model = 'gpt-4o-mini';
        }

        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $api_key,
            ),
            'body' => json_encode(array(
                'model' => $model,
                'messages' => $messages,
                'temperature' => 0.7,
                'max_tokens' => 500,
            )),
            'timeout' => 60,
        ));

        if (is_wp_error($response)) {
            wp_send_json_error($response->get_error_message());
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (isset($data['error'])) {
            wp_send_json_error($data['error']['message']);
        }

        if (empty($data['choices'][0]['message']['content'])) {
            wp_send_json_error(__('No response from AI.', 'logindesignerwp'));
        }

        $ai_content = $data['choices'][0]['message']['content'];

        // Parse JSON from response (handle markdown code blocks)
        $ai_content = preg_replace('/```json\s*/', '', $ai_content);
        $ai_content = preg_replace('/```\s*/', '', $ai_content);
        $ai_content = trim($ai_content);

        $theme = json_decode($ai_content, true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($theme)) {
            wp_send_json_error(__('Failed to parse AI response. Please try again.', 'logindesignerwp'));
        }

        // Validate and sanitize theme values
        $valid_theme = array();
        $color_keys = array(
            'form_bg_color',
            'form_border_color',
            'button_bg',
            'button_text_color',
            'label_text_color',
            'input_bg_color',
            'input_text_color',
            'input_border_color',
            'below_form_link_color'
        );

        foreach ($color_keys as $key) {
            if (isset($theme[$key]) && preg_match('/^#[a-fA-F0-9]{6}$/', $theme[$key])) {
                $valid_theme[$key] = $theme[$key];
            }
        }

        // Boolean values
        if (isset($theme['form_shadow'])) {
            $valid_theme['form_shadow'] = (bool) $theme['form_shadow'];
        }

        // Get explanation
        $explanation = isset($theme['explanation']) ? sanitize_text_field($theme['explanation']) : '';

        wp_send_json_success(array(
            'theme' => $valid_theme,
            'explanation' => $explanation,
            'background_mode' => $bg_mode,
            'message' => __('Theme generated based on your background!', 'logindesignerwp'),
        ));
    }

    /**
     * Render API Key field.
     */
    public function render_api_key_field()
    {
        $settings = $this->get_settings();
        ?>
        <input type="password" name="<?php echo esc_attr($this->option_name); ?>[openai_key]"
            value="<?php echo esc_attr($settings['openai_key']); ?>" class="regular-text" placeholder="sk-...">
        <p class="description">
            <?php esc_html_e('Enter your OpenAI API key to unlock AI features.', 'logindesignerwp'); ?>
            <a href="https://platform.openai.com/api-keys"
                target="_blank"><?php esc_html_e('Get key', 'logindesignerwp'); ?></a>
        </p>

        <h4 style="margin-top: 20px; margin-bottom: 10px;"><?php esc_html_e('AI Model', 'logindesignerwp'); ?></h4>
        <select name="<?php echo esc_attr($this->option_name); ?>[image_model]">
            <option value="gpt-image-1.5" <?php selected($settings['image_model'], 'gpt-image-1.5'); ?>>
                <?php esc_html_e('GPT Image 1.5 (Best Quality)', 'logindesignerwp'); ?>
            </option>
            <option value="gpt-image-1" <?php selected($settings['image_model'], 'gpt-image-1'); ?>>
                <?php esc_html_e('GPT Image 1 (Balanced)', 'logindesignerwp'); ?>
            </option>
            <option value="gpt-image-1-mini" <?php selected($settings['image_model'], 'gpt-image-1-mini'); ?>>
                <?php esc_html_e('GPT Image 1 Mini (Fastest)', 'logindesignerwp'); ?>
            </option>
        </select>
        <p class="description">
            <?php esc_html_e('Select the AI model for image generation.', 'logindesignerwp'); ?>
        </p>

        <h4 style="margin-top: 20px; margin-bottom: 10px;"><?php esc_html_e('Image Quality', 'logindesignerwp'); ?></h4>
        <select name="<?php echo esc_attr($this->option_name); ?>[image_quality]">
            <option value="high" <?php selected($settings['image_quality'], 'high'); ?>>
                <?php esc_html_e('High (Best Quality)', 'logindesignerwp'); ?>
            </option>
            <option value="medium" <?php selected($settings['image_quality'], 'medium'); ?>>
                <?php esc_html_e('Medium (Balanced)', 'logindesignerwp'); ?>
            </option>
            <option value="low" <?php selected($settings['image_quality'], 'low'); ?>>
                <?php esc_html_e('Low (Fastest)', 'logindesignerwp'); ?>
            </option>
            <option value="auto" <?php selected($settings['image_quality'], 'auto'); ?>>
                <?php esc_html_e('Auto', 'logindesignerwp'); ?>
            </option>
        </select>
        <p class="description">
            <?php esc_html_e('Select the quality level for generation. Higher quality may cost more credits.', 'logindesignerwp'); ?>
        </p>
        <?php
    }

    /**
     * Sanitize settings.
     *
     * @param array $input Input array.
     * @return array Sanitized array.
     */
    public function sanitize_settings($input)
    {
        $clean = array();

        if (isset($input['openai_key'])) {
            $clean['openai_key'] = sanitize_text_field($input['openai_key']);
        }

        // Image quality setting
        if (isset($input['image_quality'])) {
            $allowed_qualities = array('low', 'medium', 'high', 'auto');
            $clean['image_quality'] = in_array($input['image_quality'], $allowed_qualities, true)
                ? $input['image_quality']
                : 'high';
        }

        // Image model setting
        if (isset($input['image_model'])) {
            $valid_models = array('gpt-image-1.5', 'gpt-image-1', 'gpt-image-1-mini');
            $clean['image_model'] = in_array($input['image_model'], $valid_models, true)
                ? $input['image_model']
                : 'gpt-image-1.5';
        }

        return $clean;
    }

    /**
     * Get settings.
     *
     * @return array
     */
    public function get_settings()
    {
        $defaults = array(
            'openai_key' => '',
            'image_quality' => 'high',
            'image_model' => 'gpt-image-1.5',
        );

        $settings = get_option($this->option_name, array());
        $settings = wp_parse_args($settings, $defaults);

        // Migrate legacy quality settings on the fly
        if (isset($settings['image_quality'])) {
            if ($settings['image_quality'] === 'hd') {
                $settings['image_quality'] = 'high';
            } elseif ($settings['image_quality'] === 'standard') {
                $settings['image_quality'] = 'medium';
            }
        }

        return $settings;
    }

    /**
     * Render AI settings section.
     */
    public function render_ai_settings()
    {
        // If Pro is not active, show locked placeholder instead
        if (!logindesignerwp_is_pro_active()) {
            $this->render_ai_settings_locked();
            return;
        }

        $settings = $this->get_settings();
        ?>
        <div class="logindesignerwp-card" data-section-id="ai_configuration">
            <h2>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-superhero"></span>
                    <?php esc_html_e('AI Configuration', 'logindesignerwp'); ?>
                    <span class="logindesignerwp-pro-badge"><?php esc_html_e('Pro', 'logindesignerwp'); ?></span>
                    <?php if (!empty($settings['openai_key'])): ?>
                        <span
                            style="background: #22c55e; color: white; padding: 2px 8px; border-radius: 100px; font-size: 10px; margin-left: 5px; vertical-align: middle; text-transform: uppercase;"><?php esc_html_e('Active', 'logindesignerwp'); ?></span>
                    <?php endif; ?>
                </span>
            </h2>

            <div class="logindesignerwp-card-content">
                <p><?php esc_html_e('Configure AI settings to enable DALL-E background generation and theme analysis.', 'logindesignerwp'); ?>
                </p>

                <form method="post" action="options.php" id="logindesignerwp-ai-settings-form">
                    <?php settings_fields('logindesignerwp_ai_group'); ?>
                    <?php do_settings_sections('logindesignerwp_ai_page'); ?>
                    <?php submit_button(__('Save AI Settings', 'logindesignerwp'), 'secondary'); ?>
                </form>
            </div>
        </div>
        <?php
    }

    /**
     * Render locked AI settings placeholder for non-Pro users.
     */
    private function render_ai_settings_locked()
    {
        $upgrade_url = 'https://frontierwp.com/logindesignerwp-pro';
        ?>
        <div class="logindesignerwp-pro-locked">
            <div class="logindesignerwp-pro-locked-header">
                <h2 class="logindesignerwp-pro-locked-title">
                    <span class="dashicons dashicons-lock"></span>
                    <?php esc_html_e('AI Configuration', 'logindesignerwp'); ?>
                </h2>
                <span class="logindesignerwp-pro-badge">
                    <span class="dashicons dashicons-star-filled"></span>
                    <?php esc_html_e('Pro', 'logindesignerwp'); ?>
                </span>
            </div>
            <div class="logindesignerwp-pro-locked-content">
                <p style="margin-bottom: 16px; color: #64748b;">
                    <?php esc_html_e('Configure AI settings to enable DALL-E background generation and theme analysis.', 'logindesignerwp'); ?>
                </p>
                <table class="form-table">
                    <tr>
                        <th scope="row"><?php esc_html_e('OpenAI API Key', 'logindesignerwp'); ?></th>
                        <td>
                            <input type="password" class="regular-text" placeholder="sk-..." disabled>
                            <p class="description">
                                <?php esc_html_e('Enter your OpenAI API key to unlock AI features.', 'logindesignerwp'); ?>
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="logindesignerwp-pro-locked-footer">
                <a href="<?php echo esc_url($upgrade_url); ?>" class="logindesignerwp-pro-upgrade-btn" target="_blank">
                    <span class="dashicons dashicons-unlock"></span>
                    <?php esc_html_e('Unlock with LoginDesignerWP Pro', 'logindesignerwp'); ?>
                </a>
                <p class="logindesignerwp-pro-upgrade-text">
                    <?php esc_html_e('Generate backgrounds and themes with AI', 'logindesignerwp'); ?>
                </p>
            </div>
        </div>
        <?php
    }

    /**
     * Render AI Tools card for the Design tab.
     */
    public function render_ai_tools_card()
    {
        $settings = $this->get_settings();
        $has_api_key = !empty($settings['openai_key']);
        ?>
        <div class="logindesignerwp-card" data-section-id="ai_tools">
            <h2>
                <span class="drag-handle dashicons dashicons-move"></span>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-superhero"></span>
                    <?php esc_html_e('AI Tools', 'logindesignerwp'); ?>
                    <span class="logindesignerwp-pro-badge""><?php esc_html_e('Pro', 'logindesignerwp'); ?></span>
                    <?php if ($has_api_key): ?>
                        <span
                            style=" background: #22c55e; color: white; padding: 2px 8px; border-radius: 100px;
                            font-size: 10px; margin-left: 5px; vertical-align: middle; text-transform:
                            uppercase;"><?php esc_html_e('Active', 'logindesignerwp'); ?></span>
                    <?php endif; ?>
                </span>
            </h2>
            <div class="logindesignerwp-card-content">
                <?php if (!$has_api_key): ?>
                    <div style="background:#fff8e5; border:1px solid #ffcc00; border-radius:6px; padding:16px; margin-bottom:20px;">
                        <p style="margin:0; color:#856404;">
                            <span class="dashicons dashicons-warning" style="color:#ffcc00;"></span>
                            <?php esc_html_e('AI features require an OpenAI API key.', 'logindesignerwp'); ?>
                            <a href="#" onclick="document.querySelector('[data-tab=settings]').click(); return false;"
                                style="font-weight:600;">
                                <?php esc_html_e('Configure in Settings →', 'logindesignerwp'); ?>
                            </a>
                        </p>
                    </div>
                <?php endif; ?>

                <div class="logindesignerwp-ai-tools-grid"
                    style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:16px;">

                    <!-- AI Background Generator -->
                    <div class="logindesignerwp-ai-tool-card"
                        style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
                        <div
                            style="background:#2271b1; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
                            <span class="dashicons dashicons-format-image" style="color:#fff; font-size:24px;"></span>
                        </div>
                        <h4 style="margin:0 0 8px; font-size:14px; font-weight:600;">
                            <?php esc_html_e('Background Generator', 'logindesignerwp'); ?>
                        </h4>
                        <p style="margin:0 0 16px; font-size:12px; color:#64748b;">
                            <?php esc_html_e('Create unique backgrounds with DALL-E AI', 'logindesignerwp'); ?>
                        </p>
                        <button type="button" class="button button-primary logindesignerwp-ai-generate-bg" <?php echo !$has_api_key ? 'disabled' : ''; ?>>
                            <span class="dashicons dashicons-superhero" style="line-height:1.4; margin-right:4px;"></span>
                            <?php esc_html_e('Generate', 'logindesignerwp'); ?>
                        </button>
                    </div>

                    <!-- Smart Theme from Background -->
                    <div class="logindesignerwp-ai-tool-card"
                        style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
                        <div
                            style="background:#9333ea; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
                            <span class="dashicons dashicons-art" style="color:#fff; font-size:24px;"></span>
                        </div>
                        <h4 style="margin:0 0 8px; font-size:14px; font-weight:600;">
                            <?php esc_html_e('Smart Theme', 'logindesignerwp'); ?>
                        </h4>
                        <p style="margin:0 0 16px; font-size:12px; color:#64748b;">
                            <?php esc_html_e('Match form colors to your background', 'logindesignerwp'); ?>
                        </p>
                        <button type="button" class="button button-primary logindesignerwp-ai-smart-theme" <?php echo !$has_api_key ? 'disabled' : ''; ?>>
                            <span class="dashicons dashicons-art" style="line-height:1.4; margin-right:4px;"></span>
                            <?php esc_html_e('Analyze', 'logindesignerwp'); ?>
                        </button>
                    </div>

                    <!-- Text to Theme -->
                    <div class="logindesignerwp-ai-tool-card"
                        style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center;">
                        <div
                            style="background:#2271b1; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
                            <span class="dashicons dashicons-edit" style="color:#fff; font-size:24px;"></span>
                        </div>
                        <h4 style="margin:0 0 8px; font-size:14px; font-weight:600;">
                            <?php esc_html_e('Text to Theme', 'logindesignerwp'); ?>
                        </h4>
                        <p style="margin:0 0 16px; font-size:12px; color:#64748b;">
                            <?php esc_html_e('Describe your theme in words', 'logindesignerwp'); ?>
                        </p>
                        <button type="button" class="button button-primary logindesignerwp-ai-text-to-theme" <?php echo !$has_api_key ? 'disabled' : ''; ?>>
                            <span class="dashicons dashicons-edit" style="line-height:1.4; margin-right:4px;"></span>
                            <?php esc_html_e('Generate', 'logindesignerwp'); ?>
                        </button>
                    </div>

                </div>
            </div>
        </div>
        <?php
    }
}
