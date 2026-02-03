import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ColorPicker } from '@/components/ui/color-picker'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Image, X, Shuffle, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface BackgroundSectionProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
}

// Helper for opening media library
const openMediaLibrary = (imageKey: string, urlKey: string, onChange: (key: string, value: any) => void) => {
    if (typeof window.wp === 'undefined' || typeof window.wp.media === 'undefined') {
        alert('WordPress media library is not loaded. Please refresh the page.')
        return
    }

    try {
        const frame = window.wp.media({
            title: 'Select Background Image',
            button: { text: 'Use this image' },
            multiple: false
        })

        frame.on('select', () => {
            const attachment = frame.state().get('selection').first().toJSON()
            onChange(imageKey, attachment.id)
            onChange(urlKey, attachment.url)
        })

        frame.open()
    } catch (error) {
        console.error('LoginDesignerWP: Error opening media library:', error)
        alert('Error opening media library. Please refresh the page.')
    }
}

const BrandControls = ({ settings, onChange, isPro = false }: { settings: Record<string, any>, onChange: (key: string, value: any) => void, isPro?: boolean }) => {
    const bgMode = settings.background_mode || 'solid'

    const randomizeGradient = () => {
        const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')

        if (settings.gradient_type === 'mesh') {
            onChange('background_color', randomColor())
            onChange('background_gradient_1', randomColor())
            onChange('background_gradient_2', randomColor())
            onChange('background_gradient_3', randomColor())
            onChange('background_gradient_4', randomColor())
        } else {
            onChange('background_gradient_1', randomColor())
            onChange('background_gradient_2', randomColor())
        }
    }

    return (
        <div className="space-y-4">
            {/* Card Split: Page Background Override */}
            {settings.layout_mode === 'card_split' && (
                <div className="p-3 border rounded-md bg-muted/20">
                    <div className="flex items-center justify-between mb-1">
                        <Label className="text-sm font-semibold">Page Background</Label>
                        <ColorPicker
                            value={settings.card_page_background_color || ''}
                            onChange={(color) => onChange('card_page_background_color', color)}
                            showInput
                        />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                        Leave empty to auto-adapt to Form Color.
                    </p>
                </div>
            )}

            {/* Background Type Selector */}
            <div>
                <Label className="mb-2 block">Background Type</Label>
                <div className="flex gap-2">
                    {[
                        { value: 'solid', label: 'Solid' },
                        { value: 'gradient', label: 'Gradient' },
                        { value: 'image', label: 'Image' }
                    ].map((type) => (
                        <button
                            key={type.value}
                            onClick={() => onChange('background_mode', type.value)}
                            className={cn(
                                "flex-1 py-2 px-3 text-sm font-medium rounded-md border transition-colors",
                                bgMode === type.value
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-background text-foreground border-border hover:bg-accent"
                            )}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Solid Color */}
            {bgMode === 'solid' && (
                <div className="flex items-center justify-between">
                    <Label>Background Color</Label>
                    <ColorPicker
                        value={settings.background_color || '#f0f0f1'}
                        onChange={(color) => onChange('background_color', color)}
                        showInput
                    />
                </div>
            )}

            {/* Gradient */}
            {bgMode === 'gradient' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Gradient Type</Label>
                        <div className="flex items-center gap-2">
                            <select
                                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                                value={settings.gradient_type || 'linear'}
                                onChange={(e) => onChange('gradient_type', e.target.value)}
                            >
                                <option value="linear">Linear</option>
                                <option value="radial">Radial</option>
                                <option value="mesh">Mesh (Pro)</option>
                            </select>
                            <Button variant="outline" size="icon" onClick={randomizeGradient} title="Randomize Colors">
                                <Shuffle className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Mesh Pro Lock */}
                    {settings.gradient_type === 'mesh' && !isPro && (
                        <div className="bg-muted p-3 rounded-md border text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
                            <span className="font-semibold text-foreground">Mesh Gradients are a Pro Feature</span>
                            <Button size="sm" variant="default">Upgrade to Pro</Button>
                        </div>
                    )}

                    {/* Linear/Radial Angle */}
                    {settings.gradient_type !== 'radial' && settings.gradient_type !== 'mesh' && (
                        <div className="flex items-center justify-between">
                            <Label>Angle</Label>
                            <div className="flex items-center gap-2">
                                <Slider
                                    min={0}
                                    max={360}
                                    step={1}
                                    value={[settings.gradient_angle || 135]}
                                    onValueChange={([val]) => onChange('gradient_angle', val)}
                                    className="w-24"
                                />
                                <span className="text-sm font-medium text-primary w-10">
                                    {settings.gradient_angle || 135}°
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Radial Position */}
                    {settings.gradient_type === 'radial' && (
                        <div className="flex items-center justify-between">
                            <Label>Position</Label>
                            <select
                                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                                value={settings.gradient_position || 'center center'}
                                onChange={(e) => onChange('gradient_position', e.target.value)}
                            >
                                <option value="center center">Center</option>
                                <option value="top left">Top Left</option>
                                <option value="top center">Top Center</option>
                                <option value="top right">Top Right</option>
                                <option value="center left">Center Left</option>
                                <option value="center right">Center Right</option>
                                <option value="bottom left">Bottom Left</option>
                                <option value="bottom center">Bottom Center</option>
                                <option value="bottom right">Bottom Right</option>
                            </select>
                        </div>
                    )}

                    {/* Standard Gradients (Linear/Radial) */}
                    {settings.gradient_type !== 'mesh' && (
                        <>
                            <div className="flex items-center justify-between">
                                <Label>Start Color</Label>
                                <ColorPicker
                                    value={settings.background_gradient_1 || '#667eea'}
                                    onChange={(color) => onChange('background_gradient_1', color)}
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <Label>End Color</Label>
                                <ColorPicker
                                    value={settings.background_gradient_2 || '#764ba2'}
                                    onChange={(color) => onChange('background_gradient_2', color)}
                                />
                            </div>
                        </>
                    )}

                    {/* Mesh Gradient Controls */}
                    {settings.gradient_type === 'mesh' && (
                        <div className={cn("space-y-3", !isPro && "opacity-50 pointer-events-none")}>
                            <div className="flex items-center justify-between">
                                <Label>Base Color</Label>
                                <ColorPicker
                                    value={settings.background_color || '#1a1a2e'}
                                    onChange={(color) => onChange('background_color', color)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-xs">Top Left</Label>
                                    <ColorPicker
                                        value={settings.background_gradient_1 || '#ff0080'}
                                        onChange={(color) => onChange('background_gradient_1', color)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Top Right</Label>
                                    <ColorPicker
                                        value={settings.background_gradient_2 || '#7928ca'}
                                        onChange={(color) => onChange('background_gradient_2', color)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Bottom Left</Label>
                                    <ColorPicker
                                        value={settings.background_gradient_3 || '#ff4d4d'}
                                        onChange={(color) => onChange('background_gradient_3', color)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Bottom Right</Label>
                                    <ColorPicker
                                        value={settings.background_gradient_4 || '#f9cb28'}
                                        onChange={(color) => onChange('background_gradient_4', color)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Image */}
            {bgMode === 'image' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        {settings.background_image_url ? (
                            <div className="relative h-20 w-32 rounded border overflow-hidden">
                                <img
                                    src={settings.background_image_url}
                                    alt="Background"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => {
                                        onChange('background_image_id', '')
                                        onChange('background_image_url', '')
                                    }}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : null}
                        <Button variant="outline" onClick={() => openMediaLibrary('background_image_id', 'background_image_url', onChange)} className="gap-2">
                            <Image className="h-4 w-4" />
                            {settings.background_image_url ? 'Change' : 'Media Library'}
                        </Button>
                    </div>

                    {/* URL Input Fallback */}
                    <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground">Or paste image URL:</Label>
                        <Input
                            type="url"
                            placeholder="https://example.com/image.jpg"
                            value={settings.background_image_url || ''}
                            onChange={(e) => {
                                onChange('background_image_url', e.target.value)
                                onChange('background_image_id', '')
                            }}
                        />
                    </div>

                    {/* Image Size */}
                    <div className="flex items-center justify-between">
                        <Label>Image Size</Label>
                        <select
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                            value={settings.background_image_size || 'cover'}
                            onChange={(e) => onChange('background_image_size', e.target.value)}
                        >
                            <option value="cover">Cover</option>
                            <option value="contain">Contain</option>
                            <option value="auto">Auto</option>
                        </select>
                    </div>

                    {/* Image Position */}
                    <div className="flex items-center justify-between">
                        <Label>Image Position</Label>
                        <select
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                            value={settings.background_image_pos || 'center'}
                            onChange={(e) => onChange('background_image_pos', e.target.value)}
                        >
                            <option value="center">Center</option>
                            <option value="top">Top</option>
                            <option value="bottom">Bottom</option>
                        </select>
                    </div>

                    {/* Image Repeat */}
                    <div className="flex items-center justify-between">
                        <Label>Image Repeat</Label>
                        <select
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                            value={settings.background_image_repeat || 'no-repeat'}
                            onChange={(e) => onChange('background_image_repeat', e.target.value)}
                        >
                            <option value="no-repeat">No Repeat</option>
                            <option value="repeat">Repeat</option>
                        </select>
                    </div>

                    {/* Background Blur */}
                    <div className="flex items-center justify-between">
                        <Label>Background Blur</Label>
                        <div className="flex items-center gap-2">
                            <Slider
                                min={0}
                                max={20}
                                step={1}
                                value={[settings.background_blur || 0]}
                                onValueChange={([val]) => onChange('background_blur', val)}
                                className="w-24"
                            />
                            <span className="text-sm font-medium text-primary w-10">
                                {settings.background_blur || 0}px
                            </span>
                        </div>
                    </div>

                    {/* Color Overlay Toggle */}
                    <div className="flex items-center justify-between">
                        <Label>Color Overlay</Label>
                        <Switch
                            checked={!!settings.background_overlay_enable}
                            onCheckedChange={(checked) => onChange('background_overlay_enable', checked ? 1 : 0)}
                        />
                    </div>

                    {/* Overlay Settings */}
                    {!!settings.background_overlay_enable && (
                        <div className="pl-4 border-l-2 border-border space-y-3">
                            <div className="flex items-center justify-between">
                                <Label>Overlay Color</Label>
                                <ColorPicker
                                    value={settings.background_overlay_color || '#000000'}
                                    onChange={(color) => onChange('background_overlay_color', color)}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label>Overlay Opacity</Label>
                                <div className="flex items-center gap-2">
                                    <Slider
                                        min={0}
                                        max={100}
                                        step={5}
                                        value={[settings.background_overlay_opacity || 50]}
                                        onValueChange={([val]) => onChange('background_overlay_opacity', val)}
                                        className="w-24"
                                    />
                                    <span className="text-sm font-medium text-primary w-10">
                                        {settings.background_overlay_opacity || 50}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

const FormPanelControls = ({ settings, onChange }: { settings: Record<string, any>, onChange: (key: string, value: any) => void }) => {
    const formPanelMode = settings.form_panel_bg_mode || 'solid'

    const formPanelModes = [
        { id: 'solid', label: 'Solid Color' },
        { id: 'image', label: 'Image' },
        { id: 'gradient', label: 'Gradient' },
    ]

    return (
        <div className="space-y-4">
            {/* Mode Selector */}
            <div className="flex gap-2">
                {formPanelModes.map((mode) => (
                    <button
                        key={mode.id}
                        type="button"
                        onClick={() => onChange('form_panel_bg_mode', mode.id)}
                        className={cn(
                            "flex-1 py-2 px-3 text-xs rounded-md border transition-all",
                            formPanelMode === mode.id
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border bg-background hover:bg-muted"
                        )}
                    >
                        {mode.label}
                    </button>
                ))}
            </div>

            {/* Color Picker - Only for Solid mode */}
            {formPanelMode === 'solid' && (
                <div className="flex items-center justify-between">
                    <Label>Color</Label>
                    <ColorPicker
                        value={settings.form_panel_bg_color || '#ffffff'}
                        onChange={(color) => onChange('form_panel_bg_color', color)}
                        showInput
                    />
                </div>
            )}

            {/* Gradient Controls */}
            {formPanelMode === 'gradient' && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label>Gradient Type</Label>
                        <div className="flex items-center gap-2">
                            <select
                                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                                value={settings.form_panel_gradient_type || 'linear'}
                                onChange={(e) => onChange('form_panel_gradient_type', e.target.value)}
                            >
                                <option value="linear">Linear</option>
                                <option value="radial">Radial</option>
                            </select>
                        </div>
                    </div>

                    {settings.form_panel_gradient_type !== 'radial' && (
                        <div className="flex items-center justify-between">
                            <Label>Angle</Label>
                            <div className="flex items-center gap-2">
                                <Slider
                                    min={0}
                                    max={360}
                                    step={1}
                                    value={[settings.form_panel_gradient_angle || 135]}
                                    onValueChange={([val]) => onChange('form_panel_gradient_angle', val)}
                                    className="w-24"
                                />
                                <span className="text-sm font-medium text-primary w-10">
                                    {settings.form_panel_gradient_angle || 135}°
                                </span>
                            </div>
                        </div>
                    )}

                    {settings.form_panel_gradient_type === 'radial' && (
                        <div className="flex items-center justify-between">
                            <Label>Position</Label>
                            <select
                                className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                                value={settings.form_panel_gradient_position || 'center center'}
                                onChange={(e) => onChange('form_panel_gradient_position', e.target.value)}
                            >
                                <option value="center center">Center</option>
                                <option value="top left">Top Left</option>
                                <option value="top center">Top Center</option>
                                <option value="top right">Top Right</option>
                                <option value="center left">Center Left</option>
                                <option value="center right">Center Right</option>
                                <option value="bottom left">Bottom Left</option>
                                <option value="bottom center">Bottom Center</option>
                                <option value="bottom right">Bottom Right</option>
                            </select>
                        </div>
                    )}

                    <div className="flex items-center justify-between">
                        <Label>Start Color</Label>
                        <ColorPicker
                            value={settings.form_panel_gradient_1 || '#ffffff'}
                            onChange={(color) => onChange('form_panel_gradient_1', color)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>End Color</Label>
                        <ColorPicker
                            value={settings.form_panel_gradient_2 || '#f0f0f1'}
                            onChange={(color) => onChange('form_panel_gradient_2', color)}
                        />
                    </div>
                </div>
            )}

            {/* Image Upload - Only for Image mode */}
            {formPanelMode === 'image' && (
                <div className="space-y-3">
                    <div className="flex items-center gap-4">
                        {settings.form_panel_image_url ? (
                            <div className="relative h-16 w-24 rounded border overflow-hidden">
                                <img
                                    src={settings.form_panel_image_url}
                                    alt="Form Panel Background"
                                    className="w-full h-full object-cover"
                                />
                                <button
                                    onClick={() => {
                                        onChange('form_panel_image_id', 0)
                                        onChange('form_panel_image_url', '')
                                    }}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ) : null}
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openMediaLibrary('form_panel_image_id', 'form_panel_image_url', onChange)}
                            className="gap-2"
                        >
                            <Image className="h-4 w-4" />
                            {settings.form_panel_image_url ? 'Change' : 'Choose Image'}
                        </Button>
                    </div>
                </div>
            )}

            {/* Shadow Toggle */}
            <div className="flex items-center justify-between">
                <Label>Panel Shadow</Label>
                <Switch
                    checked={settings.form_panel_shadow ?? true}
                    onCheckedChange={(checked) => onChange('form_panel_shadow', checked ? 1 : 0)}
                />
            </div>
        </div>
    )
}

export function BackgroundSection({ settings, onChange, isPro = false }: BackgroundSectionProps & { isPro?: boolean }) {
    const layoutMode = settings.layout_mode || 'centered'
    const isAdvancedLayout = layoutMode.startsWith('split_') // Only split layouts have dual backgrounds

    // Collapsible state for advanced layout subsections
    const [brandExpanded, setBrandExpanded] = useState(true)
    const [formPanelExpanded, setFormPanelExpanded] = useState(true)

    // CENTERED LAYOUT: Simple single background section
    if (!isAdvancedLayout) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Background</CardTitle>
                    <CardDescription>Customize the login page background</CardDescription>
                </CardHeader>
                <CardContent>
                    <BrandControls settings={settings} onChange={onChange} isPro={isPro} />
                </CardContent>
            </Card>
        )
    }

    // ADVANCED LAYOUT: Dual background sections
    return (
        <Card>
            <CardHeader>
                <CardTitle>Background</CardTitle>
                <CardDescription>Customize backgrounds for your {layoutMode.replace('_', ' ')} layout</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Brand Background Section */}
                <div className="border rounded-lg overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setBrandExpanded(!brandExpanded)}
                        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <span className="font-medium text-sm">Brand Background</span>
                        {brandExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                    {brandExpanded && (
                        <div className="p-4 border-t">
                            <p className="text-xs text-muted-foreground mb-3">
                                The image or color that fills the brand zone (the large visual area).
                            </p>
                            <BrandControls settings={settings} onChange={onChange} isPro={isPro} />
                        </div>
                    )}
                </div>

                {/* Form Panel Background Section */}
                <div className="border rounded-lg overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setFormPanelExpanded(!formPanelExpanded)}
                        className="w-full flex items-center justify-between p-3 bg-muted/50 hover:bg-muted transition-colors"
                    >
                        <span className="font-medium text-sm">Form Panel Background</span>
                        {formPanelExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        )}
                    </button>
                    {formPanelExpanded && (
                        <div className="p-4 border-t">
                            <p className="text-xs text-muted-foreground mb-3">
                                The background behind the login form.
                            </p>
                            <FormPanelControls settings={settings} onChange={onChange} />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
