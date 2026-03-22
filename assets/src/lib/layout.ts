export function getLayoutMode(settings: Record<string, any>): string {
    return settings.layout_mode || 'centered'
}

export const ALLOWED_SPLIT_RATIOS = ['35', '40', '45', '50', '55', '60', '65'] as const

const ALLOWED_SPLIT_RATIO_NUMBERS = ALLOWED_SPLIT_RATIOS.map((value) => parseInt(value, 10))

export function normalizeSplitRatio(value: unknown, fallback = '50'): string {
    const fallbackValue = ALLOWED_SPLIT_RATIOS.includes(fallback as typeof ALLOWED_SPLIT_RATIOS[number]) ? fallback : '50'
    const raw = (typeof value === 'string' || typeof value === 'number') ? String(value).trim() : ''

    if (ALLOWED_SPLIT_RATIOS.includes(raw as typeof ALLOWED_SPLIT_RATIOS[number])) {
        return raw
    }

    const numeric = Number.parseInt(raw, 10)
    if (Number.isNaN(numeric)) {
        return fallbackValue
    }

    let closest = Number.parseInt(fallbackValue, 10)
    for (const allowed of ALLOWED_SPLIT_RATIO_NUMBERS) {
        if (Math.abs(allowed - numeric) < Math.abs(closest - numeric)) {
            closest = allowed
        }
    }

    return String(closest)
}

export function isSplitLayoutMode(layoutMode: string): boolean {
    return layoutMode.startsWith('split_') || layoutMode === 'card_split'
}

export function isCardSplitLayout(layoutMode: string): boolean {
    return layoutMode === 'card_split'
}

export function isBrandLayoutMode(layoutMode: string): boolean {
    return isSplitLayoutMode(layoutMode)
}

export function isSimpleLayout(settings: Record<string, any>): boolean {
    const layoutMode = getLayoutMode(settings)
    return layoutMode === 'simple' || (isSplitLayoutMode(layoutMode) && (settings.layout_form_style || 'boxed') === 'simple')
}

export function getBrandLogoRadius(preset: string | undefined): number {
    const radiusMap: Record<string, number> = {
        square: 0,
        soft: 25,
        rounded: 10,
        full: 100,
    }

    return radiusMap[preset || 'square'] ?? 0
}

export function getBrandContentAlignment(align: string | undefined): {
    alignItems: 'flex-start' | 'center' | 'flex-end'
    textAlign: 'left' | 'center' | 'right'
} {
    const value = align || 'center'

    if (value === 'left') {
        return {
            alignItems: 'flex-start',
            textAlign: 'left',
        }
    }

    if (value === 'right') {
        return {
            alignItems: 'flex-end',
            textAlign: 'right',
        }
    }

    return {
        alignItems: 'center',
        textAlign: 'center',
    }
}

export function getPerceivedBrightness(value: string | undefined): number {
    const raw = (value || '#ffffff').replace('#', '').trim()
    const hex = raw.length === 3
        ? raw.split('').map((char) => char + char).join('')
        : raw.padEnd(6, 'f').slice(0, 6)

    const r = parseInt(hex.substring(0, 2), 16)
    const g = parseInt(hex.substring(2, 4), 16)
    const b = parseInt(hex.substring(4, 6), 16)

    return ((r * 299) + (g * 587) + (b * 114)) / 1000
}

export function getAdaptiveTextColor(background: string | undefined): '#ffffff' | '#111827' {
    return getPerceivedBrightness(background) < 140 ? '#ffffff' : '#111827'
}

export function getAdaptiveCardSplitPageBackground(formColor: string | undefined): string {
    return getPerceivedBrightness(formColor) < 130 ? '#0f172a' : '#f3f4f6'
}

export function getAdaptiveFormPanelBackground(formColor: string | undefined): string {
    return getPerceivedBrightness(formColor) < 130 ? '#f8fafc' : '#ffffff'
}
