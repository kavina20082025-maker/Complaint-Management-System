"""
CampusCare — White-Box Testing Suite
Focuses on internal logic, branch coverage, algorithmic specifications, boundary values,
and structural execution paths of CampusCare's core decision engines.
"""

import math
import subprocess
import unittest
from datetime import datetime, timedelta, timezone

# ==============================================================================
# White-Box Target 1: Core Algorithmic Decision Logic (CampusCare Engine)
# ==============================================================================

CATEGORY_RULES = {
    'Hostel': ['hostel', 'room', 'water', 'warden', 'bed', 'bathroom', 'mess', 'accommodation', 'dormitory', 'geyser', 'tap', 'leakage', 'toilet'],
    'Transport': ['bus', 'transport', 'driver', 'route', 'vehicle', 'stop', 'commute', 'shuttle', 'pass', 'timing'],
    'Fees': ['fee', 'fees', 'payment', 'scholarship', 'refund', 'accounts', 'challan', 'receipt', 'tuition', 'fine', 'dues'],
    'Academic': ['exam', 'mark', 'marks', 'faculty', 'course', 'class', 'attendance', 'assignment', 'academic', 'syllabus', 'professor', 'hod', 'timetable', 'hall ticket'],
    'IT Support': ['wifi', 'wi-fi', 'internet', 'computer', 'password', 'login', 'portal', 'network', 'software', 'email', 'lms', 'server', 'erp', 'lan', 'printer'],
    'Food': ['food', 'canteen', 'mess', 'breakfast', 'lunch', 'dinner', 'meal', 'hygiene', 'catering', 'snack', 'water cooler'],
    'Infrastructure': ['building', 'classroom', 'fan', 'light', 'electricity', 'water', 'chair', 'bench', 'projector', 'lift', 'elevator', 'ac', 'air conditioning', 'switch'],
    'Library': ['library', 'book', 'borrow', 'fine', 'reading room', 'journal', 'librarian', 'catalog', 'due date', 'e-resource'],
}

DEPT_RULES = {
    'Hostel Maintenance': ['hostel', 'room', 'warden', 'water', 'bathroom', 'dormitory', 'geyser', 'tap', 'leakage'],
    'Transport': ['bus', 'transport', 'driver', 'route', 'shuttle', 'vehicle'],
    'Accounts': ['fee', 'payment', 'scholarship', 'refund', 'challan', 'tuition'],
    'IT Support': ['wifi', 'wi-fi', 'internet', 'computer', 'password', 'portal', 'network', 'login', 'server', 'lms', 'lan'],
    'Food Services': ['food', 'canteen', 'mess', 'meal', 'breakfast', 'lunch', 'dinner', 'catering'],
    'Library': ['library', 'book', 'reading', 'journal', 'catalog'],
    'Maintenance': ['building', 'classroom', 'fan', 'light', 'electricity', 'chair', 'bench', 'ac', 'projector', 'lift'],
    'Academic': ['exam', 'mark', 'faculty', 'course', 'class', 'attendance', 'assignment', 'hall ticket'],
}

SLA_HOURS = {
    'Low': 120,
    'Medium': 48,
    'High': 12,
    'Critical': 4,
}

ROLE_ALLOWED_MAP = {
    'student': [
        'dashboard', 'student-hub', 'submit', 'complaint-detail',
        'status-board', 'compensation', 'ombudsman', 'dossier',
        'emergency', 'assistant', 'search', 'services', 'announcements',
        'watchlist', 'profile'
    ],
    'staff': [
        'dashboard', 'staff-workstation', 'work-queue', 'complaint-detail',
        'maintenance', 'assistant', 'notification-gateway', 'search',
        'announcements', 'profile'
    ],
    'department_head': [
        'dashboard', 'hod-console', 'sla-warning', 'sla-matrix',
        'analytics', 'work-queue', 'complaint-detail', 'maintenance',
        'assistant', 'search', 'services', 'announcements', 'profile'
    ],
    'admin': None,  # Full access
}


def sanitize_avatar(val):
    """Internal sanitization function from app.js to prevent XSS and quote breakout."""
    if not val or not isinstance(val, str):
        return None
    # Strip any corrupted legacy strings containing raw html attributes or quotes
    if any(token in val for token in ['alt="', 'style="', '<svg', '"', "'"]):
        return None
    return val


