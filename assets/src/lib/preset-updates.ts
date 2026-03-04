import {
    getAdaptiveCardSplitPageBackground,
    getAdaptiveFormPanelBackground,
    getAdaptiveTextColor,
    getLayoutMode,
    isBrandLayoutMode,
    isCardSplitLayout,
} from '@/lib/layout'

export function buildPresetUpdates(
    currentSettings: Record<string, any>,
    presetId: string,
    preset: any
): Record<string, any> {
    const updates: Record<string, any> = {
        active_preset: presetId,
        form_border_radius: '',
        form_corner_style: 'none',
        button_border_radius: 3,
        background_mode: 'solid',
        background_color: '',
        background_image_url: '',
        background_gradient_1: '',
        background_gradient_2: '',
        form_panel_bg_mode: 'solid',
        form_panel_bg_color: '#ffffff',
        form_panel_gradient_1: '#ffffff',
        form_panel_gradient_2: '#f0f0f1',
        form_panel_gradient_type: 'linear',
        form_panel_gradient_angle: 135,
        form_panel_gradient_position: 'center center',
        form_panel_image_id: 0,
        form_panel_shadow: 1,
        card_page_background_color: '',
        brand_text_color: '',
        brand_logo_bg_color: '',
        brand_logo_bg_enable: 0,
    }

    Object.assign(updates, preset.settings || {})

    if (!preset.settings || !('enable_glassmorphism' in preset.settings)) {
        updates.enable_glassmorphism = 0
        updates.glass_enabled = false
    }

    const layoutMode = getLayoutMode(currentSettings)

    if (!isBrandLayoutMode(layoutMode)) {
        return updates
    }

    const formColor = updates.form_bg_color || currentSettings.form_bg_color || '#ffffff'
    const backgroundColor = updates.background_gradient_1 || updates.background_color || currentSettings.background_gradient_1 || currentSettings.background_color || '#f0f0f1'

    if (!preset.settings || !('form_panel_bg_mode' in preset.settings)) {
        updates.form_panel_bg_mode = 'solid'
    }

    if (!preset.settings || !('form_panel_bg_color' in preset.settings)) {
        updates.form_panel_bg_color = getAdaptiveFormPanelBackground(formColor)
    }

    if (isCardSplitLayout(layoutMode) && (!preset.settings || !('card_page_background_color' in preset.settings))) {
        updates.card_page_background_color = getAdaptiveCardSplitPageBackground(formColor)
    }

    if (!preset.settings || !('brand_text_color' in preset.settings)) {
        updates.brand_text_color = getAdaptiveTextColor(backgroundColor)
    }

    return updates
}
