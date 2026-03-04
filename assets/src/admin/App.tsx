import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { DesignTab } from '@/components/tabs/DesignTab'
import { SettingsTab } from '@/components/tabs/SettingsTab'
import { SocialTab } from '@/components/tabs/SocialTab'
import { SecurityTab } from '@/components/tabs/SecurityTab'
import { LivePreview } from '@/components/preview/LivePreview'
import { Wizard } from '@/components/wizard/Wizard'
import { applyLayoutAdjustments } from '@/lib/layout-adjustments'
import { Palette, Settings, Share2, Shield, Wand2 } from 'lucide-react'

type TabId = 'design' | 'settings' | 'social' | 'security'

const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'design', label: 'Design', icon: <Palette className="h-4 w-4" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
    { id: 'social', label: 'Social', icon: <Share2 className="h-4 w-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="h-4 w-4" /> },
]

export default function App() {
    const data = window.logindesignerwpData || {}
    const isPro = data.isPro || false
    const [activeTab, setActiveTab] = useState<TabId>('design')
    const [settings, setSettings] = useState<Record<string, any>>(data.settings || {})
    const [savedSettings, setSavedSettings] = useState<Record<string, any>>(data.settings || {})
    const [isSettingsDirty, setIsSettingsDirty] = useState(false)
    const [securitySettings, setSecuritySettings] = useState<any>(() => {
        const defaults = {
            enabled: false,
            method: 'basic',
            basic_honeypot: true,
            basic_min_time: 2,
            basic_math: false,
            turnstile_site_key: '',
            turnstile_secret: '',
            recaptcha_site_key: '',
            recaptcha_secret: '',
        }
        return { ...defaults, ...(data.security || {}) }
    })
    const [savedSecuritySettings, setSavedSecuritySettings] = useState<any>(() => {
        const defaults = {
            enabled: false,
            method: 'basic',
            basic_honeypot: true,
            basic_min_time: 2,
            basic_math: false,
            turnstile_site_key: '',
            turnstile_secret: '',
            recaptcha_site_key: '',
            recaptcha_secret: '',
        }
        return { ...defaults, ...(data.security || {}) }
    })
    const [isSecurityDirty, setIsSecurityDirty] = useState(false)
    const [showWizard, setShowWizard] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [isResetting, setIsResetting] = useState(false)
    const [presets, setPresets] = useState<Record<string, any>>(data.presets || {})
    const [isPresetsLoading, setIsPresetsLoading] = useState(!data.presets)
    const [designMode, setDesignMode] = useState<'simple' | 'advanced'>(
        () => (localStorage.getItem('ldwp_design_mode') as 'simple' | 'advanced') || 'simple'
    )

    useEffect(() => {
        if (data.presets) {
            return
        }

        let isMounted = true

        const loadPresets = async () => {
            try {
                const formData = new FormData()
                formData.append('action', 'logindesignerwp_get_presets')
                formData.append('nonce', data.nonce)

                const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    body: formData,
                })

                const result = await response.json()
                if (isMounted && result.success && result.data?.presets) {
                    setPresets(result.data.presets)
                }
            } catch (error) {
                console.error('Failed to load presets:', error)
            } finally {
                if (isMounted) {
                    setIsPresetsLoading(false)
                }
            }
        }

        loadPresets()

        return () => {
            isMounted = false
        }
    }, [data.nonce, data.presets])

    const handleDesignModeChange = (mode: 'simple' | 'advanced') => {
        setDesignMode(mode)
        localStorage.setItem('ldwp_design_mode', mode)
    }

    const hasUnsavedChanges = isSettingsDirty || isSecurityDirty

    const handleSettingChange = (key: string, value: any) => {
        setSettings((prev) => {
            if (prev[key] === value) {
                return prev
            }

            const nextSettings = (key === 'layout_mode' || key === 'layout_form_style')
                ? applyLayoutAdjustments({ ...prev, [key]: value })
                : { ...prev, [key]: value }

            setIsSettingsDirty(true)
            return nextSettings
        })
    }

    const handleBulkChange = (updates: Record<string, any>) => {
        setSettings((prev) => {
            const nextBase = { ...prev, ...updates }
            const nextSettings = ('layout_mode' in updates || 'layout_form_style' in updates)
                ? applyLayoutAdjustments(nextBase)
                : nextBase
            let hasChanges = false

            for (const [key, value] of Object.entries(nextSettings)) {
                if (prev[key] !== value) {
                    hasChanges = true
                    break
                }
            }

            if (!hasChanges) {
                return prev
            }

            setIsSettingsDirty(true)
            return nextSettings
        })
    }

    const handleDiscard = () => {
        setSettings(savedSettings)
        setSecuritySettings(savedSecuritySettings)
        setIsSettingsDirty(false)
        setIsSecurityDirty(false)
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            // Save visual settings if changed
            if (isSettingsDirty) {
                const settingsFormData = new FormData()
                settingsFormData.append('action', 'logindesignerwp_save_settings')
                settingsFormData.append('nonce', data.nonce)

                Object.entries(settings).forEach(([key, value]) => {
                    settingsFormData.append(`logindesignerwp_settings[${key}]`, String(value))
                })

                const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    body: settingsFormData,
                })

                const result = await response.json()
                if (result.success) {
                    setSavedSettings({ ...settings })
                    setIsSettingsDirty(false)
                }
            }

            // Save security settings if changed
            if (isSecurityDirty) {
                const securityFormData = new FormData()
                securityFormData.append('action', 'logindesignerwp_save_security_settings')
                securityFormData.append('nonce', data.securityNonce || data.nonce)

                const params = new URLSearchParams()
                if (securitySettings.enabled) params.append('enabled', '1')
                params.append('method', securitySettings.method)
                if (securitySettings.basic_honeypot) params.append('basic_honeypot', '1')
                params.append('basic_min_time', String(securitySettings.basic_min_time))
                if (securitySettings.basic_math) params.append('basic_math', '1')
                params.append('turnstile_site_key', securitySettings.turnstile_site_key)
                params.append('turnstile_secret', securitySettings.turnstile_secret)
                params.append('recaptcha_site_key', securitySettings.recaptcha_site_key)
                params.append('recaptcha_secret', securitySettings.recaptcha_secret)

                securityFormData.append('data', params.toString())

                const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    body: securityFormData,
                })

                const result = await response.json()
                if (result.success) {
                    setSavedSecuritySettings({ ...securitySettings })
                    setIsSecurityDirty(false)
                }
            }
        } catch (error) {
            console.error('Save failed:', error)
        } finally {
            setIsSaving(false)
        }
    }

    const handleReset = async () => {
        if (!confirm('Are you sure you want to reset all settings to WordPress defaults? This cannot be undone.')) {
            return
        }

        setIsResetting(true)
        try {
            const formData = new FormData()
            formData.append('action', 'logindesignerwp_reset_defaults')
            formData.append('nonce', data.nonce)

            const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()
            if (result.success) {
                // Reload the page to get fresh defaults
                window.location.reload()
            } else {
                console.error('Reset failed:', result.data?.message || 'Unknown error')
            }
        } catch (error) {
            console.error('Reset failed:', error)
        } finally {
            setIsResetting(false)
        }
    }

    return (
        <div className="ldwp-admin">
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">LoginDesignerWP</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Customize your WordPress login screen with simple, lightweight controls.
                    </p>
                </div>
                <Button variant="wp" onClick={() => setShowWizard(true)} className="gap-2">
                    <Wand2 className="h-4 w-4" />
                    Start Wizard
                </Button>
            </div>

            {/* Tab Navigation — shadcn Line style */}
            <div className="relative mb-8">
                <div className="flex">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                activeTab === tab.id
                                    ? "text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            {tab.icon}
                            {tab.label}
                            {/* Active indicator line */}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-foreground rounded-full" />
                            )}
                        </button>
                    ))}
                </div>
                {/* Full-width bottom border */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-border" />
            </div>

            {/* Tab Content */}
            <div className={cn("flex gap-6 transition-all duration-300", showWizard ? "relative z-[50]" : "")}>
                {/* Settings Column - 50% */}
                <div className="w-1/2 flex-shrink-0">
                    {showWizard ? (
                        <Wizard
                            settings={settings}
                            onChange={handleSettingChange}
                            onClose={() => setShowWizard(false)}
                            onApply={() => {
                                setShowWizard(false)
                                handleSave()
                            }}
                            presets={presets}
                            presetsLoading={isPresetsLoading}
                            isPro={isPro}
                        />
                    ) : (
                        <>
                            {activeTab === 'design' && (
                                <DesignTab
                                    settings={settings}
                                    onChange={handleSettingChange}
                                    onBulkChange={handleBulkChange}
                                    onSave={handleSave}
                                    onReset={handleReset}
                                    isSaving={isSaving}
                                    isResetting={isResetting}
                                    presets={presets}
                                    presetsLoading={isPresetsLoading}
                                    isPro={isPro}
                                    designMode={designMode}
                                    onDesignModeChange={handleDesignModeChange}
                                />
                            )}
                            {activeTab === 'settings' && (
                                <SettingsTab
                                    settings={settings}
                                    onChange={handleSettingChange}
                                    onSave={handleSave}
                                    isSaving={isSaving}
                                    isPro={isPro}
                                />
                            )}
                            {activeTab === 'social' && (
                                <SocialTab
                                    settings={settings}
                                    onChange={handleSettingChange}
                                    onSave={handleSave}
                                    isSaving={isSaving}
                                    isPro={isPro}
                                />
                            )}
                            {activeTab === 'security' && (
                                <SecurityTab
                                    settings={settings}
                                    onChange={handleSettingChange}
                                    onSave={handleSave}
                                    isSaving={isSaving}
                                    securitySettings={securitySettings}
                                    onSecurityChange={(key, value) => setSecuritySettings((prev: any) => {
                                        if (prev[key] === value) {
                                            return prev
                                        }

                                        setIsSecurityDirty(true)
                                        return { ...prev, [key]: value }
                                    })}
                                />
                            )}
                        </>
                    )}
                </div>

                {/* Preview Column (Design Tab Only) - 50% */}
                {(activeTab === 'design' || activeTab === 'security' || activeTab === 'social') && (
                    <div className="w-1/2 flex-shrink-0 pr-4">
                        <LivePreview
                            settings={settings}
                            hasUnsavedChanges={hasUnsavedChanges}
                            onDiscard={handleDiscard}
                            onBulkChange={handleBulkChange}
                            onSave={handleSave}
                            isSaving={isSaving}
                            loginUrl={data.loginUrl || '/wp-login.php'}
                            securitySettings={securitySettings}
                        />
                    </div>
                )}
            </div>

            {/* Wizard Focus Mode Backdrop */}
            {showWizard && (
                <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[45] animate-in fade-in duration-300" />
            )}
        </div>
    )
}
