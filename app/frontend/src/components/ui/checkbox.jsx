import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={`h-4 w-4 rounded border border-primary ${className}`}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <span>✓</span>
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
))
Checkbox.displayName = CheckboxPrimitive.Root.displayName
export { Checkbox }
