import json
import os
from backend.models.ticket_context import TicketResponse, Ticket
from langchain.agents import create_agent
from langchain_core.tools import Tool
from langchain_core.messages import ToolMessage

# ✅ Tool function for fetching all tickets
def fetch_all_tickets(data_file: str) -> TicketResponse:
    """Fetch all tickets from JSON file."""
    with open(data_file, "r") as f:
        sample_data = json.load(f)

    tickets = [Ticket(**t) for t in sample_data]
    return TicketResponse(tickets=tickets)

class TicketFetcherAgent:
    def __init__(self, llm=None, data_file=None):
        self.llm = llm
        from pathlib import Path
        self.data_file = data_file or str(
            Path(__file__).parent.parent.parent / "data" / "ticket_data.json"
        )

        # ✅ Register tool
        tools = [
            Tool(
                name="FetchAllTickets",
                func=lambda _: fetch_all_tickets(self.data_file),
                description="Fetches all tickets from JSON file"
            )
        ]

        # ✅ Create agent with LLM + tool
        self.agent = create_agent(
            model=self.llm,
            tools=tools,
            context_schema=TicketResponse,
            system_prompt="Fetch all tickets using the provided tool."
        )

    def invoke(self) -> TicketResponse:
        # ✅ Call the agent, which internally uses the tool
        result = self.agent.invoke({"messages": [{"role": "user", "content": "Fetch all tickets"}]})
        
        # Extract result from ToolMessage
        if isinstance(result, dict) and "messages" in result:
            for msg in reversed(result["messages"]):
                if isinstance(msg, ToolMessage) and msg.name == "FetchAllTickets":
                    try:
                        return TicketResponse.parse_raw(msg.content)
                    except Exception as e:
                        print(f"Error parsing tool output: {e}")
        
        return TicketResponse(tickets=[])
