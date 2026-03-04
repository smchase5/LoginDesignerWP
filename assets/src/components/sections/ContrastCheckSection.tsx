import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { auditContrast } from '@/lib/contrast'
import { AlertTriangle, Wand2 } from 'lucide-react'

interface ContrastCheckSectionProps {
    settings: Record<string, any>
    onBulkChange: (updates: Record<string, any>) => void
}

export function ContrastCheckSection({ settings, onBulkChange }: ContrastCheckSectionProps) {
    const audit = auditContrast(settings)

    if (audit.issues.length === 0) {
        return null
    }

    return (
        <Card className="border-amber-200 bg-amber-50/60">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="h-4 w-4" />
                    Contrast Check
                </CardTitle>
                <CardDescription className="text-amber-800/90">
                    Some text colors are too close to their current surfaces. This can make the login form hard to read.
                    {audit.approximate && ' Image-based backgrounds are estimated, so this check is approximate.'}
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    {audit.issues.map((issue) => (
                        <div key={issue.id} className="flex items-center justify-between rounded-md border border-amber-200 bg-white/80 px-3 py-2">
                            <div>
                                <p className="text-sm font-medium text-slate-900">
                                    {issue.label} on {issue.surfaceLabel}
                                </p>
                                <p className="text-xs text-slate-600">
                                    Contrast ratio {issue.ratio.toFixed(2)}:1, recommended minimum {issue.minimum}:1
                                </p>
                            </div>
                            <div
                                className="h-7 w-7 rounded-full border border-slate-200 shadow-sm"
                                style={{ backgroundColor: issue.foreground }}
                                title={issue.foreground}
                            />
                        </div>
                    ))}
                </div>

                <Button
                    variant="outline"
                    className="gap-2 border-amber-300 bg-white text-amber-900 hover:bg-amber-100"
                    onClick={() => onBulkChange(audit.fixes)}
                >
                    <Wand2 className="h-4 w-4" />
                    Fix Contrast
                </Button>
            </CardContent>
        </Card>
    )
}
