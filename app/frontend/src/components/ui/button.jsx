import * as React from "react"
const Button = React.forwardRef(({ className, ...props }, ref) => (
  <button ref={ref} className={`inline-flex items-center justify-center rounded-md text-sm font-medium px-4 py-2 ${className}`} {...props} />
))
Button.displayName = "Button"
export { Button }
