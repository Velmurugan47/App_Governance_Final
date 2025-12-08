# agents/logger.py
from backend.models.ticket_context import TicketResponse
from datetime import datetime
from langchain.agents import create_agent
from langchain_core.tools import Tool
from langchain_core.messages import ToolMessage
import json

# ✅ Tool function: generate logs
def generate_logs(tickets: TicketResponse, message: str = None) -> dict:
    """Generate logs for tickets or custom messages."""
    logs = []
    if message:
        logs.append(f"[{datetime.utcnow().isoformat()}] {message}")
    elif not tickets.tickets:
        logs.append(f"[{datetime.utcnow().isoformat()}] No tickets found for processing.")
    else:
        for t in tickets.tickets:
            logs.append(
                f"[{datetime.utcnow().isoformat()}] Processed ticket {t.ticket_id} "
                f"with risk {t.risk_level or 'Unknown'}"
            )
    return {"logs": logs}

class LoggerAgent:
    def __init__(self, llm=None):
        self.llm = llm

        # ✅ Register tool
        tools = [
            Tool(
                name="GenerateLogs",
                func=lambda params: generate_logs(
                    params.get("tickets"),
                    params.get("message")
                ),
                description="Generates logs for tickets or custom failure messages."
            )
        ]

        # ✅ Create agent with LLM + tool
        self.agent = create_agent(
            model=self.llm,
            tools=tools,
            context_schema=TicketResponse,
            system_prompt="Generate logs for the tickets."
        )

    def invoke(self, tickets: TicketResponse, message: str = None) -> dict:
        # Pass tickets + message to agent
        result = self.agent.invoke({"messages": [{"role": "user", "content": "Generate logs"}], "tickets": tickets, "message": message})
        
        if isinstance(result, dict) and "messages" in result:
            for msg in reversed(result["messages"]):
                if isinstance(msg, ToolMessage) and msg.name == "GenerateLogs":
                    try:
                        return json.loads(msg.content)
                    except Exception as e:
                        print(f"Error parsing logs: {e}")
        return {"logs": []}
