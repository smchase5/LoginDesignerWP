import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Wand2, Star, Check } from 'lucide-react'
import { ColorPicker } from '@/components/ui/color-picker'
import { generateTheme } from '@/utils/color-generators'
import { cn } from '@/lib/utils'

interface SmartThemeGeneratorProps {
    onBulkChange: (settings: Record<string, any>) => void
    embedded?: boolean
    onGenerateComplete?: () => void
}

export function SmartThemeGenerator({ onBulkChange, embedded = false, onGenerateComplete }: SmartThemeGeneratorProps) {
    const [color, setColor] = useState('#667eea')
    const [strategy, setStrategy] = useState<'modern' | 'bold' | 'dark'>('modern')
    const [justApplied, setJustApplied] = useState(false)

    const handleGenerate = () => {
        const newSettings = generateTheme(color, strategy)
        onBulkChange(newSettings)
        setJustApplied(true)
        window.setTimeout(() => setJustApplied(false), 1400)
        onGenerateComplete?.()
    }

    const generatorContent = (
        <div className="space-y-5">
            <div className="grid gap-6 md:grid-cols-2">
                {/* Color Input */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Brand Color</Label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <ColorPicker
                                value={color}
                                onChange={setColor}
                                showInput
                            />
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-700">
                        We'll calculate the perfect palette, contrasts, and gradients based on this color.
                    </p>
                </div>

                {/* Strategy Selection */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium">Theme Style</Label>
                    <div className="grid grid-cols-3 gap-2">
                        {[
                            { id: 'modern', label: 'Modern', bg: 'bg-white border-gray-200' },
                            { id: 'bold', label: 'Bold', bg: 'bg-gradient-to-br from-indigo-100 to-purple-100 border-indigo-200' },
                            { id: 'dark', label: 'Dark', bg: 'bg-slate-900 border-slate-700 text-white' }
                        ].map((option) => (
                            <button
                                key={option.id}
                                type="button"
                                onClick={() => setStrategy(option.id as any)}
                                className={cn(
                                    "relative flex h-20 flex-col items-center justify-center gap-2 rounded-lg border border-slate-300 p-3 text-xs font-medium text-slate-800 transition-all",
                                    strategy === option.id
                                        ? "ring-2 ring-primary ring-offset-1 border-primary/60"
                                        : "hover:border-primary/60 bg-white",
                                    option.id === 'dark' && strategy !== 'dark' ? "bg-slate-900 border-slate-800 text-slate-300" : "",
                                    option.id === 'modern' && strategy !== 'modern' ? "bg-white border-border text-foreground" : "",
                                    option.id === 'bold' && strategy !== 'bold' ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-purple-100 text-purple-900" : ""
                                )}
                            >
                                {strategy === option.id && (
                                    <div className="absolute top-1.5 right-1.5 text-primary">
                                        <Check className="h-3 w-3" />
                                    </div>
                                )}
                                <span className={cn(
                                    "w-8 h-8 rounded-full shadow-sm flex items-center justify-center text-[10px]",
                                    option.id === 'dark' ? "bg-slate-800" : "bg-white"
                                )}>
                                    Aa
                                </span>
                                {option.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <div className="pt-2">
                <Button
                    type="button"
                    onClick={handleGenerate}
                    className={cn("w-full gap-2", justApplied && "bg-[hsl(142.1,76.2%,36.3%)] hover:bg-[hsl(142.1,76.2%,30%)]")}
                    size="lg"
                >
                    <Wand2 className="h-4 w-4" />
                    {justApplied ? 'Theme Applied' : `Generate ${strategy.charAt(0).toUpperCase() + strategy.slice(1)} Theme`}
                </Button>
            </div>
        </div>
    )

    if (embedded) {
        return generatorContent
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <Wand2 className="h-4 w-4" />
                        Smart Theme Generator
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full">
                            <Star className="h-3 w-3" />
                            Pro
                        </span>
                    </CardTitle>
                </div>
                <CardDescription>
                    Automatically generate a professional login theme from a single brand color.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
                {generatorContent}
            </CardContent>
        </Card>
    )
}
