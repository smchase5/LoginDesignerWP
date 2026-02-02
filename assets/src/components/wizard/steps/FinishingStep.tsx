import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Sparkles, Image as ImageIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FinishingStepProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
}

export function FinishingStep({ settings, onChange }: FinishingStepProps) {
    const isGlass = !!settings.enable_glassmorphism

    const handleBgSelect = () => {
        if (typeof window.wp !== 'undefined' && window.wp.media) {
            const frame = window.wp.media({
                title: 'Select Background Image',
                button: { text: 'Use Background' },
                multiple: false
            })
            frame.on('select', () => {
                const attachment = frame.state().get('selection').first().toJSON()
                onChange('background_mode', 'image')
                onChange('background_image_id', attachment.id)
                onChange('background_image_url', attachment.url)
            })
            frame.open()
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">

            {/* Glassmorphism Section */}
            <div className={cn(
                "p-5 rounded-xl border-2 transition-all duration-300",
                isGlass ? "border-primary/50 bg-primary/5" : "border-border bg-card"
            )}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-lg", isGlass ? "bg-primary text-primary-foreground shadow-lg" : "bg-muted text-muted-foreground")}>
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-foreground">Glassmorphism Effect</h3>
                            <p className="text-xs text-muted-foreground">Add a modern frosted glass effect to your form.</p>
                        </div>
                    </div>
                    <Switch
                        checked={isGlass}
                        onCheckedChange={(checked) => onChange('enable_glassmorphism', checked ? 1 : 0)}
                        className="scale-110"
                    />
                </div>

                {/* Mini Preview of Effect */}
                <div className="relative h-24 rounded-lg overflow-hidden flex items-center justify-center">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-80" />
                    <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '10px 10px' }}></div>

                    {/* Glass Card */}
                    <div className={cn(
                        "relative w-32 h-16 rounded-md flex items-center justify-center border transition-all duration-500",
                        isGlass
                            ? "bg-white/20 backdrop-blur-md border-white/30 shadow-lg"
                            : "bg-white border-transparent shadow"
                    )}>
                        <span className={cn("text-xs font-medium", isGlass ? "text-white" : "text-gray-800")}>
                            {isGlass ? 'Glass Active' : 'Solid Card'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Background Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base">Background Image</Label>
                    {settings.background_image_url && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => {
                                onChange('background_mode', 'color')
                                onChange('background_image_id', '')
                                onChange('background_image_url', '')
                            }}
                        >
                            Remove
                        </Button>
                    )}
                </div>

                <div
                    onClick={handleBgSelect}
                    className="group cursor-pointer relative h-32 rounded-xl border-2 border-dashed border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/20 transition-all flex flex-col items-center justify-center overflow-hidden"
                >
                    {settings.background_image_url ? (
                        <>
                            <img
                                src={settings.background_image_url}
                                alt="Background"
                                className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                            />
                            <div className="relative z-10 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm text-xs font-medium flex items-center gap-2">
                                <ImageIcon className="w-3 h-3" />
                                Change Image
                            </div>
                        </>
                    ) : (
                        <div className="text-center p-4">
                            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mx-auto mb-2 text-muted-foreground group-hover:text-primary group-hover:bg-primary/10 transition-colors">
                                <ImageIcon className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-foreground">Select Background Image</span>
                            <p className="text-xs text-muted-foreground mt-1">Click to upload or select from library</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
