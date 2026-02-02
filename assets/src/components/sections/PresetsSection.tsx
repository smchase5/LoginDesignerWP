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
                <div className="max-h-[500px] overflow-y-auto pr-1">
                    <div className="grid grid-cols-4 gap-3">
                        {Object.entries(presets).map(([id, preset]: [string, any]) => {
                            const isLocked = preset.is_pro && !isPro
                            const preview = preset.preview || {}

                            return (
                                <div
                                    key={id}
                                    onClick={() => handlePresetSelect(id, preset)}
                                    className={cn(
                                        "relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all",
                                        "hover:border-primary hover:-translate-y-0.5",
                                        selectedPreset === id && "border-primary ring-2 ring-primary/20",
                                        selectedPreset !== id && "border-border",
                                        isLocked && "cursor-not-allowed opacity-60"
                                    )}
                                >
                                    {isLocked && (
                                        <div className="absolute top-1.5 right-1.5 z-10 bg-black/60 text-white py-0.5 px-2 rounded text-[10px] flex items-center gap-1">
                                            <Lock className="h-2.5 w-2.5" /> Pro
                                        </div>
                                    )}

                                    <div
                                        className="aspect-[4/3] flex items-center justify-center p-3"
                                        style={{ background: preview.bg || '#f0f0f1' }}
                                    >
                                        <div
                                            className="w-[70%] p-2 rounded"
                                            style={{
                                                background: preview.form_bg || '#fff',
                                                border: preview.form_border || 'none'
                                            }}
                                        >
                                            <div className="h-1.5 rounded mb-1" style={{ background: preview.input_bg || 'rgba(0,0,0,0.1)' }} />
                                            <div className="h-1.5 rounded mb-1" style={{ background: preview.input_bg || 'rgba(0,0,0,0.1)' }} />
                                            <div className="h-2.5 rounded" style={{ background: preview.button_bg || '#2271b1' }} />
                                        </div>
                                    </div>

                                    <div className="text-center py-1.5 px-2 text-xs font-medium bg-muted text-foreground">
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
