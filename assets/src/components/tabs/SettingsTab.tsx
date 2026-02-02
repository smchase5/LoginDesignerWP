import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save, ExternalLink, Check, X, Loader2 } from 'lucide-react'

interface SettingsTabProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    onSave: () => void
    isSaving: boolean
    isPro?: boolean
}

export function SettingsTab({ settings, onChange, onSave, isSaving, isPro = false }: SettingsTabProps) {
    const version = '1.0.0'
    const isProPluginActive = window.logindesignerwpData.isProPluginActive
    const [licenseKey, setLicenseKey] = useState(window.logindesignerwpData.license?.key || '')
    const [licenseStatus, setLicenseStatus] = useState(window.logindesignerwpData.license?.status || 'invalid')
    const [isLicenseLoading, setIsLicenseLoading] = useState(false)
    const [licenseMessage, setLicenseMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null)

    const handleLicenseAction = async (action: 'activate' | 'deactivate') => {
        setIsLicenseLoading(true)
        setLicenseMessage(null)

        try {
            const formData = new FormData()
            formData.append('action', `logindesignerwp_${action}_license`)
            formData.append('nonce', window.logindesignerwpData.licenseNonce || '')
            if (action === 'activate') {
                formData.append('license_key', licenseKey)
            }

            const response = await fetch(window.ajaxurl, {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()

            if (data.success) {
                setLicenseStatus(action === 'activate' ? 'valid' : 'invalid')
                setLicenseMessage({
                    text: action === 'activate' ? 'License activated successfully!' : 'License deactivated.',
                    type: 'success'
                })
                // Reload to refresh pro status across the app
                setTimeout(() => window.location.reload(), 1500)
            } else {
                setLicenseMessage({ text: data.data.message || 'An error occurred.', type: 'error' })
            }
        } catch (error) {
            setLicenseMessage({ text: 'Network error. Please try again.', type: 'error' })
        } finally {
            setIsLicenseLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Pro License Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <span className="dashicons dashicons-admin-network h-5 w-5"></span>
                        Pro License
                    </CardTitle>
                    <CardDescription>
                        {isProPluginActive
                            ? 'Manage your Login Designer WP Pro license.'
                            : 'Activate LoginDesignerWP Pro to unlock additional design presets, glassmorphism effects, custom CSS, and more.'
                        }
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isProPluginActive ? (
                        <div className="space-y-4">
                            <div className="flex gap-3 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label>License Key</Label>
                                    <Input
                                        type="password"
                                        value={licenseKey}
                                        onChange={(e) => setLicenseKey(e.target.value)}
                                        placeholder="Enter your license key..."
                                        disabled={licenseStatus === 'valid' || isLicenseLoading}
                                    />
                                </div>
                                {licenseStatus === 'valid' ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => handleLicenseAction('deactivate')}
                                        disabled={isLicenseLoading}
                                    >
                                        {isLicenseLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Deactivate'}
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => handleLicenseAction('activate')}
                                        disabled={isLicenseLoading || !licenseKey}
                                    >
                                        {isLicenseLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Activate'}
                                    </Button>
                                )}
                            </div>

                            {licenseStatus === 'valid' && (
                                <div className="flex items-center gap-2 text-green-600 text-sm">
                                    <Check className="h-4 w-4" />
                                    <span className="font-semibold">License Active</span>
                                </div>
                            )}

                            {licenseMessage && (
                                <p className={`text-sm ${licenseMessage.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                    {licenseMessage.text}
                                </p>
                            )}
                        </div>
                    ) : (
                        <Button asChild variant="wp">
                            <a href="https://frontierwp.com/logindesignerwp-pro" target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Get Pro
                            </a>
                        </Button>
                    )}
                </CardContent>
            </Card>

            {/* AI Settings (Pro Only) */}
            {isPro && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <span className="dashicons dashicons-superhero h-5 w-5"></span>
                            AI Settings
                        </CardTitle>
                        <CardDescription>Configure OpenAI settings for AI tools.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label>OpenAI API Key</Label>
                            <Input
                                type="password"
                                placeholder="sk-..."
                                value={settings.openai_api_key || ''}
                                onChange={(e) => onChange('openai_api_key', e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Required for AI features. Get your key from{' '}
                                <a
                                    href="https://platform.openai.com/api-keys"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                >
                                    OpenAI Platform
                                </a>
                                .
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>AI Model</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                value={settings.ai_model || 'gpt-4o-mini'}
                                onChange={(e) => onChange('ai_model', e.target.value)}
                            >
                                <option value="gpt-4o-mini">GPT-4o Mini (Faster, Cheaper)</option>
                                <option value="gpt-4o">GPT-4o (Higher Quality)</option>
                                <option value="gpt-4-turbo">GPT-4 Turbo</option>
                            </select>
                            <p className="text-xs text-muted-foreground">Select the AI model to use for generation.</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* General Settings */}
            <Card>
                <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>Configure general plugin behavior.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Enable Custom Styles</Label>
                            <p className="text-xs text-muted-foreground">Apply custom login page styles</p>
                        </div>
                        <Switch
                            checked={settings.enable_styles !== false && settings.enable_styles !== 0}
                            onCheckedChange={(checked) => onChange('enable_styles', checked ? 1 : 0)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Hide WordPress Logo</Label>
                            <p className="text-xs text-muted-foreground">Remove the WordPress logo</p>
                        </div>
                        <Switch
                            checked={!!settings.hide_wp_logo}
                            onCheckedChange={(checked) => onChange('hide_wp_logo', checked ? 1 : 0)}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Custom Login URL</Label>
                            <p className="text-xs text-muted-foreground">Where the logo links to</p>
                        </div>
                        <Input
                            className="max-w-xs"
                            placeholder="https://yoursite.com"
                            value={settings.logo_url || ''}
                            onChange={(e) => onChange('logo_url', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* About Card */}
            <Card>
                <CardHeader>
                    <CardTitle>About</CardTitle>
                    <CardDescription>Plugin information</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <span className="text-sm font-medium">Version</span>
                            <span className="text-sm text-muted-foreground">{version}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-border">
                            <span className="text-sm font-medium">Pro Status</span>
                            {isPro ? (
                                <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                                    <Check className="h-4 w-4" />
                                    Active
                                </span>
                            ) : (
                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                    <X className="h-4 w-4" />
                                    Not Active
                                </span>
                            )}
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm font-medium">Documentation</span>
                            <a
                                href="https://frontierwp.com/docs/logindesignerwp"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline flex items-center gap-1"
                            >
                                View Docs
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center gap-3 pt-4">
                <Button variant="wp" onClick={onSave} disabled={isSaving} className="gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </div>
    )
}
