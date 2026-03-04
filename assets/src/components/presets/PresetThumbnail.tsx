import { buildPresetUpdates } from '@/lib/preset-updates'
import { getLayoutMode, isCardSplitLayout, isSimpleLayout, isSplitLayoutMode } from '@/lib/layout'

interface PresetThumbnailProps {
    settings: Record<string, any>
    presetId: string
    preset: any
    className?: string
}

function getBackground(previewSettings: Record<string, any>) {
    const mode = previewSettings.background_mode || 'solid'

    if (mode === 'gradient') {
        const type = previewSettings.gradient_type || 'linear'
        const color1 = previewSettings.background_gradient_1 || '#f0f0f1'
        const color2 = previewSettings.background_gradient_2 || '#c3c4c7'
        const angle = previewSettings.gradient_angle || 135

        if (type === 'radial') {
            return `radial-gradient(circle, ${color1}, ${color2})`
        }

        return `linear-gradient(${angle}deg, ${color1}, ${color2})`
    }

    return previewSettings.background_color || '#f0f0f1'
}

function getPanelBackground(previewSettings: Record<string, any>) {
    const mode = previewSettings.form_panel_bg_mode || 'solid'

    if (mode === 'gradient') {
        const type = previewSettings.form_panel_gradient_type || 'linear'
        const color1 = previewSettings.form_panel_gradient_1 || '#ffffff'
        const color2 = previewSettings.form_panel_gradient_2 || '#f0f0f1'
        const angle = previewSettings.form_panel_gradient_angle || 135

        if (type === 'radial') {
            return `radial-gradient(circle, ${color1}, ${color2})`
        }

        return `linear-gradient(${angle}deg, ${color1}, ${color2})`
    }

    return previewSettings.form_panel_bg_color || '#ffffff'
}

function getFormCardStyle(previewSettings: Record<string, any>) {
    const rawRadius = Number(previewSettings.form_border_radius || 12)
    const tileRadius = Math.max(4, Math.min(14, Math.round(rawRadius * 0.55)))

    return {
        background: previewSettings.form_bg_color || '#ffffff',
        border: `1px solid ${previewSettings.form_border_color || 'rgba(148, 163, 184, 0.35)'}`,
        borderRadius: `${tileRadius}px`,
    }
}

export function PresetThumbnail({ settings, presetId, preset, className = '' }: PresetThumbnailProps) {
    const previewSettings = {
        ...settings,
        ...buildPresetUpdates(settings, presetId, preset),
    }

    const layoutMode = getLayoutMode(previewSettings)
    const isCardSplit = isCardSplitLayout(layoutMode)
    const isSplit = isSplitLayoutMode(layoutMode) && !isCardSplit
    const isSimple = isSimpleLayout(previewSettings)
    const splitRatio = Number(previewSettings.layout_split_ratio || 50)
    const background = getBackground(previewSettings)
    const panelBackground = getPanelBackground(previewSettings)
    const formCardStyle = getFormCardStyle(previewSettings)
    const inputBg = previewSettings.input_bg_color || 'rgba(148,163,184,0.22)'
    const buttonBg = previewSettings.button_bg || '#2271b1'

    const fields = (
        <>
            <div className="h-1.5 w-9 rounded-full bg-black/10" />
            <div className="h-4 rounded-[6px] border border-black/5" style={{ background: inputBg }} />
            <div className="h-4 rounded-[6px] border border-black/5" style={{ background: inputBg }} />
            <div
                className="mt-1 h-4 w-12 rounded-[5px] border shadow-sm opacity-95"
                style={{
                    background: buttonBg,
                    borderColor: 'rgba(15, 23, 42, 0.12)',
                }}
            />
        </>
    )

    if (isCardSplit) {
        return (
            <div className={`aspect-[5/4] relative overflow-hidden border-b border-border/70 bg-slate-100 ${className}`} style={{ background }}>
                <div className="absolute inset-[14px] overflow-hidden rounded-[18px] border border-black/8 shadow-[0_10px_24px_rgba(15,23,42,0.12)] ring-1 ring-black/5" style={{ background: panelBackground }}>
                    <div className="flex h-full">
                        <div style={{ width: `${splitRatio}%`, background }} className="relative" />
                        <div className="flex items-center justify-center p-3.5" style={{ width: `${100 - splitRatio}%`, background: panelBackground }}>
                            <div
                                className={`w-full ${isSimple ? 'px-1' : 'rounded-[12px] border border-black/8 p-2.5 shadow-[0_5px_14px_rgba(15,23,42,0.09)]'}`}
                                style={isSimple ? undefined : formCardStyle}
                            >
                                <div className="flex flex-col gap-1.5">
                                    {fields}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if (isSplit) {
        return (
            <div className={`aspect-[5/4] relative overflow-hidden border-b border-border/70 ${className}`}>
                <div className="flex h-full">
                    <div style={{ width: `${splitRatio}%`, background }} />
                    <div className="flex items-center justify-center p-3.5" style={{ width: `${100 - splitRatio}%`, background: panelBackground }}>
                        <div
                            className={`w-[82%] ${isSimple ? 'px-1' : 'rounded-[12px] border border-black/8 p-2.5 shadow-[0_5px_14px_rgba(15,23,42,0.09)]'}`}
                            style={isSimple ? undefined : formCardStyle}
                        >
                            <div className="flex flex-col gap-1.5">
                                {fields}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`aspect-[5/4] relative flex items-center justify-center p-4 border-b border-border/70 bg-gradient-to-b from-white/50 to-slate-50/70 ${className}`}
            style={{ background }}
        >
            <div
                className={`w-[72%] flex flex-col gap-1.5 ${isSimple ? 'px-1' : 'rounded-[12px] border border-black/8 p-2.5 shadow-[0_6px_18px_rgba(15,23,42,0.10)]'}`}
                style={isSimple ? undefined : formCardStyle}
            >
                {fields}
            </div>
        </div>
    )
}
