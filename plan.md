Here’s a `plan.md` you can drop straight into the repo for **LoginDesignerWP** 👇

---

# LoginDesignerWP – Plan

## 1. Overview

**Plugin name:** LoginDesignerWP
**Purpose:** Provide a *super lightweight* way to visually customize the default WordPress login screen with a clean, modern UI inside wp-admin.

**Core philosophy:**

* Minimal bloat, no page builders, no gimmicks.
* Respect and extend the default WordPress aesthetic.
* Safe defaults, sane fallbacks (if plugin is deactivated, login returns to normal).
* Built in a way that can later expand into a more complete “login experience” suite.

---

## 2. MVP Scope

### 2.1. Features (v1)

1. **Background styling**

   * Option to choose:

     * Solid background color
     * Gradient background
     * Background image
   * Controls:

     * Color picker for solid color
     * Two-color gradient picker (linear, top→bottom for v1)
     * Background image upload/selection (Media Library)
     * Image options: cover/contain, position (center, top, bottom), repeat (no-repeat, repeat)

2. **Login form styling**

   * Form container:

     * Background color
     * Border radius
     * Optional border color
     * Box shadow toggle + preset strength
   * Typography/colors:

     * Label text color
     * Input background color
     * Input border color + focus color
     * Input text color
   * Button:

     * Button background color
     * Button hover background color
     * Button text color
     * Border radius (linked to form or separate)

3. **Logo customization (simple)**

   * Custom logo image (Media Library)
   * Logo width (max-width in px)
   * Logo link URL (defaults to home_url)
   * Logo title attribute (defaults to site name)

4. **Preview / UX**

   * Simple “Preview” link/button that:

     * Opens the standard `/wp-login.php` in a new tab so the user can see changes.
     * Settings are saved live; no inline preview in v1 to keep things lean.

---

## 3. Admin UI / Design Language

### 3.1. General design principles

* Follow **native WordPress** admin design as closely as possible:

  * Use standard WP typography and spacing (no custom fonts).
  * Use core colors where possible (grays, blues) for non-critical UI.
  * Avoid heavy custom branding – let the *site* brand shine, not the plugin.
* Layout:

  * One main settings page under **Settings → LoginDesignerWP** (or “Appearance → Login Designer” later if desired).
  * Use **cards/sections** for grouping settings:

    * “Background”
    * “Login Form”
    * “Logo”
    * “Advanced” (even if mostly empty in v1, can be ready for future options).

### 3.2. Visual structure

Inside the settings page:

