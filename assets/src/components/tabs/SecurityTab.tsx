import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Shield, Lock } from 'lucide-react'

interface SecuritySettings {
    enabled: boolean
    method: 'basic' | 'turnstile' | 'recaptcha'
    basic_honeypot: boolean
    basic_min_time: number
    basic_math: boolean
    turnstile_site_key: string
    turnstile_secret: string
    recaptcha_site_key: string
    recaptcha_secret: string
}

interface SecurityTabProps {
    settings: any // Kept for signature compatibility but mostly unused
    onChange: (key: string, value: any) => void
    onSave: () => void // We'll trigger this but also do our own save
    securitySettings: SecuritySettings
    onSecurityChange: (key: string, value: any) => void
    isSaving: boolean
}

export function SecurityTab({ securitySettings, onSecurityChange: handleChangeAction, onSave: _onSave }: SecurityTabProps) {
    const isPro = window.logindesignerwpData?.isPro || false

    const handleChange = (key: keyof SecuritySettings, value: any) => {
        handleChangeAction(key, value)
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Bot Protection
                    </CardTitle>
                    <CardDescription>Protect your login form from bots and spam attacks.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Master Toggle */}
                    <div className="flex items-center justify-between">
                        <div>
                            <Label className="text-base">Enable Protection</Label>
                            <p className="text-sm text-muted-foreground">Turn on security features</p>
                        </div>
                        <Switch
                            checked={securitySettings.enabled}
                            onCheckedChange={(checked) => handleChange('enabled', checked)}
                        />
                    </div>

                    {securitySettings.enabled && (
                        <div className="space-y-6 pt-4 border-t">
                            {/* Method Selector */}
                            <div className="space-y-3">
                                <Label>Protection Method</Label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div
                                        onClick={() => handleChange('method', 'basic')}
                                        className={`cursor-pointer rounded-lg border-2 p-4 hover:border-primary/50 transition-colors ${securitySettings.method === 'basic' ? 'border-primary bg-primary/5' : 'border-muted'}`}
                                    >
                                        <div className="font-semibold">Basic</div>
                                        <div className="text-xs text-muted-foreground">Honeypot, Math, Time limit</div>
                                    </div>

                                    <div
                                        onClick={() => isPro && handleChange('method', 'turnstile')}
                                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${!isPro ? 'opacity-70' : 'hover:border-primary/50'} ${securitySettings.method === 'turnstile' ? 'border-primary bg-primary/5' : 'border-muted'}`}
                                    >
                                        <div className="font-semibold flex items-center gap-2">
                                            Turnstile
                                            {!isPro && <Lock className="h-3 w-3 text-muted-foreground" />}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Cloudflare smart protection</div>
                                    </div>

                                    <div
                                        onClick={() => isPro && handleChange('method', 'recaptcha')}
                                        className={`relative cursor-pointer rounded-lg border-2 p-4 transition-colors ${!isPro ? 'opacity-70' : 'hover:border-primary/50'} ${securitySettings.method === 'recaptcha' ? 'border-primary bg-primary/5' : 'border-muted'}`}
                                    >
                                        <div className="font-semibold flex items-center gap-2">
                                            reCAPTCHA
                                            {!isPro && <Lock className="h-3 w-3 text-muted-foreground" />}
                                        </div>
                                        <div className="text-xs text-muted-foreground">Google reCAPTCHA v2</div>
                                    </div>
                                </div>
                            </div>

                            {/* Basic Settings */}
                            {securitySettings.method === 'basic' && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Honeypot</Label>
                                            <p className="text-xs text-muted-foreground">Hidden field that traps bots</p>
                                        </div>
                                        <Switch
                                            checked={securitySettings.basic_honeypot}
                                            onCheckedChange={(c) => handleChange('basic_honeypot', c)}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Math Challenge</Label>
                                            <p className="text-xs text-muted-foreground">Simple math question</p>
                                        </div>
                                        <Switch
                                            checked={securitySettings.basic_math}
                                            onCheckedChange={(c) => handleChange('basic_math', c)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Minimum Submission Time (seconds)</Label>
                                        <Input
                                            type="number"
                                            min={0}
                                            value={securitySettings.basic_min_time}
                                            onChange={(e) => handleChange('basic_min_time', parseInt(e.target.value) || 0)}
                                            className="max-w-[100px]"
                                        />
                                        <p className="text-xs text-muted-foreground">Block forms submitted faster than this.</p>
                                    </div>
                                </div>
                            )}

                            {/* Turnstile Settings */}
                            {securitySettings.method === 'turnstile' && isPro && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label>Site Key</Label>
                                        <Input
                                            value={securitySettings.turnstile_site_key}
                                            onChange={(e) => handleChange('turnstile_site_key', e.target.value)}
                                            placeholder="0x4AAAAAA..."
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secret Key</Label>
                                        <Input
                                            type="password"
                                            value={securitySettings.turnstile_secret}
                                            onChange={(e) => handleChange('turnstile_secret', e.target.value)}
                                            placeholder="0x4AAAAAA..."
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Get your keys from the <a href="https://dash.cloudflare.com/" target="_blank" className="underline hover:text-primary">Cloudflare Dashboard</a>.
                                    </div>
                                </div>
                            )}

                            {/* reCAPTCHA Settings */}
                            {securitySettings.method === 'recaptcha' && isPro && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-2">
                                        <Label>Site Key</Label>
                                        <Input
                                            value={securitySettings.recaptcha_site_key}
                                            onChange={(e) => handleChange('recaptcha_site_key', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Secret Key</Label>
                                        <Input
                                            type="password"
                                            value={securitySettings.recaptcha_secret}
                                            onChange={(e) => handleChange('recaptcha_secret', e.target.value)}
                                        />
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        Get your keys from the <a href="https://www.google.com/recaptcha/admin" target="_blank" className="underline hover:text-primary">Google Admin Console</a>.
                                    </div>
                                </div>
                            )}

                            {/* Pro Upsell for Methods */}
                            {['turnstile', 'recaptcha'].includes(securitySettings.method) && !isPro && (
                                <div className="p-4 bg-muted/50 rounded-lg border text-center">
                                    <p className="text-sm font-medium mb-2">This feature requires LoginDesignerWP Pro</p>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href="https://logindesignerwp.com/pricing" target="_blank">Upgrade Now</a>
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>


        </div>
    )
}

