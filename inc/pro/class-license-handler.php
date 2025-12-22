<?php
/**
 * License Handler Class
 *
 * Handles license activation, deactivation, and status checks against the
 * store.frontierwp.com WooCommerce License Manager API.
 *
 * @package LoginDesignerWP
 */

namespace LoginDesignerWP\Pro;

if (!defined('ABSPATH')) {
    exit;
}

class License_Handler
{

    /**
     * The API URL of the store.
     */
    const STORE_URL = 'https://store.frontierwp.com';

    /**
     * Option name for storing license data.
     */
    const LICENSE_OPTION = 'logindesignerwp_pro_license';

    /**
     * Initialize the class.
     */
    public function init()
    {
        // Register any hooks if needed (e.g., periodic checks)
    }

    /**
     * Activate a license key.
     *
     * @param string $license_key The license key to activate.
     * @return array|WP_Error Response from the API or error.
     */
    public function activate_license($license_key)
    {
        // Use the authenticated REST API endpoint.
        // WARNING: Embedding Consumer Keys in client-side code is insecure for public distribution.
        // This is only acceptable for internal/private plugins where the code is not shared.
        $consumer_key = 'ck_75c02f37faf3d7ea2cd6b934dd328a9d6272a64a';
        $consumer_secret = 'cs_f5a46183df0f9c52400152af9b96a976fe394d75';

        // Endpoint: /wp-json/lmfwc/v2/licenses/activate/{license_key}
        $url = self::STORE_URL . '/wp-json/lmfwc/v2/licenses/activate/' . $license_key;

        $args = [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode($consumer_key . ':' . $consumer_secret),
                'Content-Type' => 'application/json',
            ],
            'timeout' => 15,
            'sslverify' => false, // For local dev compatibility
        ];

        $response = wp_remote_get($url, $args);

        if (is_wp_error($response)) {
            return $response;
        }

        $response_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        // Debugging LOG (Check debug.log)
        error_log('LDWP Activation URL: ' . $url);
        error_log('LDWP Activation Response Code: ' . $response_code);
        error_log('LDWP Activation Body: ' . $body);

        if (json_last_error() !== JSON_ERROR_NONE) {
            // If response isn't JSON, it's likely a server error page or HTML.
            // Return a snippet of the body to the UI.
            return new \WP_Error(
                'activation_failed',
                'Server returned non-JSON response (' . $response_code . '): ' . substr(strip_tags($body), 0, 150) . '...'
            );
        }

        if ($response_code === 200 && isset($data['success']) && $data['success'] === true) {

            // Validate Product ID
            // "61" is the ID for Login Designer WP Pro
            $product_id = isset($data['data']['productId']) ? (int) $data['data']['productId'] : 0;

            if ($product_id !== 61) {
                return new \WP_Error('activation_failed', 'Invalid license key.');
            }

            // Save license status
            update_option(
                self::LICENSE_OPTION,
                [
                    'key' => $license_key,
                    'status' => 'valid',
                    'expiry' => $data['data']['expiresAt'] ?? '',
                    'activation_token' => $data['data']['token'] ?? '', // Store token for deactivation
                ]
            );
            return $data;
        } else {
            $msg = $data['message'] ?? 'Activation failed (Unknown error).';
            if (isset($data['error'])) {
                $msg .= ' (' . $data['error'] . ')';
            }
            return new \WP_Error('activation_failed', $msg);
        }
    }

    /**
     * Deactivate a license key.
     *
     * @return array|WP_Error Response from the API.
     */
    public function deactivate_license()
    {
        $license_data = get_option(self::LICENSE_OPTION);
        if (!$license_data || empty($license_data['key'])) {
            return new \WP_Error('no_license', 'No active license found.');
        }

        $key = $license_data['key'];

        // WARNING: Using hardcoded Admin Keys for internal use only.
        $consumer_key = 'ck_75c02f37faf3d7ea2cd6b934dd328a9d6272a64a';
        $consumer_secret = 'cs_f5a46183df0f9c52400152af9b96a976fe394d75';

        // Endpoint: /wp-json/lmfwc/v2/licenses/deactivate/{key}
        $url = self::STORE_URL . '/wp-json/lmfwc/v2/licenses/deactivate/' . $key;

        $args = [
            'headers' => [
                'Authorization' => 'Basic ' . base64_encode($consumer_key . ':' . $consumer_secret),
            ],
            'timeout' => 15,
            'sslverify' => false,
        ];

        $response = wp_remote_get($url, $args);

        if (is_wp_error($response)) {
            return $response;
        }

        // Clear local option regardless of server response to ensure local deactivation
        delete_option(self::LICENSE_OPTION);

        return json_decode(wp_remote_retrieve_body($response), true);
    }

    /**
     * Get local license status.
     *
     * @return string 'valid' or 'invalid'.
     */
    public function get_license_status()
    {
        $data = get_option(self::LICENSE_OPTION);
        return (isset($data['status']) && $data['status'] === 'valid') ? 'valid' : 'invalid';
    }

    /**
     * Get the active license key.
     *
     * @return string
     */
    public function get_license_key()
    {
        $data = get_option(self::LICENSE_OPTION);
        return $data['key'] ?? '';
    }
}
