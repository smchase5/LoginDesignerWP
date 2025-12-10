Here’s an updated `freemium-architecture.md` with a clear **Free vs Pro feature split** and only *instructions/architecture* (no code). You can just overwrite your current version with this and keep your existing implementation as-is.

---

# Freemium Architecture – LoginDesignerWP

## 1. Goals

**Plugin family:**

* **Free:** `LoginDesignerWP` (core plugin, hosted on WordPress.org)
* **Pro:** `LoginDesignerWP Pro` (paid add-on, sold via your site)

**Core goals:**

* The **Free plugin is genuinely useful on its own** and feels complete, not crippled.
* The **Pro plugin is a clean, optional add-on**, not a fork or rewrite.
* Free exposes a **stable API of actions/filters** that Pro can hook into.
* Updates are **cleanly separated**:

  * Free updates via WordPress.org.
  * Pro updates via your own update server (FrontierWP).

This document is **architecture and product behavior only** — it intentionally avoids code so it won’t conflict with your current implementation.

---

## 2. Repos & Slugs

**Free plugin**

* Git repo: e.g. `github.com/frontierwp/login-designer-wp`
* WordPress.org slug: `login-designer-wp`
* Main file: `login-designer-wp.php`
* Distributed via: **WordPress.org**

**Pro plugin**

* Private Git repo: e.g. `github.com/frontierwp/login-designer-wp-pro`
* Main file: `login-designer-wp-pro.php`
* Distributed via: **frontierwp.com** as a downloadable ZIP
* Depends on: Free plugin being installed and active

---

## 3. Free vs Pro Feature Split

This is the **source of truth** for what goes where. If a feature is not explicitly listed under Free, it should be considered Pro (or future).

### 3.1. Free Features – LoginDesignerWP (Core)

The free plugin provides a **simple, clean visual redesign** of the default WordPress login page, matching a “lightweight utility” expectation.

#### A. Background styling (Free)

* Background modes:

  * Solid color
  * 2-color linear gradient (single fixed direction, e.g. top → bottom)
  * Background image
* Background controls:

  * Color picker for solid color
  * Two color pickers for gradient start/end
  * Image selection via Media Library
  * Basic image behavior:

    * Size: cover / contain
    * Position: center
    * Repeat: no-repeat or repeat

#### B. Login form card styling (Free)

* Card appearance:

  * Form background color
  * Form border radius (single numeric value)
  * Optional border color
  * Simple box shadow toggle (on/off with one preset shadow style)

#### C. Typography & fields (Free)

* Labels:

  * Label text color
* Inputs:

  * Input background color
  * Input border color
  * Input focus border color
  * Input text color

#### D. Primary button styling (Free)

* Button:

  * Button background color
  * Button hover background color
  * Button text color
  * Button border radius (single numeric value; may default to “pill”)

#### E. Logo customization (Free)

* Logo:

  * Custom logo via Media Library (single image)
  * Logo max width (numeric value)
  * Logo link URL (optional; defaults to `home_url`)
  * Logo title/text (optional; defaults to site name)

#### F. UX and workflow (Free)

* Settings experience:

  * A single **settings page** in wp-admin (e.g. under **Settings → LoginDesignerWP** or similar).
  * All settings grouped into intuitive sections:

    * “Background”
    * “Login Form”
    * “Logo”
  * Uses **native WordPress UI patterns**:

    * Standard fonts
    * Standard color pickers
    * Standard buttons
    * No custom admin frameworks
* Preview:

  * A simple “Open Login Page” or similar link/button that opens `/wp-login.php` in a new tab after saving.

#### G. Design language (Free)

* The plugin’s own settings page:

  * Clean, modern, WordPress-native.
  * Sections visually grouped in “cards” (subtle border, padding, white background).
  * Minimal use of color; the plugin UI itself should **blend with WP**, not compete.
  * Short, clear helper text near controls (not walls of text).

#### H. Behavior & scope (Free)

* No redirects, role logic, or content changes beyond styling.
* No presets/themes system in Free.
* No export/import in Free.
* No licensing logic in Free.

The Free plugin = **visual styling only**, with just enough control to feel powerful without being overwhelming.

---

### 3.2. Pro Features – LoginDesignerWP Pro (Add-on)

The Pro plugin builds on the Free plugin and focuses on:

