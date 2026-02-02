import { LayoutTemplate, PanelLeft, Minus, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayoutStepProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    isPro: boolean
}

export function LayoutStep({ settings, onChange, isPro }: LayoutStepProps) {
    const currentLayout = settings.layout_mode || 'centered'

    const layouts = [
        {
            id: 'centered',
            title: 'Centered Box',
            description: 'Classic login form in a centered box. Clean and simple.',
            icon: <LayoutTemplate className="w-8 h-8 mb-2 text-primary" />,
            isPro: false,
        },
        {
            id: 'split_left',
            title: 'Split Screen',
            description: 'Brand showcase on the left, login form on the right.',
            icon: <PanelLeft className="w-8 h-8 mb-2 text-primary" />,
            isPro: true, // Marking as pro to test UI, but logic will respect isPro prop
        },
        {
            id: 'card_split',
            title: 'Card Split',
            description: 'Modern split layout contained within a card.',
            icon: <CreditCard className="w-8 h-8 mb-2 text-primary" />,
            isPro: true,
        },
        {
            id: 'simple',
            title: 'Minimalist',
            description: 'Just the form fields. No box, no distractions.',
            icon: <Minus className="w-8 h-8 mb-2 text-primary" />,
            isPro: true,
        },
    ]

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="grid grid-cols-2 gap-4">
                {layouts.map((layout) => {
                    const isLocked = layout.isPro && !isPro
                    const isActive = currentLayout === layout.id

                    return (
                        <div
                            key={layout.id}
                            onClick={() => {
                                if (isLocked) return
                                onChange('layout_mode', layout.id)
                                // Reset/Sync Logic
                                const isBrandLayout = layout.id.startsWith('split_') || layout.id === 'card_split'
                                if (!isBrandLayout) {
                                    onChange('brand_hide_form_logo', 0)
                                } else {
                                    onChange('enable_glassmorphism', 0)
                                }
                            }}
                            className={cn(
                                "group relative flex flex-col items-center text-center p-6 border-2 rounded-xl cursor-pointer transition-all duration-200",
                                isActive
                                    ? "border-primary bg-primary/5 shadow-md scale-[1.02]"
                                    : "border-muted bg-card hover:border-primary/50 hover:bg-muted/30 hover:scale-[1.01]",
                                isLocked && "opacity-60 grayscale cursor-not-allowed hover:scale-100 hover:border-muted"
                            )}
                        >
                            {isLocked && (
                                <div className="absolute top-3 right-3 bg-amber-100 text-amber-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border border-amber-200">
                                    Pro
                                </div>
                            )}

                            <div className={cn(
                                "p-3 rounded-full mb-3 transition-colors",
                                isActive ? "bg-primary/20" : "bg-muted group-hover:bg-primary/10"
                            )}>
                                {layout.icon}
                            </div>

                            <h3 className="font-semibold text-foreground mb-1">{layout.title}</h3>
                            <p className="text-sm text-muted-foreground leading-snug max-w-[85%] mx-auto">
                                {layout.description}
                            </p>
                        </div>
                    )
                })}
            </div>

            <p className="text-center text-xs text-muted-foreground">
                Choose the structural foundation for your login page. You can always change this later.
            </p>
        </div>
    )
}
