/**
 * LoginDesigner OAuth Proxy - Cloudflare Worker
 * 
 * Deploy this to Cloudflare Workers to handle OAuth for customer sites.
 * 
 * Environment Variables (set in Cloudflare dashboard):
 * - GOOGLE_CLIENT_ID
 * - GOOGLE_CLIENT_SECRET
 * - HMAC_SECRET (random string for signing responses)
 */

export default {
    async fetch(request, env) {
        const url = new URL(request.url);
        const path = url.pathname;

        // CORS headers for preflight
        if (request.method === 'OPTIONS') {
            return new Response(null, {
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type',
                },
            });
        }

        // Route handling
        if (path === '/google') {
            return handleGoogleRedirect(url, env);
        } else if (path === '/google/callback') {
            return handleGoogleCallback(url, env);
        } else if (path === '/health') {
            return new Response(JSON.stringify({ status: 'ok' }), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        return new Response('Not Found', { status: 404 });
    },
};

/**
 * Redirect user to Google OAuth
 */
function handleGoogleRedirect(url, env) {
    const site = url.searchParams.get('site');
    const callback = url.searchParams.get('callback');
    const state = url.searchParams.get('state');

    if (!site || !callback || !state) {
        return new Response('Missing required parameters: site, callback, state', { status: 400 });
    }

    // Store the original callback in the state (we'll use our own callback first)
    const proxyState = btoa(JSON.stringify({ site, callback, state }));

    const params = new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        redirect_uri: `${new URL(url).origin}/google/callback`,
        response_type: 'code',
        scope: 'email profile',
        state: proxyState,
        access_type: 'offline',
        prompt: 'select_account',
    });

    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    return Response.redirect(googleAuthUrl, 302);
}

/**
 * Handle Google OAuth callback, fetch user info, sign and redirect back
 */
async function handleGoogleCallback(url, env) {
    const code = url.searchParams.get('code');
    const stateParam = url.searchParams.get('state');
    const error = url.searchParams.get('error');

    if (error) {
        return new Response(`OAuth Error: ${error}`, { status: 400 });
    }

    if (!code || !stateParam) {
        return new Response('Missing code or state', { status: 400 });
    }

    // Decode the original state
    let originalState;
    try {
        originalState = JSON.parse(atob(stateParam));
    } catch (e) {
        return new Response('Invalid state parameter', { status: 400 });
    }

    const { site, callback, state } = originalState;

    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            client_id: env.GOOGLE_CLIENT_ID,
            client_secret: env.GOOGLE_CLIENT_SECRET,
            code: code,
            grant_type: 'authorization_code',
            redirect_uri: `${new URL(url).origin}/google/callback`,
        }),
    });

    if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        return new Response(`Token exchange failed: ${errorText}`, { status: 500 });
    }

    const tokens = await tokenResponse.json();

    // Fetch user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` },
    });

    if (!userResponse.ok) {
        return new Response('Failed to fetch user info', { status: 500 });
    }

    const userInfo = await userResponse.json();

    // Create signed payload
    const timestamp = Math.floor(Date.now() / 1000);
    const payload = {
        email: userInfo.email,
        name: userInfo.name,
        id: userInfo.id,
        picture: userInfo.picture,
        timestamp,
        state, // Original nonce from the WP site
    };

    const payloadString = JSON.stringify(payload);
    const signature = await signPayload(payloadString, env.HMAC_SECRET);

    // Redirect back to the WordPress site
    const redirectUrl = new URL(callback);
    redirectUrl.searchParams.set('ldwp_user', btoa(payloadString));
    redirectUrl.searchParams.set('ldwp_sig', signature);
    redirectUrl.searchParams.set('state', state);

    return Response.redirect(redirectUrl.toString(), 302);
}

/**
 * Sign payload with HMAC-SHA256
 */
async function signPayload(payload, secret) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
}