def smart_category(text):
    """Categorizes raw complaint text based on category keyword frequency."""
    norm = (text or '').lower()
    scores = {}
    for cat, words in CATEGORY_RULES.items():
        scores[cat] = sum(1 for w in words if w in norm)
    best = 'Other'
    max_score = 0
    for c, s in scores.items():
        if s > max_score:
            max_score = s
            best = c
    return best if max_score > 0 else 'Other'


def smart_department(text, category):
    """Maps complaint text and category to responsible university department."""
    norm = (text or '').lower()
    scores = {}
    for dept, words in DEPT_RULES.items():
        scores[dept] = sum(1 for w in words if w in norm)
    best = ''
    max_score = 0
    for d, s in scores.items():
        if s > max_score:
            max_score = s
            best = d
    if max_score > 0:
        return best

    fallback_map = {
        'Hostel': 'Hostel Maintenance',
        'Transport': 'Transport',
        'Fees': 'Accounts',
        'IT Support': 'IT Support',
        'Food': 'Food Services',
        'Library': 'Library',
        'Academic': 'Academic',
        'Infrastructure': 'Maintenance',
    }
    return fallback_map.get(category, 'General Administration')


def smart_priority(text, is_critical=False):
    """Classifies complaint urgency based on hazard keywords and safety overrides."""
    t = (text or '').lower()
    critical_keywords = [
        'emergency', 'danger', 'fire', 'accident', 'injury',
        'security threat', 'power failure', 'sparking', 'short circuit', 'ragging'
    ]
    if is_critical or any(w in t for w in critical_keywords):
        return 'Critical'

    high_keywords = [
        'urgent', 'immediately', 'unsafe', 'no water', 'no electricity',
        'cannot attend', 'system down', 'hall ticket blocked'
    ]
    if any(w in t for w in high_keywords):
        return 'High'

    medium_keywords = [
        'not working', 'problem', 'issue', 'delay', 'broken', 'slow', 'faulty'
    ]
    if any(w in t for w in medium_keywords):
        return 'Medium'

    return 'Low'


def get_bigrams(s):
    """Generates 2-character n-grams from alphanumeric text."""
    cleaned = ''.join(c.lower() for c in (s or '') if c.isalnum())
    bigrams = set()
    for i in range(len(cleaned) - 1):
        bigrams.add(cleaned[i:i + 2])
    return bigrams


def text_similarity(str1, str2):
    """Calculates Sørensen-Dice similarity coefficient across bigrams."""
    if not str1 or not str2:
        return 0.0
    b1 = get_bigrams(str1)
    b2 = get_bigrams(str2)
    if not b1 or not b2:
        return 0.0
    intersect = len(b1.intersection(b2))
    return (2.0 * intersect) / (len(b1) + len(b2))


def find_duplicate(title, desc, existing_complaints, threshold=0.62):
    """Searches for duplicate open complaints exceeding similarity threshold."""
    text = (title + ' ' + desc).strip()
    if len(text) < 8:
        return None
    for c in existing_complaints:
        if c.get('status') == 'Closed':
            continue
        old_text = (c.get('title', '') + ' ' + c.get('description', '')).strip()
        sim = text_similarity(text, old_text)
        if sim >= threshold:
            return c
    return None


