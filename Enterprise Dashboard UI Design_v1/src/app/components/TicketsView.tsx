import { useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { ArrowLeft, Search, Filter, Download } from "lucide-react";

interface Ticket {
  id: string;
  title: string;
  status: string;
  severity: string;
  owner: string;
  category: string;
  createdAt: string;
  updatedAt: string;
  description: string;
}

// Mock ticket data
const generateMockTickets = (): Ticket[] => {
  const statuses = ["Open", "Closed", "In Progress", "Pending", "Waiting for Evidence"];
  const severities = ["Critical", "High", "Medium", "Low"];
  const owners = ["Platform Team", "Infrastructure", "Security", "Data Services", "Frontend"];
  const categories = ["Bug", "Feature Request", "Performance", "Security", "Documentation"];
  
  const tickets: Ticket[] = [];
  for (let i = 1; i <= 150; i++) {
    tickets.push({
      id: `TICK-${String(i).padStart(5, '0')}`,
      title: `${categories[Math.floor(Math.random() * categories.length)]} - Issue #${i}`,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      severity: severities[Math.floor(Math.random() * severities.length)],
      owner: owners[Math.floor(Math.random() * owners.length)],
      category: categories[Math.floor(Math.random() * categories.length)],
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      description: `This is a detailed description for ticket ${i}. It describes the issue and steps to reproduce.`
    });
  }
  return tickets;
};

export function TicketsView() {
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get("status");
  const [searchQuery, setSearchQuery] = useState("");
  
  const allTickets = generateMockTickets();
  
  // Filter tickets based on status from URL params
  const filteredTickets = allTickets.filter(ticket => {
    const matchesStatus = !statusFilter || ticket.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch = !searchQuery || 
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.owner.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return "text-red-500 bg-red-500/10 border-red-500/20";
      case "High": return "text-orange-500 bg-orange-500/10 border-orange-500/20";
      case "Medium": return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
      case "Low": return "text-green-500 bg-green-500/10 border-green-500/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open": return "text-blue-400 bg-blue-400/10 border-blue-400/20";
      case "Closed": return "text-green-400 bg-green-400/10 border-green-400/20";
      case "In Progress": return "text-purple-400 bg-purple-400/10 border-purple-400/20";
      case "Pending": return "text-yellow-400 bg-yellow-400/10 border-yellow-400/20";
      case "Waiting for Evidence": return "text-orange-400 bg-orange-400/10 border-orange-400/20";
      default: return "text-slate-400 bg-slate-400/10 border-slate-400/20";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="p-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-300" />
              </Link>
              <div>
                <h1 className="text-xl tracking-tight">Tickets Management</h1>
                {statusFilter && (
                  <p className="text-sm text-slate-400">
                    Filtered by: <span className="text-white capitalize">{statusFilter}</span>
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filters</span>
              </button>
              <button className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                <span className="text-sm">Export</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Search and Stats */}
        <div className="mb-6 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tickets by ID, title, or owner..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
            />
          </div>
          <div className="text-sm text-slate-400">
            Showing <span className="text-white">{filteredTickets.length}</span> of{" "}
            <span className="text-white">{allTickets.length}</span> tickets
          </div>
        </div>

        {/* Tickets Table */}
        <div className="rounded-xl border border-white/10 bg-slate-900/50 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 bg-slate-900/80">
                  <th className="text-left px-6 py-4 text-sm text-slate-400">Ticket ID</th>
                  <th className="text-left px-6 py-4 text-sm text-slate-400">Title</th>
                  <th className="text-left px-6 py-4 text-sm text-slate-400">Status</th>
                  <th className="text-left px-6 py-4 text-sm text-slate-400">Severity</th>
                  <th className="text-left px-6 py-4 text-sm text-slate-400">Owner</th>
                  <th className="text-left px-6 py-4 text-sm text-slate-400">Category</th>
                  <th className="text-left px-6 py-4 text-sm text-slate-400">Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((ticket, index) => (
                  <tr
                    key={ticket.id}
                    className={`border-b border-white/5 hover:bg-slate-800/30 transition-colors ${
                      index % 2 === 0 ? "bg-slate-900/20" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm text-purple-400 mono">{ticket.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-200">{ticket.title}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md border text-xs ${getSeverityColor(ticket.severity)}`}>
                        {ticket.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">{ticket.owner}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">{ticket.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-400">{ticket.updatedAt}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredTickets.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-slate-400">No tickets found matching your criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
