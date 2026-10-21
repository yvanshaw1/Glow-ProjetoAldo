import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Neumorphism of docs/padroes/design.md; the focus outline comes from
  // globals.css, and shadows change without animation. A button disabled but
  // still focusable (focusableWhenDisabled) has aria-disabled instead of the
  // disabled attribute, so it takes the same look, without being pressed.
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-[color,background-color,transform,opacity] select-none active:not-aria-[haspopup]:not-aria-disabled:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-neu-sm aria-disabled:cursor-not-allowed aria-disabled:opacity-50 aria-disabled:shadow-neu-sm aria-disabled:inset-shadow-none aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-neu-sm hover:bg-primary-hover hover:shadow-neu-lg active:shadow-none active:inset-shadow-neu-md",
        outline:
          "border-border bg-background text-foreground shadow-neu-sm hover:shadow-neu-lg active:shadow-none active:inset-shadow-neu-md aria-expanded:shadow-none aria-expanded:inset-shadow-neu-sm",
        secondary:
          "bg-secondary text-secondary-foreground shadow-neu-sm hover:shadow-neu-lg active:shadow-none active:inset-shadow-neu-md aria-expanded:shadow-none aria-expanded:inset-shadow-neu-sm",
        ghost:
          "text-foreground hover:shadow-neu-sm active:shadow-none active:inset-shadow-neu-md aria-expanded:inset-shadow-neu-sm",
        destructive:
          "bg-background text-destructive shadow-neu-sm hover:shadow-neu-lg active:shadow-none active:inset-shadow-neu-md",
        link: "text-link underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-10 gap-2 px-3 has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-12 gap-2 px-5 has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4",
        icon: "size-10",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
