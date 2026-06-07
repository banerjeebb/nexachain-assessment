import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide border-0',
  {
    variants: {
      variant: {
        default:  'bg-accent/10 text-accent',
        success:  'bg-pos/10 text-pos',
        danger:   'bg-neg/10 text-neg',
        warning:  'bg-warn/10 text-warn',
        cyan:     'bg-cyan/10 text-cyan',
        gold:     'bg-gold/10 text-gold',
        muted:    'bg-white/5 text-dim',
        outline:  'border border-border-s bg-transparent text-txt2',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
