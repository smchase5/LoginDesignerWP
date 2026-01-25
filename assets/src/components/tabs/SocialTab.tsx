import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Save, Github } from 'lucide-react'

interface SocialTabProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    onSave: () => void
    isSaving: boolean
}

export function SocialTab({ settings, onChange, onSave, isSaving }: SocialTabProps) {
    return (
        <div className="space-y-6">
            {/* Google Login */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Google Login
                    </CardTitle>
                    <CardDescription>Allow users to sign in with Google</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Enable Google Login</Label>
                        <Switch
                            checked={!!settings.google_login_enable}
                            onCheckedChange={(checked) => onChange('google_login_enable', checked ? 1 : 0)}
                        />
                    </div>

                    {!!settings.google_login_enable && (
                        <>
                            <div className="space-y-2">
                                <Label>Client ID</Label>
                                <Input
                                    placeholder="Your Google Client ID"
                                    value={settings.google_client_id || ''}
                                    onChange={(e) => onChange('google_client_id', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Client Secret</Label>
                                <Input
                                    type="password"
                                    placeholder="Your Google Client Secret"
                                    value={settings.google_client_secret || ''}
                                    onChange={(e) => onChange('google_client_secret', e.target.value)}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>

            {/* GitHub Login */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Github className="h-5 w-5" />
                        GitHub Login
                    </CardTitle>
                    <CardDescription>Allow users to sign in with GitHub</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Enable GitHub Login</Label>
                        <Switch
                            checked={!!settings.github_login_enable}
                            onCheckedChange={(checked) => onChange('github_login_enable', checked ? 1 : 0)}
                        />
                    </div>

                    {!!settings.github_login_enable && (
                        <>
                            <div className="space-y-2">
                                <Label>Client ID</Label>
                                <Input
                                    placeholder="Your GitHub Client ID"
                                    value={settings.github_client_id || ''}
                                    onChange={(e) => onChange('github_client_id', e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Client Secret</Label>
                                <Input
                                    type="password"
                                    placeholder="Your GitHub Client Secret"
                                    value={settings.github_client_secret || ''}
                                    onChange={(e) => onChange('github_client_secret', e.target.value)}
                                />
                            </div>
                        </>
                    )}
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
