"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  openPopup?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, openPopup = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    // Handle click event to create popup if openPopup is true
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (openPopup && props.onClick) {
        e.preventDefault()
        // Create a custom event that will be used to trigger popup opening
        const customEvent = new CustomEvent("openButtonPopup", {
          bubbles: true,
          detail: { buttonId: props.id || "unknown" },
        })
        e.currentTarget.dispatchEvent(customEvent)
      }

      // Call the original onClick handler if it exists
      if (props.onClick) {
        props.onClick(e)
      }
    }

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        type={props.type || "button"}
        onClick={openPopup ? handleClick : props.onClick}
        {...props}
        data-popup-trigger={openPopup ? "true" : undefined}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }

