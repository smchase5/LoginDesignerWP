import * as React from 'react'
import { cn } from '@/lib/utils'
import { Upload, X, Loader2 } from 'lucide-react'

interface ImageUploadProps {
    value?: string
    onChange: (url: string, id?: string) => void
    onRemove?: () => void
    className?: string
    height?: string
}

export function ImageUpload({
    value,
    onChange,
    onRemove,
    className,
    height = '80px'
}: ImageUploadProps) {
    const [isUploading, setIsUploading] = React.useState(false)
    const [isDragging, setIsDragging] = React.useState(false)
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleFile = async (file: File) => {
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file')
            return
        }

        setIsUploading(true)

        try {
            const formData = new FormData()
            formData.append('action', 'logindesignerwp_upload_image')
            formData.append('nonce', (window as any).logindesignerwpData?.nonce || '')
            formData.append('file', file)

            const response = await fetch((window as any).ajaxurl || '/wp-admin/admin-ajax.php', {
                method: 'POST',
                body: formData,
                credentials: 'same-origin'
            })

            const result = await response.json()

            if (result.success && result.data) {
                onChange(result.data.url, result.data.id)
            } else {
                alert(result.data?.message || 'Upload failed. Please try again.')
            }
        } catch (error) {
            console.error('Upload error:', error)
            alert('Upload failed. Please try again.')
        } finally {
            setIsUploading(false)
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const file = e.dataTransfer.files[0]
        if (file) {
            handleFile(file)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = () => {
        setIsDragging(false)
    }

    const handleClick = () => {
        if (!isUploading) {
            inputRef.current?.click()
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            handleFile(file)
        }
        // Reset input so the same file can be selected again
        e.target.value = ''
    }

    return (
        <div className={cn("relative", className)}>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleInputChange}
                className="hidden"
            />

            <div
                onClick={handleClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    "relative group cursor-pointer rounded-lg border-2 border-dashed transition-all overflow-hidden",
                    isDragging
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50",
                    isUploading && "pointer-events-none opacity-70"
                )}
                style={{ height }}
            >
                {value ? (
                    <>
                        <img
                            src={value}
                            alt="Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white text-xs font-medium">
                                {isUploading ? 'Uploading...' : 'Change Image'}
                            </span>
                        </div>
                    </>
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                        {isUploading ? (
                            <>
                                <Loader2 className="w-6 h-6 mb-1 opacity-50 animate-spin" />
                                <span className="text-xs">Uploading...</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-6 h-6 mb-1 opacity-50" />
                                <span className="text-xs">
                                    {isDragging ? 'Drop image here' : 'Click or drag image'}
                                </span>
                            </>
                        )}
                    </div>
                )}
            </div>

            {value && onRemove && !isUploading && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove()
                    }}
                    className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm hover:bg-destructive/90 transition-colors"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    )
}
