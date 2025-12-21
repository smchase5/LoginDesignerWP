<?php
/**
 * Plugin Updater Class
 *
 * Handles automatic updates for the Pro plugin by interfacing with the
 * WooCommerce Software Licensing API.
 *
 * @package LoginDesignerWP
 */

namespace LoginDesignerWP\Pro;

if (!defined('ABSPATH')) {
    exit;
}

class Plugin_Updater
{

    /**
     * store API URL.
     */
    const STORE_URL = 'https://store.frontierwp.com';

    /**
     * Plugin slug.
     */
    private $slug;

    /**
     * Plugin file path.
     */
    private $plugin_file;

    /**
     * Plugin version.
     */
    private $version;

    /**
     * License key.
     */
    private $license_key;

    /**
     * Constructor.
     *
     * @param string $plugin_file The absolute path to the main plugin file.
     * @param string $version     Current plugin version.
     * @param string $license_key Active license key.
     */
    public function __construct($plugin_file, $version, $license_key, $slug = 'login-designer-wp-pro')
    {
        $this->plugin_file = $plugin_file;
        $this->version = $version;
        $this->license_key = $license_key;
        $this->slug = $slug;

        add_filter('pre_set_site_transient_update_plugins', [$this, 'check_update']);
        add_filter('plugins_api', [$this, 'check_info'], 10, 3);
    }

    /**
     * Check for updates.
     *
     * @param object $transient The update transient.
     * @return object
     */
    public function check_update($transient)
    {
        if (empty($transient->checked)) {
            return $transient;
        }

        $remote_version = $this->request_info();

        if ($remote_version && version_compare($this->version, $remote_version->new_version, '<')) {
            $res = (object) [
                'slug' => $this->slug,
                'plugin' => plugin_basename($this->plugin_file),
                'new_version' => $remote_version->new_version,
                'package' => $remote_version->package,
                'url' => $remote_version->url,
            ];

            $transient->response[$this->slug] = $res;
        }

        return $transient;
    }

    /**
     * Get plugin info for the "View Details" popup.
     *
     * @param bool   $false  False.
     * @param string $action Action.
     * @param object $args   Args.
     * @return object|bool
     */
    public function check_info($false, $action, $args)
    {
        if ('plugin_information' !== $action) {
            return $false;
        }

        if ($this->slug !== $args->slug) {
            return $false;
        }

        return $this->request_info();
    }

    /**
     * Request update info from the remote server.
     *
     * @return object|bool
     */
    private function request_info()
    {
        $url = add_query_arg(
            [
                'mf_action' => 'get_version', // LMFWC standard action for version check
                'license' => $this->license_key,
                'slug' => $this->slug,
            ],
            self::STORE_URL . '/wp-json/lmfwc/v2/licenses/check-update' // Adjust based on doc if needed
        );

        // Fallback to standard WooCommerce Software Add-on style if LMFWC differs:
        // Usually /wp-json/lmfwc/v2/licenses/check-update isn't standard, it's often a custom endpoint
        // or just checking the product variation. 
        // For simplicity, assuming a standard GET request that returns JSON with new_version and package.

        // Let's use a generic implementation compatible with most Managers:
        $request = wp_remote_get($url, ['timeout' => 15]);

        if (is_wp_error($request) || wp_remote_retrieve_response_code($request) !== 200) {
            return false;
        }

        $body = json_decode(wp_remote_retrieve_body($request));

        if ($body && isset($body->success) && $body->success) {
            // Adapt response to WP format
            $data = $body->data;
            return (object) [
                'new_version' => $data->version ?? '0.0.0',
                'package' => $data->package ?? '', // The zip URL
                'url' => $data->url ?? self::STORE_URL, // Info URL
                'slug' => $this->slug,
            ];
        }

        return false;
    }
}
