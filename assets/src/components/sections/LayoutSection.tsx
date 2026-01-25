
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { LayoutTemplate, PanelLeft, PanelRight, Minus, Lock } from 'lucide-react'

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
            id: 'split_right',
            title: 'Split Right',
            description: 'Form left, brand right',
            icon: <PanelRight className="w-6 h-6" />,
            isPro: true,
        },
    ]

    // Layout-specific options
    const splitRatioOptions = ['40', '50', '60']
    const formWidthOptions = [
        { value: '320', label: 'Narrow (320px)' },
        { value: '360', label: 'Default (360px)' },
        { value: '420', label: 'Medium (420px)' },
        { value: '480', label: 'Wide (480px)' },
    ]

    const isSplitLayout = currentLayout.startsWith('split_')
    const isSimpleLayout = currentLayout === 'simple'

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
                            onClick={() => !isDisabled && onChange('layout_mode', layout.id)}
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
            {isSplitLayout && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                    <div>
                        <Label className="text-sm font-medium">Split Options</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Adjust the brand/form ratio
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label className="text-sm">Split Ratio</Label>
                        <select
                            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
                            value={settings.layout_split_ratio || '50'}
                            onChange={(e) => onChange('layout_split_ratio', e.target.value)}
                        >
                            {splitRatioOptions.map((ratio) => (
                                <option key={ratio} value={ratio}>
                                    {ratio}% / {100 - parseInt(ratio)}%
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    )
}
