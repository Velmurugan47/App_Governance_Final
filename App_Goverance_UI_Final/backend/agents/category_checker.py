from backend.models.ticket_context import TicketResponse, Ticket
from langchain.agents import create_agent
from langchain_core.tools import Tool
from langchain_core.messages import ToolMessage

def filter_iam_tickets(tickets: TicketResponse) -> TicketResponse:        
    """Tool function to filter IAM tickets and mark deliverableType."""
    iam_tickets = []
    for t in tickets.tickets:
        if t.category.upper() == "IAM":
            t.deliverableType = "IAM Category"
            iam_tickets.append(t)
    return TicketResponse(tickets=iam_tickets)

class CategoryCheckerAgent:
    def __init__(self, llm):
        # Register the IAM filter tool
        tools = [
            Tool(
                name="FilterIAMTickets",
                func=filter_iam_tickets,
                description="Filters tickets and returns only IAM category tickets"
            )
        ]

        # Create the agent with LLM + tool
        self.agent = create_agent(
            model=llm,
            tools=tools,
            context_schema= TicketResponse,
            system_prompt="Filter the tickets to only IAM category."
        )

    def invoke(self, tickets: TicketResponse) -> TicketResponse:
        # Call the agent with your ticket context
        result = self.agent.invoke({"messages": [{"role": "user", "content": "Filter IAM tickets"}], "tickets": tickets})
        
        if isinstance(result, dict) and "messages" in result:
            for msg in reversed(result["messages"]):
                if isinstance(msg, ToolMessage) and msg.name == "FilterIAMTickets":
                    return TicketResponse.parse_raw(msg.content)
        return TicketResponse(tickets=[])
