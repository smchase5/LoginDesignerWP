import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X, ChevronLeft, ChevronRight, Check, Wand2 } from 'lucide-react'

interface WizardProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    onClose: () => void
    onApply: () => void
    presets: Record<string, any>
    isPro: boolean
}

const steps = [
    { id: 1, title: 'Pick a Preset', description: 'Select a style to start customizing' },
    { id: 2, title: 'Customize Background', description: 'Choose your background style' },
    { id: 3, title: 'Logo Setup', description: 'Upload and customize your logo' },
]

export function Wizard({ settings, onChange, onClose, onApply, presets, isPro }: WizardProps) {
    const [step, setStep] = useState(1)
    const [selectedPreset, setSelectedPreset] = useState(settings.active_preset || '')

    const progress = (step / steps.length) * 100
    const currentStep = steps[step - 1]

    const handlePresetSelect = (presetId: string, preset: any) => {
        if (preset.is_pro && !isPro) {
            alert('This preset requires Login Designer WP Pro')
            return
        }
        setSelectedPreset(presetId)
        onChange('active_preset', presetId)
        if (preset.settings) {
            Object.entries(preset.settings).forEach(([key, value]) => {
                onChange(key, value)
            })
        }
    }

    return (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50">
            <div className="w-full max-w-2xl bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div
                    className="flex items-center justify-between px-6 py-4 text-white"
                    style={{ background: 'linear-gradient(135deg, #2271b1 0%, #135e96 100%)' }}
                >
                    <div className="flex items-center gap-3">
                        <Wand2 className="h-5 w-5" />
                        <h3 className="text-lg font-semibold">Design Wizard</h3>
                        <span className="bg-white/20 px-3 py-1 rounded-full text-xs">
                            Step {step} of {steps.length}
                        </span>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClose}
                        className="text-white hover:bg-white/20 hover:text-white gap-1"
                    >
                        <X className="h-4 w-4" />
                        Exit
                    </Button>
                </div>

                {/* Progress Bar */}
                <div className="h-1 bg-muted">
                    <div
                        className="h-full transition-all duration-300"
                        style={{
                            width: `${progress}%`,
                            background: 'linear-gradient(90deg, #2271b1, #36a3f7)'
                        }}
                    />
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Step Header */}
                    <div className="text-center mb-6">
                        <h4 className="text-xl font-semibold text-foreground">{currentStep.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{currentStep.description}</p>
                    </div>

                    {/* Step 1: Presets */}
                    {step === 1 && (
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
                                        <div className="text-center py-1.5 px-2 text-xs font-medium bg-muted">
                                            {preset.name}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Step 2: Background */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex gap-3 mb-4">
                                {['solid', 'gradient', 'image'].map((type) => (
                                    <button
                                        key={type}
                                        onClick={() => onChange('background_mode', type)}
                                        className={cn(
                                            "flex-1 py-3 px-4 text-sm font-medium rounded-lg border-2 transition-all capitalize",
                                            settings.background_mode === type
                                                ? "border-primary bg-primary/5 text-primary"
                                                : "border-border hover:border-primary/50"
                                        )}
                                    >
                                        {type}
                                    </button>
                                ))}
                            </div>

                            {settings.background_mode === 'solid' && (
                                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                    <label className="text-sm font-medium">Color</label>
                                    <input
                                        type="color"
                                        className="h-10 w-16 rounded border cursor-pointer"
                                        value={settings.background_color || '#f0f0f1'}
                                        onChange={(e) => onChange('background_color', e.target.value)}
                                    />
                                </div>
                            )}

                            {settings.background_mode === 'gradient' && (
                                <div className="p-4 bg-muted rounded-lg space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">Start Color</label>
                                        <input
                                            type="color"
                                            className="h-10 w-16 rounded border cursor-pointer"
                                            value={settings.background_gradient_1 || '#667eea'}
                                            onChange={(e) => onChange('background_gradient_1', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium">End Color</label>
                                        <input
                                            type="color"
                                            className="h-10 w-16 rounded border cursor-pointer"
                                            value={settings.background_gradient_2 || '#764ba2'}
                                            onChange={(e) => onChange('background_gradient_2', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {settings.background_mode === 'image' && (
                                <div className="p-4 bg-muted rounded-lg text-center">
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            if (window.wp?.media) {
                                                const frame = window.wp.media({
                                                    title: 'Select Background',
                                                    button: { text: 'Use Image' },
                                                    multiple: false
                                                })
                                                frame.on('select', () => {
                                                    const attachment = frame.state().get('selection').first().toJSON()
                                                    onChange('background_image_id', attachment.id)
                                                    onChange('background_image_url', attachment.url)
                                                })
                                                frame.open()
                                            }
                                        }}
                                    >
                                        Select Image
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step 3: Logo */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                                <div className="h-16 w-24 rounded border border-dashed border-border flex items-center justify-center bg-background overflow-hidden">
                                    {settings.logo_image_url ? (
                                        <img src={settings.logo_image_url} alt="Logo" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No Logo</span>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (window.wp?.media) {
                                            const frame = window.wp.media({
                                                title: 'Select Logo',
                                                button: { text: 'Use Logo' },
                                                multiple: false
                                            })
                                            frame.on('select', () => {
                                                const attachment = frame.state().get('selection').first().toJSON()
                                                onChange('logo_id', attachment.id)
                                                onChange('logo_image_url', attachment.url)
                                            })
                                            frame.open()
                                        }
                                    }}
                                >
                                    {settings.logo_id ? 'Change Logo' : 'Select Logo'}
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Width (px)</label>
                                    <input
                                        type="number"
                                        className="w-full h-10 px-3 rounded-md border border-input"
                                        value={settings.logo_width || 84}
                                        onChange={(e) => onChange('logo_width', parseInt(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Height (px)</label>
                                    <input
                                        type="number"
                                        className="w-full h-10 px-3 rounded-md border border-input"
                                        value={settings.logo_height || 84}
                                        onChange={(e) => onChange('logo_height', parseInt(e.target.value))}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/50">
                    <div className="flex gap-2">
                        {steps.map((s) => (
                            <div
                                key={s.id}
                                className={cn(
                                    "w-2 h-2 rounded-full transition-colors",
                                    s.id <= step ? "bg-primary" : "bg-border"
                                )}
                            />
                        ))}
                    </div>
                    <div className="flex gap-2">
                        {step > 1 && (
                            <Button variant="secondary" onClick={() => setStep(step - 1)} className="gap-1">
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>
                        )}
                        {step < steps.length ? (
                            <Button variant="wp" onClick={() => setStep(step + 1)} className="gap-1">
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button variant="success" onClick={onApply} className="gap-1">
                                <Check className="h-4 w-4" />
                                Apply Design
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
