import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { PresetThumbnail } from '@/components/presets/PresetThumbnail'
import { SmartThemeGenerator } from '@/components/generator/SmartThemeGenerator'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { buildPresetUpdates } from '@/lib/preset-updates'
import { Lock, Sparkles, Wand2, Star } from 'lucide-react'

interface PresetsSectionProps {
    settings: Record<string, any>
    onBulkChange: (updates: Record<string, any>) => void
    presets: Record<string, any>
    isLoading?: boolean
    isPro: boolean
}

export function PresetsSection({ settings, onBulkChange, presets, isLoading = false, isPro }: PresetsSectionProps) {
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false)
    const selectedPreset = settings.active_preset || ''
    const upgradeUrl = 'https://frontierwp.com/logindesignerwp-pro'

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
                    <CardDescription className="text-slate-700">
                        Pick a preset, or generate your own theme from a single accent color.
                    </CardDescription>
                </div>
            </CardHeader>
            <CardContent>
                <div className="mb-4 flex flex-col gap-3 rounded-lg border border-slate-400 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-950">Preset or Custom Theme</p>
                        <p className="text-xs text-slate-700">
                            Choose a preset below, or generate a fresh theme from your accent color.
                        </p>
                    </div>

                    {isPro ? (
                        <Dialog open={isGeneratorOpen} onOpenChange={setIsGeneratorOpen}>
                            <Button type="button" size="sm" className="gap-2 sm:shrink-0" onClick={() => setIsGeneratorOpen(true)}>
                                <Wand2 className="h-3.5 w-3.5" />
                                Generate Theme
                            </Button>
                            <DialogContent className="max-w-3xl border-slate-400 bg-white shadow-2xl">
                                <DialogHeader className="pr-8">
                                    <DialogTitle className="flex items-center gap-2">
                                        <Wand2 className="h-4 w-4" />
                                        Smart Theme Generator
                                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                                            <Star className="h-3 w-3" />
                                            Pro
                                        </span>
                                    </DialogTitle>
                                    <DialogDescription>
                                        Generate a full login theme from one brand color and apply it instantly.
                                    </DialogDescription>
                                </DialogHeader>
                                <SmartThemeGenerator
                                    embedded
                                    onBulkChange={onBulkChange}
                                />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <Button asChild type="button" variant="secondary" size="sm" className="gap-2 sm:shrink-0">
                            <a href={upgradeUrl} target="_blank" rel="noopener noreferrer">
                                <Lock className="h-3.5 w-3.5" />
                                Generate Theme (Pro)
                            </a>
                        </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="rounded-lg border border-dashed border-border/70 bg-muted/20 px-4 py-6 text-sm text-muted-foreground">
                        Loading presets...
                    </div>
                ) : (
                    <div className="max-h-[640px] overflow-y-auto px-1 pt-1 pb-2">
                        <div className="grid grid-cols-2 gap-4">
                        {Object.entries(presets).map(([id, preset]: [string, any]) => {
                            const isLocked = preset.is_pro && !isPro

                            return (
                                <div
                                    key={id}
                                    onClick={() => handlePresetSelect(id, preset)}
                                    className={cn(
                                        "group relative cursor-pointer rounded-xl overflow-hidden border border-slate-400/90 ring-1 ring-inset ring-slate-200 transition-all duration-200 bg-card",
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
