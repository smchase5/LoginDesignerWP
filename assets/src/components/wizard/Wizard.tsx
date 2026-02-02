import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { X, ChevronLeft, ChevronRight, Check, Wand2 } from 'lucide-react'
import { LayoutStep } from './steps/LayoutStep'
import { ThemeStep } from './steps/ThemeStep'
import { BrandStep } from './steps/BrandStep'
import { FinishingStep } from './steps/FinishingStep'

interface WizardProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    onClose: () => void
    onApply: () => void
    presets: Record<string, any>
    isPro: boolean
}

const steps = [
    { id: 1, title: 'Choose Layout', description: 'Start with a strong foundation.', component: LayoutStep },
    { id: 2, title: 'Pick a Theme', description: 'Select a style to customize.', component: ThemeStep },
    { id: 3, title: 'Branding', description: 'Add your logo and identity.', component: BrandStep },
    { id: 4, title: 'Finishing Touches', description: 'Polish with effects and backgrounds.', component: FinishingStep },
]

export function Wizard({ settings, onChange, onClose, onApply, presets, isPro }: WizardProps) {
    const [step, setStep] = useState(1)

    const progress = (step / steps.length) * 100
    const currentStep = steps[step - 1]
    const StepComponent = currentStep.component

    const isLastStep = step === steps.length

    return (
        <div className="w-full h-full bg-background border rounded-xl shadow-2xl flex flex-col pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="relative overflow-hidden bg-primary px-6 py-5 text-primary-foreground shrink-0">
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-blue-600 opacity-90" />

                {/* Deco Circles */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-10 w-24 h-24 bg-black/10 rounded-full blur-2xl pointer-events-none" />

                <div className="relative flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                            <Wand2 className="h-5 w-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold tracking-tight">Design Wizard</h2>
                            <p className="text-primary-foreground/80 text-xs">Create your perfect login page.</p>
                        </div>
                    </div>

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-primary-foreground/70 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="h-1 bg-muted shrink-0">
                <div
                    className="h-full bg-blue-500 transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-2 text-primary font-medium text-sm">
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-xs">
                            {step}
                        </span>
                        {currentStep.title}
                    </div>
                    <p className="text-sm text-muted-foreground">{currentStep.description}</p>
                </div>

                <StepComponent
                    settings={settings}
                    onChange={onChange}
                    presets={presets}
                    isPro={isPro}
                />
            </div>

            {/* Footer Controls */}
            <div className="p-4 border-t bg-muted/30 shrink-0 flex items-center justify-between">
                <div className="flex gap-1">
                    {steps.map((s) => (
                        <div
                            key={s.id}
                            className={cn(
                                "w-1.5 h-1.5 rounded-full transition-colors duration-300",
                                s.id <= step ? "bg-primary" : "bg-muted-foreground/20"
                            )}
                        />
                    ))}
                </div>

                <div className="flex gap-2">
                    {step > 1 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setStep(step - 1)}
                            className="pl-2"
                        >
                            <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                            Back
                        </Button>
                    )}

                    {!isLastStep ? (
                        <Button
                            size="sm"
                            onClick={() => setStep(step + 1)}
                            className="pr-2 min-w-[90px]"
                        >
                            Next
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={onApply}
                            className="min-w-[120px] bg-green-600 hover:bg-green-700 text-white"
                        >
                            <Check className="w-3.5 h-3.5 mr-2" />
                            Apply
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
