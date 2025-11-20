#!/usr/bin/env python3
"""
Quick API test script
"""
import requests
import json

API_URL = "http://localhost:8001"

# Test 1: Health check
print("Test 1: Health Check")
response = requests.get(f"{API_URL}/api/health")
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}\n")

# Test 2: Create ticket
print("Test 2: Create Ticket")
ticket_data = {
    "source": {
        "channel": "whatsapp",
        "origin_platform_id": "+15550100",
        "is_bot_handoff": False
    },
    "customer": {
        "internal_id": "",
        "name": "John Doe",
        "primary_email": "john@example.com",
        "channel_identity": "+15550100"
    },
    "subject": "Need help with my order",
    "initial_message": "My order #12345 is delayed",
    "priority": "high"
}

response = requests.post(f"{API_URL}/api/tickets/create", json=ticket_data)
print(f"Status: {response.status_code}")
if response.status_code == 201:
    ticket = response.json()
    print(f"✅ Ticket created: {ticket['ticket_id']}")
    print(f"   Status: {ticket['status']}")
    print(f"   Priority: {ticket['priority']}")
    print(f"   Subject: {ticket['subject']}")
else:
    print(f"❌ Error: {response.text}")
