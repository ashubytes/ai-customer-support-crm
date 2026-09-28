import os
import json
import re
from typing import Dict, Any, List
from dotenv import load_dotenv
from app.models.schemas import TicketAnalysisResponse, SuggestResponseOutput

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()

# Initialize Gemini if key is provided
gemini_client = None
if GEMINI_API_KEY:
    try:
        import google.generativeai as genai
        genai.configure(api_key=GEMINI_API_KEY)
        gemini_client = genai.GenerativeModel("gemini-1.5-flash")
        print("[AI-SERVICE] Successfully initialized Google Gemini API client.")
    except Exception as e:
        print(f"[AI-SERVICE] Warning: Could not initialize Gemini API: {e}")
        gemini_client = None


def is_gemini_active() -> bool:
    return gemini_client is not None and bool(GEMINI_API_KEY)


def rule_based_fallback_analysis(subject: str, description: str) -> Dict[str, Any]:
    """
    Intelligent NLP fallback analyzer when Gemini API is unavailable or unconfigured.
    """
    combined = f"{subject} {description}".lower()

    # Category matching
    category = "Other"
    if any(k in combined for k in ["payment", "card", "charge", "checkout", "transaction", "stripe", "visa"]):
        category = "Payment"
    elif any(k in combined for k in ["billing", "invoice", "receipt", "subscription fee", "cost"]):
        category = "Billing"
    elif any(k in combined for k in ["refund", "money back", "reimburse"]):
        category = "Refund"
    elif any(k in combined for k in ["login", "password", "otp", "2fa", "locked", "credentials", "sign in"]):
        category = "Login"
    elif any(k in combined for k in ["account", "profile", "sso", "saml", "upgrade", "downgrade"]):
        category = "Account"
    elif any(k in combined for k in ["error", "bug", "500", "404", "crash", "timeout", "exception", "failed", "api"]):
        category = "Technical Issue"
    elif any(k in combined for k in ["order", "purchase", "tracking", "cart"]):
        category = "Order"
    elif any(k in combined for k in ["delivery", "shipping", "courier", "package"]):
        category = "Delivery"
    elif any(k in combined for k in ["product", "feature request", "compatibility"]):
        category = "Product"

    # Priority matching
    priority = "Medium"
    if any(k in combined for k in ["urgent", "critical", "outage", "emergency", "production down", "asap"]):
        priority = "Urgent"
    elif any(k in combined for k in ["fail", "error", "charged twice", "double charge", "cannot login", "lost access"]):
        priority = "High"
    elif any(k in combined for k in ["inquiry", "question", "how do i", "information", "feedback"]):
        priority = "Low"

    # Sentiment matching
    sentiment = "Neutral"
    if any(k in combined for k in ["unacceptable", "terrible", "frustrated", "angry", "worst", "error", "fail", "broken", "duplicate charge"]):
        sentiment = "Negative"
    elif any(k in combined for k in ["thank", "great", "awesome", "love", "helpful", "appreciate"]):
        sentiment = "Positive"

    summary = f"Customer reports: {subject.strip()}."
    if len(summary) > 120:
        summary = summary[:117] + "..."

    suggested_reply = (
        f"Hello, thank you for reaching out to our support team regarding '{subject}'. "
        f"We understand the importance of this matter and are actively investigating. "
        f"We will review your account details and update you with a resolution shortly."
    )

    return {
        "category": category,
        "priority": priority,
        "sentiment": sentiment,
        "summary": summary,
        "suggested_reply": suggested_reply,
        "is_fallback": True,
    }


async def analyze_ticket_with_gemini(subject: str, description: str) -> TicketAnalysisResponse:
    """
    Analyzes ticket subject and description using Google Gemini API with fallback.
    """
    if not is_gemini_active():
        fallback = rule_based_fallback_analysis(subject, description)
        return TicketAnalysisResponse(**fallback)

    prompt = f"""
You are an expert AI customer support triage and CRM system.
Analyze the following support ticket and provide structured JSON output.

Ticket Subject: {subject}
Ticket Description: {description}

Categories allowed: ["Account", "Payment", "Billing", "Refund", "Technical Issue", "Login", "Order", "Product", "Delivery", "Other"]
Priorities allowed: ["Low", "Medium", "High", "Urgent"]
Sentiments allowed: ["Positive", "Neutral", "Negative"]

Respond ONLY with a valid JSON object in this exact schema without any markdown wrapping or extra text:
{{
  "category": "string",
  "priority": "string",
  "sentiment": "string",
  "summary": "1-2 sentence executive summary of the issue",
  "suggested_reply": "A professional, polite, empathetic draft response ready for the agent to review and send"
}}
"""

    try:
        response = gemini_client.generate_content(prompt)
        text = response.text.strip()

        # Clean any markdown code fences if present
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?", "", text)
            text = re.sub(r"```$", "", text).strip()

        parsed = json.loads(text)

        # Validate category, priority, sentiment boundaries
        category = parsed.get("category", "Other")
        if category not in ["Account", "Payment", "Billing", "Refund", "Technical Issue", "Login", "Order", "Product", "Delivery", "Other"]:
            category = "Other"

        priority = parsed.get("priority", "Medium")
        if priority not in ["Low", "Medium", "High", "Urgent"]:
            priority = "Medium"

        sentiment = parsed.get("sentiment", "Neutral")
        if sentiment not in ["Positive", "Neutral", "Negative"]:
            sentiment = "Neutral"

        summary = parsed.get("summary", subject)
        suggested_reply = parsed.get("suggested_reply", "Thank you for reaching out. We are looking into this.")

        return TicketAnalysisResponse(
            category=category,
            priority=priority,
            sentiment=sentiment,
            summary=summary,
            suggested_reply=suggested_reply,
            is_fallback=False,
        )
    except Exception as e:
        print(f"[AI-SERVICE] Gemini generation exception ({e}). Falling back to local NLP.")
        fallback = rule_based_fallback_analysis(subject, description)
        return TicketAnalysisResponse(**fallback)


async def suggest_response_with_gemini(
    subject: str,
    description: str,
    messages: List[Dict[str, Any]]
) -> SuggestResponseOutput:
    """
    Generates a contextual reply suggestion considering full conversation history.
    """
    if not is_gemini_active():
        return SuggestResponseOutput(
            suggested_reply=f"Hello, thank you for following up regarding '{subject}'. We are continuing to work on your request and will provide an update shortly.",
            is_fallback=True
        )

    formatted_history = "\n".join([
        f"[{m.get('sender_type', 'user').upper()}]: {m.get('message', '')}"
        for m in messages
    ])

    prompt = f"""
You are an AI customer support assistant helping a human support agent.
Review the ticket details and full conversation history below, and draft a helpful, professional, polite follow-up response for the agent to send to the customer.

Ticket Subject: {subject}
Initial Problem: {description}

Conversation History:
{formatted_history}

Provide ONLY the suggested response text without any metadata or quotation marks.
"""

    try:
        response = gemini_client.generate_content(prompt)
        reply = response.text.strip()
        return SuggestResponseOutput(suggested_reply=reply, is_fallback=False)
    except Exception as e:
        print(f"[AI-SERVICE] Gemini suggest reply error: {e}")
        return SuggestResponseOutput(
            suggested_reply=f"Hello, thank you for your patience. I am reviewing the recent updates for '{subject}' and will assist you shortly.",
            is_fallback=True
        )
