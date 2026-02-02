import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Rocket } from 'lucide-react'

// Interface to satisfy type checking in App.tsx
interface SocialTabProps {
    settings?: Record<string, any>
    onChange?: (key: string, value: any) => void
    onSave?: () => void
    isSaving?: boolean
    isPro?: boolean
}

export function SocialTab({ }: SocialTabProps) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Rocket className="h-5 w-5" />
                        Social Login
                    </CardTitle>
                    <CardDescription>Integrate with your favorite social platforms.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-10 text-center space-y-4">
                    <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center">
                        <Rocket className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="max-w-xs space-y-2">
                        <h3 className="font-semibold text-lg">Coming Soon</h3>
                        <p className="text-sm text-muted-foreground">
                            We are working hard to bring you social login integrations. Stay tuned for updates!
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
