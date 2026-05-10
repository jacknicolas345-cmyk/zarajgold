import * as React from "react"
function Badge({ className, ...props }) {
  return <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${className}`} {...props} />
}
export { Badge }
