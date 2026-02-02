import { colord, extend } from 'colord'
import a11yPlugin from 'colord/plugins/a11y'
import mixPlugin from 'colord/plugins/mix'
import harmoniesPlugin from 'colord/plugins/harmonies'

// Extend colord with plugins
extend([a11yPlugin, mixPlugin, harmoniesPlugin])

// Get optimal contrast color (white or black)
export const getContrastColor = (hex: string): string => {
    return colord(hex).isDark() ? '#ffffff' : '#111827'
}

// Generate Palette based on strategy
export const generateTheme = (baseColor: string, strategy: 'modern' | 'bold' | 'dark'): Record<string, any> => {
    const base = colord(baseColor)
    const settings: Record<string, any> = {}

    // Common Settings
    settings.active_preset = 'custom'
    settings.input_border_focus = base.toHex()

    // Ensure Brand Content text is legible (for Split layouts)
    settings.brand_text_color = base.isDark() ? '#ffffff' : '#111827'

    // Helper: Ensure distinct active color for very light/dark colors
    if (base.isLight() && base.contrast('#ffffff') < 3) {
        settings.input_border_focus = base.darken(0.2).toHex()
    }

    switch (strategy) {
        case 'modern':
            // Modern: Very light tint background, white card
            const pastelBg = colord('#ffffff').mix(base.toHex(), 0.1).toHex()

            settings.background_mode = 'solid'
            settings.background_color = pastelBg

            settings.form_bg_color = '#ffffff'
            settings.form_shadow_enable = true
            settings.form_border_radius = 12
            settings.form_padding = 40
            settings.form_border_color = '#e2e8f0' // Neutral Slate-200 border

            settings.label_text_color = '#111827'
            settings.input_bg_color = '#ffffff'
            settings.input_border_color = '#e2e8f0' // Slate-200, strictly neutral
            settings.input_text_color = '#1e293b'

            // Button: Base color, but ensure it pops against white
            settings.button_bg = base.toHex()
            if (colord(base.toHex()).contrast('#ffffff') < 3) {
                settings.button_bg = base.darken(0.15).toHex()
            }
            settings.button_text_color = getContrastColor(settings.button_bg)

            settings.layout_mode = 'centered'
            break

        case 'bold':
            // Bold: Gradient background using accent
            settings.background_mode = 'gradient'
            settings.gradient_type = 'linear'
            settings.background_gradient_1 = base.toHex()

            const analogous = base.harmonies('analogous').map(c => c.toHex())
            settings.background_gradient_2 = analogous[1] || base.darken(0.2).toHex()
            settings.gradient_angle = 135

            settings.form_bg_color = '#ffffff'
            settings.form_shadow_enable = true
            settings.form_border_radius = 16
            // No form border for bold to let the shadow and gradient pop
            settings.form_border_color = ''
            settings.layout_mode = 'centered'

            settings.label_text_color = '#111827'

            // Fix Contrast Issue:
            // If the base color is light (e.g. Yellow), it's hard to read on White form AND white text is hard to read on it.
            let btnBg = base

            // If contrast against white form is too low, darken the button background
            if (btnBg.contrast('#ffffff') < 3) { // 3:1 is absolute minimum for graphical objects
                btnBg = btnBg.darken(0.25)
            }

            settings.button_bg = btnBg.toHex()
            settings.button_text_color = getContrastColor(settings.button_bg)

            // Also update focus ring if needed
            settings.input_border_focus = btnBg.toHex()
            break

        case 'dark':
            // Dark Mode: High Contrast "Professional" Dark
            // Avoid "muddy" tints. Keep background dark neutral, use brand for connection.

            // Background: Very dark neutral (Slate-950 approx), slight tint
            const darkBg = colord('#0f172a').mix(base.toHex(), 0.05).toHex()

            // Form: Slightly lighter (Slate-900) - No brand tint to avoid "pink border" feel
            const formBg = '#1e293b' // Slate-800 standard

            settings.background_mode = 'solid'
            settings.background_color = darkBg

            settings.form_bg_color = formBg
            // FIX: Explicitly set a neutral border color for the form card
            settings.form_border_color = '#334155' // Slate-700

            settings.form_shadow_enable = true
            settings.form_border_radius = 8

            settings.label_text_color = '#f8fafc' // Slate-50

            // Inputs: Darker slot inside the form
            settings.input_bg_color = '#0f172a' // Slate-950 (darker than form)
            settings.input_border_color = '#334155' // Slate-700 (Visible but neutral border)
            settings.input_text_color = '#ffffff'

            // Button
            settings.button_bg = base.toHex()
            // Ensure button text is readable
            if (colord(base.toHex()).contrast('#ffffff') < 3 && colord(base.toHex()).contrast('#000000') < 10) {
                // If it's a middle-brightness color that's hard to read...
                // Usually just checking contrast against white/black for text is enough
            }
            settings.button_text_color = getContrastColor(base.toHex())

            settings.layout_mode = 'centered'
            break
    }

    return settings
}