* Advanced design options
* Behavioral control (redirects, messages)
* Productivity (presets, import/export)
* Multi-site/agency needs

Pro should **require** the Free plugin and extend it via actions/filters.

Great call — **showing Pro UI in the Free version but locking it** is one of the strongest upsell mechanisms in the entire WordPress ecosystem.

Let’s add that cleanly and explicitly into the architecture doc so it becomes part of the official plugin design.

Here’s the **updated section** you can insert into `freemium-architecture.md` (or I can re-generate the entire document with it folded in if you prefer):

---

# 🔒 3.3. Pro Feature Display in the Free Plugin (Locked UI)

To maximize adoption and upgrades, the Free plugin should **visually expose some Pro-only settings**, but keep them **disabled** or **read-only** with a clear lock indicator.

This pattern has several goals:

* Show users what’s possible if they upgrade
* Increase perceived value of the Pro edition
* Make the interface feel consistent (same settings layout; some items just locked)
* Reduce support questions (“does this plugin offer X?”)

### How this should look

* Pro-only sections appear **grayed out**, with:

  * A subtle lock icon 🔒
  * A tooltip or small inline note:
    **“Available in LoginDesignerWP Pro”**
  * Controls inside are **disabled** (e.g., `disabled` attribute)
* Clicking the locked section or hovering over the lock can show:

  * A brief upgrade message
  * A link to the Pro upgrade page

### Sections recommended to appear locked in the Free version

These should show *in Free* but be locked:

#### **1. Advanced Background Options (Locked UI)**

* Editable gradient angles
* 3–5 color gradient stops
* Overlays (color, opacity, blend modes)

#### **2. Glassmorphism Panel (Locked UI)**

* Background blur strength
* Transparency slider
* Glass-style borders

#### **3. Alternate Layouts (Locked UI)**

* Side-aligned login form
* Compact layout
* Wide layout
* “Hide WP footer links” toggles

#### **4. Presets (Locked UI)**

* Built-in design presets (display list, but disabled)
* “Save as preset” option
* “Apply preset” button

#### **5. Redirects & Behavior (Locked UI)**

* After-login redirect rules
* After-logout redirect
* Custom message under form
* Custom footer text

#### **6. Advanced / Agency Tools (Locked UI)**

* Export settings (disabled button)
* Import settings (disabled dropzone/button)
* Custom CSS input (read-only)
* Multisite default override options

### UI Behavior

* Locked sections should appear **below Free sections**, separated visually so users understand the plugin is free-first with optional upgrade.
* Use the exact same styling structure, just:

  * Light gray overlay or lowered opacity
  * Disabled fields
  * Lock icon
  * Upgrade CTA inside the section footer

### Tone for upsell messaging

Soft, non-annoying language, e.g.:

* **“Unlock Pro to customize gradients in any direction.”**
* **“Presets are a Pro feature—upgrade to save and reuse styles.”**
* **“Advanced layouts available in LoginDesignerWP Pro.”**

Short, simple, non-pushy.

### Why this works

This layout:

* Keeps Free UI perfectly clean
* Teases what users *could* do in Pro
* Dramatically improves conversion without popups, nags, or banners
* Matches the model of top-tier plugins like:

  * Astra
  * Kadence Blocks
  * RankMath
  * FluentCRM
  * WPForms


#### A. Advanced styling (Pro)

* Background:

  * Adjustable gradient angle (0–360°)
  * Multi-stop gradients (more than 2 colors)
  * Optional gradient overlays on top of background images
* Form card:

  * “Glassmorphism” options (blur strength, transparency percentage)
  * Separate desktop vs mobile radius/shadow options (optional; could be later)
* Additional button and link styling:

  * Separate styling for secondary links (e.g., “Lost your password?”)
  * Hover/active styles for nav and back-to-site links

#### B. Layout options (Pro)

* Optional layout templates, e.g.:

  * Standard centered form
  * Left/right aligned form
  * Compact vs spacious layout
* Ability to **toggle/hide certain native elements**:

  * Hide/rename “Back to site”
  * Hide/rename “Lost your password?” link

#### C. Presets & themes (Pro)

* Built-in style presets:

  * Examples: “Dark Glass”, “Minimal Light”, “Neon Gradient”, “Corporate Blue”
