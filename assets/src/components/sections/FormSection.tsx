import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ColorPicker } from '@/components/ui/color-picker'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

// Added Star icon for Pro badge
import { Star } from 'lucide-react'

interface FormSectionProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    isPro?: boolean
    designMode?: 'simple' | 'advanced'
}

export function FormSection({ settings, onChange, isPro = false, designMode = 'advanced' }: FormSectionProps) {
    // Handle 0 as valid value (don't default to 4)
    const buttonCorners = settings.button_border_radius !== undefined && settings.button_border_radius !== ''
        ? Number(settings.button_border_radius)
        : 3

    // Handle form radius highlight (treat empty as 0/Square or fallback to style-based highlight?)
    // For now align with 0 if empty/undefined to show Square as default state
    const formRadius = settings.form_border_radius !== undefined && settings.form_border_radius !== ''
        ? Number(settings.form_border_radius)
        : (settings.form_corner_style === 'rounded' ? 24 : settings.form_corner_style === 'soft' ? 4 : 0)


    return (
        <Card>
            <CardHeader>
                <CardTitle>Login Form</CardTitle>
                <CardDescription>Style the login form container</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Glassmorphism - Advanced only */}
                {designMode === 'advanced' && (
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-foreground">Form Container</h4>
                        <div className="flex items-center gap-2">
                            <Label htmlFor="glass-toggle" className="text-xs font-normal text-muted-foreground">Glassmorphism</Label>
                            <Switch
                                id="glass-toggle"
                                checked={!!settings.enable_glassmorphism}
                                onCheckedChange={(checked) => onChange('enable_glassmorphism', checked ? 1 : 0)}
                                disabled={!isPro}
                            />
                            {!isPro && <Star className="h-3 w-3 text-amber-500" />}
                        </div>
                    </div>
                )}

                {/* Glassmorphism Controls (Conditional) - Advanced only */}
                {designMode === 'advanced' && !!settings.enable_glassmorphism && (
                    <div className="pl-4 border-l-2 border-primary/20 space-y-4 pt-1">
                        {/* Blur Strength */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-normal text-muted-foreground">Blur Amount</Label>
                                <span className="text-xs w-8 text-right font-medium">{settings.glass_blur || 10}px</span>
                            </div>
                            <Slider
                                min={0}
                                max={40}
                                step={1}
                                value={[settings.glass_blur || 10]}
                                onValueChange={([val]) => onChange('glass_blur', val)}
                                className="w-full"
                            />
                        </div>

                        {/* Transparency */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-normal text-muted-foreground">Transparency</Label>
                                <span className="text-xs w-8 text-right font-medium">{settings.glass_transparency || 80}%</span>
                            </div>
                            <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[settings.glass_transparency || 80]}
                                onValueChange={([val]) => onChange('glass_transparency', val)}
                                className="w-full"
                            />
                        </div>

                        {/* Border Toggle */}
                        <div className="flex items-center justify-between pt-1">
                            <Label className="text-xs font-normal text-muted-foreground">Glass Border</Label>
                            <Switch
                                checked={settings.glass_border !== undefined ? !!settings.glass_border : true}
                                onCheckedChange={(checked) => onChange('glass_border', checked ? 1 : 0)}
                                className="scale-75 origin-right"
                            />
                        </div>
                    </div>
                )}

                {/* Form Background Color */}
                <div className="flex items-center justify-between">
                    <Label>Background Color</Label>
                    <ColorPicker
                        value={settings.form_bg_color || '#ffffff'}
                        onChange={(color) => onChange('form_bg_color', color)}
                        showInput
                    />
                </div>

                {/* Form Corners */}
                <div>
                    <Label className="mb-2 block">Form Corners</Label>
                    <div className="flex p-1 bg-muted rounded-full">
                        {[
                            { value: 'square', label: 'Square', radius: 0 },
                            { value: 'soft', label: 'Soft', radius: 4 },
                            { value: 'rounded', label: 'Rounded', radius: 12 }
                        ].map((style) => (
                            <button
                                key={style.value}
                                onClick={() => onChange('form_border_radius', style.radius)}
                                className={cn(
                                    "flex-1 py-1.5 px-3 text-sm font-medium rounded-full transition-all",
                                    formRadius === style.radius
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {style.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Border Color - Advanced only */}
                {designMode === 'advanced' && (
                    <div className="flex items-center justify-between">
                        <Label>Border Color</Label>
                        <ColorPicker
                            value={settings.form_border_color || '#c3c4c7'}
                            onChange={(color) => onChange('form_border_color', color)}
                        />
                    </div>
                )}

                {/* Box Shadow - Advanced only */}
                {designMode === 'advanced' && (
                    <div className="flex items-center justify-between">
                        <Label>Box Shadow</Label>
                        <Switch
                            checked={!!settings.form_shadow_enable}
                            onCheckedChange={(checked) => onChange('form_shadow_enable', checked ? 1 : 0)}
                        />
                    </div>
                )}

                {/* Form Padding - Advanced only */}
                {designMode === 'advanced' && (
                    <div className="flex items-center justify-between">
                        <Label>Form Padding</Label>
                        <div className="flex items-center gap-2">
                            <Slider
                                min={0}
                                max={60}
                                step={1}
                                value={[settings.form_padding || 26]}
                                onValueChange={([val]) => onChange('form_padding', val)}
                                className="w-24"
                            />
                            <span className="text-sm font-medium text-primary w-12">
                                {settings.form_padding || 26}px
                            </span>
                        </div>
                    </div>
                )}

                {/* Fields & Labels Section - Advanced only */}
                {designMode === 'advanced' && (
                    <div className="space-y-4 pt-4 border-t border-border">
                        <h4 className="text-sm font-semibold text-foreground">Fields & Labels</h4>

                        {/* Label Text Color */}
                        <div className="flex items-center justify-between">
                            <Label>Label Text Color</Label>
                            <ColorPicker
                                value={settings.label_text_color || '#1e1e1e'}
                                onChange={(color) => onChange('label_text_color', color)}
                            />
                        </div>

                        {/* Input Background */}
                        <div className="flex items-center justify-between">
                            <Label>Input Background</Label>
                            <ColorPicker
                                value={settings.input_bg_color || '#ffffff'}
                                onChange={(color) => onChange('input_bg_color', color)}
                            />
                        </div>

                        {/* Input Text Color */}
                        <div className="flex items-center justify-between">
                            <Label>Input Text Color</Label>
                            <ColorPicker
                                value={settings.input_text_color || '#1e1e1e'}
                                onChange={(color) => onChange('input_text_color', color)}
                            />
                        </div>

                        {/* Input Border Color */}
                        <div className="flex items-center justify-between">
                            <Label>Input Border Color</Label>
                            <ColorPicker
                                value={settings.input_border_color || '#8c8f94'}
                                onChange={(color) => onChange('input_border_color', color)}
                            />
                        </div>

                        {/* Input Focus Color */}
                        <div className="flex items-center justify-between">
                            <Label>Input Focus Color</Label>
                            <ColorPicker
                                value={settings.input_border_focus || '#2271b1'}
                                onChange={(color) => onChange('input_border_focus', color)}
                            />
                        </div>
                    </div>
                )}

                {/* Button Section */}
                <div className="space-y-4 pt-4 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground">Button</h4>

                    {/* Button Background */}
                    <div className="flex items-center justify-between">
                        <Label>Button Background</Label>
                        <ColorPicker
                            value={settings.button_bg || '#2271b1'}
                            onChange={(color) => onChange('button_bg', color)}
                        />
                    </div>

                    {/* Button Hover Background - Advanced only */}
                    {designMode === 'advanced' && (
                        <div className="flex items-center justify-between">
                            <Label>Button Hover</Label>
                            <ColorPicker
                                value={settings.button_bg_hover || '#135e96'}
                                onChange={(color) => onChange('button_bg_hover', color)}
                            />
                        </div>
                    )}

                    {/* Button Text Color */}
                    <div className="flex items-center justify-between">
                        <Label>Button Text Color</Label>
                        <ColorPicker
                            value={settings.button_text_color || '#ffffff'}
                            onChange={(color) => onChange('button_text_color', color)}
                        />
                    </div>

                    {/* Button Corners - Advanced only */}
                    {designMode === 'advanced' && (
                        <div>
                            <Label className="mb-2 block">Button Corners</Label>
                            <div className="flex p-1 bg-muted rounded-full">
                                {[
                                    { value: 0, label: 'Square' },
                                    { value: 4, label: 'Soft' },
                                    { value: 8, label: 'Rounded' },
                                    { value: 9999, label: 'Pill' }
                                ].map((style) => (
                                    <button
                                        key={style.value}
                                        onClick={() => onChange('button_border_radius', style.value)}
                                        className={cn(
                                            "flex-1 py-1.5 px-3 text-sm font-medium rounded-full transition-all",
                                            buttonCorners === style.value
                                                ? "bg-background text-foreground shadow-sm"
                                                : "text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        {style.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Below Form Link Color - Advanced only */}
                    {designMode === 'advanced' && (
                        <div className="space-y-4 pt-4 border-t border-border">
                            <h4 className="text-sm font-semibold text-foreground">Footer Links</h4>

                            <div className="flex items-center justify-between">
                                <Label>Link Color</Label>
                                <ColorPicker
                                    value={settings.below_form_link_color || '#50575e'}
                                    onChange={(color) => onChange('below_form_link_color', color)}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card >
    )
}
