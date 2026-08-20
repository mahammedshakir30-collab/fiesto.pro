import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-[#F1642E] text-white hover:bg-[#F1642E]/90 shadow-sm",
        secondary:
          "bg-white text-primary border-2 border-primary/20 hover:border-primary hover:bg-primary/5",
        outline:
          "border border-border bg-card text-foreground hover:border-color-primary/50 hover:text-color-primary",
        ghost: 
          "text-foreground hover:bg-muted hover:text-foreground",
        link: 
          "text-[#F1642E] underline-offset-4 hover:underline",
        destructive:
          "bg-destructive text-white shadow-sm hover:bg-destructive/90",
      },
      size: {
        default: "h-11 px-6 rounded-xl text-[15px]",
        sm: "h-9 px-4 rounded-lg text-sm",
        lg: "h-14 px-8 rounded-2xl text-[17px]",
        icon: "h-11 w-11 rounded-xl",
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
