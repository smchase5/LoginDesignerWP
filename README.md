# Login Designer WP

**Custom Login Page Designer for WordPress**

Transform your WordPress login page with a beautiful, professional design. No coding required.

## Description

Login Designer WP is a powerful yet easy-to-use plugin that lets you customize every aspect of your WordPress login page. With a live preview and preset templates, you can create a stunning login experience for your users in minutes.

### Features

**Free Version:**
- 🎨 Live preview as you design
- 🖼️ Custom background (solid color, gradient, or image)
- 📝 Custom logo with size controls
- 🔘 Button styling (colors, radius, hover effects)
- 📋 Form styling (background, border radius, shadows)
- 🏷️ Label and input styling
- 🎯 8+ Built-in presets
- 💾 Save custom presets
- 🔧 Setup wizard for quick configuration

**Pro Version:**
- ✨ Glassmorphism effects
- 🤖 AI-powered theme generation
- 🔐 Social login (Google, GitHub)
- 🛡️ reCAPTCHA & Cloudflare Turnstile
- 🎨 Premium preset library
- 📧 Priority support

## Installation

1. Upload the `login-designer-wp` folder to `/wp-content/plugins/`
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Navigate to **Settings → Login Designer** to customize your login page

## Frequently Asked Questions

### Will this work with my theme?
Yes! Login Designer WP works independently of your theme since the WordPress login page is separate from your main site.

### Can I see changes before saving?
Absolutely! The live preview shows all your changes in real-time before you save.

### How do I reset to defaults?
Use the "Reset to Defaults" button in the settings page to restore all original settings.

## Screenshots

1. Settings page with live preview
2. Design tab with background options
3. Form customization options
4. Preset library

## Changelog

### 1.0.0
- Initial release

## Development

### Build Assets

```bash
# Install dependencies
npm install

# Build minified assets
npm run build

# Watch for changes (development)
npm run watch
```

### SCRIPT_DEBUG

The plugin automatically loads source files when `SCRIPT_DEBUG` is enabled in `wp-config.php`:

```php
define('SCRIPT_DEBUG', true);
```

## Support

For support, please visit [logindesignerwp.com](https://logindesignerwp.com) or open an issue on GitHub.

## License

GPL-2.0+
