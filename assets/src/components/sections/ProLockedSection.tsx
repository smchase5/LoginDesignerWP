import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Lock, Star, Unlock } from 'lucide-react'

interface ProLockedSectionProps {
    title: string
    description: string
    children?: React.ReactNode
    upgradeUrl?: string
}

export function ProLockedSection({
    title,
    description,
    children,
    upgradeUrl = 'https://frontierwp.com/logindesignerwp-pro'
}: ProLockedSectionProps) {
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
                {/* Disabled preview content */}
                <div className="pointer-events-none select-none opacity-50">
                    {children}
                </div>

                {/* Upgrade CTA */}
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
