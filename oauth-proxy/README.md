# LoginDesigner OAuth Proxy

A Cloudflare Worker that handles OAuth authentication for LoginDesignerWP Pro customers. This proxy securely manages OAuth flows for Google and GitHub social login.

## Prerequisites

- A [Cloudflare account](https://dash.cloudflare.com/sign-up) (free tier works)
- [Node.js](https://nodejs.org/) installed (v16 or higher)
- Google and/or GitHub Developer accounts for OAuth apps

---

## Quick Start

### 1. Install Wrangler CLI

Wrangler is Cloudflare's CLI tool for managing Workers.

```bash
# Install globally
npm install -g wrangler

# Login to your Cloudflare account (opens browser)
wrangler login
```

### 2. Clone/Navigate to the OAuth Proxy

```bash
cd /path/to/LoginDesignerWP/oauth-proxy
```

### 3. Update wrangler.toml

Edit `wrangler.toml` and set your worker name:

```toml
name = "logindesigner-oauth-proxy"  # Change this to your preferred name
main = "worker.js"
compatibility_date = "2024-01-01"
```

---

## Setting Up OAuth Apps

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Navigate to **APIs & Services > Credentials**
4. Click **Create Credentials > OAuth Client ID**
5. If prompted, configure the OAuth consent screen first:
   - Choose "External" user type
   - Fill in app name, support email
   - Add scopes: `email`, `profile`, `openid`
   - Add test users if in testing mode
6. Back in Credentials, create OAuth Client ID:
   - Application type: **Web application**
   - Name: "LoginDesignerWP OAuth"
   - Authorized redirect URIs: 
     ```
     https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/google/callback
     ```
7. Copy the **Client ID** and **Client Secret**

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **OAuth Apps > New OAuth App**
3. Fill in the details:
   - Application name: "LoginDesignerWP"
   - Homepage URL: Your website URL
   - Authorization callback URL:
     ```
     https://YOUR-WORKER-NAME.YOUR-SUBDOMAIN.workers.dev/github/callback
     ```
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it

---

## Configure Secrets

Secrets are stored securely in Cloudflare and never exposed in code.

```bash
cd oauth-proxy

# Google OAuth credentials
wrangler secret put GOOGLE_CLIENT_ID
# Paste your Google Client ID when prompted

wrangler secret put GOOGLE_CLIENT_SECRET
# Paste your Google Client Secret when prompted

# GitHub OAuth credentials
wrangler secret put GITHUB_CLIENT_ID
# Paste your GitHub Client ID when prompted

wrangler secret put GITHUB_CLIENT_SECRET
# Paste your GitHub Client Secret when prompted

# HMAC signing secret (generate a random 32+ character string)
wrangler secret put HMAC_SECRET
# Use a secure random string, e.g.: openssl rand -hex 32
```

**Tip:** Generate a secure HMAC secret:
```bash
openssl rand -hex 32
```

---

## Deploy

Deploy the worker to Cloudflare:

```bash
wrangler deploy
```

You'll see output like:
```
Published logindesigner-oauth-proxy (1.0.0)
  https://logindesigner-oauth-proxy.your-subdomain.workers.dev
```

**Copy this URL** - you'll need it for the plugin configuration.

---

## Configure the WordPress Plugin

1. Go to **WP Admin > LoginDesignerWP > Settings > Social Login**
2. Select **Advanced Setup** mode
3. Enter the **Proxy URL**:
   ```
   https://logindesigner-oauth-proxy.your-subdomain.workers.dev
   ```
4. Enter your **HMAC Secret** (same one you configured in Cloudflare)
5. Enable Google and/or GitHub login
6. Save settings

---

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/google` | GET | Initiates Google OAuth flow |
| `/google/callback` | GET | Handles Google OAuth callback |
| `/github` | GET | Initiates GitHub OAuth flow |
| `/github/callback` | GET | Handles GitHub OAuth callback |
| `/health` | GET | Health check endpoint |

---

## Testing

Test the health endpoint:
```bash
curl https://YOUR-WORKER-NAME.workers.dev/health
```

Expected response:
```json
{"status": "ok", "timestamp": 1234567890}
```

---

## Security Features

- **HMAC-SHA256 Signing**: All user data is signed before redirect
- **Timestamp Validation**: 60-second window prevents replay attacks
- **No Data Storage**: Worker is stateless, no user data persisted
- **HTTPS Only**: All communication uses TLS encryption

---

## Troubleshooting

### "redirect_uri_mismatch" Error
- Ensure the callback URL in Google/GitHub exactly matches your worker URL
- Include the full path: `/google/callback` or `/github/callback`
- Check for trailing slashes

### "Invalid signature" in WordPress
- Verify HMAC_SECRET matches in both Cloudflare and WordPress
- Ensure no extra whitespace when entering the secret

### Worker Not Responding
```bash
# Check worker logs
wrangler tail
```

### Update Secrets
```bash
# Re-run the secret command to update
wrangler secret put SECRET_NAME
```

---

## Local Development

Test locally before deploying:

```bash
# Start local dev server
wrangler dev

# Worker runs at http://localhost:8787
```

Note: OAuth callbacks won't work locally since providers need HTTPS URLs.

---

## Updating the Worker

After making changes to `worker.js`:

```bash
wrangler deploy
```

The update is instant with zero downtime.
