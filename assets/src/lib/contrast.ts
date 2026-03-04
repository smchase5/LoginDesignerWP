import { getLayoutMode, isSplitLayoutMode, isSimpleLayout } from '@/lib/layout'

type RGB = {
    r: number
    g: number
    b: number
    a: number
}

type ContrastIssue = {
    id: 'label_text_color' | 'below_form_link_color' | 'input_text_color' | 'button_text_color'
    label: string
    foreground: string
    surfaceLabel: string
    ratio: number
    minimum: number
}

type ContrastAudit = {
    issues: ContrastIssue[]
    fixes: Record<string, string>
    approximate: boolean
}

const LIGHT_TEXT = '#ffffff'
const DARK_TEXT = '#111827'
const MINIMUM_RATIO = 4.5

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value))
}

function parseHexColor(value: string): RGB | null {
    const hex = value.replace('#', '').trim()

    if (hex.length === 3) {
        const [r, g, b] = hex.split('')
        return {
            r: parseInt(r + r, 16),
            g: parseInt(g + g, 16),
            b: parseInt(b + b, 16),
            a: 1,
        }
    }

    if (hex.length === 6 || hex.length === 8) {
        return {
            r: parseInt(hex.slice(0, 2), 16),
            g: parseInt(hex.slice(2, 4), 16),
            b: parseInt(hex.slice(4, 6), 16),
            a: hex.length === 8 ? clamp(parseInt(hex.slice(6, 8), 16) / 255, 0, 1) : 1,
        }
    }

    return null
}

function parseRgbColor(value: string): RGB | null {
    const match = value.match(/rgba?\(([^)]+)\)/i)
    if (!match) {
        return null
    }

    const parts = match[1].split(',').map((part) => part.trim())
    if (parts.length < 3) {
        return null
    }

    return {
        r: clamp(Number(parts[0]), 0, 255),
        g: clamp(Number(parts[1]), 0, 255),
        b: clamp(Number(parts[2]), 0, 255),
        a: parts[3] !== undefined ? clamp(Number(parts[3]), 0, 1) : 1,
    }
}

function parseColor(value: unknown): RGB | null {
    if (typeof value !== 'string' || value.trim() === '') {
        return null
    }

    const normalized = value.trim()
    if (normalized.startsWith('#')) {
        return parseHexColor(normalized)
    }

    if (normalized.startsWith('rgb')) {
        return parseRgbColor(normalized)
    }

    return null
}

function compositeColor(foreground: RGB, background: RGB): RGB {
    const alpha = clamp(foreground.a, 0, 1)
    const inverse = 1 - alpha

    return {
        r: Math.round(foreground.r * alpha + background.r * inverse),
        g: Math.round(foreground.g * alpha + background.g * inverse),
        b: Math.round(foreground.b * alpha + background.b * inverse),
        a: 1,
    }
}

function normalizeColor(value: unknown, fallback: RGB): RGB {
    const parsed = parseColor(value)
    if (!parsed) {
        return fallback
    }

    if (parsed.a >= 1) {
        return { ...parsed, a: 1 }
    }

    return compositeColor(parsed, fallback)
}

function channelToLinear(channel: number) {
    const normalized = channel / 255
    return normalized <= 0.03928
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4
}

function luminance(color: RGB) {
    return (
        0.2126 * channelToLinear(color.r) +
        0.7152 * channelToLinear(color.g) +
        0.0722 * channelToLinear(color.b)
    )
}

function contrastRatio(foreground: RGB, background: RGB) {
    const light = Math.max(luminance(foreground), luminance(background))
    const dark = Math.min(luminance(foreground), luminance(background))
    return (light + 0.05) / (dark + 0.05)
}

function minContrastRatio(foreground: unknown, backgrounds: RGB[]) {
    return backgrounds.reduce((lowest, background) => {
        return Math.min(lowest, contrastRatio(normalizeColor(foreground, background), background))
    }, Number.POSITIVE_INFINITY)
}

function averageColors(colors: RGB[]) {
    const total = colors.length || 1
    return {
        r: Math.round(colors.reduce((sum, color) => sum + color.r, 0) / total),
        g: Math.round(colors.reduce((sum, color) => sum + color.g, 0) / total),
        b: Math.round(colors.reduce((sum, color) => sum + color.b, 0) / total),
        a: 1,
    }
}

