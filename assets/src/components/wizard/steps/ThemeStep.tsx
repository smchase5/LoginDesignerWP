import { cn } from '@/lib/utils'
import { Lock } from 'lucide-react'

interface ThemeStepProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    presets: Record<string, any>
    isPro: boolean
}

export function ThemeStep({ settings, onChange, presets, isPro }: ThemeStepProps) {
    const selectedPreset = settings.active_preset || ''

    const handlePresetSelect = (presetId: string, preset: any) => {
        if (preset.is_pro && !isPro) return

        onChange('active_preset', presetId)
        if (preset.settings) {
            Object.entries(preset.settings).forEach(([key, value]) => {
                onChange(key, value)
            })
        }
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-3 gap-4 max-h-[400px] overflow-y-auto pr-2 pb-2">
                {Object.entries(presets).map(([id, preset]: [string, any]) => {
                    const isLocked = preset.is_pro && !isPro
                    const isActive = selectedPreset === id
                    const preview = preset.preview || {}

                    return (
                        <div
                            key={id}
                            onClick={() => handlePresetSelect(id, preset)}
                            className={cn(
                                "group relative rounded-xl border-2 cursor-pointer overflow-hidden transition-all duration-200",
                                isActive
                                    ? "border-primary ring-2 ring-primary/20 scale-[1.02]"
                                    : "border-border hover:border-primary/50 hover:scale-[1.02]",
                                isLocked && "opacity-70 cursor-not-allowed hover:scale-100 hover:border-border"
                            )}
                        >
                            {/* Pro Badge */}
                            {isLocked && (
                                <div className="absolute inset-0 z-10 bg-background/10 backdrop-blur-[1px] flex items-center justify-center">
                                    <div className="bg-black/80 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-lg">
                                        <Lock className="w-3 h-3" />
                                        <span>Pro</span>
                                    </div>
                                </div>
                            )}

                            {/* Minimal Preview Representation */}
                            <div
                                className="aspect-[4/3] relative flex items-center justify-center p-3"
                                style={{ background: preview.bg || '#f0f0f1' }}
                            >
                                <div
                                    className="w-[75%] p-2 rounded shadow-sm flex flex-col gap-1.5"
                                    style={{
                                        background: preview.form_bg || '#fff',
                                        border: preview.form_border || 'none'
                                    }}
                                >
                                    <div className="h-1.5 w-1/3 rounded-sm bg-black/10 mx-auto mb-1" /> {/* Logo placeholder */}
                                    <div className="h-6 rounded border border-black/5" style={{ background: preview.input_bg || 'transparent' }} />
                                    <div className="h-6 rounded border border-black/5" style={{ background: preview.input_bg || 'transparent' }} />
                                    <div className="h-7 rounded mt-1 shadow-sm opacity-90" style={{ background: preview.button_bg || '#2271b1' }} />
                                </div>
                            </div>

                            <div className={cn(
                                "py-2 px-3 text-center text-xs font-semibold border-t transition-colors",
                                isActive ? "bg-primary text-primary-foreground border-primary" : "bg-muted text-muted-foreground border-border group-hover:bg-muted/80"
                            )}>
                                {preset.name}
                            </div>
                        </div>
                    )
                })}
            </div>

            <p className="text-center text-xs text-muted-foreground">
                Select a starting point. Detailed colors and styles can be fine-tuned later.
            </p>
        </div>
    )
}
