import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '../../ui/textarea'
import { Upload, X, ImageIcon } from 'lucide-react'

interface BrandStepProps {
    settings: Record<string, any>
    onChange: (key: string, value: any) => void
}

export function BrandStep({ settings, onChange }: BrandStepProps) {
    const isSplitLayout = (settings.layout_mode || '').startsWith('split_') || settings.layout_mode === 'card_split'

    // Auto-enable brand content and set defaults for split layouts
    useEffect(() => {
        if (isSplitLayout) {
            // Ensure the toggle is on
            if (!settings.brand_content_enable) {
                onChange('brand_content_enable', true)
            }
            // Set default Welcome Title if empty
            if (!settings.brand_title) {
                onChange('brand_title', 'Welcome Back')
            }
            // Set default Subtitle if empty
            if (!settings.brand_subtitle) {
                onChange('brand_subtitle', 'Log in to access your account.')
            }
        }
    }, [isSplitLayout]) // Run once when layout mode check changes or component mounts into this state

    const handleMediaSelect = (keyId: string, keyUrl: string) => {
        if (typeof window.wp !== 'undefined' && window.wp.media) {
            const frame = window.wp.media({
                title: 'Select Image',
                button: { text: 'Use this image' },
                multiple: false
            })
            frame.on('select', () => {
                const attachment = frame.state().get('selection').first().toJSON()
                onChange(keyId, attachment.id)
                onChange(keyUrl, attachment.url)
            })
            frame.open()
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Logo Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b">
                    <h3 className="text-sm font-medium text-foreground">Login Logo</h3>
                </div>

                <div className="flex items-start gap-6">
                    <div className="flex-1 space-y-2">
                        <Label>Logo Image</Label>
                        <p className="text-xs text-muted-foreground">
                            This logo appears above your login form.
                        </p>
                        <div className="flex gap-2 mt-2">
                            <Button
                                variant="outline"
                                onClick={() => handleMediaSelect('logo_id', 'logo_image_url')}
                                className="w-full justify-start gap-2"
                            >
                                <Upload className="w-4 h-4" />
                                {settings.logo_image_url ? 'Change Logo' : 'Upload Logo'}
                            </Button>
                            {settings.logo_image_url && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                        onChange('logo_id', '')
                                        onChange('logo_image_url', '')
                                    }}
                                    className="text-muted-foreground hover:text-destructive"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="w-32 h-32 rounded-lg border-2 border-dashed border-muted-foreground/20 flex flex-col items-center justify-center bg-muted/30 overflow-hidden relative">
                        {settings.logo_image_url ? (
                            <img
                                src={settings.logo_image_url}
                                alt="Logo Preview"
                                className="max-w-full max-h-full p-2 object-contain"
                            />
                        ) : (
                            <div className="text-center p-2">
                                <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/50 mb-1" />
                                <span className="text-[10px] text-muted-foreground">Preview</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Split Layout Brand Content - Only shown for Split Layouts */}
            {isSplitLayout && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between pb-2 border-b pt-2">
                        <h3 className="text-sm font-medium text-foreground">Brand Layout Content</h3>
                        <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">Split Layout Active</span>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                            <Label>Welcome Title</Label>
                            <Input
                                value={settings.brand_title || ''}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange('brand_title', e.target.value)}
                                placeholder="e.g. Welcome to Dashboard"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Subtitle / Message</Label>
                            <Textarea
                                value={settings.brand_subtitle || ''}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange('brand_subtitle', e.target.value)}
                                placeholder="Enter a welcoming message for your users..."
                                className="h-20 resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Brand Logo (Sidebar)</Label>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMediaSelect('brand_logo_id', 'brand_logo_url')}
                                    className="gap-2"
                                >
                                    <Upload className="w-3 h-3" />
                                    {settings.brand_logo_url ? 'Change Brand Logo' : 'Upload Brand Logo'}
                                </Button>
                                {settings.brand_logo_url && (
                                    <span className="text-xs text-muted-foreground flex items-center">
                                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                                        Logo Selected
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
