import { cn } from "../../lib/utils"

type SkeletonProps<T extends React.ElementType> = {
  as?: T
  className?: string
} & React.ComponentPropsWithoutRef<T>

function Skeleton<T extends React.ElementType = "div">({
  as,
  className,
  ...props
}: SkeletonProps<T>) {
  const Component = as || "div"

  return (
    <Component
      className={cn("animate-pulse rounded-md bg-on-surface/10", className)}
      {...props}
    />
  )
}

export { Skeleton }