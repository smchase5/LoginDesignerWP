import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PresetThumbnail } from '@/components/presets/PresetThumbnail'
import { cn } from '@/lib/utils'
import { buildPresetUpdates } from '@/lib/preset-updates'
import { Lock, Sparkles } from 'lucide-react'

interface PresetsSectionProps {
    settings: Record<string, any>
    onBulkChange: (updates: Record<string, any>) => void
    presets: Record<string, any>
    isLoading?: boolean
    isPro: boolean
}

export function PresetsSection({ settings, onBulkChange, presets, isLoading = false, isPro }: PresetsSectionProps) {
    const selectedPreset = settings.active_preset || ''

    const handlePresetSelect = (presetId: string, preset: any) => {
        if (preset.is_pro && !isPro) {
            alert('This preset requires Login Designer WP Pro')
            return
        }

        onBulkChange(buildPresetUpdates(settings, presetId, preset))
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
                {isLoading ? (
                    <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                        Loading presets...
                    </div>
                ) : (
                    <div className="max-h-[640px] overflow-y-auto px-1 pt-1 pb-2">
                        <div className="grid grid-cols-3 gap-4">
                        {Object.entries(presets).map(([id, preset]: [string, any]) => {
                            const isLocked = preset.is_pro && !isPro

                            return (
                                <div
                                    key={id}
                                    onClick={() => handlePresetSelect(id, preset)}
                                    className={cn(
                                        "group relative cursor-pointer rounded-xl overflow-hidden border border-slate-300 transition-all duration-200 bg-card",
                                        "hover:border-primary/60 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(15,23,42,0.08)]",
                                        selectedPreset === id && "border-primary ring-2 ring-primary/20 shadow-[0_10px_28px_rgba(37,99,235,0.12)]",
                                        isLocked && "cursor-not-allowed opacity-60"
                                    )}
                                >
                                    {isLocked && (
                                        <div className="absolute top-2 right-2 z-10 bg-slate-900/80 text-white py-0.5 px-2 rounded-full text-[10px] flex items-center gap-1 shadow-sm">
                                            <Lock className="h-2.5 w-2.5" /> Pro
                                        </div>
                                    )}

                                    <PresetThumbnail settings={settings} presetId={id} preset={preset} />

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
                )}
            </CardContent>
        </Card>
    )
}
