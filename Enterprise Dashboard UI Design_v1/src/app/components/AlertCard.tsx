import { TriangleAlert, Clock, CircleAlert } from "lucide-react";

interface Alert {
  id: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium";
  timestamp: string;
  type: "sla_breach" | "past_due" | "critical_incident";
}

interface AlertCardProps {
  alerts: Alert[];
}

export function AlertCard({ alerts }: AlertCardProps) {
  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case "critical":
        return "border-red-500/50 bg-red-500/5";
      case "high":
        return "border-orange-500/50 bg-orange-500/5";
      default:
        return "border-yellow-500/50 bg-yellow-500/5";
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "sla_breach":
        return Clock;
      case "critical_incident":
        return CircleAlert;
      default:
        return TriangleAlert;
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-red-500/10 to-orange-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
            <TriangleAlert className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-lg">Critical Alerts & Risk</h3>
            <p className="text-sm text-muted-foreground">Requires immediate attention</p>
          </div>
          <div className="ml-auto">
            <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-500 text-xs">
              {alerts.length} Active
            </span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {alerts.map((alert) => {
            const Icon = getIcon(alert.type);
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border ${getSeverityStyles(alert.severity)} hover:shadow-lg transition-all duration-200 cursor-pointer group`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5">
                    <Icon className="w-5 h-5 text-red-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h4 className="group-hover:text-primary transition-colors">
                        {alert.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {alert.timestamp}
                      </span>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">
                      {alert.description}
                    </p>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-xs uppercase tracking-wide ${
                        alert.severity === "critical" 
                          ? "bg-red-500/20 text-red-500" 
                          : alert.severity === "high"
                          ? "bg-orange-500/20 text-orange-500"
                          : "bg-yellow-500/20 text-yellow-500"
                      }`}>
                        {alert.severity}
                      </span>
                      <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs">
                        Action Required
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}