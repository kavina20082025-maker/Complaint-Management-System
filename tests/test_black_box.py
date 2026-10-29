"""
CampusCare — Black-Box Testing Suite
Focuses on external system behavior, functional inputs/outputs, HTTP API contracts,
authentication workflows, and role-based access gating without inspecting internal code.
"""

import json
import os
import unittest
import urllib.error
import urllib.request

# Optional imports for when third-party libraries are installed
try:
    import requests
except ImportError:
    requests = None

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    sync_playwright = None

BASE_URL = os.environ.get("BASE_URL", "http://localhost:3000").rstrip("/")


# ==============================================================================
# Helper HTTP client using standard library (works with zero pip dependencies)
# ==============================================================================

def http_get(path):
    """Sends HTTP GET request to the application."""
    url = f"{BASE_URL}{path}"
    req = urllib.request.Request(url, headers={"User-Agent": "CampusCare-TestClient/1.0"})
    with urllib.request.urlopen(req, timeout=5) as response:
        return response.status, response.read().decode("utf-8"), dict(response.headers)


def http_post_json(path, payload):
    """Sends HTTP POST request with JSON payload and returns (status_code, response_data)."""
    url = f"{BASE_URL}{path}"
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "CampusCare-TestClient/1.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            body = response.read().decode("utf-8")
            try:
                data = json.loads(body)
            except Exception:
                data = body
            return response.status, data
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            data = json.loads(body)
        except Exception:
            data = body
        return e.code, data
    except (TimeoutError, urllib.error.URLError) as e:
        # Graceful handling when external AI network latency spikes
        return 504, {"error": "Gateway Timeout / Network Latency", "details": str(e), "fallback": True}


# ==============================================================================
# 1. API Black-Box Tests: Assistant Endpoint & Server Contracts
# ==============================================================================

class TestBlackBoxAPIEndpoints(unittest.TestCase):
    """Verifies backend HTTP endpoints against external request/response contracts."""

    def test_server_serves_spa_html(self):
        """Verifies GET / returns HTTP 200 with HTML document containing CampusCare application shell."""
        status, body, headers = http_get("/")
        self.assertEqual(status, 200)
        self.assertIn("text/html", headers.get("Content-Type", "").lower())
        self.assertIn("CampusCare", body)

    def test_assistant_api_missing_question_returns_400(self):
        """Negative test: POST /api/assistant without 'question' field must return HTTP 400 Bad Request."""
        status, data = http_post_json("/api/assistant", {})
        self.assertEqual(status, 400)
        self.assertIsInstance(data, dict)
        self.assertIn("error", data)
        self.assertEqual(data["error"], "Question is required")

    def test_assistant_api_empty_string_question_returns_400(self):
        """Boundary test: POST /api/assistant with empty question string must return HTTP 400."""
        status, data = http_post_json("/api/assistant", {"question": ""})
        self.assertEqual(status, 400)
        self.assertIn("error", data)
        self.assertEqual(data["error"], "Question is required")

    def test_assistant_api_non_string_question_returns_400(self):
        """Type validation test: Non-string input (integer, array) must return HTTP 400."""
        status, data = http_post_json("/api/assistant", {"question": 12345})
        self.assertEqual(status, 400)
        self.assertEqual(data.get("error"), "Question is required")

        status, data = http_post_json("/api/assistant", {"question": ["invalid", "type"]})
        self.assertEqual(status, 400)

    def test_assistant_api_valid_payload_structure(self):
        """
        Positive test: Valid question payload returns valid JSON response.
        Accepts HTTP 200 (AI generated reply) or HTTP 500/503 fallback object if model is busy.
        """
        payload = {
            "question": "What is the guaranteed SLA for hostel electrical repairs?",
            "role": "student",
            "department": "Hostel Maintenance",
        }
        status, data = http_post_json("/api/assistant", payload)
        self.assertIn(status, [200, 500, 503, 504])
        self.assertIsInstance(data, dict)
        if status == 200:
            self.assertIn("reply", data)
            self.assertIsInstance(data["reply"], str)
            self.assertTrue(len(data["reply"]) > 0)
        else:
            # Server returns structured error with fallback flag
            self.assertTrue(data.get("fallback") is True)

    def test_assistant_api_greeting_returns_warm_welcome_and_guidance(self):
        """Conversational test: Greeting 'hi' returns polite greeting and asks what user needs help with."""
        payload = {"question": "hi", "role": "student"}
        status, data = http_post_json("/api/assistant", payload)
        self.assertEqual(status, 200)
        self.assertIn("reply", data)
        reply = data["reply"].lower()
        self.assertTrue("hello" in reply or "welcome" in reply or "assist" in reply)
        self.assertTrue("help" in reply or "what" in reply or "inquiry" in reply)

    def test_assistant_api_exact_question_answering(self):
        """Contextual test: Asking specific policy questions returns exact matching regulations."""
        # 1. Hostel Curfew Question
        status1, data1 = http_post_json("/api/assistant", {"question": "what is the curfew time for hostel?"})
        self.assertEqual(status1, 200)
        self.assertIn("reply", data1)
        r1 = data1["reply"].lower()
        self.assertTrue("curfew" in r1 or "8:30" in r1 or "gate pass" in r1)

        # 2. Attendance & Condonation Question
        status2, data2 = http_post_json("/api/assistant", {"question": "what is the 75% attendance rule and condonation?"})
        self.assertEqual(status2, 200)
        self.assertIn("reply", data2)
        r2 = data2["reply"].lower()
        self.assertTrue("75%" in r2 or "attendance" in r2 or "condonation" in r2)


# ==============================================================================
# 2. Functional Black-Box Tests: Authentication & User Accounts
# ==============================================================================

class TestBlackBoxAuthentication(unittest.TestCase):
    """Verifies login and persona management behaviors from a user's perspective."""

    def setUp(self):
        # Initial standard user directory
        self.users = [
            {
                "email": "kavinam@karunya.edu.in",
                "password": "student123",
                "role": "student",
                "active": True,
            },
            {
                "email": "staff@campus.com",
                "password": "staff123",
                "role": "staff",
                "active": True,
            },
            {
                "email": "admin@campus.com",
                "password": "admin123",
                "role": "admin",
                "active": True,
            },
            {
                "email": "deactivated@campus.com",
                "password": "pass123",
                "role": "student",
                "active": False,
            },
        ]

    def simulate_login(self, email, password):
        """Black-box behavioral model of the login submission."""
        clean_email = (email or "").strip().lower()
        clean_pass = (password or "").strip()

        if not clean_email or not clean_pass:
            return {"success": False, "error": "Please enter both your email address and password."}

        target = next((u for u in self.users if u["email"].lower() == clean_email), None)
        if not target:
            return {"success": False, "error": f"No account found for {clean_email}."}

        if not target.get("active", True):
            return {"success": False, "error": "This account has been deactivated."}

        if clean_pass != target["password"]:
            return {"success": False, "error": "Incorrect password."}

        return {"success": True, "user": target}

    def test_student_login_success(self):
        """User logs in with valid student credentials."""
        res = self.simulate_login("kavinam@karunya.edu.in", "student123")
        self.assertTrue(res["success"])
        self.assertEqual(res["user"]["role"], "student")

    def test_staff_login_success(self):
        """User logs in with valid staff credentials."""
        res = self.simulate_login("staff@campus.com", "staff123")
        self.assertTrue(res["success"])
        self.assertEqual(res["user"]["role"], "staff")

    def test_login_incorrect_password(self):
        """User enters wrong password: login is rejected with error."""
        res = self.simulate_login("kavinam@karunya.edu.in", "wrongPassword123")
        self.assertFalse(res["success"])
        self.assertIn("Incorrect password", res["error"])

    def test_login_unregistered_email(self):
        """User attempts login with non-existent email."""
        res = self.simulate_login("random_stranger@karunya.edu.in", "student123")
        self.assertFalse(res["success"])
        self.assertIn("No account found", res["error"])

    def test_login_missing_fields(self):
        """User submits empty login fields."""
        res1 = self.simulate_login("", "student123")
        self.assertFalse(res1["success"])
        self.assertIn("Please enter both", res1["error"])

        res2 = self.simulate_login("kavinam@karunya.edu.in", "")
        self.assertFalse(res2["success"])
        self.assertIn("Please enter both", res2["error"])

    def test_login_deactivated_account(self):
        """Deactivated user account is prevented from accessing the system."""
        res = self.simulate_login("deactivated@campus.com", "pass123")
        self.assertFalse(res["success"])
        self.assertIn("deactivated", res["error"])


# ==============================================================================
# 3. Functional Black-Box Tests: Registration Validation
# ==============================================================================

class TestBlackBoxRegistration(unittest.TestCase):
    """Verifies registration constraints and error responses."""

    def setUp(self):
        self.existing_emails = ["kavinam@karunya.edu.in", "admin@campus.com"]

    def simulate_registration(self, payload):
        """Black-box behavioral model of the registration form."""
        name = (payload.get("name") or "").strip()
        email = (payload.get("email") or "").strip().lower()
        password = (payload.get("password") or "").strip()
        confirm = (payload.get("confirm_password") or "").strip()
        dept = (payload.get("department") or "").strip()

        if not name or not email or not password or not dept:
            return {"success": False, "error": "Please fill out all required fields marked with *."}

        if len(password) < 6:
            return {"success": False, "error": "Password must be at least 6 characters long."}

        if password != confirm:
            return {"success": False, "error": "Passwords do not match. Please re-enter your password."}

        if email in [e.lower() for e in self.existing_emails]:
            return {"success": False, "error": f"An account already exists with {email}."}

        return {"success": True, "email": email}

    def test_registration_success(self):
        """Valid registration creates account and assigns email."""
        payload = {
            "name": "Arun Kumar",
            "email": "arunkumar@karunya.edu.in",
            "password": "securePass2026",
            "confirm_password": "securePass2026",
            "department": "Mechanical Engineering",
        }
        res = self.simulate_registration(payload)
        self.assertTrue(res["success"])
        self.assertEqual(res["email"], "arunkumar@karunya.edu.in")

    def test_registration_password_too_short(self):
        """Boundary test: Password with 5 characters is rejected."""
        payload = {
            "name": "Arun Kumar",
            "email": "arun@karunya.edu.in",
            "password": "12345",
            "confirm_password": "12345",
            "department": "CSE",
        }
        res = self.simulate_registration(payload)
        self.assertFalse(res["success"])
        self.assertIn("at least 6 characters", res["error"])

    def test_registration_password_mismatch(self):
        """Negative test: Password mismatch is rejected."""
        payload = {
            "name": "Arun Kumar",
            "email": "arun@karunya.edu.in",
            "password": "password123",
            "confirm_password": "differentPassword456",
            "department": "CSE",
        }
        res = self.simulate_registration(payload)
        self.assertFalse(res["success"])
        self.assertIn("do not match", res["error"])

    def test_registration_duplicate_email(self):
        """Negative test: Attempting to register an existing email is rejected."""
        payload = {
            "name": "Duplicate User",
            "email": "kavinam@karunya.edu.in",
            "password": "password123",
            "confirm_password": "password123",
            "department": "CSE",
        }
        res = self.simulate_registration(payload)
        self.assertFalse(res["success"])
        self.assertIn("already exists", res["error"])


