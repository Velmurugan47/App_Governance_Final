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
        """Fetch tickets directly without LLM overhead for reliability."""
        try:
            return fetch_all_tickets(self.data_file)
        except Exception as e:
            print(f"Error fetching tickets: {e}")
            return TicketResponse(tickets=[])
