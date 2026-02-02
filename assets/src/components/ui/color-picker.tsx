"use client"

import * as React from "react"
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface ColorPickerProps {
    value: string
    onChange: (value: string) => void
    className?: string
    showInput?: boolean
    disabled?: boolean
}

export function ColorPicker({
    value,
    onChange,
    className,
    showInput = false,
    disabled = false
}: ColorPickerProps) {
    const [open, setOpen] = React.useState(false)
    const [inputValue, setInputValue] = React.useState(value)

    // Sync input value with prop value
    React.useEffect(() => {
        setInputValue(value)
    }, [value])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)

        // Only update if it's a valid hex color
        if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
            onChange(newValue)
        }
    }

    const handleInputBlur = () => {
        // On blur, if not valid, revert to current value
        if (!/^#[0-9A-Fa-f]{6}$/.test(inputValue)) {
            setInputValue(value)
        }
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild disabled={disabled}>
                    <button
                        className={cn(
                            "h-9 w-14 rounded-md border border-input cursor-pointer transition-colors",
                            "hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        style={{ backgroundColor: value }}
                        aria-label="Pick a color"
                    />
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                    <div className="space-y-3">
                        <HexColorPicker color={value} onChange={onChange} />
                        <div className="flex items-center gap-2">
                            <div
                                className="h-8 w-8 rounded border border-input shrink-0"
                                style={{ backgroundColor: value }}
                            />
                            <Input
                                value={inputValue}
                                onChange={handleInputChange}
                                onBlur={handleInputBlur}
                                className="h-8 font-mono text-sm"
                                placeholder="#000000"
                            />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>

            {showInput && (
                <Input
                    value={inputValue}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    className="w-24 font-mono text-sm"
                    placeholder="#000000"
                    disabled={disabled}
                />
            )}
        </div>
    )
}
