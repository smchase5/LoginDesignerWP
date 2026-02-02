
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { LayoutTemplate, PanelLeft, Minus, Lock, X } from 'lucide-react'
import { ColorPicker } from '@/components/ui/color-picker'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'

interface LayoutSectionProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    isPro?: boolean
}

export function LayoutSection({ settings, onChange, isPro = false }: LayoutSectionProps) {
    const currentLayout = settings.layout_mode || 'centered'

    // 4 clean layouts - Centered first (default), Simple second
    const layouts = [
        {
            id: 'centered',
            title: 'Centered',
            description: 'Form in styled box',
            icon: <LayoutTemplate className="w-6 h-6" />,
            isPro: false,
        },
        {
            id: 'simple',
            title: 'Simple',
            description: 'Just fields, no form box',
            icon: <Minus className="w-6 h-6" />,
            isPro: true,
        },
        {
            id: 'split_left',
            title: 'Split Left',
            description: 'Brand left, form right',
            icon: <PanelLeft className="w-6 h-6" />,
            isPro: true,
        },
        {
            id: 'card_split',
            title: 'Card Split',
            description: 'Split inside a card',
            icon: <div className="flex w-6 h-6 border border-current rounded"><div className="w-1/2 border-r border-current"></div></div>,
            isPro: true,
        },
    ]

    // Layout-specific options
    const formWidthOptions = [
        { value: '320', label: 'Narrow (320px)' },
        { value: '360', label: 'Default (360px)' },
        { value: '420', label: 'Medium (420px)' },
        { value: '480', label: 'Wide (480px)' },
    ]

    const isSplitLayout = currentLayout.startsWith('split_')
    const isCardSplit = currentLayout === 'card_split'
    const isSimpleLayout = currentLayout === 'simple'
    const showBrandOptions = isSplitLayout || isCardSplit

    return (
        <div className="space-y-4">
            {/* Layout Grid - 2x2 */}
            <div className="grid grid-cols-2 gap-3">
                {layouts.map((layout) => {
                    const isDisabled = layout.isPro && !isPro

                    return (
                        <div
                            key={layout.id}
                            className={cn(
                                "relative cursor-pointer rounded-lg border-2 p-4 transition-all flex flex-col items-center text-center",
                                currentLayout === layout.id
                                    ? "border-primary bg-primary/5"
                                    : "border-muted bg-card hover:bg-muted/30",
                                isDisabled && "opacity-75"
                            )}
                            onClick={() => {
                                if (isDisabled) return
                                onChange('layout_mode', layout.id)

                                // Reset brand settings if switching to non-brand layout
                                const isBrandLayout = layout.id.startsWith('split_') || layout.id === 'card_split'
                                if (!isBrandLayout) {
                                    onChange('brand_hide_form_logo', 0)
                                } else {
                                    // Disable glassmorphism on form container by default for split layouts
                                    // as it often looks bad with the default white form panel
                                    onChange('enable_glassmorphism', 0)
                                }
                            }}
                        >
                            {isDisabled && (
                                <div className="absolute top-2 right-2 text-amber-500">
                                    <Lock className="w-4 h-4" />
                                </div>
                            )}
                            <div className={cn(
                                "rounded-lg p-2.5 mb-2",
                                currentLayout === layout.id ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                {layout.icon}
                            </div>
                            <Label className="cursor-pointer font-medium text-sm">{layout.title}</Label>
                            <span className="text-[11px] text-muted-foreground leading-tight mt-0.5">
                                {layout.description}
                            </span>
                        </div>
                    )
                })}
            </div>

            {/* Form Width (for Simple layout) */}
            {isSimpleLayout && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div>
                        <Label className="text-sm font-medium">Form Width</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Adjust field width
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label className="text-sm">Width</Label>
                        <select
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                            value={settings.layout_form_width || '360'}
                            onChange={(e) => onChange('layout_form_width', e.target.value)}
                        >
                            {formWidthOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Split Layout Options */}
            {showBrandOptions && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div>
                        <Label className="text-sm font-medium">Split Options</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Adjust the brand/form ratio
                        </p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <Label className="text-sm">Split Ratio</Label>
                            <span className="text-xs text-muted-foreground font-mono">
                                {settings.layout_split_ratio || '50'}%
                            </span>
                        </div>
                        <Slider
                            value={[parseInt(settings.layout_split_ratio || '50')]}
                            min={20}
                            max={80}
                            step={5}
                            onValueChange={(vals) => onChange('layout_split_ratio', vals[0].toString())}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label className="text-sm">Form Style</Label>
                        <div className="flex bg-secondary/50 p-1 rounded-md">
                            {['boxed', 'simple'].map((style) => (
                                <button
                                    key={style}
                                    className={cn(
                                        "px-3 py-1 text-xs font-medium rounded-sm transition-all",
                                        (settings.layout_form_style || 'boxed') === style
                                            ? "bg-background shadow-sm text-foreground"
                                            : "text-muted-foreground hover:text-foreground"
                                    )}
                                    onClick={() => onChange('layout_form_style', style)}
                                >
                                    {style.charAt(0).toUpperCase() + style.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Brand Content Controls */}
                    <div className="pt-4 border-t border-border space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <Label className="text-sm font-medium">Brand Content</Label>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Show content opposite form
                                </p>
                            </div>
                            <div className="flex items-center h-6">
                                <Switch
                                    checked={!!settings.brand_content_enable}
                                    onCheckedChange={(checked) => onChange('brand_content_enable', checked ? 1 : 0)}
                                />
                            </div>
                        </div>

                        {!!settings.brand_content_enable && (
                            <div className="space-y-3 pl-2 border-l-2 border-primary/20">
                                {/* Hide Login Form Logo */}
                                <div className="flex items-center justify-between">
                                    <Label className="text-xs">Hide Login Form Logo</Label>
                                    <Switch
                                        checked={!!settings.brand_hide_form_logo}
                                        onCheckedChange={(checked) => onChange('brand_hide_form_logo', checked ? 1 : 0)}
                                    />
                                </div>

                                {/* Brand Logo Upload */}
                                <div className="space-y-1">
                                    <Label className="text-xs">Brand Logo</Label>
                                    <div className="flex items-center gap-3">
                                        {settings.brand_logo_url ? (
                                            <div className="relative h-12 w-12 rounded border overflow-hidden bg-muted flex items-center justify-center">
                                                <img
                                                    src={settings.brand_logo_url}
                                                    alt="Brand Logo"
                                                    className="max-h-full max-w-full object-contain"
                                                />
                                                <button
                                                    onClick={() => {
                                                        onChange('brand_logo_id', '')
                                                        onChange('brand_logo_url', '')
                                                    }}
                                                    className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                                                >
                                                    <X className="h-2 w-2" />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="h-12 w-12 rounded border border-dashed border-border flex items-center justify-center bg-muted">
                                                <div className="w-4 h-4 rounded-full bg-muted-foreground/30" />
                                            </div>
                                        )}
                                        <button
                                            className="text-xs bg-secondary hover:bg-secondary/80 text-secondary-foreground px-2 py-1 rounded transition-colors"
                                            onClick={() => {
                                                if (typeof window.wp !== 'undefined' && window.wp.media) {
                                                    const frame = window.wp.media({
                                                        title: 'Select Brand Logo',
                                                        button: { text: 'Use this logo' },
                                                        multiple: false
                                                    })
                                                    frame.on('select', () => {
                                                        const attachment = frame.state().get('selection').first().toJSON()
                                                        onChange('brand_logo_id', attachment.id)
                                                        onChange('brand_logo_url', attachment.url)
                                                    })
                                                    frame.open()
                                                }
                                            }}
                                        >
                                            {settings.brand_logo_url ? 'Change' : 'Select Image'}
                                        </button>
                                    </div>
                                </div>

                                {/* Brand Logo Background */}
                                <div className="space-y-3 pt-2 pb-1 border-b border-border/50">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Enable Logo Background</Label>
                                        <Switch
                                            checked={!!settings.brand_logo_bg_enable}
                                            onCheckedChange={(checked) => onChange('brand_logo_bg_enable', checked ? 1 : 0)}
                                        />
                                    </div>

                                    {!!settings.brand_logo_bg_enable && (
                                        <div className="flex items-center justify-between">
                                            <Label className="text-xs text-muted-foreground">Background Color</Label>
                                            <div className="flex items-center gap-2">
                                                <ColorPicker
                                                    value={settings.brand_logo_bg_color || '#ffffff'}
                                                    onChange={(val) => onChange('brand_logo_bg_color', val)}
                                                    showInput
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {!!settings.brand_logo_bg_enable && (
                                        <div className="pt-2">
                                            <Label className="text-xs text-muted-foreground block mb-1.5">Corner Style</Label>
                                            <div className="flex bg-secondary/50 p-1 rounded-md">
                                                {['square', 'rounded', 'soft', 'full'].map((preset) => (
                                                    <button
                                                        key={preset}
                                                        className={`flex-1 text-[10px] font-medium py-1 rounded-sm transition-all ${(settings.brand_logo_radius_preset || 'square') === preset
                                                            ? 'bg-background shadow-sm text-foreground'
                                                            : 'text-muted-foreground hover:text-foreground'
                                                            }`}
                                                        onClick={() => onChange('brand_logo_radius_preset', preset)}
                                                    >
                                                        {preset.charAt(0).toUpperCase() + preset.slice(1)}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-3 pt-2 pb-1 border-b border-border/50">
                                    <div className="flex items-center justify-between">
                                        <Label className="text-xs">Text Color</Label>
                                        <div className="flex items-center gap-2">
                                            <ColorPicker
                                                value={settings.brand_text_color || '#ffffff'}
                                                onChange={(val) => onChange('brand_text_color', val)}
                                                showInput
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <Label className="text-xs">Title</Label>
                                    <input
                                        type="text"
                                        className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
                                        placeholder="Welcome Back"
                                        value={settings.brand_title || ''}
                                        onChange={(e) => onChange('brand_title', e.target.value)}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Subtitle</Label>
                                    <textarea
                                        className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors resize-none h-20"
                                        placeholder="Enter your subtitle or message here..."
                                        value={settings.brand_subtitle || ''}
                                        onChange={(e) => onChange('brand_subtitle', e.target.value)}
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
