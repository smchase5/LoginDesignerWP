import { PresetThumbnail } from '@/components/presets/PresetThumbnail'
import { cn } from '@/lib/utils'
import { buildPresetUpdates } from '@/lib/preset-updates'
import { Lock } from 'lucide-react'

interface ThemeStepProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    presets: Record<string, any>
    presetsLoading?: boolean
    isPro: boolean
}

export function ThemeStep({ settings, onChange, presets, presetsLoading = false, isPro }: ThemeStepProps) {
    const selectedPreset = settings.active_preset || ''

    const handlePresetSelect = (presetId: string, preset: any) => {
        if (preset.is_pro && !isPro) return

        Object.entries(buildPresetUpdates(settings, presetId, preset)).forEach(([key, value]) => {
            onChange(key, value)
        })
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            {presetsLoading ? (
                <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                    Loading presets...
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 max-h-[460px] overflow-y-auto px-1 pt-1 pb-2">
                    {Object.entries(presets).map(([id, preset]: [string, any]) => {
                        const isLocked = preset.is_pro && !isPro
                        const isActive = selectedPreset === id

                        return (
                            <div
                                key={id}
                                onClick={() => handlePresetSelect(id, preset)}
                                className={cn(
                                    "group relative rounded-xl border border-slate-300 cursor-pointer overflow-hidden transition-all duration-200 bg-card",
                                    isActive
                                        ? "border-primary ring-2 ring-primary/20 scale-[1.02] shadow-[0_10px_28px_rgba(37,99,235,0.12)]"
                                        : "hover:border-primary/50 hover:scale-[1.02] hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
                                    isLocked && "opacity-70 cursor-not-allowed hover:scale-100 hover:border-border/90"
                                )}
                            >
                                {isLocked && (
                                    <div className="absolute inset-0 z-10 bg-background/10 backdrop-blur-[1px] flex items-center justify-center">
                                        <div className="bg-black/80 text-white px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium shadow-lg">
                                            <Lock className="w-3 h-3" />
                                            <span>Pro</span>
                                        </div>
                                    </div>
                                )}

                                <PresetThumbnail settings={settings} presetId={id} preset={preset} />

                                <div className={cn(
                                    "py-2 px-3 text-center text-xs font-semibold transition-colors",
                                    isActive
                                        ? "bg-primary/8 text-foreground"
                                        : "bg-slate-50/90 text-muted-foreground group-hover:bg-slate-100/90"
                                )}>
                                    {preset.name}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            <p className="text-center text-xs text-muted-foreground">
                Select a starting point. Detailed colors and styles can be fine-tuned later.
            </p>
        </div>
    )
}
