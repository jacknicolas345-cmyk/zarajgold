import * as React from "react"
const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={`flex min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}
    {...props}
  />
))
Textarea.displayName = "Textarea"
export { Textarea }
