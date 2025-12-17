import { Ticket, Activity, CheckCircle2, Clock, XCircle, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { MetricCard } from "./MetricCard";
import { TrendChart } from "./TrendChart";
import { DistributionCharts } from "./DistributionCharts";
import { AlertCard } from "./AlertCard";
import { AIInsights } from "./AIInsights";

// Mock data for the dashboard
const kpiData = [
  {
    title: "Total Tickets",
    value: "12,847",
    change: 12.5,
    icon: Ticket,
    trend: "neutral" as const,
    status: null,
  },
  {
    title: "Open",
    value: "3,421",
    change: -8.2,
    icon: Activity,
    trend: "down" as const,
    status: "open",
  },
  {
    title: "Closed",
    value: "8,156",
    change: 18.4,
    icon: CheckCircle2,
    trend: "up" as const,
    status: "closed",
  },
  {
    title: "In Progress",
    value: "892",
    change: 5.3,
    icon: Clock,
    trend: "neutral" as const,
    status: "in progress",
  },
  {
    title: "Pending",
    value: "247",
    change: -12.1,
    icon: HelpCircle,
    trend: "down" as const,
    status: "pending",
  },
  {
    title: "Waiting for Evidence",
    value: "131",
    change: -15.6,
    icon: XCircle,
    trend: "down" as const,
    status: "waiting for evidence",
  },
];

const trendData = [
  { date: "Nov 18", open: 420, closed: 380, total: 800 },
  { date: "Nov 25", open: 390, closed: 410, total: 800 },
  { date: "Dec 02", open: 450, closed: 420, total: 870 },
  { date: "Dec 09", open: 380, closed: 490, total: 870 },
  { date: "Dec 16", open: 340, closed: 510, total: 850 },
  { date: "Dec 23", open: 320, closed: 540, total: 860 },
  { date: "Dec 30", open: 360, closed: 520, total: 880 },
  { date: "Jan 06", open: 340, closed: 560, total: 900 },
  { date: "Jan 13", open: 310, closed: 590, total: 900 },
  { date: "Jan 20", open: 290, closed: 620, total: 910 },
];

const ownerData = [
  { name: "Platform Team", value: 342, color: "#8b5cf6" },
  { name: "Infrastructure", value: 287, color: "#6366f1" },
  { name: "Security", value: 198, color: "#3b82f6" },
  { name: "Data Services", value: 234, color: "#06b6d4" },
  { name: "Frontend", value: 156, color: "#10b981" },
];

const severityData = [
  { name: "Critical", value: 89, color: "#ef4444" },
  { name: "High", value: 234, color: "#f97316" },
  { name: "Medium", value: 487, color: "#f59e0b" },
  { name: "Low", value: 612, color: "#84cc16" },
];

const categoryData = [
  { name: "Bug", value: 456, color: "#ec4899" },
  { name: "Feature Request", value: 289, color: "#a855f7" },
  { name: "Performance", value: 178, color: "#6366f1" },
  { name: "Security", value: 134, color: "#3b82f6" },
  { name: "Documentation", value: 98, color: "#06b6d4" },
];

const alerts = [
  {
    id: "1",
    title: "SLA Breach: Payment Service Critical Incident",
    description: "Payment processing service has been down for 4+ hours, exceeding critical incident SLA of 2 hours. Customer impact: High.",
    severity: "critical" as const,
    timestamp: "2 hours ago",
    type: "sla_breach" as const,
  },
  {
    id: "2",
    title: "Authentication System - Multiple High Priority Tickets Past Due",
    description: "5 high-priority tickets related to authentication failures have exceeded resolution deadline by 48 hours.",
    severity: "high" as const,
    timestamp: "5 hours ago",
    type: "past_due" as const,
  },
  {
    id: "3",
    title: "Data Pipeline Failure - Escalation Required",
    description: "Critical data pipeline has failed health checks for 3 consecutive cycles. No owner assigned after 6 hours.",
    severity: "critical" as const,
    timestamp: "6 hours ago",
    type: "critical_incident" as const,
  },
];

const aiInsights = [
  {
    id: "1",
    type: "prediction" as const,
    title: "Predicted Ticket Spike - API Gateway",
    description: "ML models predict a 65% increase in API Gateway tickets over the next 7 days based on historical patterns and recent deployment activity.",
    confidence: 87,
    impact: "high" as const,
    tags: ["API Gateway", "Capacity Planning"],
  },
  {
    id: "2",
    type: "risk" as const,
    title: "High-Risk Pattern Detected - Database Team",
    description: "Database team showing 45% increase in ticket velocity with 23% decrease in resolution speed. Risk of backlog overflow detected.",
    confidence: 92,
    impact: "high" as const,
    tags: ["Database", "Resource Alert"],
  },
  {
    id: "3",
    type: "recommendation" as const,
    title: "Auto-Categorization Suggestion",
    description: "AI identified 127 tickets that could be automatically categorized as 'Configuration Issues' with 94% confidence, saving ~8 hours of manual work.",
    confidence: 94,
    impact: "medium" as const,
    tags: ["Automation", "Efficiency"],
  },
  {
    id: "4",
    type: "optimization" as const,
    title: "Root Cause Analysis - Authentication Failures",
    description: "Pattern recognition identified common root cause across 42 authentication tickets: OAuth token expiry misconfiguration in prod environment.",
    confidence: 89,
    impact: "high" as const,
    tags: ["Authentication", "Root Cause"],
  },
  {
    id: "5",
    type: "prediction" as const,
    title: "SLA Risk Forecast - Storage Services",
    description: "Current ticket aging patterns suggest 12 storage service tickets are at 78% risk of SLA breach within next 24 hours.",
    confidence: 78,
    impact: "medium" as const,
    tags: ["Storage", "SLA Risk"],
  },
  {
    id: "6",
    type: "recommendation" as const,
    title: "Team Load Rebalancing Opportunity",
    description: "Platform Team is operating at 142% capacity while Frontend Team is at 67%. Recommend redistributing 8 cross-functional tickets.",
    confidence: 85,
    impact: "medium" as const,
    tags: ["Load Balancing", "Team Ops"],
  },
];

export function DashboardView() {
  const navigate = useNavigate();

  const handleMetricClick = (status: string | null) => {
    if (status) {
      navigate(`/tickets?status=${encodeURIComponent(status)}`);
    } else {
      navigate("/tickets");
    }
  };

  return (
    <>
      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* KPI Summary Cards */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl mb-2">Key Performance Metrics</h2>
            <p className="text-slate-400">Real-time ticket status and trends</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            {kpiData.map((metric, index) => (
              <MetricCard 
                key={index} 
                {...metric} 
                onClick={() => handleMetricClick(metric.status)}
              />
            ))}
          </div>
        </section>

        {/* Critical Alerts */}
        <section>
          <AlertCard alerts={alerts} />
        </section>

        {/* Trend Analysis */}
        <section>
          <TrendChart data={trendData} />
        </section>

        {/* Distribution Analytics */}
        <section>
          <div className="mb-6">
            <h2 className="text-2xl mb-2">Distribution & Ownership Analysis</h2>
            <p className="text-slate-400">Ticket distribution across teams, severity, and categories</p>
          </div>
          <DistributionCharts
            ownerData={ownerData}
            severityData={severityData}
            categoryData={categoryData}
          />
        </section>

        {/* AI Insights */}
        <section>
          <AIInsights insights={aiInsights} />
        </section>
      </main>
    </>
  );
}
