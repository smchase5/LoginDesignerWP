import { auditContrast } from '@/lib/contrast'
import {
    getAdaptiveCardSplitPageBackground,
    getAdaptiveFormPanelBackground,
    getAdaptiveTextColor,
    getLayoutMode,
    isCardSplitLayout,
    isSimpleLayout,
    isSplitLayoutMode,
} from '@/lib/layout'

function getPrimaryPageColor(settings: Record<string, any>): string {
    if (settings.background_mode === 'gradient') {
        return settings.background_gradient_1 || settings.background_color || '#f0f0f1'
    }

    return settings.background_color || '#f0f0f1'
}

export function applyLayoutAdjustments(settings: Record<string, any>): Record<string, any> {
    const next = { ...settings }
    const layoutMode = getLayoutMode(next)
    const isSplit = isSplitLayoutMode(layoutMode)
    const isCard = isCardSplitLayout(layoutMode)
    const simple = isSimpleLayout(next)
    const formColor = next.form_bg_color || '#ffffff'

    if (isSplit) {
        next.form_panel_bg_mode = 'solid'
        next.form_panel_bg_color = getAdaptiveFormPanelBackground(formColor)
        next.brand_text_color = getAdaptiveTextColor(getPrimaryPageColor(next))

        if (isCard) {
            next.card_page_background_color = getAdaptiveCardSplitPageBackground(formColor)
        }
    }

    if (!isSplit && simple) {
        const simpleSurface = getPrimaryPageColor(next)
        next.label_text_color = getAdaptiveTextColor(simpleSurface)
        next.below_form_link_color = getAdaptiveTextColor(simpleSurface)
    }

    const contrastAudit = auditContrast(next)
    if (contrastAudit.issues.length > 0) {
        Object.assign(next, contrastAudit.fixes)
    }

    return next
}
