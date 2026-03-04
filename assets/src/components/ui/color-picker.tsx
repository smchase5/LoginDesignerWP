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

function normalizeHex(value: string): string | null {
    const trimmed = value.trim()
    if (!trimmed) return null

    const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`
    const hex = withHash.slice(1)

    if (/^[0-9A-Fa-f]{3}$/.test(hex)) {
        return `#${hex.split("").map((char) => char + char).join("").toLowerCase()}`
    }

    if (/^[0-9A-Fa-f]{6}$/.test(hex)) {
        return withHash.toLowerCase()
    }

    return null
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
    const normalizedValue = normalizeHex(value) ?? "#ffffff"

    // Sync input value with prop value
    React.useEffect(() => {
        setInputValue(normalizedValue)
    }, [normalizedValue])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value
        setInputValue(newValue)

        const normalized = normalizeHex(newValue)
        if (normalized) {
            onChange(normalized)
        }
    }

    const handleInputBlur = () => {
        const normalized = normalizeHex(inputValue)

        if (!normalized) {
            setInputValue(normalizedValue)
            return
        }

        setInputValue(normalized)
        if (normalized !== normalizedValue) {
            onChange(normalized)
        }
    }

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild disabled={disabled}>
                    <button
                        className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-background p-1 shadow-sm cursor-pointer transition-all",
                            "hover:border-primary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                            disabled && "opacity-50 cursor-not-allowed"
                        )}
                        aria-label="Pick a color"
                    >
                        <span
                            className="block h-full w-full rounded-[6px] border border-slate-300/90 shadow-inner"
                            style={{ backgroundColor: normalizedValue }}
                        />
                    </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-3" align="start">
                    <div className="space-y-3">
                        <div className="rounded-lg bg-white p-1 shadow-sm">
                            <HexColorPicker color={normalizedValue} onChange={onChange} />
                        </div>
                        <div className="flex items-center gap-2">
                            <div
                                className="h-8 w-8 rounded border border-input shrink-0"
                                style={{ backgroundColor: normalizedValue }}
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

            <Input
                value={inputValue}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                className={cn("w-28 font-mono text-sm", showInput && "w-28")}
                placeholder="#000000"
                disabled={disabled}
            />
        </div>
    )
}
