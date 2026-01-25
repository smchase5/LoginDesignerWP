import { RotateCcw, Save, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface LivePreviewProps {
    settings: Record<string, any>
    hasUnsavedChanges?: boolean
    onDiscard?: () => void
    onSave?: () => void
    isSaving?: boolean
    loginUrl?: string
    securitySettings?: {
        enabled: boolean
        method: 'basic' | 'turnstile' | 'recaptcha'
        basic_math: boolean
        basic_honeypot: boolean
    }
}

export function LivePreview({
    settings,
    hasUnsavedChanges = false,
    onDiscard,
    onSave,
    isSaving = false,
    loginUrl = '/wp-login.php',
    securitySettings
}: LivePreviewProps) {
    // Build background styles
    const getBackgroundStyle = (): React.CSSProperties => {
        const mode = settings.background_mode || 'solid'

        switch (mode) {
            case 'gradient': {
                const type = settings.gradient_type || 'linear'
                const color1 = settings.background_gradient_1 || '#667eea'
                const color2 = settings.background_gradient_2 || '#764ba2'
                const angle = settings.gradient_angle || 135

                if (type === 'radial') {
                    return { background: `radial-gradient(circle, ${color1}, ${color2})` }
                }
                return { background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }
            }
            case 'image':
                if (settings.background_image_url) {
                    return {
                        backgroundImage: `url(${settings.background_image_url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                    }
                }
                return { backgroundColor: settings.background_color || '#f0f0f1' }
            default:
                return { backgroundColor: settings.background_color || '#f0f0f1' }
        }
    }

    // Helper to robustly parse radius
    const parseRadius = (value: any, defaultValue: number = 0): number => {
        if (value === undefined || value === null || value === '') return defaultValue
        const parsed = parseFloat(String(value))
        return isNaN(parsed) ? defaultValue : parsed
    }

    // Form container styles
    const getFormStyle = (): React.CSSProperties => {
        const layoutMode = settings.layout_mode || 'centered'

        // Simple layout: no form box styling at all
        if (layoutMode === 'simple') {
            return {
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box',
                position: 'relative',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: 0,
                boxShadow: 'none',
                padding: 0,
                margin: 0,
            }
        }

        const cornerRadiusMap: Record<string, number> = {
            'none': 0,
            'small': 4,
            'medium': 8,
            'large': 12,
            'rounded': 24,
        }

        // Prioritize strict numeric setting, fallback to corner style map
        // Default fallback should be 0 (none) to match legacy wizard defaults
        let cornerRadius = 0
        if (settings.form_border_radius !== undefined && settings.form_border_radius !== '') {
            cornerRadius = parseRadius(settings.form_border_radius, 0)
        } else {
            cornerRadius = cornerRadiusMap[settings.form_corner_style || 'none'] || 0
        }

        const baseStyle: React.CSSProperties = {
            borderRadius: cornerRadius,
            padding: `${settings.form_padding || 26}px`,
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box',
            position: 'relative',
            backgroundColor: settings.form_bg_color || '#ffffff',
            border: settings.form_border_color ? `1px solid ${settings.form_border_color}` : 'none',
            boxShadow: settings.form_shadow_enable ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
        }

        if (settings.enable_glassmorphism || settings.glass_enabled) {
            return {
                ...baseStyle,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            }
        }

        return baseStyle
    }

    // Logo styles
    const getLogoStyle = (): React.CSSProperties => {
        const logoUrl = settings.logo_image_url
        const logoColor = (settings.label_text_color || '#1e1e1e').replace('#', '')

        // Default WordPress logo SVG
        const defaultSvg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 122.52 122.523'%3E%3Cpath fill='%23${logoColor}' d='M8.708 61.26c0 20.802 12.089 38.779 29.619 47.298L13.258 39.872a52.354 52.354 0 00-4.55 21.388zM96.74 58.608c0-6.495-2.333-10.993-4.334-14.494-2.664-4.329-5.161-7.995-5.161-12.324 0-4.831 3.664-9.328 8.825-9.328.233 0 .454.029.681.042-9.35-8.566-21.807-13.796-35.489-13.796-18.36 0-34.513 9.42-43.91 23.688 1.233.037 2.395.063 3.382.063 5.497 0 14.006-.667 14.006-.667 2.833-.167 3.167 3.994.337 4.329 0 0-2.847.335-6.015.501L48.2 93.547l11.501-34.493-8.188-22.434c-2.83-.166-5.511-.501-5.511-.501-2.832-.166-2.5-4.496.332-4.329 0 0 8.679.667 13.843.667 5.496 0 14.006-.667 14.006-.667 2.835-.167 3.168 3.994.337 4.329 0 0-2.853.335-6.015.501l18.992 56.494 5.242-17.517c2.272-7.269 4.001-12.49 4.001-16.989z'/%3E%3Cpath fill='%23${logoColor}' d='M62.184 65.857l-15.768 45.819a52.552 52.552 0 0032.29-.838 4.693 4.693 0 01-.37-.712L62.184 65.857zM107.376 36.046a42.584 42.584 0 01.358 5.708c0 5.651-1.057 12.002-4.229 19.94l-16.973 49.082c16.519-9.627 27.618-27.628 27.618-48.18 0-9.762-2.499-18.929-6.774-26.55z'/%3E%3Cpath fill='%23${logoColor}' d='M61.262 0C27.483 0 0 27.481 0 61.26c0 33.783 27.483 61.263 61.262 61.263 33.778 0 61.265-27.48 61.265-61.263C122.526 27.481 95.04 0 61.262 0zm0 119.715c-32.23 0-58.453-26.223-58.453-58.455 0-32.23 26.222-58.451 58.453-58.451 32.229 0 58.45 26.221 58.45 58.451 0 32.232-26.221 58.455-58.45 58.455z'/%3E%3C/svg%3E`

        const style: React.CSSProperties = {
            width: settings.logo_width || 84,
            height: settings.logo_height || 84,
            backgroundImage: logoUrl ? `url(${logoUrl})` : `url("${defaultSvg}")`,
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundOrigin: 'content-box',
            padding: settings.logo_padding || 0,
            borderRadius: settings.logo_border_radius || 0,
            marginBottom: settings.logo_bottom_margin || 25,
            display: 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
        }

        if (settings.logo_background_enable) {
            style.backgroundColor = settings.logo_background_color || '#ffffff'
        }

        return style
    }

    // Input styles
    const getInputStyle = (): React.CSSProperties => ({
        backgroundColor: settings.input_bg_color || '#ffffff',
        border: `1px solid ${settings.input_border_color || '#8c8f94'}`,
        color: settings.input_text_color || '#1e1e1e',
        borderRadius: 4,
        padding: '3px 5px',
        fontSize: 24,
        lineHeight: 1.3,
        width: '100%',
        boxSizing: 'border-box',
    })

    // Button styles
    const getButtonStyle = (): React.CSSProperties => ({
        backgroundColor: settings.button_bg || settings.button_color || '#2271b1',
        color: '#fff',
        border: 'none',
        borderRadius: parseRadius(settings.button_border_radius, 3),
        padding: '0 12px',
        height: 36,
        fontSize: 13,
        fontWeight: 500,
        cursor: 'pointer',
        lineHeight: '36px',
        textAlign: 'center',
    })

    // Helper to calculate brightness
    const getPerceivedBrightness = (hex: string): number => {
        hex = hex.replace('#', '')
        if (hex.length === 3) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
        }
        const r = parseInt(hex.substring(0, 2), 16)
        const g = parseInt(hex.substring(2, 4), 16)
        const b = parseInt(hex.substring(4, 6), 16)
        return ((r * 299) + (g * 587) + (b * 114)) / 1000
    }

    // Helper to determine label color based on layout and contrast
    const getLabelColor = (): string => {
        let color = settings.label_text_color || '#1e1e1e'

        // Simple layout contrast fix
        if (settings.layout_mode === 'simple') {
            let bgCheckColor = settings.background_color || '#ffffff'

            if (settings.background_mode === 'gradient' && settings.background_gradient_1) {
                bgCheckColor = settings.background_gradient_1
            }

            const brightness = getPerceivedBrightness(bgCheckColor)

            if (brightness < 140) {
                color = '#ffffff'
            } else {
                color = '#111827'
            }
        }
        return color
    }

    // Label styles
    const getLabelStyle = (): React.CSSProperties => {
        return {
            color: getLabelColor(),
            fontSize: 14,
            fontWeight: 600,
            marginBottom: 3,
            display: 'block',
        }
    }

    return (
        <div className="sticky top-12 h-[calc(100vh-6rem)] border-l border-border/50 bg-muted/10 rounded-lg overflow-hidden flex flex-col shadow-sm">
            {/* Preview Container with Badge Inside */}
            <div
                className="relative rounded-lg overflow-hidden border border-border shadow-lg"
                style={{ minHeight: 550 }}
            >
                {/* Preview Badge - Inside at Top Left */}
                <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center gap-2 text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1.5 rounded-full shadow-sm border border-gray-200">
                        <span className={`w-2 h-2 rounded-full ${hasUnsavedChanges ? 'bg-amber-500' : 'bg-green-500'}`}></span>
                        Preview
                        <span className="text-gray-400">·</span>
                        <span className={hasUnsavedChanges ? 'text-amber-600' : 'text-green-600'}>
                            {hasUnsavedChanges ? 'Unsaved' : 'Saved'}
                        </span>
                        {hasUnsavedChanges && onDiscard && (
                            <button
                                onClick={onDiscard}
                                className="ml-1 p-0.5 text-red-500 hover:text-red-700 transition-colors"
                                title="Discard Changes"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </span>
                </div>

                {/* Content Rendering based on Layout Mode */}
                {(() => {
                    const layoutMode = settings.layout_mode || 'centered'

                    // Layout variables from settings
                    const splitRatio = settings.layout_split_ratio || '50'
                    const verticalAlign = settings.layout_vertical_align || 'center'
                    const density = settings.layout_density || 'normal'

                    // Build unified class string
                    let shellClasses = `lp-shell layout--${layoutMode}`
                    if (density !== 'normal') shellClasses += ` density--${density}`
                    if (verticalAlign !== 'center') shellClasses += ` align--${verticalAlign}`

                    // Reusable Login Form Content
                    const FormContent = (
                        <div className="lp-content-wrap" style={{
                            width: '100%',
                            maxWidth: settings.layout_max_width ? `${settings.layout_max_width}px` : '320px',
                            margin: '0 auto',
                            position: 'relative',
                            zIndex: 10
                        }}>
                            <div id="login" className="lp-form">
                                {/* Logo */}
                                <div style={getLogoStyle()} />

                                {/* Form */}
                                <div style={getFormStyle()}>
                                    {/* Username Field */}
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={getLabelStyle()}>Username or Email</label>
                                        <input
                                            type="text"
                                            readOnly
                                            style={getInputStyle()}
                                        />
                                    </div>

                                    {/* Password Field */}
                                    <div style={{ marginBottom: 16 }}>
                                        <label style={getLabelStyle()}>Password</label>
                                        <input
                                            type="password"
                                            value="••••••••"
                                            readOnly
                                            style={getInputStyle()}
                                        />
                                    </div>

                                    {/* Security Widgets */}
                                    {securitySettings?.enabled && (
                                        <div style={{ marginBottom: 16 }}>
                                            {/* Math Challenge */}
                                            {securitySettings.method === 'basic' && securitySettings.basic_math && (
                                                <div style={{ marginBottom: 16 }}>
                                                    <label style={getLabelStyle()}>7 + 5 = ?</label>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        className="w-20"
                                                        style={{ ...getInputStyle(), width: '80px' }}
                                                    />
                                                </div>
                                            )}

                                            {/* Turnstile Placeholder */}
                                            {securitySettings.method === 'turnstile' && (
                                                <div style={{
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '4px',
                                                    padding: '12px',
                                                    backgroundColor: '#fafafa',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '12px',
                                                    marginBottom: 16
                                                }}>
                                                    <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid #ccc', borderTopColor: '#000', animation: 'spin 1s linear infinite' }} />
                                                    <span style={{ fontSize: 13, color: '#4b5563' }}>Verifying...</span>
                                                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#9ca3af' }}>Cloudflare</span>
                                                </div>
                                            )}

                                            {/* reCAPTCHA Placeholder */}
                                            {securitySettings.method === 'recaptcha' && (
                                                <div style={{
                                                    border: '1px solid #d1d5db',
                                                    borderRadius: '3px',
                                                    padding: '12px',
                                                    backgroundColor: '#f9f9f9',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    marginBottom: 16,
                                                    height: 74,
                                                    boxSizing: 'border-box'
                                                }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                        <div style={{ width: 24, height: 24, border: '2px solid #c1c1c1', borderRadius: 2, backgroundColor: '#fff' }} />
                                                        <span style={{ fontSize: 14, color: '#222' }}>I'm not a robot</span>
                                                    </div>
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                        <img
                                                            src="https://www.gstatic.com/recaptcha/api2/logo_48.png"
                                                            alt="reCAPTCHA"
                                                            style={{ width: 24, height: 24, opacity: 0.5 }}
                                                        />
                                                        <span style={{ fontSize: 10, color: '#555' }}>reCAPTCHA</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Remember Me + Submit Row */}
                                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: getLabelColor() }}>
                                            <input type="checkbox" readOnly />
                                            Remember Me
                                        </label>
                                        <button type="button" style={getButtonStyle()}>
                                            Log In
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Links (Lost Password & Back to Site) */}
                            {(() => {
                                let linkColor = settings.below_form_link_color || '#50575e'

                                // Simple layout contrast fix
                                if (settings.layout_mode === 'simple') {
                                    let bgCheckColor = settings.background_color || '#ffffff'
                                    if (settings.background_mode === 'gradient' && settings.background_gradient_1) {
                                        bgCheckColor = settings.background_gradient_1
                                    }

                                    const brightness = getPerceivedBrightness(bgCheckColor)
                                    if (brightness < 140) {
                                        linkColor = '#ffffff'
                                    } else {
                                        linkColor = '#111827'
                                    }
                                }

                                return (
                                    <div className="logindesignerwp-preview-links" style={{
                                        textAlign: 'center',
                                        marginTop: 16,
                                        fontSize: 13,
                                        display: settings.hide_footer_links ? 'none' : 'block'
                                    }}>
                                        <div style={{ marginBottom: 10 }}>
                                            <a href="#" style={{ color: linkColor, textDecoration: 'none' }}>
                                                Lost your password?
                                            </a>
                                        </div>
                                        <div>
                                            <a href="#" style={{ color: linkColor, textDecoration: 'none' }}>
                                                &larr; Go to Site
                                            </a>
                                        </div>
                                    </div>
                                )
                            })()}

                            {/* Custom Message (Below Links) */}
                            {settings.custom_message && (
                                <div style={{
                                    marginTop: 16,
                                    padding: '12px',
                                    backgroundColor: '#fff',
                                    borderLeft: `4px solid ${settings.button_bg || settings.button_color || '#2271b1'}`,
                                    boxShadow: '0 1px 1px 0 rgba(0,0,0,.1)',
                                    fontSize: 13,
                                    color: '#444',
                                    borderRadius: parseRadius(settings.form_border_radius, 0) / 2,
                                    position: 'relative',
                                    zIndex: 10
                                }}>
                                    {settings.custom_message}
                                </div>
                            )}
                        </div>
                    )

                    // Helper to get brand content (backgrounds)
                    const getBrandContent = () => {
                        const hasImage = settings.background_mode === 'image' && settings.background_image_url
                        const isGradient = settings.background_mode === 'gradient'
                        const isSolid = settings.background_mode === 'solid'

                        // Determine effective style
                        const style: React.CSSProperties = {}

                        if (hasImage) {
                            style.backgroundImage = `url(${settings.background_image_url})`
                            style.backgroundSize = 'cover'
                            style.backgroundPosition = 'center'
                        } else if (isGradient || isSolid) {
                            // Apply solid or gradient background
                            const bgStyle = getBackgroundStyle()
                            if (bgStyle.background) style.background = bgStyle.background
                            if (bgStyle.backgroundColor) style.backgroundColor = bgStyle.backgroundColor
                        } else {
                            // Default fallback pattern for "Dual Background" requirement
                            // Only if absolutely no background setting is active
                            style.backgroundImage = `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                        }

                        return (
                            <div className="w-full h-full relative" style={style}>
                                {!!settings.background_blur && settings.background_blur > 0 && (
                                    <div className="absolute inset-0 backdrop-blur-sm"
                                        style={{ backdropFilter: `blur(${settings.background_blur}px)` }}
                                    />
                                )}
                                {!!settings.background_overlay_enable && (
                                    <div className="absolute inset-0"
                                        style={{
                                            backgroundColor: settings.background_overlay_color || '#000000',
                                            opacity: (parseInt(settings.background_overlay_opacity) || 50) / 100
                                        }}
                                    />
                                )}
                            </div>
                        )
                    }

                    // CSS Variable Injection for dynamic layout props
                    const cssVariables: React.CSSProperties = {
                        '--lp-brand-width': `${splitRatio}%`,
                    } as React.CSSProperties

                    // Helper to get Form Panel background style (for advanced layouts)
                    const getFormPanelStyle = (): React.CSSProperties => {
                        const mode = settings.form_panel_bg_mode || 'solid'
                        const style: React.CSSProperties = {}

                        if (mode === 'solid') {
                            style.backgroundColor = settings.form_panel_bg_color || '#ffffff'
                        } else if (mode === 'image') {
                            // Use separate form panel image
                            if (settings.form_panel_image_url) {
                                style.backgroundImage = `url(${settings.form_panel_image_url})`
                                style.backgroundSize = 'cover'
                                style.backgroundPosition = 'center'
                            } else {
                                // Fallback to white if no image selected
                                style.backgroundColor = '#ffffff'
                            }
                        } else if (mode === 'glassmorphism') {
                            // Frosted glass effect
                            style.backgroundColor = 'rgba(255, 255, 255, 0.15)'
                            style.backdropFilter = 'blur(10px)'
                            style.WebkitBackdropFilter = 'blur(10px)'
                            style.border = '1px solid rgba(255, 255, 255, 0.25)'
                        }

                        // Shadow
                        if (settings.form_panel_shadow ?? true) {
                            style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.15)'
                        }

                        return style
                    }

                    // We remove ScaledWrapper to prevent visual artifacts.
                    // Instead, we rely on responsive CSS and the .is-preview-mode class.

                    // For our 4 layouts (centered, split_left, split_right, card):
                    // - Centered & Card: lp-brand is hidden via CSS
                    // - Split: lp-brand shows the background image
                    // - Card: lp-content-wrap gets card styling via CSS

                    const isSplitLayout = layoutMode.startsWith('split_')

                    return (
                        <div
                            className={`${shellClasses} is-preview-mode w-full h-full min-h-[550px] relative transition-all duration-300`}
                            style={cssVariables}
                        >
                            {/* Brand Slot - Only visible in split layouts */}
                            <div className="lp-brand">
                                {getBrandContent()}
                            </div>

                            {/* Main Slot (Form) */}
                            <div
                                className="lp-main relative z-10 transition-all duration-300"
                                style={isSplitLayout ? getFormPanelStyle() : undefined}
                            >
                                {/* Centered/Card layout: show background behind form */}
                                {!isSplitLayout && (
                                    <div className="absolute inset-0 -z-10" style={getBackgroundStyle()}></div>
                                )}

                                {FormContent}
                            </div>
                        </div>
                    )
                })()}
            </div>

            {/* Action Buttons Below Preview */}
            <div className="flex items-center gap-3 mt-4">
                <Button
                    variant="wp"
                    onClick={onSave}
                    disabled={isSaving || !hasUnsavedChanges}
                    className="gap-2 flex-1"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" asChild className="gap-2 flex-1">
                    <a href={loginUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        View Login Page
                    </a>
                </Button>
            </div>
        </div>
    )
}
