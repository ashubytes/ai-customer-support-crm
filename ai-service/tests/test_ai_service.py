import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.asyncio
async def test_health_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "service" in data


@pytest.mark.asyncio
async def test_analyze_ticket_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/ai/analyze-ticket",
            json={
                "subject": "Double charged for subscription renewal",
                "description": "I was charged twice on my corporate credit card for the annual plan.",
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert "category" in data
    assert "priority" in data
    assert "sentiment" in data
    assert "summary" in data
    assert "suggested_reply" in data
    assert data["category"] in [
        "Account",
        "Payment",
        "Billing",
        "Refund",
        "Technical Issue",
        "Login",
        "Order",
        "Product",
        "Delivery",
        "Other",
    ]


@pytest.mark.asyncio
async def test_suggest_response_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/api/ai/suggest-response",
            json={
                "subject": "Cannot access dashboard",
                "description": "Getting 403 Forbidden error after login.",
                "messages": [
                    {"sender_type": "customer", "message": "Still getting 403 error."}
                ],
            },
        )
    assert response.status_code == 200
    data = response.json()
    assert "suggested_reply" in data
    assert len(data["suggested_reply"]) > 0
