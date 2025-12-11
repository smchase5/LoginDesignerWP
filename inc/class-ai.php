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

        // Call DALL-E 3
        $response = wp_remote_post('https://api.openai.com/v1/images/generations', array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $api_key,
            ),
            'body' => json_encode(array(
                'model' => 'dall-e-3',
                'prompt' => $prompt,
                'n' => 1,
                'size' => '1792x1024', // Widescreen for backgrounds
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

        if (empty($data['data'][0]['url'])) {
            wp_send_json_error(__('No image returned from AI.', 'logindesignerwp'));
        }

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
        $system_prompt = 'You are a professional UI designer. Generate a login page theme based on the user\'s description. Return ONLY valid JSON with these exact keys (no explanation, just JSON):
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
  "link_color": "#hexcolor"
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
        );

        $settings = get_option($this->option_name, array());

        return wp_parse_args($settings, $defaults);
    }

    /**
     * Render AI settings section.
     */
    public function render_ai_settings()
    {
        $settings = $this->get_settings();
        ?>
        <div class="logindesignerwp-card" data-section-id="ai_configuration">
            <h2>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-superhero"></span>
                    <?php esc_html_e('AI Configuration', 'logindesignerwp'); ?>
                    <?php if (!empty($settings['openai_key'])): ?>
                        <span class="logindesignerwp-ai-active-badge"
                            style="background:#46b450; color:white; padding:2px 8px; border-radius:10px; font-size:10px; margin-left:10px; vertical-align:middle; text-transform:uppercase;"><?php esc_html_e('Active', 'logindesignerwp'); ?></span>
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
     * Render AI Tools card for the Design tab.
     */
    public function render_ai_tools_card()
    {
        $settings = $this->get_settings();
        $has_api_key = !empty($settings['openai_key']);
        ?>
        <div class="logindesignerwp-card" data-section-id="ai_tools">
            <h2>
                <span class="logindesignerwp-card-title-wrapper">
                    <span class="dashicons dashicons-superhero"></span>
                    <?php esc_html_e('AI Tools', 'logindesignerwp'); ?>
                    <?php if ($has_api_key): ?>
                        <span class="logindesignerwp-ai-active-badge"
                            style="background:#2271b1; color:white; padding:2px 8px; border-radius:10px; font-size:10px; margin-left:10px; vertical-align:middle; text-transform:uppercase;"><?php esc_html_e('Active', 'logindesignerwp'); ?></span>
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

                    <!-- Magic Import (Coming Soon) -->
                    <div class="logindesignerwp-ai-tool-card"
                        style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:20px; text-align:center; opacity:0.7;">
                        <div
                            style="background:#6b7280; width:48px; height:48px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 12px;">
                            <span class="dashicons dashicons-upload" style="color:#fff; font-size:24px;"></span>
                        </div>
                        <h4 style="margin:0 0 8px; font-size:14px; font-weight:600;">
                            <?php esc_html_e('Magic Import', 'logindesignerwp'); ?>
                        </h4>
                        <p style="margin:0 0 16px; font-size:12px; color:#64748b;">
                            <?php esc_html_e('Upload an image to extract colors', 'logindesignerwp'); ?>
                        </p>
                        <span class="button button-secondary" disabled
                            style="pointer-events:none;"><?php esc_html_e('Coming Soon', 'logindesignerwp'); ?></span>
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
