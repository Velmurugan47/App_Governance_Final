# agents/ownership_space_checker.py
from backend.models.ticket_context import TicketResponse
from langchain.agents import create_agent
from langchain_core.tools import Tool
from langchain_core.messages import ToolMessage

# ✅ Tool function: check if app owner belongs to our space
def check_owner_space(tickets: TicketResponse, allowed_spaces: list[str]) -> TicketResponse:
    """Filter tickets whose application_owner belongs to allowed spaces."""
    valid_tickets = []
    for t in tickets.tickets:
        if t.application_owner and t.application_owner in allowed_spaces:
            valid_tickets.append(t)
    return TicketResponse(tickets=valid_tickets)

class AppOwnerCheckerAgent:
    def __init__(self, llm=None, allowed_spaces=None):
        self.llm = llm
        self.allowed_spaces = allowed_spaces or ["IAM-Space", "Security-Space"]

        # ✅ Register tool
        tools = [
            Tool(
                name="CheckOwnerSpace",
                func=lambda params: check_owner_space(
                    params.get("tickets"),
                    self.allowed_spaces
                ),
                description="Filters tickets to only those whose app owner belongs to allowed spaces."
            )
        ]

        # ✅ Create agent with LLM + tool
        self.agent = create_agent(
            model=self.llm,
            tools=tools,
            context_schema=TicketResponse,
            system_prompt="Filter tickets by allowed app owner spaces."
        )

    def invoke(self, tickets: TicketResponse) -> TicketResponse:
        result = self.agent.invoke({"messages": [{"role": "user", "content": "Filter tickets"}], "tickets": tickets})
        
        if isinstance(result, dict) and "messages" in result:
            for msg in reversed(result["messages"]):
                if isinstance(msg, ToolMessage) and msg.name == "CheckOwnerSpace":
                    try:
                        return TicketResponse.parse_raw(msg.content)
                    except:
                        pass
        return TicketResponse(tickets=[])
