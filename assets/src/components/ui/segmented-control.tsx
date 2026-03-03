import * as React from "react"
import { cn } from "@/lib/utils"

type SegmentedValue = string | number

interface SegmentedOption<T extends SegmentedValue> {
    value: T
    label: string
    icon?: React.ReactNode
}

interface SegmentedControlProps<T extends SegmentedValue> {
    value: T
    options: SegmentedOption<T>[]
    onChange: (value: T) => void
    className?: string
    buttonClassName?: string
    activeClassName?: string
    inactiveClassName?: string
}

export function SegmentedControl<T extends SegmentedValue>({
    value,
    options,
    onChange,
    className,
    buttonClassName,
    activeClassName,
    inactiveClassName,
}: SegmentedControlProps<T>) {
    const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))

    return (
        <div
            className={cn(
                "relative grid rounded-full border border-slate-200 bg-slate-100 p-1 shadow-inner",
                className
            )}
            style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
        >
            <div
                className={cn(
                    "absolute bottom-1 left-1 top-1 rounded-full border border-slate-300 bg-white shadow-sm transition-transform duration-200 ease-out",
                    activeClassName
                )}
                style={{
                    width: `calc((100% - 0.5rem) / ${options.length})`,
                    transform: `translateX(${selectedIndex * 100}%)`,
                }}
                aria-hidden="true"
            />

            {options.map((option) => {
                const isActive = option.value === value

                return (
                    <button
                        key={String(option.value)}
                        type="button"
                        onClick={() => onChange(option.value)}
                        className={cn(
                            "relative z-10 inline-flex min-h-[42px] items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                            isActive
                                ? "text-slate-900"
                                : "text-slate-600 hover:text-slate-900",
                            buttonClassName,
                            !isActive && inactiveClassName
                        )}
                    >
                        {option.icon}
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
