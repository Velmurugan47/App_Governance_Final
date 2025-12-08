# agents/closer.py
from backend.models.ticket_context import TicketResponse, Ticket
from langchain.agents import create_agent
from langchain_core.tools import Tool
from langchain_core.messages import ToolMessage

# ✅ Tool function: close tickets by appending evidence message
def close_tickets(tickets: TicketResponse) -> TicketResponse:
    """Mark tickets as closed by appending evidence message to description."""
    updated = []
    for t in tickets.tickets:
        t.description = (t.description or "") + " | Evidence attached, ticket closed."
        updated.append(t)
    return TicketResponse(tickets=updated)

class CloserAgent:
    def __init__(self, llm=None):
        self.llm = llm

        # ✅ Register tool
        tools = [
            Tool(
                name="CloseTickets",
                func=lambda params: close_tickets(params.get("tickets")),
                description="Closes tickets by appending evidence message to description."
            )
        ]

        # ✅ Create agent with LLM + tool
        self.agent = create_agent(
            model=self.llm,
            tools=tools,
            context_schema=TicketResponse,
            system_prompt="Close the tickets by appending evidence."
        )

    def invoke(self, tickets: TicketResponse) -> TicketResponse:
        # Pass tickets to agent, which internally calls the tool
        result = self.agent.invoke({"messages": [{"role": "user", "content": "Close tickets"}], "tickets": tickets})
        
        if isinstance(result, dict) and "messages" in result:
            for msg in reversed(result["messages"]):
                if isinstance(msg, ToolMessage) and msg.name == "CloseTickets":
                    try:
                        return TicketResponse.parse_raw(msg.content)
                    except:
                        pass
        return TicketResponse(tickets=[])