* **Page Title:** `LoginDesignerWP`
* **Intro text:** One short sentence: e.g. “Customize your WordPress login screen with simple, lightweight controls.”
* **Section layout:**

  * Each section wrapped in a subtle card:

    * Light gray border (like WP metaboxes)
    * Slight background (#fff on classic, or match WP default)
    * 16–20px internal padding
    * Section title as `<h2>` using WP default styling.

Rough visual hierarchy (top → bottom):

1. **Background Section**

   * Radio or segmented control:

     * `Solid color`, `Gradient`, `Image`
   * Fields change conditionally based on selected mode.
   * Use built-in WP color pickers.
   * Image field uses standard media uploader button (“Select image”).

2. **Login Form Section**

   * Card for “Form card” (background, radius, shadow).
   * Card for “Fields & Labels” (label text color, input styles).
   * Card for “Button” (bg, hover, text, radius).

3. **Logo Section**

   * Media picker for logo.
   * Number field for width (with `px` hint).
   * Text fields for link URL + title.

4. **Save & Preview**

   * Standard **Save Changes** button (core WP button-primary).
   * Beside or under it: a **secondary button** “Open Login Page” linking to `/wp-login.php` in a new tab.

### 3.3. Tone & microcopy

* Short, practical, non-technical helper text.
* Example:

  * “This color fills the entire background of the login page.”
  * “If you set a background image, it will appear behind the login form.”
  * “Logo width is a maximum; the image will scale down on smaller screens.”

---

## 4. Settings & Data Model

### 4.1. Option storage

Single options array in `wp_options`:

* Option name: `logindesignerwp_settings`
* Structure (example):

```php
$defaults = [
    'background_mode'        => 'solid', // solid | gradient | image
    'background_color'       => '#0f172a',
    'background_gradient_1'  => '#0f172a',
    'background_gradient_2'  => '#111827',
    'background_image_id'    => 0,
    'background_image_size'  => 'cover',
    'background_image_pos'   => 'center',
    'background_image_repeat'=> 'no-repeat',

    'form_bg_color'          => '#020617',
    'form_border_radius'     => 12,
    'form_border_color'      => '#1f2933',
    'form_shadow_enable'     => true,

    'label_text_color'       => '#e5e7eb',
    'input_bg_color'         => '#020617',
    'input_text_color'       => '#f9fafb',
    'input_border_color'     => '#1f2937',
    'input_border_focus'     => '#3b82f6',

    'button_bg'              => '#3b82f6',
    'button_bg_hover'        => '#2563eb',
    'button_text_color'      => '#ffffff',
    'button_border_radius'   => 999,

    'logo_id'                => 0,
    'logo_width'             => 220,
    'logo_url'               => '', // fallback: home_url
    'logo_title'             => '', // fallback: blog name
];
```

Future-ready: keep everything in one array, version the settings if needed (`settings_version`).

---

## 5. Technical Implementation

### 5.1. Hooks used

* **Admin page**

  * `admin_menu` – add settings page.
  * `admin_init` – register settings, sections, fields.

* **Login styling**

  * `login_enqueue_scripts` – print inline CSS based on settings.
  * `login_headerurl` – override logo URL if custom provided.
  * `login_headertext` – override logo title if custom provided.

### 5.2. CSS generation

Generate inline CSS in PHP on the login page:

* Fetch settings with `get_option( 'logindesignerwp_settings', $defaults )`.
* Sanitize aggressively:

  * Colors: `sanitize_hex_color`, allow fallback/default if invalid.
  * Integers: `(int)` cast with bounds.
  * URLs: `esc_url`.
* Output `<style>` tag in `login_enqueue_scripts`:

Example structure:

```php
<style>
body.login {
    <?php if ( $background_mode === 'solid' ) : ?>
        background: <?php echo esc_html( $background_color ); ?>;
    <?php elseif ( $background_mode === 'gradient' ) : ?>
        background: linear-gradient(
            to bottom,
            <?php echo esc_html( $gradient_1 ); ?>,
            <?php echo esc_html( $gradient_2 ); ?>
        );
    <?php else : ?>
        background: #0f172a;
        <?php if ( $image_url ) : ?>
            background-image: url('<?php echo esc_url( $image_url ); ?>');
            background-size: <?php echo esc_html( $image_size ); ?>;
            background-position: <?php echo esc_html( $image_pos ); ?>;
            background-repeat: <?php echo esc_html( $image_repeat ); ?>;
        <?php endif; ?>
    <?php endif; ?>
}
</style>
```

Keep CSS minimal and constrained to `body.login` and `#login` selectors.

### 5.3. Admin assets

For MVP, rely on:

* Core WordPress color picker (`wp-color-picker`).
* Core admin styles.
* A small custom admin CSS file to:

  * Style cards (border, padding).
  * Tidy up field grouping.
* Optional small JS file for:

  * Handling background mode toggling (show/hide fields).
  * Initializing color pickers.

---

## 6. Future Enhancements (Post-MVP Roadmap)

Not built now, but plan for:

1. **Presets / Themes**

   * Prebuilt style presets (e.g., “Dark Glass”, “Minimal Light”, “Gradient Glow”) selectable from a dropdown.
   * “Reset to default” and “Reset to preset” options.

2. **Role-based redirect rules**

   * After-login redirect based on role (e.g., subscribers → /account, editors → /wp-admin).

3. **Messages + Branding**

   * Custom text under the form (e.g. “Need help? Contact support”).
   * Custom footer / back-to-site link text.

4. **Export / Import**

   * JSON export/import of settings to move login designs between sites.

5. **Multi-site aware**

   * Network-level defaults with per-site override.

---

## 7. Code Structure

Suggested plugin file layout:

```text
login-designer-wp/
  |-- login-designer-wp.php        # Main plugin file
  |-- readme.txt
  |-- plan.md                      # This file
  |-- inc/
  |     |-- class-settings.php     # Settings registration & admin page
  |     |-- class-login-style.php  # Login CSS, logo, etc.
  |     |-- helpers.php            # Shared utility functions
  |
  |-- assets/
        |-- css/
        |     |-- admin.css        # Light admin styling for settings page
        |
        |-- js/
              |-- admin.js         # Toggle controls, color picker init
```

---

## 8. Design Summary (for quick reference)

* **Look & Feel:** Clean, modern, and aligned with WordPress core. No heavy custom theme; enhance, don’t replace.
* **Colors:** Use user-selected colors only for the login preview output; plugin UI itself uses standard WP palette.
* **Components:**

  * Card-like sections with clear titles.
  * Native form fields, color pickers, and media uploaders.
* **Experience:**

  * One simple page.
  * User changes options → clicks “Save Changes” → clicks “Open Login Page” to see result.
  * No surprises, no dependency on third-party frameworks.

---

If you want, next step I can draft:

* The main plugin file with the bootstrap.
* The settings registration class skeleton.
* The `login_enqueue_scripts` logic wired up to your defaults.