* Ability to:

  * Choose from preset list
  * Save current configuration as a **custom preset**
  * Apply/reset presets easily

#### D. Behavior & redirects (Pro)

* Post-login behavior:

  * Redirect after login based on role (e.g. subscribers to `/account`, editors to `/wp-admin`)
* Post-logout behavior:

  * Custom logout redirect URL (e.g. back to home or a dedicated “Goodbye” page)
* Optional custom message area:

  * Custom text block under the login form (e.g., “Need help? Contact support at…”)
  * Basic formatting support (line breaks, links)

#### E. Advanced / agency features (Pro)

* Export / Import:

  * Export settings as JSON
  * Import JSON to replicate a design on another site
* Multisite / network:

  * Ability to define **network-wide defaults** with per-site overrides (can be a later Pro release)
* Custom CSS:

  * One custom CSS textarea for power users to add small tweaks
  * Applied only on the login page

#### F. White-label & admin polish (Pro, optional / future)

* Ability to:

  * Hide “Powered by LoginDesignerWP” notices (if you ever add them)
  * Adjust plugin page labels or internal branding for agencies (if desired)

---

## 4. Extension Points (Concept)

Free should expose a minimal, stable set of **hooks**. Pro will attach to these rather than modifying core logic.

Conceptually:

* **Settings defaults hook**
  Free defines the base defaults. Pro can:

  * Add new keys (e.g. `advanced_gradient_angle`, `glass_effect_enabled`)
  * Adjust default values for its own fields

* **Sections/fields registration hook**
  Free builds its settings page. Pro adds extra sections, such as:

  * “Advanced Styling”
  * “Presets”
  * “Redirects & Behavior”

* **Sanitization hook**
  Free sanitizes its known fields. Pro is responsible for:

  * Sanitizing Pro-specific fields
  * Validating ranges (e.g., gradient angle, blur strength)

* **Login CSS hook**
  Free outputs the baseline CSS. Pro:

  * Appends additional CSS for advanced gradients, glass effects, layouts, etc.
  * Optionally overrides specific behaviors in a controlled way.

These hooks already exist in your implementation; this document simply defines **what they’re meant to be used for**.

---

## 5. Update & Distribution Strategy

### 5.1. Free (LoginDesignerWP)

* **Development:** Git (GitHub).
* **Distribution:** WordPress.org plugin repository.
* **Updates:** Users receive updates via WordPress.org like any other plugin.
* Recommended: CI/automation that deploys tagged releases from GitHub to WordPress.org.

### 5.2. Pro (LoginDesignerWP Pro)

* **Development:** Private Git repo.
* **Distribution:** ZIP downloads hosted on your site (or object storage) and sold through your chosen e-commerce stack.
* **Updates:** Pro plugin uses a custom update mechanism that:

  * Checks a version endpoint on your site.
  * Compares local version to latest.
  * If a newer version exists and license is valid (if you use licensing), shows update in wp-admin and downloads from your server.

The Pro update mechanism should be **separate from** the Free plugin’s update path.

---

## 6. Admin UI / Design Language Summary

For both Free and Pro settings pages (Pro sections just “slot in”):

* Look & feel:

  * Match core WordPress admin styles.
  * Use native color pickers, media pickers, buttons, and typography.
  * Avoid heavy custom branding or visual noise.
* Layout:

  * A single main settings screen, with multiple clearly labeled sections.
  * Each section contained in a card-like panel with:

    * Title
    * Brief description (optional)
    * Controls grouped logically
* Tone:

  * Short, clear labels and descriptions.
  * No jargon where it’s not needed; focus on “what it does” for the user.

---

## 7. Implementation Notes (High Level, No Code)

* The Free plugin **owns**:

  * The main settings option (one options array).
  * The base styling behavior.
  * The settings screen and its navigation.
* The Pro plugin **never alters Free files**:

  * It relies only on Free’s public hooks and settings.
  * It may add its own internal options if needed, but ideally extends the main settings array where it makes sense (as defined by your existing implementation).
* This document is meant to be a **product and architecture map**, not a strict technical contract. When in doubt:

  * Put simple, universal styling features in Free.
  * Put advanced styling, behavior, and “workflow sugar” in Pro.

---

If you want, next step we can turn this into a tiny **“feature comparison” table** for marketing copy on your sales page, using this same split.
