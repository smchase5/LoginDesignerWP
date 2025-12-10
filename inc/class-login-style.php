<?php
/**
 * Login styling class for LoginDesignerWP.
 *
 * @package LoginDesignerWP
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class LoginDesignerWP_Login_Style
 *
 * Handles login page styling and customization.
 */
class LoginDesignerWP_Login_Style
{

    /**
     * Plugin settings.
     *
     * @var array
     */
    private $settings;

    /**
     * Constructor.
     */
    public function __construct()
    {
        add_action('login_enqueue_scripts', array($this, 'output_login_styles'));
        add_filter('login_headerurl', array($this, 'custom_logo_url'));
        add_filter('login_headertext', array($this, 'custom_logo_title'));
    }

    /**
     * Output login page styles.
     */
    public function output_login_styles()
    {
        $this->settings = logindesignerwp_get_settings();
        $s = $this->settings;

        // Get background image URL if applicable.
        $bg_image_url = '';
        if ('image' === $s['background_mode'] && $s['background_image_id']) {
            $bg_image_url = wp_get_attachment_image_url($s['background_image_id'], 'full');
        }

        // Get custom logo URL if applicable.
        $logo_url = '';
        if ($s['logo_id']) {
            $logo_url = wp_get_attachment_image_url($s['logo_id'], 'full');
        }

        ?>
        <style type="text/css">
            /* Background */
            body.login {
                <?php if ('solid' === $s['background_mode']): ?>
                    background:
                        <?php echo esc_html($s['background_color']); ?>
                    ;
                <?php elseif ('gradient' === $s['background_mode']): ?>
                    background: linear-gradient(to bottom,
                            <?php echo esc_html($s['background_gradient_1']); ?>
                            ,
                            <?php echo esc_html($s['background_gradient_2']); ?>
                        );
                    min-height: 100vh;
                <?php elseif ('image' === $s['background_mode'] && $bg_image_url): ?>
                    background-color:
                        <?php echo esc_html($s['background_color']); ?>
                    ;
                    background-image: url('<?php echo esc_url($bg_image_url); ?>');
                    background-size:
                        <?php echo esc_html($s['background_image_size']); ?>
                    ;
                    background-position:
                        <?php echo esc_html($s['background_image_pos']); ?>
                    ;
                    background-repeat:
                        <?php echo esc_html($s['background_image_repeat']); ?>
                    ;
                    background-attachment: fixed;
                <?php endif; ?>
            }

            /* Login Form Container */
            #login {
                padding: 8% 0 0;
            }

            #loginform,
            #registerform,
            #lostpasswordform {
                background:
                    <?php echo esc_html($s['form_bg_color']); ?>
                ;
                border-radius:
                    <?php echo esc_html($s['form_border_radius']); ?>
                    px;
                border: 1px solid
                    <?php echo esc_html($s['form_border_color']); ?>
                ;
                <?php if ($s['form_shadow_enable']): ?>
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.25);
                <?php else: ?>
                    box-shadow: none;
                <?php endif; ?>
                padding: 26px 24px;
            }

            /* Labels */
            #login label {
                color:
                    <?php echo esc_html($s['label_text_color']); ?>
                ;
                font-size: 14px;
            }

            /* Input Fields */
            #login input[type="text"],
            #login input[type="password"],
            #login input[type="email"] {
                background:
                    <?php echo esc_html($s['input_bg_color']); ?>
                ;
                color:
                    <?php echo esc_html($s['input_text_color']); ?>
                ;
                border: 1px solid
                    <?php echo esc_html($s['input_border_color']); ?>
                ;
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 16px;
            }

            #login input[type="text"]:focus,
            #login input[type="password"]:focus,
            #login input[type="email"]:focus {
                border-color:
                    <?php echo esc_html($s['input_border_focus']); ?>
                ;
                box-shadow: 0 0 0 1px
                    <?php echo esc_html($s['input_border_focus']); ?>
                ;
                outline: none;
            }

            /* Submit Button */
            #login .button-primary {
                background:
                    <?php echo esc_html($s['button_bg']); ?>
                ;
                border: none;
                border-radius:
                    <?php echo esc_html($s['button_border_radius']); ?>
                    px;
                color:
                    <?php echo esc_html($s['button_text_color']); ?>
                ;
                font-size: 14px;
                font-weight: 500;
                padding: 8px 16px;
                text-shadow: none;
                transition: background 0.2s ease;
            }

            #login .button-primary:hover,
            #login .button-primary:focus {
                background:
                    <?php echo esc_html($s['button_bg_hover']); ?>
                ;
                color:
                    <?php echo esc_html($s['button_text_color']); ?>
                ;
            }

            /* Links */
            #login #nav a,
            #login #backtoblog a {
                color:
                    <?php echo esc_html($s['label_text_color']); ?>
                ;
                opacity: 0.8;
            }

            #login #nav a:hover,
            #login #backtoblog a:hover {
                color:
                    <?php echo esc_html($s['input_border_focus']); ?>
                ;
                opacity: 1;
            }

            /* Logo */
            <?php if ($logo_url): ?>
                #login h1 a {
                    background-image: url('<?php echo esc_url($logo_url); ?>');
                    background-size: contain;
                    background-position: center;
                    background-repeat: no-repeat;
                    width:
                        <?php echo esc_html($s['logo_width']); ?>
                        px;
                    height: 100px;
                    max-width: 100%;
                }

            <?php endif; ?>

            /* Message boxes */
            #login .message,
            #login .success {
                border-left-color:
                    <?php echo esc_html($s['input_border_focus']); ?>
                ;
                background:
                    <?php echo esc_html($s['form_bg_color']); ?>
                ;
                color:
                    <?php echo esc_html($s['label_text_color']); ?>
                ;
            }

            /* Error messages */
            #login #login_error {
                border-left-color: #dc2626;
                background:
                    <?php echo esc_html($s['form_bg_color']); ?>
                ;
                color:
                    <?php echo esc_html($s['label_text_color']); ?>
                ;
            }

            #login #login_error a {
                color:
                    <?php echo esc_html($s['input_border_focus']); ?>
                ;
            }

            /* Password toggle button */
            .wp-hide-pw,
            .wp-hide-pw:hover,
            .wp-hide-pw:focus {
                color:
                    <?php echo esc_html($s['label_text_color']); ?>
                ;
            }

            /* Privacy policy link */
            .privacy-policy-page-link a {
                color:
                    <?php echo esc_html($s['label_text_color']); ?>
                ;
            }
        </style>
        <?php
    }

    /**
     * Custom logo URL.
     *
     * @param string $url Default URL.
     * @return string Custom URL or default.
     */
    public function custom_logo_url($url)
    {
        $settings = logindesignerwp_get_settings();

        if (!empty($settings['logo_url'])) {
            return esc_url($settings['logo_url']);
        }

        return home_url();
    }

    /**
     * Custom logo title.
     *
     * @param string $title Default title.
     * @return string Custom title or default.
     */
    public function custom_logo_title($title)
    {
        $settings = logindesignerwp_get_settings();

        if (!empty($settings['logo_title'])) {
            return esc_html($settings['logo_title']);
        }

        return get_bloginfo('name');
    }
}
