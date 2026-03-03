import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Lock, Sparkles } from 'lucide-react'

interface PresetsSectionProps {
    settings: Record<string, any>
    onBulkChange: (updates: Record<string, any>) => void
    presets: Record<string, any>
    isPro: boolean
}

export function PresetsSection({ settings, onBulkChange, presets, isPro }: PresetsSectionProps) {
    const selectedPreset = settings.active_preset || ''

    const handlePresetSelect = (presetId: string, preset: any) => {
        if (preset.is_pro && !isPro) {
            alert('This preset requires Login Designer WP Pro')
            return
        }

        // Start with resets, then apply preset settings
        const updates: Record<string, any> = {
            active_preset: presetId,
            // Reset key style properties to defaults to prevent "stickiness" from previous presets
            form_border_radius: '',
            form_corner_style: 'none',
            button_border_radius: 3,
            // Reset background props to ensure seamless transition
            background_mode: 'solid',
            background_color: '',
            background_image_url: '',
            background_gradient_1: '',
            background_gradient_2: '',
            // Reset brand props to prevent leakage from previous Smart Themes
            brand_text_color: '',
            brand_logo_bg_color: '',
            brand_logo_bg_enable: 0,
        }

        // Apply preset settings AFTER resets
        Object.assign(updates, preset.settings || {})

        // Ensure glassmorphism is disabled if not explicitly enabled in preset
        if (!preset.settings || !('enable_glassmorphism' in preset.settings)) {
            updates.enable_glassmorphism = 0
            updates.glass_enabled = false
        }



        // Atomic update
        onBulkChange(updates)
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Design Presets
                    </CardTitle>
                    <CardDescription>Quick-start with a preset design</CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="max-h-[500px] overflow-y-auto px-1 pt-1 pb-2">
                    <div className="grid grid-cols-4 gap-3">
                        {Object.entries(presets).map(([id, preset]: [string, any]) => {
                            const isLocked = preset.is_pro && !isPro
                            const preview = preset.preview || {}

                            return (
                                <div
                                    key={id}
                                    onClick={() => handlePresetSelect(id, preset)}
                                    className={cn(
                                        "group relative cursor-pointer rounded-xl overflow-hidden border transition-all duration-200 bg-card",
                                        "hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
                                        selectedPreset === id && "border-primary ring-2 ring-primary/20 shadow-[0_10px_28px_rgba(37,99,235,0.12)]",
                                        selectedPreset !== id && "border-border/90",
                                        isLocked && "cursor-not-allowed opacity-60"
                                    )}
                                >
                                    {isLocked && (
                                        <div className="absolute top-2 right-2 z-10 bg-slate-900/80 text-white py-0.5 px-2 rounded-full text-[10px] flex items-center gap-1 shadow-sm">
                                            <Lock className="h-2.5 w-2.5" /> Pro
                                        </div>
                                    )}

                                    <div
                                        className="aspect-[4/3] flex items-center justify-center p-3 border-b border-border/70 bg-gradient-to-b from-white/50 to-slate-50/70"
                                        style={{ background: preview.bg || '#f0f0f1' }}
                                    >
                                        <div
                                            className="w-[72%] p-2.5 rounded-lg shadow-[0_6px_20px_rgba(15,23,42,0.12)]"
                                            style={{
                                                background: preview.form_bg || '#fff',
                                                border: preview.form_border || '1px solid rgba(148, 163, 184, 0.35)'
                                            }}
                                        >
                                            <div className="h-1.5 rounded mb-1 border border-black/5" style={{ background: preview.input_bg || 'rgba(148,163,184,0.22)' }} />
                                            <div className="h-1.5 rounded mb-1 border border-black/5" style={{ background: preview.input_bg || 'rgba(148,163,184,0.22)' }} />
                                            <div className="h-2.5 rounded shadow-sm" style={{ background: preview.button_bg || '#2271b1' }} />
                                        </div>
                                    </div>

                                    <div className={cn(
                                        "text-center py-2 px-2 text-xs font-semibold transition-colors",
                                        selectedPreset === id
                                            ? "bg-primary/8 text-foreground"
                                            : "bg-slate-50/90 text-foreground group-hover:bg-slate-100/90"
                                    )}>
                                        {preset.name}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
