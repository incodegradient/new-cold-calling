import { cn } from "@/lib/utils"
import { Check } from "lucide-react"

export const Stepper = ({ children }: { children: React.ReactNode }) => {
  return <div className="flex items-center justify-between w-full">{children}</div>
}

export const StepperItem = ({ isActive, isCompleted, children }: { isActive: boolean; isCompleted: boolean; children: React.ReactNode }) => {
  return (
    <div className="flex items-center gap-2">
      <div className={cn(
        "flex items-center justify-center w-6 h-6 rounded-full border-2",
        isActive && "border-primary",
        isCompleted && "border-primary bg-primary text-primary-foreground"
      )}>
        {isCompleted ? <Check className="w-4 h-4" /> : null}
      </div>
      <div className={cn(
        "text-sm font-medium",
        isActive ? "text-primary" : "text-muted-foreground",
        isCompleted && "text-primary"
      )}>
        {children}
      </div>
    </div>
  )
}

export const StepperSeparator = () => {
  return <div className="flex-1 h-px bg-border mx-4"></div>
}
