import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import Header from './Header';
import Footer from './Footer';
import { AlertCircle, Clock, CheckCircle2, PlayCircle, User, Calendar, Loader2, CheckCheck, Play, CheckCircle, Activity, FileText, Tag, X } from 'lucide-react';

interface HomeProps {
  currentUser: string;
  onSignOut: () => void;
}

interface Stage {
  id: number;
  name: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  message: string;
}

interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'not-started' | 'in-progress' | 'completed';
  customer: string;
  createdAt: string;
  currentStage: number;
  stages: Stage[];
  waitingForReview?: boolean;
  waitingForPriorityConfirmation?: boolean;
  waitingForClosureConfirmation?: boolean;
  aitNumber?: string;
  deliverableType?: string;
  category?: string;
  slaDeadline?: string;
  armId?: string;
  applicationName?: string;
  lobOwner?: string;
  aitOwner?: string;
  contacts?: string[];
}

export default function Home({ currentUser, onSignOut }: HomeProps) {
  const navigate = useNavigate();
  const { ticketId } = useParams();
  const wsRef = useRef<WebSocket | null>(null);

  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [statusMessage, setStatusMessage] = useState('');
  const [showAllTickets, setShowAllTickets] = useState(true); // Show all tickets by default
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showClosureModal, setShowClosureModal] = useState(false);
  const [showStepsModal, setShowStepsModal] = useState(false);
  const [emailTemplate, setEmailTemplate] = useState<{ to: string, subject: string, body: string } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);


  // WebSocket connection
  useEffect(() => {
    const connectWebSocket = () => {
      const ws = new WebSocket('ws://localhost:8000/ws');

      ws.onopen = () => {
        console.log('WebSocket connected');
        setConnectionStatus('connected');
        setStatusMessage('Connected to server');
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        switch (data.type) {
          case 'initial_state':
            // Don't set tickets from WebSocket - let HTTP fetch handle initial load
            // This ensures the filter (IAM vs All) is respected
            console.log('WebSocket connected, initial state received');
            break;

          case 'ticket_update':
            setTickets((prev) => {
              const index = prev.findIndex((t) => t.id === data.ticket.id);
              if (index >= 0) {
                const updated = [...prev];
                updated[index] = data.ticket;
                return updated;
              } else {
                return [...prev, data.ticket];
              }
            });

            // Update selected ticket if it's the one being updated
            if (selectedTicket && selectedTicket.id === data.ticket.id) {
              setSelectedTicket(data.ticket);
            }
            break;

          case 'processing_start':
            setStatusMessage(data.message);
            break;

          case 'stage_update':
            setStatusMessage(`${data.stage}: ${data.message}`);
            break;

          case 'processing_complete':
            setStatusMessage(data.message);
            if (data.ticket) {
              // Update the specific ticket
              setTickets((prev) => {
                const index = prev.findIndex((t) => t.id === data.ticket.id);
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = data.ticket;
                  return updated;
                }
                return prev;
              });
            }
            break;

          case 'error':
            setStatusMessage(`Error: ${data.message}`);
            alert(`Error: ${data.message}`);
            break;
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
        setStatusMessage('Connection error');
      };

      ws.onclose = () => {
        console.log('WebSocket disconnected');
        setConnectionStatus('disconnected');
        setStatusMessage('Disconnected from server');

        // Attempt to reconnect after 3 seconds
        setTimeout(connectWebSocket, 3000);
      };

      wsRef.current = ws;
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Show success toast when ticket is completed
  useEffect(() => {
    if (selectedTicket?.status === 'completed') {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedTicket?.status]);

  // Load tickets on mount
  useEffect(() => {
    fetchTickets();
  }, []);

  // Show success toast when ticket is completed
  useEffect(() => {
    if (selectedTicket?.status === 'completed') {
      setShowSuccessToast(true);
      const timer = setTimeout(() => setShowSuccessToast(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [selectedTicket?.status]);

  // Handle ticket selection from URL
  useEffect(() => {
    if (ticketId && tickets.length > 0) {
      const ticket = tickets.find((t) => t.id === ticketId);
      if (ticket) {
        setSelectedTicket(ticket);
      }
    }
  }, [ticketId, tickets]);

  // Reset filter when user changes (always show all tickets by default)
  useEffect(() => {
    setShowAllTickets(true);
  }, [currentUser]);

  // Refetch tickets when filter changes
  useEffect(() => {
    fetchTickets();
  }, [showAllTickets]);

  const fetchTickets = async () => {
    try {
      const endpoint = showAllTickets
        ? 'http://localhost:8000/api/tickets'
        : 'http://localhost:8000/api/tickets/iam';
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.tickets) {
        setTickets(data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
    }
  };

  const handleProcessTicket = async (ticketId: string) => {
    try {
      setStatusMessage(`Processing ticket ${ticketId}...`);

      const response = await fetch(`http://localhost:8000/api/tickets/${ticketId}/process`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to start processing');
      }

      const data = await response.json();
      console.log('Processing started:', data);
    } catch (error) {
      console.error('Error starting processing:', error);
      setStatusMessage('Failed to start processing');
      alert('Error: ' + (error as Error).message);
    }
  };

  const handleConfirmPriority = async (ticketId: string) => {
    try {
      setStatusMessage(`Confirming priority for ticket ${ticketId}...`);

      // Get priority from currently selected ticket (which reflects dropdown state)
      const priority = selectedTicket && selectedTicket.id === ticketId
        ? selectedTicket.priority
        : 'medium';

      const response = await fetch(`http://localhost:8000/api/tickets/${ticketId}/confirm-priority`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority }),
      });

      if (!response.ok) {
        throw new Error('Failed to confirm priority');
      }

      const data = await response.json();
      console.log('Priority confirmed:', data);
      setStatusMessage(data.message);
    } catch (error) {
      console.error('Error confirming priority:', error);
      setStatusMessage('Failed to confirm priority');
    }
  };

  const handleConfirmClosure = async (ticketId: string) => {
    try {
      setStatusMessage(`Confirming closure for ticket ${ticketId}...`);
      setShowClosureModal(false);

      const response = await fetch(`http://localhost:8000/api/tickets/${ticketId}/confirm-closure`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to confirm closure');
      }

      const data = await response.json();
      console.log('Closure confirmed:', data);
      setStatusMessage(data.message);
    } catch (error) {
      console.error('Error confirming closure:', error);
      setStatusMessage('Failed to confirm closure');
    }
  };

  const handleShowEmailPreview = async (ticketId: string) => {
    try {
      // Fetch email template from backend
      const response = await fetch(`http://localhost:8000/api/tickets/${ticketId}/email-preview`);

      if (!response.ok) {
        throw new Error('Failed to fetch email template');
      }

      const data = await response.json();
      setEmailTemplate(data.email);
      setShowEmailModal(true);
    } catch (error) {
      console.error('Error fetching email template:', error);
      // If API doesn't exist yet, show sample template
      setEmailTemplate({
        to: selectedTicket?.contacts?.join(', ') || 'app.owner@company.com',
        subject: `Evidence Required: ${selectedTicket?.title || 'Ticket'} - ${selectedTicket?.id}`,
        body: `Dear Application Owner,\n\nWe are processing ticket ${selectedTicket?.id} regarding ${selectedTicket?.title}.\n\nApplication Details:\n- Application Name: ${selectedTicket?.applicationName || 'N/A'}\n- AIT Number: ${selectedTicket?.aitNumber || 'N/A'}\n- LOB Owner: ${selectedTicket?.lobOwner || 'N/A'}\n\nWe require evidence of the following actions:\n1. User access review\n2. Compliance verification\n3. Security approval\n\nPlease provide the requested evidence within 48 hours.\n\nBest regards,\nGovernance Team`
      });
      setShowEmailModal(true);
    }
  };

  const handleApproveReview = async (ticketId: string) => {
    try {
      setStatusMessage(`Approving review for ticket ${ticketId}...`);
      setShowEmailModal(false);

      const response = await fetch(`http://localhost:8000/api/tickets/${ticketId}/approve-review`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to approve review');
      }

      const data = await response.json();
      console.log('Review approved:', data);
      setStatusMessage(data.message);
    } catch (error) {
      console.error('Error approving review:', error);
      setStatusMessage('Failed to approve review');
      alert('Error: ' + (error as Error).message);
    }
  };

  // Sync selectedTicket with tickets state when updates arrive
  useEffect(() => {
    if (selectedTicket) {
      const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
      if (updatedTicket && JSON.stringify(updatedTicket) !== JSON.stringify(selectedTicket)) {
        setSelectedTicket(updatedTicket);
      }
    }
  }, [tickets]);

  const handleTicketClick = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    // Update URL without navigation
    window.history.pushState({}, '', `/home/ticket/${ticket.id}`);
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
    navigate('/home');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not-started':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <PlayCircle className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'not-started':
        return 'bg-gray-100 text-gray-700';
      case 'in-progress':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStageStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500 text-white';
      case 'in-progress':
        return 'bg-blue-500 border-blue-500 text-white';
      case 'error':
        return 'bg-red-500 border-red-500 text-white';
      default:
        return 'border-gray-300 text-gray-500';
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header currentUser={currentUser} onSignOut={onSignOut} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-gray-900 mb-2">Ticket Portal</h1>
              <p className="text-gray-600">
                Manage and track your governance tickets with AI agents
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' :
                  connectionStatus === 'connecting' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`} />
                <span className="text-sm text-gray-600">
                  {connectionStatus === 'connected' ? 'Connected' :
                    connectionStatus === 'connecting' ? 'Connecting...' :
                      'Disconnected'}
                </span>
              </div>
              {/* Toggle Button */}
              <button
                onClick={() => setShowAllTickets(!showAllTickets)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-sm"
              >
                {showAllTickets ? 'IAM Tickets Only' : 'All Tickets'}
              </button>
            </div>
          </div>

          {/* Status Message */}
          {statusMessage && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg">
              {statusMessage}
            </div>
          )}
        </div>

        {/* Tickets Grid */}
        <div className={`grid gap-6 ${selectedTicket ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Tickets List */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-gray-900 mb-4">
                {showAllTickets ? 'All Tickets' : 'IAM Tickets'} ({tickets.length})
              </h2>

              {tickets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No tickets available</p>
                  <p className="text-sm mt-2">Tickets will load automatically</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      onClick={() => handleTicketClick(ticket)}
                      className={`border rounded-lg p-4 transition hover:shadow-md cursor-pointer ${selectedTicket?.id === ticket.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-white'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-900 font-semibold">{ticket.id}</span>
                          {/* Category Badge */}
                          <span className={`px-2 py-1 rounded text-xs font-medium ${ticket.category?.toUpperCase() === 'IAM'
                            ? 'bg-blue-100 text-blue-700 border border-blue-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                            }`}>
                            {ticket.category || 'Unknown'}
                          </span>
                          {ticket.priority === 'urgent' && (
                            <AlertCircle className="w-4 h-4 text-red-600" />
                          )}
                          {ticket.waitingForReview && (
                            <span className="px-2 py-1 rounded text-xs bg-yellow-100 text-yellow-700 border border-yellow-200">
                              ⏸️ Review
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs border ${getPriorityColor(
                              ticket.priority
                            )}`}
                          >
                            {ticket.priority.toUpperCase()}
                          </span>
                          <span
                            className={`px-2 py-1 rounded text-xs flex items-center gap-1 ${getStatusColor(
                              ticket.status
                            )}`}
                          >
                            {getStatusIcon(ticket.status)}
                            {ticket.status.replace('-', ' ').toUpperCase()}
                          </span>
                        </div>
                      </div>

                      <h3 className="text-gray-900 mb-3 font-medium">{ticket.title}</h3>

                      <div className="flex items-center gap-4 text-gray-600 text-sm mb-3">
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          <span>{ticket.customer}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{ticket.createdAt}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                        <span className="text-gray-600 text-sm">
                          Stage {ticket.currentStage + 1}/{ticket.stages.length}
                        </span>
                        <div className="flex gap-1">
                          {ticket.stages.slice(0, 8).map((stage, idx) => (
                            <div
                              key={idx}
                              className={`w-2 h-2 rounded-full ${stage.status === 'completed' ? 'bg-green-500' :
                                stage.status === 'in-progress' ? 'bg-blue-500' :
                                  stage.status === 'error' ? 'bg-red-500' :
                                    'bg-gray-300'
                                }`}
                              title={stage.name}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Detail Panel */}
          {/* Ticket Detail Panel */}
          {selectedTicket && (
            <div className="md:sticky md:top-24 h-[calc(100vh-8rem)] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">

              {/* FIXED HEADER SECTION */}
              <div className="p-6 pb-2 border-b border-gray-100 bg-white z-20">
                <div className="flex items-start justify-between mb-4">
                  <h2 className="text-gray-900 font-bold">{selectedTicket.id}</h2>
                  <button
                    onClick={handleCloseTicket}
                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* ACTION BUTTONS Container - Always Visible */}
                <div className="mb-2">
                  {(() => {
                    // 1. Priority Confirmation with Editable Dropdown
                    if (selectedTicket.waitingForPriorityConfirmation ||
                      (selectedTicket.stages[2].status === 'completed' &&
                        selectedTicket.stages[3].status !== 'in-progress' &&
                        selectedTicket.stages[3].status !== 'completed')) {
                      return (
                        <div className="space-y-3 p-1">
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-sm text-blue-800 font-medium">
                              ⚡ Priority calculated as <span className="font-bold uppercase">{selectedTicket.priority}</span>. Confirm to proceed.
                            </p>
                          </div>
                          <button
                            onClick={() => handleConfirmPriority(selectedTicket.id)}
                            className="w-full bg-blue-600 text-white border border-blue-700 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg font-bold"
                          >
                            <CheckCheck className="w-5 h-5" />
                            Confirm Priority & Continue
                          </button>
                        </div>
                      );
                    }

                    // 2. Review Approval
                    if (selectedTicket.stages[5].status === 'in-progress' || selectedTicket.waitingForReview) {
                      return (
                        <button
                          onClick={() => handleShowEmailPreview(selectedTicket.id)}
                          className="w-full bg-green-600 text-white border border-green-700 py-3 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2 shadow-lg animate-pulse font-bold"
                        >
                          <CheckCheck className="w-5 h-5" />
                          Review Email & Approve
                        </button>
                      );
                    }

                    // 3. Closure Confirmation
                    if (selectedTicket.stages[6].status === 'in-progress' || selectedTicket.waitingForClosureConfirmation) {
                      return (
                        <button
                          onClick={() => setShowClosureModal(true)}
                          className="w-full bg-blue-600 text-white border border-blue-700 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg animate-pulse font-bold"
                        >
                          <CheckCheck className="w-5 h-5" />
                          Confirm Closure
                        </button>
                      );
                    }

                    // 4. Start Processing
                    if (selectedTicket.status === 'not-started') {
                      return (
                        <button
                          onClick={() => handleProcessTicket(selectedTicket.id)}
                          className="w-full bg-blue-600 text-white border border-blue-700 py-3 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-sm font-bold"
                        >
                          <Play className="w-5 h-5" />
                          Start Processing
                        </button>
                      );
                    }

                    // 5. Processing State
                    if (selectedTicket.status === 'in-progress') {
                      return (
                        <div className="w-full bg-blue-50 text-blue-700 py-3 rounded-lg flex items-center justify-center gap-2 border border-blue-100 font-medium">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </div>
                      );
                    }

                    return (
                      <div className="w-full bg-green-50 text-green-700 py-3 rounded-lg flex items-center justify-center gap-2 border border-green-100 font-medium">
                        <CheckCircle className="w-5 h-5" />
                        Completed
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* SCROLLABLE CONTENT AREA */}
              <div className="flex-1 overflow-y-auto p-6 pt-0">
                <h3 className="text-gray-900 mb-4 font-semibold mt-4">{selectedTicket.title}</h3>

                <div className="space-y-3 mb-6 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                        <User className="w-3 h-3" /> Customer
                      </span>
                      <p className="text-gray-900 font-medium">{selectedTicket.customer}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3 h-3" /> Priority
                      </span>
                      <p className={`font-medium ${getPriorityColor(selectedTicket.priority).replace('bg-', 'text-').replace('100', '700').replace('border-', '')}`}>
                        {selectedTicket.priority.toUpperCase()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                        <Activity className="w-3 h-3" /> Status
                      </span>
                      <p className="text-gray-900 font-medium capitalize">{selectedTicket.status.replace('-', ' ')}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3" /> Created
                      </span>
                      <p className="text-gray-900 font-medium">{selectedTicket.createdAt}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                      <FileText className="w-3 h-3" /> Description
                    </span>
                    <p className="text-gray-900 text-sm leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                      {selectedTicket.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    {selectedTicket.category && (
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                          <Tag className="w-3 h-3" /> Category
                        </span>
                        <span className={`px-2 py-1 rounded text-xs font-bold ${selectedTicket.category.toUpperCase() === 'IAM'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'
                          }`}>
                          {selectedTicket.category}
                        </span>
                      </div>
                    )}
                    {selectedTicket.slaDeadline && (
                      <div>
                        <span className="text-gray-500 text-xs uppercase tracking-wider font-semibold flex items-center gap-1 mb-1">
                          <Clock className="w-3 h-3" /> SLA Deadline
                        </span>
                        <p className="text-gray-900 font-medium">{selectedTicket.slaDeadline}</p>
                      </div>
                    )}
                  </div>
                </div>



                <div className="pt-6 border-t border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-gray-900 font-semibold">Agent Pipeline Progress</h3>
                    <button
                      onClick={() => setShowStepsModal(true)}
                      className="px-2.5 py-1 bg-purple-600 text-white text-xs rounded-md hover:bg-purple-700 transition flex items-center gap-1 shadow-sm"
                      title="View detailed progress in modal"
                    >
                      <Activity className="w-3 h-3" />
                      Expand
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedTicket.stages.map((stage, index) => {
                      const isCompleted = stage.status === 'completed';
                      const isCurrent = stage.status === 'in-progress';
                      const isError = stage.status === 'error';

                      return (
                        <div key={stage.id} className="flex items-start gap-3">
                          <div
                            className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${getStageStatusColor(stage.status)}`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isError ? (
                              <AlertCircle className="w-5 h-5" />
                            ) : (
                              <span className="text-sm font-medium">{index + 1}</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`font-medium ${isCurrent ? 'text-blue-600' : 'text-gray-900'}`}>
                              {stage.name}
                            </p>
                            {stage.message && (
                              <p className="text-sm text-gray-500 mt-1">{stage.message}</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main >

      {/* Email Preview Modal */}
      {
        showEmailModal && emailTemplate && createPortal(
          <div className="flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
            <div className="bg-white rounded-lg shadow-2xl w-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" style={{ maxHeight: '90vh' }}>

              {/* Header */}
              <div className="text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#2563eb' }}>
                <div>
                  <h2 className="text-xl font-bold">📧 Review Email</h2>
                  <p className="text-blue-100 text-sm mt-1">Ticket {selectedTicket?.id}</p>
                </div>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="p-1 text-white hover:bg-blue-700/50 rounded transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300 space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">To</label>
                  <div className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">{emailTemplate.to}</div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Subject</label>
                  <div className="text-sm font-medium text-gray-900 bg-gray-50 p-2 rounded border border-gray-200">{emailTemplate.subject}</div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-gray-500 font-bold mb-1">Message Body</label>
                  <div className="text-sm text-gray-800 bg-gray-50 p-3 rounded border border-gray-200 whitespace-pre-wrap font-mono leading-relaxed" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {emailTemplate.body}
                  </div>
                </div>

                <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded flex gap-2 items-start">
                  <span className="text-lg">ℹ️</span>
                  <span className="mt-0.5">This email will be sent immediately to the application owner.</span>
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200" style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', alignItems: 'center' }}>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 font-medium shadow-sm transition flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedTicket && handleApproveReview(selectedTicket.id)}
                  className="px-4 py-2 text-white rounded font-bold shadow-md hover:brightness-110 flex items-center gap-2 transition"
                  style={{ backgroundColor: '#16a34a' }}
                >
                  <CheckCheck className="w-4 h-4" /> Approve & Send
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Closure Confirmation Modal */}
      {
        showClosureModal && selectedTicket && createPortal(
          <div className="flex items-center justify-center p-4" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)' }}>
            <div className="bg-white rounded-lg shadow-2xl w-[600px] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200" style={{ maxHeight: '90vh' }}>

              {/* Header */}
              <div className="text-white px-6 py-4 flex items-center justify-between" style={{ backgroundColor: '#7e22ce' }}>
                <div>
                  <h2 className="text-xl font-bold">✅ Confirm Closure</h2>
                  <p className="text-purple-100 text-sm mt-1">Ticket {selectedTicket?.id}</p>
                </div>
                <button
                  onClick={() => setShowClosureModal(false)}
                  className="p-1 text-white hover:bg-purple-700/50 rounded transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-300">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                    <CheckCheck className="w-5 h-5" /> Actions Verified
                  </h3>
                  <ul className="space-y-2 text-sm text-green-700 ml-1">
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> IAM Category Verified</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Risk Assessment Complete</li>
                    <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Evidence Collected</li>
                  </ul>
                </div>

                <p className="text-gray-600">
                  You are about to close this ticket. This action will archive the collected evidence and notify the requester.
                </p>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end items-center gap-3 border-t border-gray-200">
                <button
                  onClick={() => setShowClosureModal(false)}
                  className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded hover:bg-gray-50 font-medium shadow-sm transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => selectedTicket && handleConfirmClosure(selectedTicket.id)}
                  className="px-4 py-2 text-white rounded font-bold shadow-md hover:brightness-110 flex items-center gap-2 transition"
                  style={{ backgroundColor: '#7e22ce' }}
                >
                  <CheckCheck className="w-4 h-4" /> Confirm & Close
                </button>
              </div>
            </div>
          </div>,
          document.body
        )
      }

      {/* Agent Pipeline Progress Modal */}
      {
        showStepsModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold">🤖 Agent Pipeline Progress</h2>
                    <p className="text-purple-100 text-sm mt-1">
                      Ticket {selectedTicket.id} - Stage {selectedTicket.currentStage + 1}/{selectedTicket.stages.length}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowStepsModal(false)}
                    className="text-white hover:text-purple-200 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-4">
                  {selectedTicket.stages.map((stage, index) => {
                    const isCompleted = stage.status === 'completed';
                    const isCurrent = stage.status === 'in-progress';
                    const isError = stage.status === 'error';

                    return (
                      <div
                        key={stage.id}
                        className={`flex items-start gap-4 p-4 rounded-lg border-2 transition ${isCurrent ? 'bg-blue-50 border-blue-300 shadow-md' :
                          isCompleted ? 'bg-green-50 border-green-200' :
                            isError ? 'bg-red-50 border-red-200' :
                              'bg-gray-50 border-gray-200'
                          }`}
                      >
                        <div
                          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${getStageStatusColor(stage.status)}`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-6 h-6" />
                          ) : isError ? (
                            <AlertCircle className="w-6 h-6" />
                          ) : isCurrent ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                          ) : (
                            <span className="text-sm font-bold">{index + 1}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <p className={`font-semibold text-lg ${isCurrent ? 'text-blue-700' :
                              isCompleted ? 'text-green-700' :
                                isError ? 'text-red-700' :
                                  'text-gray-700'
                              }`}>
                              {stage.name}
                            </p>
                            <span className={`px-2 py-1 rounded text-xs font-bold ${isCompleted ? 'bg-green-100 text-green-700' :
                              isCurrent ? 'bg-blue-100 text-blue-700' :
                                isError ? 'bg-red-100 text-red-700' :
                                  'bg-gray-100 text-gray-600'
                              }`}>
                              {stage.status.toUpperCase().replace('-', ' ')}
                            </span>
                          </div>
                          {stage.message && (
                            <p className="text-sm text-gray-600 mt-2 bg-white p-2 rounded border border-gray-200">
                              {stage.message}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                <button
                  onClick={() => setShowStepsModal(false)}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-medium shadow-md"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Success Toast Notification */}
      {
        showSuccessToast && (
          <div className="fixed bottom-8 right-8 bg-white border-l-4 border-green-500 shadow-2xl rounded-lg p-4 flex items-center gap-4 animate-slide-up z-50 max-w-md">
            <div className="bg-green-100 p-2 rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Ticket Processed Successfully!</h4>
              <p className="text-sm text-gray-600">Ticket {selectedTicket?.id} has been closed and logged.</p>
            </div>
            <button
              onClick={() => setShowSuccessToast(false)}
              className="text-gray-400 hover:text-gray-600 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      }

      <Footer />
    </div >
  );
}
