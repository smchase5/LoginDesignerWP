import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ColorPicker } from '@/components/ui/color-picker'
import { cn } from '@/lib/utils'
import { Image, X, Shuffle, ChevronDown, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface BackgroundSectionProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
}

export function BackgroundSection({ settings, onChange }: BackgroundSectionProps) {
    const bgMode = settings.background_mode || 'solid'
    const layoutMode = settings.layout_mode || 'centered'
    const isAdvancedLayout = layoutMode.startsWith('split_') // Only split layouts have dual backgrounds

    // Collapsible state for advanced layout subsections
    const [brandExpanded, setBrandExpanded] = useState(true)
    const [formPanelExpanded, setFormPanelExpanded] = useState(true)

    const openMediaLibrary = (imageKey: string, urlKey: string) => {
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

    const randomizeGradient = () => {
        const randomColor = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
        onChange('background_gradient_1', randomColor())
        onChange('background_gradient_2', randomColor())
    }

    // Reusable Brand Background Controls
    const BrandBackgroundControls = () => (
        <div className="space-y-4">
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
                            </select>
                            <Button variant="outline" size="icon" onClick={randomizeGradient} title="Randomize Colors">
                                <Shuffle className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {settings.gradient_type !== 'radial' && (
                        <div className="flex items-center justify-between">
                            <Label>Angle</Label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="range"
                                    className="w-24"
                                    min="0"
                                    max="360"
                                    value={settings.gradient_angle || 135}
                                    onChange={(e) => onChange('gradient_angle', parseInt(e.target.value))}
                                />
                                <span className="text-sm font-medium text-primary w-10">
                                    {settings.gradient_angle || 135}°
                                </span>
                            </div>
                        </div>
                    )}

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
                        <Button variant="outline" onClick={() => openMediaLibrary('background_image_id', 'background_image_url')} className="gap-2">
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
                            <input
                                type="range"
                                className="w-24"
                                min="0"
                                max="20"
                                value={settings.background_blur || 0}
                                onChange={(e) => onChange('background_blur', parseInt(e.target.value))}
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
                                    <input
                                        type="range"
                                        className="w-24"
                                        min="0"
                                        max="100"
                                        step="5"
                                        value={settings.background_overlay_opacity || 50}
                                        onChange={(e) => onChange('background_overlay_opacity', parseInt(e.target.value))}
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

    // Form Panel Background Controls (for advanced layouts)
    const FormPanelControls = () => {
        const formPanelMode = settings.form_panel_bg_mode || 'solid'

        const formPanelModes = [
            { id: 'solid', label: 'Solid Color' },
            { id: 'image', label: 'Image' },
            { id: 'glassmorphism', label: 'Glassmorphism' },
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
                                onClick={() => openMediaLibrary('form_panel_image_id', 'form_panel_image_url')}
                                className="gap-2"
                            >
                                <Image className="h-4 w-4" />
                                {settings.form_panel_image_url ? 'Change' : 'Choose Image'}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Glassmorphism Info */}
                {formPanelMode === 'glassmorphism' && (
                    <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                        The form panel will have a frosted glass effect, blurring the brand background behind it.
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

    // CENTERED LAYOUT: Simple single background section
    if (!isAdvancedLayout) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Background</CardTitle>
                    <CardDescription>Customize the login page background</CardDescription>
                </CardHeader>
                <CardContent>
                    <BrandBackgroundControls />
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
                            <BrandBackgroundControls />
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
                            <FormPanelControls />
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
