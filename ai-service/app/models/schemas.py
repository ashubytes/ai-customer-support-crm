from typing import List, Optional, Literal
from pydantic import BaseModel, Field

TicketCategory = Literal[
    'Account',
    'Payment',
    'Billing',
    'Refund',
    'Technical Issue',
    'Login',
    'Order',
    'Product',
    'Delivery',
    'Other',
]

TicketPriority = Literal['Low', 'Medium', 'High', 'Urgent']

TicketSentiment = Literal['Positive', 'Neutral', 'Negative']


class TicketAnalysisRequest(BaseModel):
    subject: str = Field(..., min_length=3, description="Subject of the support ticket")
    description: str = Field(..., min_length=5, description="Full description of the customer issue")


class TicketAnalysisResponse(BaseModel):
    category: TicketCategory
    priority: TicketPriority
    sentiment: TicketSentiment
    summary: str = Field(..., description="Concise 1-2 sentence executive summary of the issue")
    suggested_reply: str = Field(..., description="Draft professional empathetic response for the support agent")
    is_fallback: bool = Field(default=False, description="Flag indicating whether rule-based fallback was used")


class ConversationMessage(BaseModel):
    sender_type: Literal['customer', 'agent', 'admin', 'system']
    message: str


class SuggestResponseRequest(BaseModel):
    subject: str
    description: str
    messages: Optional[List[ConversationMessage]] = []


class SuggestResponseOutput(BaseModel):
    suggested_reply: str
    is_fallback: bool = False
