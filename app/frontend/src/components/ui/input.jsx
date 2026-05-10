import * as React from "react"
const Input = React.forwardRef(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}
    ref={ref}
    {...props}
  />
))
Input.displayName = "Input"
export { Input }
