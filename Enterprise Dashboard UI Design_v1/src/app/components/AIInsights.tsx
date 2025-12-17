import { Sparkles, TrendingUp, AlertTriangle, Target, Lightbulb, Brain } from "lucide-react";

interface Insight {
  id: string;
  type: "prediction" | "recommendation" | "risk" | "optimization";
  title: string;
  description: string;
  confidence: number;
  impact: "high" | "medium" | "low";
  tags: string[];
}

interface AIInsightsProps {
  insights: Insight[];
}

export function AIInsights({ insights }: AIInsightsProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case "prediction":
        return TrendingUp;
      case "recommendation":
        return Lightbulb;
      case "risk":
        return AlertTriangle;
      case "optimization":
        return Target;
      default:
        return Sparkles;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-purple-500 bg-purple-500/10 border-purple-500/20";
      case "medium":
        return "text-blue-500 bg-blue-500/10 border-blue-500/20";
      default:
        return "text-gray-500 bg-gray-500/10 border-gray-500/20";
    }
  };

  return (
    <div className="rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm overflow-hidden">
      <div className="p-6 border-b border-border/50 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-cyan-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg mb-1">AI-Powered Insights & Recommendations</h3>
            <p className="text-sm text-muted-foreground">Intelligent analysis and predictive alerts</p>
          </div>
          <div className="ml-auto flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-400">AI Active</span>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((insight) => {
            const Icon = getIcon(insight.type);
            return (
              <div
                key={insight.id}
                className="group relative p-5 rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 hover:border-purple-500/30 hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Animated background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 group-hover:bg-purple-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-purple-400" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="group-hover:text-purple-400 transition-colors">
                          {insight.title}
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-xs uppercase tracking-wide ${getImpactColor(insight.impact)}`}>
                          {insight.impact}
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-4">
                        {insight.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2">
                          {insight.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                              style={{ width: `${insight.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">{insight.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 pt-3 border-t border-border/50">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-xs text-purple-400">AI Detected</span>
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
