"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "<ecolens>/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-black disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-[0_0_20px_rgba(0,255,133,0.3)] hover:shadow-[0_0_30px_rgba(0,255,133,0.5)] hover:scale-105 active:scale-95",
        destructive:
          "bg-red-500 text-white shadow-elegant hover:bg-red-600 hover:shadow-elegant-md hover:scale-105 active:scale-95",
        outline:
          "border-2 border-emerald-400 bg-transparent text-emerald-400 hover:bg-emerald-400 hover:text-black shadow-[0_0_15px_rgba(0,255,133,0.2)] hover:shadow-[0_0_25px_rgba(0,255,133,0.4)] hover:scale-105 active:scale-95",
        secondary:
          "bg-slate-200 text-slate-900 shadow-elegant hover:bg-slate-300 hover:shadow-elegant-md hover:scale-105 active:scale-95",
        ghost: 
          "text-white hover:text-emerald-400 hover:bg-white/10 hover:scale-105 active:scale-95",
        link: 
          "text-emerald-400 underline-offset-4 hover:underline hover:text-emerald-300",
        verified:
          "bg-emerald-500 text-black font-semibold shadow-[0_0_20px_rgba(0,255,133,0.3)] hover:shadow-[0_0_30px_rgba(0,255,133,0.5)] hover:scale-105 active:scale-95",
        nav:
          "text-white hover:text-emerald-400 hover:bg-white/10 font-medium hover:scale-105 active:scale-95",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-lg px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }