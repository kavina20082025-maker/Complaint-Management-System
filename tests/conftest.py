"""
CampusCare Testing Suite — Shared Pytest Fixtures & Configuration
Provides reusable fixtures for both White-Box and Black-Box test suites.
"""

import os
import pytest

# Application Base URL (defaults to port 3000 where server.ts runs)
BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000")


@pytest.fixture(scope="session")
def base_url():
    """Returns the base URL of the running CampusCare application."""
    return BASE_URL.rstrip("/")


@pytest.fixture(scope="session")
def assistant_api_url(base_url):
    """Returns the assistant API endpoint URL."""
    return f"{base_url}/api/assistant"


@pytest.fixture
def seed_users():
    """
    Standard seed test accounts verified in the CampusCare codebase.
    Used for authentication, role gating, and authorization tests.
    """
    return {
        "student": {
            "id": "usr_student_kavin",
            "name": "Kavin A M",
            "email": "kavinam@karunya.edu.in",
            "password": "student123",
            "role": "student",
            "department": "Computer Science & Engineering",
        },
        "staff": {
            "id": "usr_staff_rajesh",
            "name": "Dr. Rajesh Kumar",
            "email": "staff@campus.com",
            "password": "staff123",
            "role": "staff",
            "department": "Maintenance",
        },
        "head": {
            "id": "usr_head_selvam",
            "name": "Prof. M. Selvam",
            "email": "head@campus.com",
            "password": "head123",
            "role": "department_head",
            "department": "Maintenance",
        },
        "admin": {
            "id": "usr_admin_sarah",
            "name": "Dr. Sarah Jenkins",
            "email": "admin@campus.com",
            "password": "admin123",
            "role": "admin",
            "department": "General Administration",
        },
    }


@pytest.fixture
def valid_grievance_payload():
    """Valid grievance submission payload matching input fields of intake form."""
    return {
        "title": "Severe plumbing leakage on 3rd floor corridor",
        "description": "Drinking water pipeline has burst near room 314. Corridor is flooded and water supply is disrupted.",
        "location": "Hostel Block C, 3rd Floor",
        "is_critical": False,
        "is_anonymous": False,
    }


@pytest.fixture
def invalid_grievance_payloads():
    """Collection of invalid payloads for boundary testing."""
    return [
        {"title": "", "description": "Description without a title", "location": "Lab 1"},
        {"title": "Title without description", "description": "", "location": "Lab 2"},
        {"title": "   ", "description": "   ", "location": "Library"},
    ]
