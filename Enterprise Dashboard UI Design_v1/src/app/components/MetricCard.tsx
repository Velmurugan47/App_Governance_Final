import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  changeLabel?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  className?: string;
  onClick?: () => void;
}

export function MetricCard({
  title,
  value,
  change,
  changeLabel = "vs last period",
  icon: Icon,
  trend = "neutral",
  className = "",
  onClick,
}: MetricCardProps) {
  const isPositive = change > 0;
  const isNegative = change < 0;
  
  const trendColor = trend === "up" 
    ? (isPositive ? "text-emerald-500" : "text-red-500")
    : trend === "down"
    ? (isNegative ? "text-emerald-500" : "text-red-500")
    : "text-gray-500";

  const bgGradient = trend === "up"
    ? "from-emerald-500/5 to-emerald-500/0"
    : trend === "down"
    ? "from-red-500/5 to-red-500/0"
    : "from-blue-500/5 to-blue-500/0";

  return (
    <div 
      className={`relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br ${bgGradient} backdrop-blur-sm ${onClick ? 'cursor-pointer hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/10' : ''} ${className}`}
      onClick={onClick}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="text-sm text-muted-foreground">{title}</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-3xl tracking-tight">{value}</div>
          
          <div className="flex items-center gap-2">
            <span className={`text-sm ${trendColor}`}>
              {isPositive ? "+" : ""}{change}%
            </span>
            <span className="text-xs text-muted-foreground">{changeLabel}</span>
          </div>
        </div>
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
    </div>
  );
}