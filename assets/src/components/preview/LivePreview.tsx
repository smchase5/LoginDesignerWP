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
        const isGlassmorphismPreset = settings.active_preset === 'glassmorphism'

        // Helper to get asset URL
        const getAssetUrl = (path: string) => {
            if (typeof window !== 'undefined' && (window as any).logindesignerwpData?.assetsUrl) {
                return (window as any).logindesignerwpData.assetsUrl + path
            }
            return ''
        }

        switch (mode) {
            case 'gradient': {
                const type = settings.gradient_type || 'linear'
                const color1 = settings.background_gradient_1 || '#667eea'
                const color2 = settings.background_gradient_2 || '#764ba2'
                const angle = settings.gradient_angle || 135
                const position = settings.gradient_position || 'center center'

                if (type === 'radial') {
                    return { background: `radial-gradient(circle at ${position}, ${color1}, ${color2})` }
                }

                if (type === 'mesh') {
                    const color3 = settings.background_gradient_3 || color1
                    const color4 = settings.background_gradient_4 || color2
                    const base = settings.background_color || '#1a1a2e'
                    return {
                        backgroundColor: base,
                        backgroundImage: `radial-gradient(at 15% 15%, ${color1}, transparent 60%), radial-gradient(at 85% 15%, ${color2}, transparent 60%), radial-gradient(at 15% 85%, ${color3}, transparent 60%), radial-gradient(at 85% 85%, ${color4}, transparent 60%)`,
                        backgroundAttachment: 'fixed',
                        backgroundSize: 'cover',
                        backgroundRepeat: 'no-repeat'
                    }
                }

                return { background: `linear-gradient(${angle}deg, ${color1}, ${color2})` }
            }
            case 'image':
                // Special handling for Glassmorphism preset default image
                if (isGlassmorphismPreset && !settings.background_image_url) {
                    const glassBgUrl = getAssetUrl('images/glassmorphism-bg.png')
                    if (glassBgUrl) {
                        return {
                            backgroundImage: `url(${glassBgUrl})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                        }
                    }
                }

                if (settings.background_image_url) {
                    return {
                        backgroundImage: `url(${settings.background_image_url})`,
                        backgroundSize: settings.background_image_size || 'cover',
                        backgroundPosition: settings.background_image_pos || 'center',
                        backgroundRepeat: settings.background_image_repeat || 'no-repeat',
                    }
                }
                return { backgroundColor: settings.background_color || '#f0f0f1' }
            default:
                // Solid
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
        const isSplitLayout = layoutMode.startsWith('split_')
        const isCardSplit = layoutMode === 'card_split'
        const isBrandLayout = isSplitLayout || isCardSplit

        // Simple layout OR Split layouts with 'simple' form style
        if (layoutMode === 'simple' || (isBrandLayout && settings.layout_form_style === 'simple')) {
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
            // Split Layout Override: Glass looks bad on the default white background of split layouts
            // Force a solid clean card style for better UX
            if (isSplitLayout) {
                return {
                    ...baseStyle,
                    backgroundColor: '#ffffff',
                    backdropFilter: 'none',
                    WebkitBackdropFilter: 'none',
                    border: 'none',
                    boxShadow: settings.form_shadow_enable ? '0 10px 25px rgba(0,0,0,0.1)' : 'none',
                }
            }

            const blur = parseRadius(settings.glass_blur, 10)
            const transparency = parseRadius(settings.glass_transparency, 80)
            const opacity = Math.max(0, Math.min(1, (100 - transparency) / 100))
            const hasBorder = settings.glass_border !== undefined ? !!settings.glass_border : true

            return {
                ...baseStyle,
                backgroundColor: `rgba(255, 255, 255, ${opacity})`,
                backdropFilter: `blur(${blur}px)`,
                WebkitBackdropFilter: `blur(${blur}px)`,
                border: hasBorder ? '1px solid rgba(255, 255, 255, 0.2)' : 'none',
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
            display: settings.brand_hide_form_logo ? 'none' : 'block',
            marginLeft: 'auto',
            marginRight: 'auto',
        }

        if (settings.logo_background_enable) {
            style.backgroundColor = settings.logo_background_color || '#ffffff'
        }

        return style
    }

    // Input styles
    const getInputStyle = (): React.CSSProperties => {
        // Override for Split + Glass -> Force standardized inputs
        const isSplitMode = settings.layout_mode?.startsWith('split_') || settings.layout_mode === 'card_split'
        const isGlassActive = settings.enable_glassmorphism || settings.glass_enabled

        if (isSplitMode && isGlassActive) {
            return {
                backgroundColor: '#f8fafc',
                border: '1px solid #cbd5e1',
                color: '#1e293b',
                borderRadius: 4,
                padding: '3px 5px',
                fontSize: 24,
                lineHeight: 1.3,
                width: '100%',
                boxSizing: 'border-box',
            }
        }

        const baseStyle: React.CSSProperties = {
            backgroundColor: settings.input_bg_color || '#ffffff',
            border: `1px solid ${settings.input_border_color || '#8c8f94'}`,
            color: settings.input_text_color || '#1e1e1e',
            borderRadius: parseRadius(settings.input_border_radius, 6),
            padding: '3px 5px',
            fontSize: 24,
            lineHeight: 1.3,
            width: '100%',
            boxSizing: 'border-box',
        }

        // Fix for specific Glassmorphism preset issue where borders might be hidden in preview
        // If glassmorphism (global or form panel) is active, ensure we can see inputs
        if (settings.enable_glassmorphism || settings.form_panel_bg_mode === 'glassmorphism') {
            // If manual border color isn't explicitly transparent, ensure it shows
        }

        return baseStyle
    }

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
        // Override for Split + Glass -> Force dark labels
        const isSplitMode = settings.layout_mode?.startsWith('split_') || settings.layout_mode === 'card_split'
        const isGlassActive = settings.enable_glassmorphism || settings.glass_enabled

        if (isSplitMode && isGlassActive) {
            return '#334155'
        }

        let color = settings.label_text_color || '#1e1e1e'

        // Simple layout contrast fix
        const layoutMode = settings.layout_mode || 'centered'
        const isSplitLayout = layoutMode.startsWith('split_') || layoutMode === 'card_split'
        const isSimpleForm = layoutMode === 'simple' || (isSplitLayout && settings.layout_form_style === 'simple')

        if (isSimpleForm) {
            let bgCheckColor = '#ffffff'

            if (isSplitLayout) {
                // Check Form Panel background
                const panelMode = settings.form_panel_bg_mode || 'solid'
                if (panelMode === 'solid') {
                    bgCheckColor = settings.form_panel_bg_color || '#ffffff'
                } else if (panelMode === 'gradient') {
                    bgCheckColor = settings.form_panel_gradient_1 || settings.background_gradient_1 || '#ffffff'
                }
            } else {
                // Standard Simple Layout
                bgCheckColor = settings.background_color || '#ffffff'
                if (settings.background_mode === 'gradient' && settings.background_gradient_1) {
                    bgCheckColor = settings.background_gradient_1
                }
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
                <div className="absolute top-3 left-3 z-50">
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
                            maxWidth: settings.layout_form_width ? `${settings.layout_form_width}px` : '360px',
                            margin: '0 auto',
                            position: 'relative',
                            zIndex: 10
                        }}>
                            <div id="login" className="lp-form">
                                {/* Logo (Show above form if NOT using brand content logo in future) */}
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

                                    {/* Social Login Buttons */}
                                    {(!!settings.google_login_enable || !!settings.github_login_enable) && (
                                        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                                            {/* Google */}
                                            {!!settings.google_login_enable && (
                                                <button type="button" style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 10,
                                                    width: '100%',
                                                    padding: '10px',
                                                    backgroundColor: '#ffffff',
                                                    border: '1px solid #ddd',
                                                    borderRadius: '4px',
                                                    color: '#555',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}>
                                                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
                                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                                    </svg>
                                                    Sign in with Google
                                                </button>
                                            )}

                                            {/* GitHub */}
                                            {!!settings.github_login_enable && (
                                                <button type="button" style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 10,
                                                    width: '100%',
                                                    padding: '10px',
                                                    backgroundColor: '#24292e',
                                                    border: '1px solid #24292e',
                                                    borderRadius: '4px',
                                                    color: '#ffffff',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                                }}>
                                                    <svg viewBox="0 0 24 24" style={{ width: 18, height: 18, fill: 'currentColor' }}>
                                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                                    </svg>
                                                    Sign in with GitHub
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Links */}
                            {(() => {
                                let linkColor = settings.below_form_link_color

                                // Contrast analysis
                                const layoutMode = settings.layout_mode || 'centered'
                                const isCardSplit = layoutMode === 'card_split'
                                const isSplit = layoutMode.startsWith('split_')

                                let bgCheckColor = '#ffffff'
                                let isImageBackground = false

                                if (isCardSplit) {
                                    bgCheckColor = '#ffffff'
                                } else if (isSplit) {
                                    const panelMode = settings.form_panel_bg_mode || 'solid'
                                    if (panelMode === 'solid') {
                                        bgCheckColor = settings.form_panel_bg_color || '#ffffff'
                                    } else if (panelMode === 'gradient') {
                                        bgCheckColor = settings.form_panel_gradient_1 || '#ffffff'
                                    } else if (panelMode === 'image') {
                                        isImageBackground = true
                                    }
                                } else {
                                    const bgMode = settings.background_mode || 'solid'
                                    if (bgMode === 'solid') {
                                        bgCheckColor = settings.background_color || '#f0f0f1'
                                    } else if (bgMode === 'gradient') {
                                        bgCheckColor = settings.background_gradient_1 || settings.background_color || '#f0f0f1'
                                    } else if (bgMode === 'image') {
                                        isImageBackground = true
                                    }
                                }

                                // Helper to check if color is light
                                const isLight = (hex: string) => {
                                    try {
                                        return getPerceivedBrightness(hex.includes('rgb') ? '#ffffff' : hex) > 130
                                    } catch (e) { return true }
                                }

                                const bgIsDark = !isLight(bgCheckColor)

                                // Determine final link color
                                if (isImageBackground) {
                                    // For images, we can't easily adhere to a specific color unless it has a strong shadow,
                                    // but white is generally safest with a shadow.
                                    // If the user deliberately picked a color, we try to honor it but ADD a shadow.
                                    // However, if it's dark text on a dark image, it fails. 
                                    // Safety fallback: If user set a DARK color, but we don't know the image, potentially risky.
                                    // Best UX: Default to white for AI/Images unless explicitly overridden by user manually (hard to detect manual vs AI).
                                    // We'll enforce white if the provided color is seemingly dark or default.
                                    if (!linkColor || !isLight(linkColor)) {
                                        linkColor = '#ffffff'
                                    }
                                } else {
                                    // Solid/Gradient Backgrounds
                                    if (bgIsDark) {
                                        // Background is Dark. Link MUST be Light.
                                        if (linkColor && !isLight(linkColor)) {
                                            linkColor = '#ffffff' // Override bad contrast
                                        } else if (!linkColor) {
                                            linkColor = '#ffffff' // Default to white
                                        }
                                    } else {
                                        // Background is Light. Link MUST be Dark.
                                        if (linkColor && isLight(linkColor)) {
                                            linkColor = '#444444' // Override bad contrast (light on light)
                                        } else if (!linkColor) {
                                            linkColor = '#444444' // Default to dark
                                        }
                                    }
                                }

                                const textShadow = isImageBackground ? '0 1px 4px rgba(0,0,0,0.9)' : 'none'

                                return (
                                    <div className="logindesignerwp-preview-links" style={{
                                        textAlign: 'center',
                                        marginTop: 16,
                                        fontSize: 13,
                                        display: 'block',
                                        position: 'relative',
                                        zIndex: 20,
                                        textShadow: textShadow
                                    }}>
                                        <div style={{ marginBottom: 10 }}>
                                            <a href="#" style={{ color: linkColor, textDecoration: 'underline', opacity: 0.9 }}>
                                                Lost your password?
                                            </a>
                                        </div>
                                        <div>
                                            <a href="#" style={{ color: linkColor, textDecoration: 'none', opacity: 0.9 }}>
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
                        // Determine effective style
                        const style: React.CSSProperties = {
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center', // Default center, setting.brand_content_align handles text
                            padding: '2rem',
                            color: '#ffffff'
                        }

                        // Use centralized background logic for Brand Column (Supports Mesh, Gradient, Image, Solid)
                        const bgStyle = getBackgroundStyle()
                        if (bgStyle.background) style.background = bgStyle.background
                        if (bgStyle.backgroundColor) style.backgroundColor = bgStyle.backgroundColor
                        if (bgStyle.backgroundImage) style.backgroundImage = bgStyle.backgroundImage
                        if (bgStyle.backgroundSize) style.backgroundSize = bgStyle.backgroundSize
                        if (bgStyle.backgroundPosition) style.backgroundPosition = bgStyle.backgroundPosition
                        if (bgStyle.backgroundRepeat) style.backgroundRepeat = bgStyle.backgroundRepeat
                        if (bgStyle.backgroundAttachment) style.backgroundAttachment = bgStyle.backgroundAttachment

                        // Fallback only if absolutely no background is present
                        if (!style.background && !style.backgroundImage && !style.backgroundColor) {
                            style.backgroundImage = `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
                        }

                        return (
                            <div className="w-full h-full relative flex items-center justify-center" style={style}>
                                {!!settings.background_blur && settings.background_blur > 0 && (
                                    <div className="absolute inset-0 z-0 backdrop-blur-sm"
                                        style={{ backdropFilter: `blur(${settings.background_blur}px)` }}
                                    />
                                )}
                                {!!settings.background_overlay_enable && (
                                    <div className="absolute inset-0 z-10"
                                        style={{
                                            backgroundColor: settings.background_overlay_color || '#000000',
                                            opacity: (parseInt(settings.background_overlay_opacity) || 50) / 100
                                        }}
                                    />
                                )}

                                {/* Brand Content Overlay */}
                                {!!settings.brand_content_enable && (
                                    <div className="relative z-20 w-full max-w-md space-y-6 text-center flex flex-col items-center">
                                        {/* Brand Logo */}
                                        {settings.brand_logo_url && (
                                            <img
                                                src={settings.brand_logo_url}
                                                alt={settings.brand_title || 'Brand Logo'}
                                                className="h-auto max-w-[200px] object-contain mb-2 drop-shadow-sm"
                                                style={settings.brand_logo_bg_enable ? {
                                                    backgroundColor: settings.brand_logo_bg_color || '#ffffff',
                                                    padding: 10,
                                                    borderRadius: (({
                                                        'square': 0,
                                                        'rounded': 10,
                                                        'soft': 25,
                                                        'full': 100
                                                    } as Record<string, number>)[settings.brand_logo_radius_preset as string || 'square']) ?? 0,
                                                    boxSizing: 'content-box'
                                                } : {}}
                                            />
                                        )}

                                        {/* Render Title/Subtitle if enabled */}
                                        <div className="relative z-10 w-full max-w-sm text-center">
                                            <h2
                                                className="text-3xl font-bold tracking-tight mb-4 font-sans drop-shadow-sm"
                                                style={{ color: settings.brand_text_color || '#ffffff' }}
                                            >
                                                {settings.brand_title || 'Welcome Back'}
                                            </h2>
                                            <p
                                                className="text-lg opacity-90 leading-relaxed font-sans drop-shadow-sm"
                                                style={{ color: settings.brand_text_color || '#ffffff' }}
                                            >
                                                {settings.brand_subtitle || 'Log in to access your account.'}
                                            </p>
                                        </div>
                                    </div>
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
                        } else if (mode === 'gradient') {
                            const type = settings.form_panel_gradient_type || 'linear'
                            const color1 = settings.form_panel_gradient_1 || '#ffffff'
                            const color2 = settings.form_panel_gradient_2 || '#f0f0f1'
                            const angle = settings.form_panel_gradient_angle || 135

                            if (type === 'radial') {
                                style.background = `radial-gradient(circle, ${color1}, ${color2})`
                            } else {
                                style.background = `linear-gradient(${angle}deg, ${color1}, ${color2})`
                            }
                        } else if (mode === 'glassmorphism') {
                            // Frosted glass effect (Code kept for fallback but option removed from UI)
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

                    // Layout Logic
                    const isSplitLayout = layoutMode.startsWith('split_')
                    const isCardSplit = layoutMode === 'card_split'
                    const showBrand = isSplitLayout || isCardSplit

                    // CARD SPLIT LAYOUT SPECIFIC STRUCTURE
                    if (isCardSplit) {
                        return (
                            <div
                                className="w-full h-full min-h-[550px] relative transition-all duration-300 flex items-center justify-center p-8 overflow-hidden"
                            >
                                {/* Background for the whole screen (using brand background logic or separate?)
                                    Usually card split implies a neutral background behind the card,
                                    and the CARD itself is split.
                                */}
                                <div className="absolute inset-0 -z-10 bg-gray-100"></div>

                                <div className="flex w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden h-[600px]">
                                    {/* Left Side (Brand) */}
                                    <div className="relative bg-blue-600" style={{ width: `${splitRatio}%` }}>
                                        {getBrandContent()}
                                    </div>

                                    {/* Right Side (Form) */}
                                    <div className="p-8 flex items-center justify-center bg-white" style={{ width: `${100 - Number(splitRatio)}%` }}>
                                        {FormContent}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    // STANDARD LAYOUTS (Centered, Split Left, Split Right, Simple)
                    return (
                        <div
                            className={`${shellClasses} is-preview-mode w-full h-full min-h-[550px] relative transition-all duration-300`}
                            style={cssVariables}
                        >
                            {/* Brand Slot - Only visible in split layouts */}
                            {showBrand && (
                                <div className="lp-brand">
                                    {getBrandContent()}
                                </div>
                            )}

                            {/* Main Slot (Form) */}
                            <div
                                className="lp-main relative z-10 transition-all duration-300"
                                style={(isSplitLayout && !isCardSplit) ? getFormPanelStyle() : undefined}
                            >
                                {/* Centered/Card layout: show background behind form */}
                                {!showBrand && (
                                    <div className="absolute inset-0 -z-10" style={getBackgroundStyle()}>
                                        {/* Background Blur */}
                                        {!!settings.background_blur && settings.background_blur > 0 && (
                                            <div className="absolute inset-0 z-0 backdrop-blur-sm"
                                                style={{ backdropFilter: `blur(${settings.background_blur}px)` }}
                                            />
                                        )}
                                        {/* Background Overlay */}
                                        {!!settings.background_overlay_enable && (
                                            <div className="absolute inset-0 z-10"
                                                style={{
                                                    backgroundColor: settings.background_overlay_color || '#000000',
                                                    opacity: (parseInt(settings.background_overlay_opacity) || 50) / 100
                                                }}
                                            />
                                        )}
                                    </div>
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
