export function Button({ children, className = "", variant = "default", size = "default", ...props }) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none"

  const variantClasses =
    {
      default: "bg-blue-600 text-white hover:bg-blue-700",
      outline: "border border-gray-300 bg-transparent hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-800",
      ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800",
    }[variant] || "bg-blue-600 text-white hover:bg-blue-700"

  const sizeClasses =
    {
      default: "h-10 px-4 py-2",
      sm: "h-9 px-3 py-1 text-sm",
      lg: "h-11 px-8 py-3",
    }[size] || "h-10 px-4 py-2"

  const classes = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}