function getSurfaceCandidates(settings: Record<string, any>, source: 'page' | 'form-panel'): { colors: RGB[], approximate: boolean } {
    const fallback = parseColor('#ffffff')!

    if (source === 'form-panel') {
        const mode = settings.form_panel_bg_mode || 'solid'
        if (mode === 'gradient') {
            return {
                colors: [
                    normalizeColor(settings.form_panel_gradient_1 || '#ffffff', fallback),
                    normalizeColor(settings.form_panel_gradient_2 || '#f0f0f1', fallback),
                ],
                approximate: false,
            }
        }

        if (mode === 'image') {
            return {
                colors: [normalizeColor(settings.form_panel_bg_color || '#ffffff', fallback)],
                approximate: true,
            }
        }

        return {
            colors: [normalizeColor(settings.form_panel_bg_color || '#ffffff', fallback)],
            approximate: false,
        }
    }

    const mode = settings.background_mode || 'solid'

    if (mode === 'gradient') {
        if (settings.gradient_type === 'mesh') {
            return {
                colors: [
                    normalizeColor(settings.background_color || '#1a1a2e', fallback),
                    normalizeColor(settings.background_gradient_1 || '#f0f0f1', fallback),
                    normalizeColor(settings.background_gradient_2 || '#c3c4c7', fallback),
                    normalizeColor(settings.background_gradient_3 || '#dcdcde', fallback),
                    normalizeColor(settings.background_gradient_4 || settings.background_gradient_2 || '#c3c4c7', fallback),
                ],
                approximate: false,
            }
        }

        return {
            colors: [
                normalizeColor(settings.background_gradient_1 || '#f0f0f1', fallback),
                normalizeColor(settings.background_gradient_2 || '#c3c4c7', fallback),
            ],
            approximate: false,
        }
    }

    if (mode === 'image') {
        const base = normalizeColor(settings.background_color || '#f0f0f1', fallback)

        if (settings.background_overlay_enable) {
            const overlay = parseColor(settings.background_overlay_color || '#000000')
            if (overlay) {
                const opacity = clamp(Number(settings.background_overlay_opacity ?? 50) / 100, 0, 1)
                return {
                    colors: [compositeColor({ ...overlay, a: opacity }, base)],
                    approximate: true,
                }
            }
        }

        return {
            colors: [base],
            approximate: true,
        }
    }

    return {
        colors: [normalizeColor(settings.background_color || '#f0f0f1', fallback)],
        approximate: false,
    }
}

function deriveCardSplitBackground(formColor: unknown) {
    const normalized = normalizeColor(formColor, parseColor('#ffffff')!)
    const whiteRatio = contrastRatio(normalized, parseColor('#ffffff')!)
    return whiteRatio < 3 ? parseColor('#0f172a')! : parseColor('#f3f4f6')!
}

function getPanelSurfaces(settings: Record<string, any>) {
    const layoutMode = getLayoutMode(settings)

    if (isSplitLayoutMode(layoutMode)) {
        return getSurfaceCandidates(settings, 'form-panel')
    }

    return getSurfaceCandidates(settings, 'page')
}

function getContainerSurfaces(settings: Record<string, any>) {
    const layoutMode = getLayoutMode(settings)

    if (layoutMode === 'card_split') {
        if (settings.card_page_background_color) {
            return {
                colors: [normalizeColor(settings.card_page_background_color, parseColor('#f3f4f6')!)],
                approximate: false,
            }
        }

        return {
            colors: [deriveCardSplitBackground(settings.form_bg_color || '#ffffff')],
            approximate: false,
        }
    }

    if (isSplitLayoutMode(layoutMode)) {
        return getSurfaceCandidates(settings, 'form-panel')
    }

    return getSurfaceCandidates(settings, 'page')
}

function getFooterLinkSurfaces(settings: Record<string, any>) {
    const layoutMode = getLayoutMode(settings)

    if (layoutMode === 'card_split') {
        const panel = getPanelSurfaces(settings)
        return {
            colors: [averageColors(panel.colors)],
            approximate: panel.approximate,
        }
    }

    if (isSplitLayoutMode(layoutMode)) {
        const panel = getPanelSurfaces(settings)
        return {
            colors: [averageColors(panel.colors)],
            approximate: panel.approximate,
        }
    }

    const page = getSurfaceCandidates(settings, 'page')
    const gradientType = settings.gradient_type || 'linear'

    if (settings.background_mode === 'gradient') {
        if (gradientType === 'mesh') {
            const meshColors = [
                normalizeColor(settings.background_color || '#1a1a2e', parseColor('#ffffff')!),
                normalizeColor(settings.background_gradient_3 || settings.background_gradient_1 || '#dcdcde', parseColor('#ffffff')!),
                normalizeColor(settings.background_gradient_4 || settings.background_gradient_2 || '#c3c4c7', parseColor('#ffffff')!),
            ]

            return {
                colors: [averageColors(meshColors)],
                approximate: false,
            }
        }

        return {
            colors: [averageColors(page.colors)],
            approximate: false,
        }
    }

    return page
}

