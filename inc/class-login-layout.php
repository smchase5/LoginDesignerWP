<?php
/**
 * Login Layout Manager for LoginDesignerWP.
 * Handles the output buffering and DOM injection for advanced layouts.
 *
 * @package LoginDesignerWP
 */

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class LoginDesignerWP_Login_Layout
 */
class LoginDesignerWP_Login_Layout
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
        add_action('login_init', array($this, 'init_buffering'));
    }

    /**
     * Start output buffering on login init.
     */
    public function init_buffering()
    {
        // Only run for login page and if not an AJAX request
        if (defined('DOING_AJAX') && DOING_AJAX) {
            return;
        }

        $this->settings = logindesignerwp_get_settings();

        // Start buffering with our modifier callback
        ob_start(array($this, 'modify_login_output'));
    }

    /**
     * Modify the final login page output.
     * 
     * @param string $buffer The output buffer.
     * @return string The modified HTML.
     */
    public function modify_login_output($buffer)
    {
        // Safety check: ensure we have the login form container
        if (strpos($buffer, '<div id="login">') === false) {
            return $buffer;
        }

        $settings = $this->settings;
        $layout_mode = isset($settings['layout_mode']) ? $settings['layout_mode'] : 'centered';

        // CSS Classes for the shell
        $classes = array('lp-shell');
        $classes[] = 'layout--' . $layout_mode;

        if (isset($settings['layout_density'])) {
            $classes[] = 'density--' . $settings['layout_density'];
        }

        if (isset($settings['layout_vertical_align'])) {
            $classes[] = 'align--' . $settings['layout_vertical_align'];
        }

        // Action classes
        $action = isset($_REQUEST['action']) ? $_REQUEST['action'] : 'login';
        $classes[] = 'screen--' . sanitize_html_class($action);

        $class_string = implode(' ', $classes);

        // Build the Shell Structure
        $shell_start = sprintf('<div class="%s" id="lp-shell">', $class_string);

        $shell_start .= '<div class="lp-brand">';

        // Brand Content Injection
        if (!empty($settings['brand_content_enable']) && ($is_split_layout = strpos($layout_mode, 'split_') === 0 || $layout_mode === 'card_split')) {
            $shell_start .= '<div class="lp-brand-content">';

            // Brand Logo
            if (!empty($settings['brand_logo_url'])) {
                $shell_start .= sprintf(
                    '<img src="%s" class="lp-brand-logo" alt="%s" />',
                    esc_url($settings['brand_logo_url']),
                    esc_attr(isset($settings['brand_title']) ? $settings['brand_title'] : 'Logo')
                );
            }

            // Title
            if (!empty($settings['brand_title'])) {
                $shell_start .= sprintf('<h2 class="lp-brand-title">%s</h2>', esc_html($settings['brand_title']));
            }

            // Subtitle
            if (!empty($settings['brand_subtitle'])) {
                $shell_start .= sprintf('<p class="lp-brand-subtitle">%s</p>', esc_html($settings['brand_subtitle']));
            }

            $shell_start .= '</div>';
        }

        $shell_start .= '</div>';

        // Main Slot Start
        $shell_start .= '<div class="lp-main">';
        $shell_start .= '<div class="lp-content-wrap">';

        if (class_exists('DOMDocument') && function_exists('libxml_use_internal_errors')) {
            return $this->modify_via_dom($buffer, $class_string);
        }

        // Fallback: Simple Wrap (May allow scripts inside shell)
        // 1. Open the shell before #login
        $buffer = str_replace('<div id="login">', $shell_start . '<div id="login" class="lp-form">', $buffer);

        // Closing divs
        $shell_end = '</div></div></div>'; // lp-content-wrap, lp-main, lp-shell
        $buffer = str_replace('</body>', $shell_end . '</body>', $buffer);

        return $buffer;
    }

    /**
     * robust DOM modification
     */
    private function modify_via_dom($html, $class_string)
    {
        $dom = new DOMDocument();
        libxml_use_internal_errors(true);
        // Hack to handle UTF-8 correctly in loadHTML
        $dom->loadHTML(mb_convert_encoding($html, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
        libxml_clear_errors();

        $xpath = new DOMXPath($dom);
        $login_div = $dom->getElementById('login');

        if (!$login_div) {
            return $html;
        }

        // Create our structure
        $shell = $dom->createElement('div');
        $shell->setAttribute('class', $class_string);
        $shell->setAttribute('id', 'lp-shell');

        $brand = $dom->createElement('div');
        $brand->setAttribute('class', 'lp-brand');
        $shell->appendChild($brand);

        // Inject Brand Content
        $settings = $this->settings;
        $layout_mode = isset($settings['layout_mode']) ? $settings['layout_mode'] : 'centered';

        if (!empty($settings['brand_content_enable']) && ($is_split_layout = strpos($layout_mode, 'split_') === 0 || $layout_mode === 'card_split')) {
            $brand_content = $dom->createElement('div');
            $brand_content->setAttribute('class', 'lp-brand-content');
            $brand->appendChild($brand_content);

            // Brand Logo
            if (!empty($settings['brand_logo_url'])) {
                $img = $dom->createElement('img');
                $img->setAttribute('src', esc_url($settings['brand_logo_url']));
                $img->setAttribute('class', 'lp-brand-logo');
                $img->setAttribute('alt', isset($settings['brand_title']) ? $settings['brand_title'] : 'Logo');
                $brand_content->appendChild($img);
            }

            // Title
            if (!empty($settings['brand_title'])) {
                $title = $dom->createElement('h2', esc_html($settings['brand_title']));
                $title->setAttribute('class', 'lp-brand-title');
                $brand_content->appendChild($title);
            }

            // Subtitle
            if (!empty($settings['brand_subtitle'])) {
                $subtitle = $dom->createElement('p', esc_html($settings['brand_subtitle']));
                $subtitle->setAttribute('class', 'lp-brand-subtitle');
                $brand_content->appendChild($subtitle);
            }
        }

        $main = $dom->createElement('div');
        $main->setAttribute('class', 'lp-main');
        $shell->appendChild($main);

        $content_wrap = $dom->createElement('div');
        $content_wrap->setAttribute('class', 'lp-content-wrap');
        $main->appendChild($content_wrap);

        // Move #login INTO content_wrap
        $login_parent = $login_div->parentNode;
        $login_parent->insertBefore($shell, $login_div);
        $content_wrap->appendChild($login_div);

        // Add lp-form class to the existing login div
        $existing_classes = $login_div->getAttribute('class');
        $login_div->setAttribute('class', trim($existing_classes . ' lp-form'));

        // Handle Custom Message - Move it inside the wrapper
        $custom_message = $dom->getElementById('ldwp-custom-message');
        if ($custom_message) {
            $content_wrap->appendChild($custom_message);
        }

        return $dom->saveHTML();
    }
}