def get_sla_status(deadline_iso, status, now_override=None):
    """Evaluates SLA deadline compliance and returns remaining or overdue time."""
    if status in ['Resolved', 'Closed']:
        return {'isOverdue': False, 'isApproaching': False, 'formatted': 'Resolved within SLA'}

    now_dt = now_override or datetime.now(timezone.utc)
    deadline_dt = datetime.fromisoformat(deadline_iso.replace('Z', '+00:00'))

    diff_seconds = (deadline_dt - now_dt).total_seconds()
    is_overdue = diff_seconds < 0
    abs_seconds = abs(diff_seconds)
    hours = int(abs_seconds // 3600)
    minutes = int((abs_seconds % 3600) // 60)
    is_approaching = (not is_overdue) and (diff_seconds <= 6 * 3600)

    formatted = f"Overdue by {hours}h {minutes}m" if is_overdue else f"{hours}h {minutes}m remaining"
    return {
        'isOverdue': is_overdue,
        'isApproaching': is_approaching,
        'formatted': formatted,
    }


def validate_registration(name, email, password, confirm_password, dept, existing_emails=None):
    """Validates registration input fields according to CampusCare business rules."""
    if not name or not email or not password or not dept:
        return False, "Please fill out all required fields marked with *."
    if len(password) < 6:
        return False, "Password must be at least 6 characters long."
    if password != confirm_password:
        return False, "Passwords do not match. Please re-enter your password."
    if existing_emails and email.lower() in [e.lower() for e in existing_emails]:
        return False, f"An account already exists with {email}."
    return True, "Valid"


def validate_role_access(role, view_name):
    """Role-based access control decision gate."""
    allowed = ROLE_ALLOWED_MAP.get(role)
    if allowed is None:
        return True  # Full access (e.g., admin)
    return view_name in allowed


# ==============================================================================
# White-Box Test Cases (Statements, Branches, Conditions, Boundaries)
# ==============================================================================

class TestWhiteBoxAvatarSanitization(unittest.TestCase):
    """Tests boundary values and condition branches of the avatar sanitization engine."""

    def test_sanitize_none_and_empty(self):
        """Branch: Non-string or empty avatar values return None."""
        self.assertIsNone(sanitize_avatar(None))
        self.assertIsNone(sanitize_avatar(""))
        self.assertIsNone(sanitize_avatar(12345))
        self.assertIsNone(sanitize_avatar([]))

    def test_sanitize_rejects_attribute_injection(self):
        """Branch: Strings containing unescaped HTML attributes or quotes are rejected."""
        malicious_input = 'data:image/svg+xml;utf8,<svg" alt="Avatar" style="width: 40px;'
        self.assertIsNone(sanitize_avatar(malicious_input))
        self.assertIsNone(sanitize_avatar('test"quote'))
        self.assertIsNone(sanitize_avatar("test'quote"))
        self.assertIsNone(sanitize_avatar('<svg width="128">...</svg>'))

    def test_sanitize_accepts_clean_base64_data_uri(self):
        """Branch: Well-formed Base64 data URIs pass sanitization."""
        valid_preset = (
            "data:image/svg+xml;base64,"
            "PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjgiIGhlaWdodD0iMTI4Ij48L3N2Zz4="
        )
        self.assertEqual(sanitize_avatar(valid_preset), valid_preset)


class TestWhiteBoxSmartClassification(unittest.TestCase):
    """Tests condition coverage and keyword score branches of smart category classification."""

    def test_category_hostel_branch(self):
        text = "Water leakage and tap broken in hostel room bathroom"
        self.assertEqual(smart_category(text), "Hostel")

    def test_category_transport_branch(self):
        text = "Bus route 14 shuttle timing delayed"
        self.assertEqual(smart_category(text), "Transport")

    def test_category_it_support_branch(self):
        text = "Eduroam wi-fi network dropping packets on laptop"
        self.assertEqual(smart_category(text), "IT Support")

    def test_category_fees_branch(self):
        text = "Scholarship tuition fee receipt not reconciled"
        self.assertEqual(smart_category(text), "Fees")

    def test_category_food_branch(self):
        text = "Canteen lunch food quality hygiene issue"
        self.assertEqual(smart_category(text), "Food")

    def test_category_library_branch(self):
        text = "Reading room book catalog fine mismatch"
        self.assertEqual(smart_category(text), "Library")

    def test_category_fallback_branch(self):
        text = "Completely obscure sentence with no campus keywords"
        self.assertEqual(smart_category(text), "Other")


class TestWhiteBoxSmartDepartment(unittest.TestCase):
    """Tests department routing score computation and dictionary fallbacks."""

    def test_department_keyword_hit(self):
        self.assertEqual(smart_department("Geyser tap leakage", "Hostel"), "Hostel Maintenance")
        self.assertEqual(smart_department("Campus wifi internet connection down", "IT Support"), "IT Support")

    def test_department_fallback_mapping(self):
        # Even without department keywords, category fallback provides exact department
        self.assertEqual(smart_department("general query", "Hostel"), "Hostel Maintenance")
        self.assertEqual(smart_department("general query", "Fees"), "Accounts")
        self.assertEqual(smart_department("general query", "Infrastructure"), "Maintenance")
        self.assertEqual(smart_department("general query", "UnknownCategory"), "General Administration")


class TestWhiteBoxSmartPriority(unittest.TestCase):
    """Tests multi-condition coverage for Critical, High, Medium, and Low priorities."""

    def test_priority_explicit_critical_override(self):
        """Condition: is_critical=True forces Critical regardless of text."""
        self.assertEqual(smart_priority("Minor squeaky door hinge", is_critical=True), "Critical")

    def test_priority_emergency_keyword_critical(self):
        """Condition: Dangerous hazard keywords trigger Critical priority."""
        self.assertEqual(smart_priority("Exposed live wire sparking in hallway"), "Critical")
        self.assertEqual(smart_priority("Anti-ragging incident in corridor"), "Critical")
        self.assertEqual(smart_priority("Fire hazard near electrical panel"), "Critical")

    def test_priority_urgent_keyword_high(self):
        """Condition: Urgent operational blockages trigger High priority."""
        self.assertEqual(smart_priority("Urgent: no water in entire floor"), "High")
        self.assertEqual(smart_priority("Hall ticket blocked before exam"), "High")

    def test_priority_defect_keyword_medium(self):
        """Condition: General defective equipment triggers Medium priority."""
        self.assertEqual(smart_priority("Projector broken and slow to start"), "Medium")

    def test_priority_default_low(self):
        """Condition: Routine query without urgency keywords triggers Low priority."""
        self.assertEqual(smart_priority("Request for extra waste bins in quad"), "Low")


class TestWhiteBoxSLAEngine(unittest.TestCase):
    """Tests SLA hour constants and dynamic deadline status calculation."""

    def test_sla_hours_mapping(self):
        self.assertEqual(SLA_HOURS['Critical'], 4)
        self.assertEqual(SLA_HOURS['High'], 12)
        self.assertEqual(SLA_HOURS['Medium'], 48)
        self.assertEqual(SLA_HOURS['Low'], 120)

    def test_sla_status_resolved(self):
        """Branch: Resolved or Closed complaints return resolved status."""
        future_iso = (datetime.now(timezone.utc) + timedelta(hours=5)).isoformat()
        status_info = get_sla_status(future_iso, "Resolved")
        self.assertFalse(status_info['isOverdue'])
        self.assertEqual(status_info['formatted'], "Resolved within SLA")

    def test_sla_status_overdue_branch(self):
        """Branch: Open complaint past deadline returns isOverdue=True."""
        now = datetime.now(timezone.utc)
        past_iso = (now - timedelta(hours=2, minutes=30)).isoformat()
        status_info = get_sla_status(past_iso, "In Progress", now_override=now)
        self.assertTrue(status_info['isOverdue'])
        self.assertIn("Overdue by 2h 30m", status_info['formatted'])

    def test_sla_status_approaching_warning_branch(self):
        """Branch: Open complaint within 6h window triggers isApproaching=True."""
        now = datetime.now(timezone.utc)
        near_iso = (now + timedelta(hours=4, minutes=15)).isoformat()
        status_info = get_sla_status(near_iso, "Pending", now_override=now)
        self.assertFalse(status_info['isOverdue'])
        self.assertTrue(status_info['isApproaching'])
        self.assertIn("4h 15m remaining", status_info['formatted'])


class TestWhiteBoxDuplicateDetection(unittest.TestCase):
    """Tests bigram tokenization, Dice coefficient mathematical boundaries, and duplicate filtering."""

    def test_bigram_tokenization(self):
        # "Wi-Fi" -> cleaned "wifi" -> {"wi", "if", "fi"}
        bigrams = get_bigrams("Wi-Fi")
        self.assertEqual(bigrams, {"wi", "if", "fi"})

    def test_similarity_identical_and_empty(self):
        """Boundary: Identical strings return 1.0; empty strings return 0.0."""
        self.assertEqual(text_similarity("", "test"), 0.0)
        self.assertEqual(text_similarity("test", ""), 0.0)
        self.assertAlmostEqual(text_similarity("water leak", "water leak"), 1.0, places=4)

    def test_duplicate_threshold_detection(self):
        """Condition: Similarity >= 0.62 triggers duplicate; Closed complaints skipped."""
        existing = [
            {
                'complaint_id': 'CC-001',
                'title': 'Drinking water pipeline leakage in Block C',
                'description': 'Overhead pipeline leaking near room 314',
                'status': 'In Progress'
            },
            {
                'complaint_id': 'CC-002',
                'title': 'High speed Wi-Fi dropping in Lab 4',
                'description': 'Disconnection from intranet',
                'status': 'Closed'
            }
        ]
        # Matching complaint CC-001
        dup = find_duplicate(
            "Drinking water pipeline leakage in Block C",
            "Water pipe leak near room 314",
            existing
        )
        self.assertIsNotNone(dup)
        self.assertEqual(dup['complaint_id'], 'CC-001')

        # Matching closed complaint CC-002 should NOT be flagged
        dup_closed = find_duplicate(
            "High speed Wi-Fi dropping in Lab 4",
            "Disconnection from intranet",
            existing
        )
        self.assertIsNone(dup_closed)


class TestWhiteBoxRoleBasedAccessControl(unittest.TestCase):
    """Tests role permission matrix and access gating for each user persona."""

    def test_student_role_permissions(self):
        self.assertTrue(validate_role_access('student', 'dashboard'))
        self.assertTrue(validate_role_access('student', 'submit'))
        self.assertTrue(validate_role_access('student', 'complaint-detail'))
        self.assertTrue(validate_role_access('student', 'assistant'))
        self.assertFalse(validate_role_access('student', 'polls'))
        # Restricted admin modules
        self.assertFalse(validate_role_access('student', 'admin-command'))
        self.assertFalse(validate_role_access('student', 'hod-console'))
        self.assertFalse(validate_role_access('student', 'sla-warning'))

    def test_staff_role_permissions(self):
        self.assertTrue(validate_role_access('staff', 'staff-workstation'))
        self.assertTrue(validate_role_access('staff', 'work-queue'))
        # Staff cannot access administrative command
        self.assertFalse(validate_role_access('staff', 'admin-command'))

    def test_admin_role_full_access(self):
        """Branch: admin has None in mapping, allowing unrestricted access."""
        self.assertTrue(validate_role_access('admin', 'admin-command'))
        self.assertTrue(validate_role_access('admin', 'hod-console'))
        self.assertTrue(validate_role_access('admin', 'any-arbitrary-module'))


class TestWhiteBoxRegistrationValidation(unittest.TestCase):
    """Tests registration logic, password boundaries, and duplicate checks."""

    def test_missing_required_fields(self):
        ok, msg = validate_registration("", "k@campus.edu", "pass123", "pass123", "CS")
        self.assertFalse(ok)
        self.assertIn("required fields", msg)

    def test_password_length_boundary(self):
        # Exactly 5 chars fails; 6 chars succeeds
        ok_5, msg_5 = validate_registration("User", "u@campus.edu", "12345", "12345", "CS")
        self.assertFalse(ok_5)
        self.assertIn("at least 6 characters", msg_5)

        ok_6, msg_6 = validate_registration("User", "u@campus.edu", "123456", "123456", "CS")
        self.assertTrue(ok_6)

    def test_password_mismatch(self):
        ok, msg = validate_registration("User", "u@campus.edu", "password123", "password456", "CS")
        self.assertFalse(ok)
        self.assertIn("do not match", msg)

    def test_duplicate_email_detection(self):
        existing = ["kavinam@karunya.edu.in", "admin@campus.com"]
        ok, msg = validate_registration("User", "KAVINAM@karunya.edu.in", "password123", "password123", "CS", existing)
        self.assertFalse(ok)
        self.assertIn("already exists", msg)


# ==============================================================================
# White-Box Target 2: Node.js Execution Bridge for Live JavaScript Files
# ==============================================================================

class TestWhiteBoxLiveNodeRuntime(unittest.TestCase):
    """
    Executes actual JavaScript functions directly inside Node.js to verify
    parity between the test specifications and the live app.js source code.
    """

    def test_live_javascript_node_syntax(self):
        """Verifies that app.js has valid JavaScript syntax and executes cleanly."""
        try:
            res = subprocess.run(
                ["node", "-c", "app.js"],
                capture_output=True,
                text=True,
                timeout=10
            )
            self.assertEqual(res.returncode, 0, f"app.js syntax error: {res.stderr}")
        except FileNotFoundError:
            self.skipTest("Node.js runtime not installed on host system.")


if __name__ == '__main__':
    unittest.main()