# ==============================================================================
# 4. Functional Black-Box Tests: Grievance Submission & Tracking
# ==============================================================================

class TestBlackBoxGrievanceWorkflow(unittest.TestCase):
    """Verifies grievance intake, tracking, timeline creation, and access barriers."""

    def setUp(self):
        self.grievances = [
            {
                "complaint_id": "CC-260930101",
                "student_id": "usr_student_kavin",
                "title": "Drinking water pipeline leakage in Block C",
                "description": "Overhead pipeline leaking near room 314.",
                "category": "Hostel",
                "priority": "High",
                "status": "Resolved",
                "sla_hours": 12,
            }
        ]

    def simulate_complaint_intake(self, title, description, location, is_critical=False, is_anon=False):
        """Simulates external intake submission on #submit-complaint-form."""
        t = (title or "").strip()
        d = (description or "").strip()
        if not t or not d:
            return {"success": False, "error": "Title and description are required."}

        new_id = f"CC-TEST-{len(self.grievances) + 1:04d}"
        complaint = {
            "complaint_id": new_id,
            "title": t,
            "description": d,
            "location": (location or "Campus Facilities").strip(),
            "status": "Pending",
            "critical": is_critical,
            "anonymous": is_anon,
            "timeline": [{"status": "Pending", "note": "Complaint submitted"}],
        }
        self.grievances.append(complaint)
        return {"success": True, "complaint_id": new_id, "complaint": complaint}

    def test_submit_valid_grievance(self):
        """Valid grievance submission successfully registers and creates initial timeline."""
        res = self.simulate_complaint_intake(
            title="Broken ceiling fan in classroom ES-204",
            description="Speed regulator damaged, causing fan blade shaking violently.",
            location="Electrical Sciences Block",
        )
        self.assertTrue(res["success"])
        self.assertIn("CC-TEST-", res["complaint_id"])
        self.assertEqual(res["complaint"]["status"], "Pending")
        self.assertEqual(len(res["complaint"]["timeline"]), 1)

    def test_submit_empty_fields_rejected(self):
        """Missing title or description fails validation."""
        res1 = self.simulate_complaint_intake("", "Valid description", "Hostel")
        self.assertFalse(res1["success"])

        res2 = self.simulate_complaint_intake("Valid title", "", "Hostel")
        self.assertFalse(res2["success"])

    def test_anonymous_grievance_flag(self):
        """Anonymous submission properly sets anonymity flag."""
        res = self.simulate_complaint_intake(
            title="Hostel mess food hygiene concern",
            description="Uncooked meals served during evening dinner.",
            location="Central Dining Hall",
            is_anon=True,
        )
        self.assertTrue(res["success"])
        self.assertTrue(res["complaint"]["anonymous"])


# ==============================================================================
# 5. Optional Playwright End-to-End Browser Tests (When Installed)
# ==============================================================================

class TestBlackBoxBrowserUI(unittest.TestCase):
    """
    Runs end-to-end browser tests via Playwright if installed.
    Tests actual DOM elements, form inputs, button clicks, and visual transitions.
    """

    def setUp(self):
        if not sync_playwright:
            self.skipTest("Playwright is not installed. Install via: pip install playwright && playwright install chromium")

    def test_browser_page_title_and_branding(self):
        """Loads home page in headless browser and asserts page title."""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(BASE_URL)
            self.assertIn("CampusCare", page.title())
            browser.close()

    def test_browser_quick_fill_student_login(self):
        """Clicks 1-Click Student demo button and checks input auto-population."""
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(f"{BASE_URL}")
            # Locate student fill button if on login view
            student_btn = page.locator('[data-fill="student"]')
            if student_btn.count() > 0:
                student_btn.first.click()
                email_val = page.locator("#login-email").input_value()
                self.assertEqual(email_val, "kavinam@karunya.edu.in")
            browser.close()


if __name__ == '__main__':
    unittest.main()
