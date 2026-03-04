import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { ColorPicker } from '@/components/ui/color-picker'
import { Slider } from '@/components/ui/slider'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { ensureWpMedia } from '@/lib/wp-media'
import { Image, X } from 'lucide-react'

interface LogoSectionProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
    designMode?: 'simple' | 'advanced'
}

export function LogoSection({ settings, onChange, designMode = 'advanced' }: LogoSectionProps) {
    const logoBackgroundRadius = settings.logo_border_radius ?? 0
    const logoCornerPreset =
        logoBackgroundRadius >= 999 ? 'pill'
            : logoBackgroundRadius >= 16 ? 'rounded'
                : logoBackgroundRadius >= 8 ? 'soft'
                    : 'square'

    const handleLogoCornerChange = (value: string) => {
        const radiusMap: Record<string, number> = {
            square: 0,
            soft: 8,
            rounded: 16,
            pill: 999,
        }

        onChange('logo_border_radius', radiusMap[value] ?? 0)
    }

    const openMediaLibrary = async () => {
        try {
            await ensureWpMedia()

            const frame = window.wp.media({
                title: 'Select Logo',
                button: { text: 'Use this logo' },
                multiple: false
            })
            frame.on('select', () => {
                const attachment = frame.state().get('selection').first().toJSON()
                onChange('logo_id', attachment.id)
                onChange('logo_image_url', attachment.url)
            })
            frame.open()
        } catch (error) {
            console.error('LoginDesignerWP: Error opening logo media library:', error)
            alert('WordPress media library is not ready yet. Please try again in a moment.')
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Logo</CardTitle>
                <CardDescription>Customize your login logo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Logo Upload */}
                <div className="flex items-center gap-4">
                    {settings.logo_image_url ? (
                        <div className="relative h-16 w-24 rounded border overflow-hidden bg-muted flex items-center justify-center">
                            <img
                                src={settings.logo_image_url}
                                alt="Logo"
                                className="max-h-full max-w-full object-contain"
                            />
                            <button
                                onClick={() => {
                                    onChange('logo_id', '')
                                    onChange('logo_image_url', '')
                                }}
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                            >
                                <X className="h-3 w-3" />
                            </button>
                        </div>
                    ) : (
                        <div className="h-16 w-24 rounded border border-dashed border-border flex items-center justify-center bg-muted">
                            <Image className="h-6 w-6 text-muted-foreground" />
                        </div>
                    )}
                    <Button variant="outline" onClick={openMediaLibrary}>
                        {settings.logo_id ? 'Change Logo' : 'Select Logo'}
                    </Button>
                </div>

                {/* Logo Dimensions - Advanced only */}
                {designMode === 'advanced' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label>Size (Width)</Label>
                            <div className="flex items-center gap-2">
                                <Slider
                                    min={20}
                                    max={500}
                                    step={1}
                                    value={[settings.logo_width || 84]}
                                    onValueChange={([val]) => onChange('logo_width', val)}
                                    className="w-24"
                                />
                                <span className="text-sm font-medium text-primary w-12 text-right">
                                    {settings.logo_width || 84}px
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>Height</Label>
                            <div className="flex items-center gap-2">
                                <Slider
                                    min={20}
                                    max={500}
                                    step={1}
                                    value={[settings.logo_height || 84]}
                                    onValueChange={([val]) => onChange('logo_height', val)}
                                    className="w-24"
                                />
                                <span className="text-sm font-medium text-primary w-12 text-right">
                                    {settings.logo_height || 84}px
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Padding - Advanced only */}
                {designMode === 'advanced' && (
                    <div className="flex items-center justify-between">
                        <Label>Padding</Label>
                        <div className="flex items-center gap-2">
                            <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[settings.logo_padding || 0]}
                                onValueChange={([val]) => onChange('logo_padding', val)}
                                className="w-24"
                            />
                            <span className="text-sm font-medium text-primary w-12">
                                {settings.logo_padding || 0}px
                            </span>
                        </div>
                    </div>
                )}

                {/* Bottom Margin - Advanced only */}
                {designMode === 'advanced' && (
                    <div className="flex items-center justify-between">
                        <Label>Bottom Margin</Label>
                        <div className="flex items-center gap-2">
                            <Slider
                                min={0}
                                max={100}
                                step={1}
                                value={[settings.logo_bottom_margin || 25]}
                                onValueChange={([val]) => onChange('logo_bottom_margin', val)}
                                className="w-24"
                            />
                            <span className="text-sm font-medium text-primary w-12">
                                {settings.logo_bottom_margin || 25}px
                            </span>
                        </div>
                    </div>
                )}

                {/* Logo Background - Advanced only */}
                {designMode === 'advanced' && (
                    <>
                        <div className="flex items-center justify-between">
                            <Label>Logo Background</Label>
                            <Switch
                                checked={!!settings.logo_background_enable}
                                onCheckedChange={(checked) => onChange('logo_background_enable', checked ? 1 : 0)}
                            />
                        </div>

                        {!!settings.logo_background_enable && (
                            <div className="space-y-4 pl-4 border-l-2 border-border">
                                <div className="space-y-2">
                                    <Label>Background Color</Label>
                                    <ColorPicker
                                        value={settings.logo_background_color || '#ffffff'}
                                        onChange={(color) => onChange('logo_background_color', color)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Corner Style</Label>
                                    <SegmentedControl
                                        value={logoCornerPreset}
                                        onChange={handleLogoCornerChange}
                                        options={[
                                            { value: 'square', label: 'Square' },
                                            { value: 'soft', label: 'Soft' },
                                            { value: 'rounded', label: 'Rounded' },
                                            { value: 'pill', label: 'Pill' },
                                        ]}
                                        buttonClassName="text-xs py-1.5"
                                    />
                                </div>
                            </div>
                        )}
                    </>
                )}

                {/* Logo URL */}
                <div className="space-y-2 pt-4 border-t border-border">
                    <Label>Logo URL</Label>
                    <Input
                        type="text"
                        placeholder="https://yoursite.com"
                        value={settings.logo_url || ''}
                        onChange={(e) => onChange('logo_url', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Link when clicking the logo. Default: Homepage.</p>
                </div>

                {/* Logo Title - Advanced only */}
                {designMode === 'advanced' && (
                    <div className="space-y-2">
                        <Label>Logo Title</Label>
                        <Input
                            type="text"
                            placeholder="Your Site Name"
                            value={settings.logo_title || ''}
                            onChange={(e) => onChange('logo_title', e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Title attribute for the logo link. Default: Site Title.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