function getFormSurfaces(settings: Record<string, any>) {
    const fallback = parseColor('#ffffff')!
    const layoutMode = getLayoutMode(settings)
    const split = isSplitLayoutMode(layoutMode)
    const container = split ? getPanelSurfaces(settings) : getContainerSurfaces(settings)

    if (settings.enable_glassmorphism || settings.glass_enabled) {
        if (split) {
            return {
                colors: [fallback],
                approximate: container.approximate,
            }
        }

        const opacity = clamp((100 - Number(settings.glass_transparency ?? 80)) / 100, 0, 1)
        return {
            colors: container.colors.map((surface) =>
                compositeColor({ r: 255, g: 255, b: 255, a: opacity }, surface)
            ),
            approximate: container.approximate,
        }
    }

    return {
        colors: container.colors.map((surface) => normalizeColor(settings.form_bg_color || '#ffffff', surface)),
        approximate: container.approximate,
    }
}

function getTextSurfaceType(settings: Record<string, any>) {
    const simple = isSimpleLayout(settings)
    const layoutMode = getLayoutMode(settings)

    if (simple && isSplitLayoutMode(layoutMode)) {
        return getPanelSurfaces(settings)
    }

    return simple ? getContainerSurfaces(settings) : getFormSurfaces(settings)
}

function chooseBestTextColor(surfaces: RGB[]) {
    const candidates = [LIGHT_TEXT, DARK_TEXT]

    return candidates.reduce(
        (best, candidate) => {
            const ratio = minContrastRatio(candidate, surfaces)
            if (ratio > best.ratio) {
                return { color: candidate, ratio }
            }
            return best
        },
        { color: DARK_TEXT, ratio: 0 }
    ).color
}

export function auditContrast(settings: Record<string, any>): ContrastAudit {
    const container = getContainerSurfaces(settings)
    const footerLinks = getFooterLinkSurfaces(settings)
    const textSurface = getTextSurfaceType(settings)
    const inputSurface = [normalizeColor(settings.input_bg_color || '#ffffff', parseColor('#ffffff')!)]
    const buttonSurface = [normalizeColor(settings.button_bg || '#2271b1', parseColor('#2271b1')!)]

    const issues: ContrastIssue[] = []
    const fixes: Record<string, string> = {}

    const checks: Array<{
        id: ContrastIssue['id']
        label: string
        foreground: string
        surfaces: RGB[]
        surfaceLabel: string
    }> = [
        {
            id: 'label_text_color',
            label: 'Label text',
            foreground: settings.label_text_color || '#1e1e1e',
            surfaces: textSurface.colors,
            surfaceLabel: 'form background',
        },
        {
            id: 'below_form_link_color',
            label: 'Below-form links',
            foreground: settings.below_form_link_color || '#50575e',
            surfaces: footerLinks.colors,
            surfaceLabel: isSplitLayoutMode(getLayoutMode(settings)) ? 'panel background' : 'page background',
        },
        {
            id: 'input_text_color',
            label: 'Input text',
            foreground: settings.input_text_color || '#1e1e1e',
            surfaces: inputSurface,
            surfaceLabel: 'input background',
        },
        {
            id: 'button_text_color',
            label: 'Button text',
            foreground: settings.button_text_color || '#ffffff',
            surfaces: buttonSurface,
            surfaceLabel: 'button background',
        },
    ]

    checks.forEach((check) => {
        const ratio = minContrastRatio(check.foreground, check.surfaces)

        if (ratio < MINIMUM_RATIO) {
            issues.push({
                id: check.id,
                label: check.label,
                foreground: check.foreground,
                surfaceLabel: check.surfaceLabel,
                ratio,
                minimum: MINIMUM_RATIO,
            })

            fixes[check.id] = chooseBestTextColor(check.surfaces)
        }
    })

    return {
        issues,
        fixes,
        approximate: container.approximate || textSurface.approximate || footerLinks.approximate,
    }
}
