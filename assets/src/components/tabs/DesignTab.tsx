import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { BackgroundSection } from '@/components/sections/BackgroundSection'
import { FormSection } from '@/components/sections/FormSection'
import { LogoSection } from '@/components/sections/LogoSection'
import { PresetsSection } from '@/components/sections/PresetsSection'
import { LayoutSection } from '@/components/sections/LayoutSection'
import { Wizard } from '@/components/wizard/Wizard'
import { Save, ExternalLink, RotateCcw, Lock, Star, Unlock } from 'lucide-react'
import { AIToolsSection } from '@/components/sections/AIToolsSection'
import { SmartThemeGenerator } from '@/components/generator/SmartThemeGenerator'

const ProSection = ({
    title,
    description,
    children,
    isPro,
    extraBadge
}: {
    title: string
    description: string
    children: React.ReactNode
    isPro: boolean
    extraBadge?: React.ReactNode
}) => {
    const upgradeUrl = 'https://frontierwp.com/logindesignerwp-pro'

    if (isPro) {
        // Unlocked - render functional section
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-base">
                        {title}
                        <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-0.5 rounded-full">
                            <Star className="h-3 w-3" />
                            Pro
                        </span>
                        {extraBadge}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {children}
                </CardContent>
            </Card>
        )
    }

    // Locked - render teaser
    return (
        <Card className="relative overflow-hidden border-dashed opacity-75">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                    <Lock className="h-4 w-4" />
                    {title}
                </CardTitle>
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-1 rounded-full">
                    <Star className="h-3 w-3" />
                    Pro
                </span>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="pointer-events-none select-none opacity-50">
                    {children}
                </div>
                <div className="flex flex-col items-center gap-2 pt-4 border-t border-border">
                    <Button asChild className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
                        <a href={upgradeUrl} target="_blank" rel="noopener noreferrer">
                            <Unlock className="h-4 w-4" />
                            Unlock with LoginDesignerWP Pro
                        </a>
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">{description}</p>
                </div>
            </CardContent>
        </Card>
    )
}


interface DesignTabProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    onBulkChange: (updates: Record<string, any>) => void
    onSave: () => void
    onReset: () => void
    isSaving: boolean
    isResetting: boolean
    showWizard: boolean
    setShowWizard: (show: boolean) => void
    presets: Record<string, any>
    isPro: boolean
}

export function DesignTab({
    settings,
    onChange,
    onBulkChange,
    onSave,
    onReset,
    isSaving,
    isResetting,
    showWizard,
    setShowWizard,
    presets,
    isPro
}: DesignTabProps) {
    const loginUrl = window.logindesignerwpData?.loginUrl || '/wp-login.php'

    const hasAIKey = !!settings.openai_api_key
    const aiBadge = hasAIKey ? (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
            AI Active
        </span>
    ) : (
        <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
            Setup Required
        </span>
    )

    return (
        <div className="space-y-6">
            {/* Wizard Modal */}
            {showWizard && (
                <Wizard
                    settings={settings}
                    onChange={onChange}
                    onClose={() => setShowWizard(false)}
                    onApply={() => {
                        onSave()
                        setShowWizard(false)
                    }}
                    presets={presets}
                    isPro={isPro}
                />
            )}

            {/* Presets Section */}
            <PresetsSection
                settings={settings}
                onBulkChange={onBulkChange}
                presets={presets}
                isPro={isPro}
            />

            {/* Smart Theme Generator (New Pro Feature) */}
            {isPro && (
                <SmartThemeGenerator onBulkChange={onBulkChange} />
            )}

            {/* Layout Options - Now near the top for foundational decision */}
            <ProSection title="Layout" description="Choose your login page layout" isPro={isPro}>
                <LayoutSection settings={settings} onChange={onChange} isPro={isPro} />
            </ProSection>

            {/* Background Section - Now layout-aware */}
            <BackgroundSection settings={settings} onChange={onChange} isPro={isPro} />

            {/* Form Section */}
            <FormSection settings={settings} onChange={onChange} isPro={isPro} />

            {/* Logo Section */}
            <LogoSection settings={settings} onChange={onChange} />

            <ProSection title="AI Tools" description="Generate backgrounds and themes with AI" isPro={isPro} extraBadge={aiBadge}>
                <AIToolsSection
                    onBulkChange={onBulkChange}
                    settings={settings}
                />
            </ProSection>

            {/* Redirects & Behavior */}
            <ProSection title="Redirects & Behavior" description="Control where users go after login/logout" isPro={isPro}>
                <div className="space-y-3">
                    <div className="space-y-2">
                        <Label>After Login Redirect</Label>
                        <Input
                            placeholder="/my-account/"
                            value={settings.redirect_after_login || ''}
                            onChange={(e) => onChange('redirect_after_login', e.target.value)}
                            disabled={!isPro}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>After Logout Redirect</Label>
                        <Input
                            placeholder="/"
                            value={settings.redirect_after_logout || ''}
                            onChange={(e) => onChange('redirect_after_logout', e.target.value)}
                            disabled={!isPro}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Custom Message</Label>
                        <textarea
                            placeholder="Need help? Contact support..."
                            value={settings.custom_message || ''}
                            onChange={(e) => onChange('custom_message', e.target.value)}
                            disabled={!isPro}
                            className="w-full h-16 px-3 py-2 rounded-md border bg-background text-sm resize-none"
                        />
                    </div>
                </div>
            </ProSection>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
                <Button variant="wp" onClick={onSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" asChild className="gap-2">
                    <a href={loginUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Open Login Page
                    </a>
                </Button>
                <Button
                    variant="ghost"
                    onClick={onReset}
                    disabled={isResetting}
                    className="gap-2 text-destructive hover:text-destructive"
                >
                    <RotateCcw className="h-4 w-4" />
                    {isResetting ? 'Resetting...' : 'Reset to Defaults'}
                </Button>
            </div>
        </div>
    )
}
