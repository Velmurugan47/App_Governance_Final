# agents/sla_prioritizer.py
from backend.models.ticket_context import TicketResponse, Ticket
from datetime import datetime
from langchain.agents import create_agent
from langchain_core.tools import Tool
from langchain_core.messages import ToolMessage

# ✅ Tool function: calculate SLA risk levels
def prioritize_tickets_by_sla(tickets: TicketResponse) -> TicketResponse:
    """Assign risk levels to tickets based on SLA deadlines."""
    updated = []
    for t in tickets.tickets:
        try:
            due = datetime.fromisoformat(t.sla_deadline)
            days_left = (due - datetime.utcnow()).days
            if days_left <= 2:
                t.risk_level = "High"
            elif days_left <= 5:
                t.risk_level = "Medium"
            else:
                t.risk_level = "Low"
        except Exception:
            t.risk_level = "Unknown"
        updated.append(t)
    return TicketResponse(tickets=updated)

class SLAPrioritizerAgent:
    def __init__(self, llm=None):
        self.llm = llm

        # ✅ Register tool
        tools = [
            Tool(
                name="PrioritizeTicketsBySLA",
                func=lambda params: prioritize_tickets_by_sla(params.get("tickets")),
                description="Assigns risk levels (High/Medium/Low) to tickets based on SLA deadlines."
            )
        ]

        # ✅ Create agent with LLM + tool
        self.agent = create_agent(
            model=self.llm,
            tools=tools,
            context_schema=TicketResponse,
            system_prompt="Prioritize tickets based on SLA."
        )

    def invoke(self, tickets: TicketResponse) -> TicketResponse:
        # Pass tickets to agent, which internally calls the tool
        result = self.agent.invoke({"messages": [{"role": "user", "content": "Prioritize tickets"}], "tickets": tickets})
        
        if isinstance(result, dict) and "messages" in result:
            for msg in reversed(result["messages"]):
                if isinstance(msg, ToolMessage) and msg.name == "PrioritizeTicketsBySLA":
                    try:
                        return TicketResponse.parse_raw(msg.content)
                    except:
                        pass
        return TicketResponse(tickets=[])
