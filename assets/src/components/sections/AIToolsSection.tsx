import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Wand2, Type, Image as ImageIcon, Loader2 } from 'lucide-react'

interface AIToolsSectionProps {
    onBulkChange: (updates: Record<string, any>) => void
}

export function AIToolsSection({ onBulkChange }: AIToolsSectionProps) {
    const [isGeneratingBg, setIsGeneratingBg] = useState(false)
    const [isGeneratingTheme, setIsGeneratingTheme] = useState(false)
    const [isExtractingColors, setIsExtractingColors] = useState(false)

    // Background Generator State
    const [bgPrompt, setBgPrompt] = useState('')
    const [bgStyle, setBgStyle] = useState('abstract')


    // Text to Theme State
    const [themePrompt, setThemePrompt] = useState('')

    const handleGenerateBackground = async () => {
        setIsGeneratingBg(true)
        try {
            const formData = new FormData()
            formData.append('action', 'logindesignerwp_generate_background') // Fixed action name
            formData.append('prompt', bgPrompt)
            formData.append('style', bgStyle)
            formData.append('nonce', (window as any).logindesignerwpData.nonce)

            const response = await fetch((window as any).ajaxurl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (result.success) {
                // Apply background image and mode atomically
                onBulkChange({
                    background_image: result.data.id, // Save the ID for persistence
                    background_image_url: result.data.url, // For immediate preview (if needed by weird legacy logic, though ID usually suffices)
                    background_mode: 'image',
                    background_color: '#ffffff' // Reset base color to clean up
                })
                alert('Background generated and applied!')
            } else {
                alert('Error: ' + (result.data || 'Unknown error'))
            }
        } catch (error) {
            console.error('BG Gen failed', error)
            alert('Generation failed. Please check your API key and connection.')
        } finally {
            setIsGeneratingBg(false)
        }
    }

    const handleGenerateTheme = async () => {
        setIsGeneratingTheme(true)
        try {
            const formData = new FormData()
            formData.append('action', 'logindesignerwp_generate_theme') // Fixed action name
            formData.append('prompt', themePrompt)
            formData.append('nonce', (window as any).logindesignerwpData.nonce)

            const response = await fetch((window as any).ajaxurl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (result.success) {
                const themeSettings = result.data.theme || result.data
                // Bulk update settings to prevent race conditions
                onBulkChange(themeSettings)
                alert('Theme generated and applied!')
            } else {
                alert('Error: ' + (result.data || 'Unknown error'))
            }
        } catch (error) {
            console.error('Theme Gen failed', error)
            alert('Theme generation failed.')
        } finally {
            setIsGeneratingTheme(false)
        }
    }

    const handleMagicPalette = async () => {
        setIsExtractingColors(true)
        try {
            const formData = new FormData()
            formData.append('action', 'logindesignerwp_generate_theme_from_bg') // Use the correct backend action
            formData.append('nonce', (window as any).logindesignerwpData.nonce)

            const response = await fetch((window as any).ajaxurl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
            })

            const result = await response.json()

            if (result.success) {
                const themeSettings = result.data.theme || result.data
                // Apply extracted palette
                onBulkChange(themeSettings)
                alert('Magic Palette applied based on your background!')
            } else {
                alert('Error: ' + (result.data || 'Unknown error'))
            }
        } catch (error) {
            console.error('Magic Palette failed', error)
            alert('Magic Palette failed.')
        } finally {
            setIsExtractingColors(false)
        }
    }

    return (
        <div className="grid grid-cols-3 gap-3">
            {/* Background Generator */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors text-center group">
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 group-hover:scale-110 transition-transform flex items-center justify-center mx-auto mb-2">
                            <ImageIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-sm font-semibold mb-1">Background Gen</p>
                        <p className="text-[10px] text-muted-foreground">Create unique backgrounds with DALL-E</p>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>AI Background Generator</DialogTitle>
                        <DialogDescription>
                            Describe the background you want and let AI create it for you.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Prompt</Label>
                            <Input
                                placeholder="e.g. Minimalist blue geometric shapes"
                                value={bgPrompt}
                                onChange={(e) => setBgPrompt(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Style</Label>
                            <Select value={bgStyle} onValueChange={setBgStyle}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="abstract">Abstract</SelectItem>
                                    <SelectItem value="nature">Nature</SelectItem>
                                    <SelectItem value="gradient">Gradient</SelectItem>
                                    <SelectItem value="minimal">Minimal</SelectItem>
                                    <SelectItem value="cyberpunk">Cyberpunk</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleGenerateBackground} disabled={isGeneratingBg || !bgPrompt}>
                            {isGeneratingBg && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate & Apply
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Magic Palette (formerly Magic Import) */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors text-center group">
                        <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900 group-hover:scale-110 transition-transform flex items-center justify-center mx-auto mb-2">
                            <Wand2 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-sm font-semibold mb-1">Magic Palette</p>
                        <p className="text-[10px] text-muted-foreground">Match colors to current background</p>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Magic Palette</DialogTitle>
                        <DialogDescription>
                            Analyze your current background settings (image or color) and automatically generate a matching color scheme for your login form.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
                        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-full">
                            <Wand2 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-sm text-muted-foreground max-w-xs">
                            This will update your form colors, buttons, and text to complement your current background.
                        </p>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleMagicPalette} disabled={isExtractingColors} className="w-full sm:w-auto">
                            {isExtractingColors && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Analyze & Apply Palette
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Text to Theme */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="p-4 rounded-lg border bg-card hover:bg-accent/50 cursor-pointer transition-colors text-center group">
                        <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 group-hover:scale-110 transition-transform flex items-center justify-center mx-auto mb-2">
                            <Type className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <p className="text-sm font-semibold mb-1">Text to Theme</p>
                        <p className="text-[10px] text-muted-foreground">Describe your theme in words</p>
                    </div>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Text to Theme</DialogTitle>
                        <DialogDescription>
                            Describe the look and feel you want (e.g., "Dark modern corporate theme with blue accents").
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Description</Label>
                            <textarea
                                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. A friendly and welcoming login page with soft pastel colors and rounded corners."
                                value={themePrompt}
                                onChange={(e) => setThemePrompt(e.target.value)}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button onClick={handleGenerateTheme} disabled={isGeneratingTheme || !themePrompt}>
                            {isGeneratingTheme && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Generate Theme
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
