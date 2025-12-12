
import os
import sys
from dotenv import load_dotenv

# Add project root to path
sys.path.append(os.getcwd())

load_dotenv()

from backend.agents.ticket_fetcher import TicketFetcherAgent
from backend.core.orchestrator import IAMOrchestrator
from langchain_openai import ChatOpenAI

def test_fetcher():
    print("Initializing LLM...")
    api_key = os.getenv("OPEN_ROUTER_KEY_ORIGINAL")
    if not api_key:
        print("Error: OPEN_ROUTER_KEY_ORIGINAL not found")
        return

    llm = ChatOpenAI(
        model="gpt-3.5-turbo",
        temperature=0,
        api_key=api_key,
        base_url="https://openrouter.ai/api/v1"
    )

    print("Initializing Agent...")
    agent = TicketFetcherAgent(llm=llm)
    
    print("Invoking Agent...")
    try:
        response = agent.invoke()
        print(f"Success! Found {len(response.tickets)} tickets.")
        for t in response.tickets:
            print(f"- {t.ticket_id}: {t.description[:30]}...")
    except Exception as e:
        print(f"Error invoking agent: {e}")

if __name__ == "__main__":
    test_fetcher()
