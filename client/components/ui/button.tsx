import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 cursor-pointer border-0',
  {
    variants: {
      variant: {
        default:
          'bg-accent text-white hover:bg-accent-d hover:-translate-y-px active:translate-y-0',
        ghost:
          'bg-transparent text-txt2 border border-border-s hover:bg-white/5 hover:text-txt',
        outline:
          'bg-transparent border border-border-s text-txt2 hover:bg-white/5',
        destructive:
          'bg-neg/90 text-white hover:bg-neg',
        link:
          'text-accent underline-offset-4 hover:underline bg-transparent',
        subtle:
          'bg-white/5 text-txt2 hover:bg-white/10 hover:text-txt',
      },
      size: {
        default: 'h-9 px-4 py-2',
        sm:      'h-7 px-3 text-xs',
        lg:      'h-11 px-6 text-base',
        icon:    'h-9 w-9',
        'icon-sm':'h-7 w-7',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { Button, buttonVariants }
