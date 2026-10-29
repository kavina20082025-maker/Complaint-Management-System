# CampusCare — White-Box and Black-Box Testing Guide

This documentation provides complete, beginner-friendly instructions for executing and understanding the **White-Box** and **Black-Box** automated testing suites for **CampusCare – Smart Student Grievance System** in **VS Code on Windows**.

---

## 1. Project & Testing Overview

- **Application Name**: CampusCare – Smart Student Grievance System
- **Frontend**: Single Page Application (SPA) driven by TypeScript/JavaScript and HTML5
- **Backend / Server**: Node.js & Express (`server.ts`) hosting static assets, Vite middleware, and the AI Policy Guide API endpoint (`POST /api/assistant`)
- **Testing Language**: Python 3.10+
- **Test Frameworks Supported**: `pytest` (with `pytest-cov`, `requests`, `playwright`) and standard library `unittest` (zero-dependency fallback)
- **Editor**: Visual Studio Code (Windows / macOS / Linux)

---

## 2. White-Box Testing vs. Black-Box Testing

| Aspect | White-Box Testing (Glass / Structural) | Black-Box Testing (Functional / Behavioral) |
| :--- | :--- | :--- |
| **Definition** | Tests the internal logic, code paths, branches, algorithms, and conditions of the software. | Tests external functionality and system behavior against user specifications without viewing internal code. |
| **Tester's Perspective** | Full access to source code, algorithms, data structures, and private routing maps. | Evaluates from the perspective of an end-user, browser, or external API consumer. |
| **Focus Areas** | Function coverage, branch coverage, loop boundaries, conditional thresholds, XSS sanitization, state machine transitions. | Valid/invalid inputs, user authentication, form validation messages, API HTTP status codes, error alerts. |
| **In CampusCare** | Tested in `tests/test_white_box.py`: `smartCategory`, `smartDepartment`, `smartPriority`, `SLA_HOURS`, `textSimilarity` (Dice coefficient), `findDuplicate` (0.62 threshold), `sanitizeAvatar`, and `ROLE_ALLOWED_MAP`. | Tested in `tests/test_black_box.py`: `POST /api/assistant` HTTP status contracts, Student/Staff login flows, registration constraints, grievance submission, and role authorization barriers. |
| **Techniques Used** | Statement coverage, Branch testing, Condition coverage, Boundary-Value Analysis (BVA). | Equivalence Partitioning (EP), Boundary-Value Analysis (BVA), User Story acceptance testing, API contract testing. |

---

## 3. Directory Structure

```text
campuscare/
├── app.js                    # Core client application logic & state engine
├── server.ts                 # Express server & API endpoints (port 3000)
├── index.html                # Single-page interface & DOM structure
├── package.json              # Node.js dependencies & scripts
├── requirements-test.txt     # Python testing dependencies (pytest, requests, etc.)
└── tests/
    ├── conftest.py           # Shared pytest fixtures, URLs, and seed data
    ├── test_white_box.py     # Structural & internal logic test suite (32 tests)
    ├── test_black_box.py     # Functional & API behavioral test suite (20 tests)
    └── README_TESTING.md     # Testing instructions, execution guide & mapping
```

---

## 4. Test Case Mapping Table

### A. White-Box Test Cases (`tests/test_white_box.py`)

| Test ID | Test Function | Target Component / Function | Testing Type | Purpose & Condition Tested | Expected Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **WB-01** | `test_sanitize_none_and_empty` | `sanitizeAvatar` | Boundary Value | Pass `None`, `""`, non-string integers, and empty lists. | Returns `None` without crashing. |
| **WB-02** | `test_sanitize_rejects_attribute_injection` | `sanitizeAvatar` | Branch / Security | Malicious string containing `'alt="'`, `'style="'`, `'<svg'`, or quotes. | Returns `None`, neutralizing HTML attribute injection. |
| **WB-03** | `test_sanitize_accepts_clean_base64_data_uri` | `sanitizeAvatar` | Positive Path | Clean Base64 SVG data URI (`data:image/svg+xml;base64,...`). | Returns the unchanged, valid Base64 URI. |
| **WB-04** | `test_category_hostel_branch` | `smartCategory` | Keyword Branch | Text containing `water`, `leakage`, `tap`, `hostel`, `room`. | Returns `'Hostel'`. |
| **WB-05** | `test_category_transport_branch` | `smartCategory` | Keyword Branch | Text containing `bus`, `transport`, `route`, `shuttle`. | Returns `'Transport'`. |
| **WB-06** | `test_category_it_support_branch` | `smartCategory` | Keyword Branch | Text containing `wi-fi`, `internet`, `network`, `laptop`. | Returns `'IT Support'`. |
| **WB-07** | `test_category_fees_branch` | `smartCategory` | Keyword Branch | Text containing `scholarship`, `tuition`, `fee`, `receipt`. | Returns `'Fees'`. |
| **WB-08** | `test_category_food_branch` | `smartCategory` | Keyword Branch | Text containing `canteen`, `lunch`, `food`, `hygiene`. | Returns `'Food'`. |
| **WB-09** | `test_category_library_branch` | `smartCategory` | Keyword Branch | Text containing `reading room`, `book`, `catalog`, `fine`. | Returns `'Library'`. |
| **WB-10** | `test_category_fallback_branch` | `smartCategory` | Fallback Branch | Text containing zero university domain keywords. | Returns `'Other'`. |
| **WB-11** | `test_department_keyword_hit` | `smartDepartment` | Scoring Branch | Text with strong department keywords (`geyser tap` -> Hostel, `wifi internet` -> IT). | Returns matching department string. |
| **WB-12** | `test_department_fallback_mapping` | `smartDepartment` | Fallback Map | General text lacking department keywords; relies on Category fallback map. | Maps Category to assigned Department (`Fees` -> `Accounts`, etc.). |
| **WB-13** | `test_priority_explicit_critical_override` | `smartPriority` | Condition Override | Pass `is_critical=True` with low-urgency text. | Returns `'Critical'`. |
| **WB-14** | `test_priority_emergency_keyword_critical` | `smartPriority` | Hazard Branch | Text containing `'sparking'`, `'fire'`, `'ragging'`. | Returns `'Critical'`. |
| **WB-15** | `test_priority_urgent_keyword_high` | `smartPriority` | Urgent Branch | Text containing `'no water'`, `'urgent'`, `'hall ticket blocked'`. | Returns `'High'`. |
| **WB-16** | `test_priority_defect_keyword_medium` | `smartPriority` | Defect Branch | Text containing `'broken'`, `'problem'`, `'slow'`. | Returns `'Medium'`. |
| **WB-17** | `test_priority_default_low` | `smartPriority` | Fallback Branch | Text with routine suggestions lacking urgency markers. | Returns `'Low'`. |
| **WB-18** | `test_sla_hours_mapping` | `SLA_HOURS` | Constant Verification | Verifies hours for Critical (4), High (12), Medium (48), Low (120). | SLA hours match university policy constants. |
| **WB-19** | `test_sla_status_resolved` | `getSlaStatus` | Branch Testing | Pass status `'Resolved'` or `'Closed'`. | `isOverdue: False`, formatted string indicates resolved within SLA. |
| **WB-20** | `test_sla_status_overdue_branch` | `getSlaStatus` | Condition Testing | Deadline in the past (diff < 0). | `isOverdue: True`, formatted string shows overdue elapsed hours. |
| **WB-21** | `test_sla_status_approaching_warning_branch` | `getSlaStatus` | Condition Testing | Deadline within 6 hours (0 <= diff <= 6h). | `isApproaching: True`, returns remaining countdown. |
| **WB-22** | `test_bigram_tokenization` | `getBigrams` | Unit Logic | Strips punctuation, lowercases, generates 2-char n-grams. | Returns correct set of character pairs. |
| **WB-23** | `test_similarity_identical_and_empty` | `textSimilarity` | Boundary Value | Compares empty strings (0.0) and identical strings (1.0). | Returns exact expected float boundaries. |
| **WB-24** | `test_duplicate_threshold_detection` | `findDuplicate` | Algorithmic Threshold | Compares new complaint against existing active tickets (>= 0.62 threshold). | Returns existing ticket if active; skips if `'Closed'`. |
| **WB-25** | `test_student_role_permissions` | `ROLE_ALLOWED_MAP` | RBAC Matrix | Tests student permissions on dashboard, submit, admin-command, hod-console. | True for allowed student views, False for restricted admin views. |
| **WB-26** | `test_staff_role_permissions` | `ROLE_ALLOWED_MAP` | RBAC Matrix | Tests staff permissions on work-queue and admin-command. | True for staff workstation, False for admin console. |
| **WB-27** | `test_admin_role_full_access` | `ROLE_ALLOWED_MAP` | RBAC Matrix | Admin role has `None` in dictionary. | Returns True for all requested views. |
| **WB-28** | `test_missing_required_fields` | `validateRegistration` | Input Validation | Missing name, email, password, or department. | Returns `(False, "Please fill out all required fields...")`. |
| **WB-29** | `test_password_length_boundary` | `validateRegistration` | Boundary Value | Exactly 5 characters vs. 6 characters. | 5 chars fails; 6 chars passes. |
| **WB-30** | `test_password_mismatch` | `validateRegistration` | Input Validation | Passwords do not match. | Returns `(False, "Passwords do not match...")`. |
| **WB-31** | `test_duplicate_email_detection` | `validateRegistration` | Collision Check | Register with email already in user list (case-insensitive). | Returns `(False, "An account already exists...")`. |
| **WB-32** | `test_live_javascript_node_syntax` | Node runtime | Syntax / Static Analysis | Runs `node -c app.js` to ensure zero compilation or syntax errors. | Process exit code is 0. |

---

### B. Black-Box Test Cases (`tests/test_black_box.py`)

| Test ID | Test Function | Target Endpoint / Workflow | Testing Type | Input / Scenario | Expected Observable Output |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **BB-01** | `test_server_serves_spa_html` | `GET /` | API / Web Server | Standard HTTP GET to root URL. | HTTP 200, Content-Type `text/html`, page body contains `CampusCare`. |
| **BB-02** | `test_assistant_api_missing_question_returns_400` | `POST /api/assistant` | API Contract | Send empty JSON `{}` without question. | HTTP 400 Bad Request, body contains `{"error":"Question is required"}`. |
| **BB-03** | `test_assistant_api_empty_string_question_returns_400` | `POST /api/assistant` | API Boundary | Send `{"question": ""}`. | HTTP 400 Bad Request, body contains `{"error":"Question is required"}`. |
| **BB-04** | `test_assistant_api_non_string_question_returns_400` | `POST /api/assistant` | API Type Safety | Send non-string integer or array as question. | HTTP 400 Bad Request, error message returned. |
| **BB-05** | `test_assistant_api_valid_payload_structure` | `POST /api/assistant` | API Contract | Send valid question string, student role, department. | HTTP 200 with `reply` string OR graceful fallback object if AI service is busy. |
| **BB-06** | `test_student_login_success` | Login Form | Functional / Auth | Enter `kavinam@karunya.edu.in` and `student123`. | Successful login, user role identified as `student`. |
| **BB-07** | `test_staff_login_success` | Login Form | Functional / Auth | Enter `staff@campus.com` and `staff123`. | Successful login, user role identified as `staff`. |
| **BB-08** | `test_login_incorrect_password` | Login Form | Functional / Auth | Enter valid email with wrong password. | Login rejected, returns error `"Incorrect password"`. |
| **BB-09** | `test_login_unregistered_email` | Login Form | Functional / Auth | Enter non-existent email address. | Login rejected, returns error `"No account found"`. |
| **BB-10** | `test_login_missing_fields` | Login Form | Form Validation | Submit with empty email or empty password. | Login rejected, prompts user to fill both fields. |
| **BB-11** | `test_login_deactivated_account` | Login Form | Security / Account State | Attempt login with deactivated user account. | Login rejected, returns `"This account has been deactivated"`. |
| **BB-12** | `test_registration_success` | Registration Form | Functional / User Intake | Submit complete registration with valid 6+ char password. | Account created successfully. |
| **BB-13** | `test_registration_password_too_short` | Registration Form | Boundary Value | Submit password with 5 characters (`"12345"`). | Registration rejected, requires at least 6 characters. |
| **BB-14** | `test_registration_password_mismatch` | Registration Form | Form Validation | Password and confirmation password differ. | Registration rejected with `"Passwords do not match"`. |
| **BB-15** | `test_registration_duplicate_email` | Registration Form | Business Rule | Submit registration using existing student email. | Registration rejected with `"already exists"`. |
| **BB-16** | `test_submit_valid_grievance` | Grievance Intake | Functional / Ticket Lifecycle | Enter title, description, location. | Ticket generated with ID format `CC-TEST-xxxx`, status `Pending`. |
| **BB-17** | `test_submit_empty_fields_rejected` | Grievance Intake | Form Validation | Submit form with empty title or empty description. | Submission blocked, validation error returned. |
| **BB-18** | `test_anonymous_grievance_flag` | Grievance Intake | Privacy Feature | Submit with `is_anon=True` checkbox. | Ticket generated with `anonymous=True`. |
| **BB-19** | `test_browser_page_title_and_branding` | Browser E2E (Playwright) | UI / E2E | Load application in headless Chromium browser. | Browser window title contains `CampusCare`. |
| **BB-20** | `test_browser_quick_fill_student_login` | Browser E2E (Playwright) | UI / E2E | Click 1-Click Student demo button. | Email field automatically populated with `kavinam@karunya.edu.in`. |

---

## 5. Step-by-Step Execution Instructions (VS Code on Windows)

### Step 1: Open the Project in VS Code
1. Launch **Visual Studio Code**.
2. Select **File > Open Folder...** and choose your cloned `campuscare` project directory.
3. Open a terminal by pressing **Ctrl + `** (or selecting **Terminal > New Terminal**).

### Step 2: Set Up Python Virtual Environment
In the VS Code terminal (PowerShell or Command Prompt):

```powershell
# Create a virtual environment named .venv
python -m venv .venv

# Activate the virtual environment
# In PowerShell:
.\.venv\Scripts\Activate.ps1

# In Command Prompt:
.\.venv\Scripts\activate.bat
```

> *Tip for PowerShell execution policy error:* If you see a script execution policy error, run:
> `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass` and then run the activate command again.

### Step 3: Install Testing Dependencies
```powershell
pip install -r requirements-test.txt
```

*(Optional for browser E2E tests)* Install Playwright's Chromium browser binary:
```powershell
playwright install chromium
```

### Step 4: Ensure CampusCare Application is Running
In a separate terminal tab in VS Code:
```powershell
npm run dev
```
Confirm the terminal displays: `Server running on http://0.0.0.0:3000`.

---

### Step 5: Running Tests

#### Option A: Running All Tests with `pytest` (Recommended)
```powershell
pytest tests/ -v
```

#### Option B: Running White-Box Tests Only
```powershell
pytest tests/test_white_box.py -v
```

#### Option C: Running Black-Box Tests Only
```powershell
pytest tests/test_black_box.py -v
```

#### Option D: Zero-Dependency Run with Python's Built-in `unittest`
If you are on a system without `pytest` or internet access to install packages:
```powershell
python -m unittest discover tests -v
```

---

### Step 6: Generating a Code Coverage Report
To generate an automated test coverage report using `pytest-cov`:

```powershell
# Run coverage on the testing suite
pytest tests/ --cov=tests --cov-report=term-missing
```

To generate a detailed interactive HTML coverage report:
```powershell
pytest tests/ --cov=tests --cov-report=html
```
Open `htmlcov/index.html` in your browser (right-click in VS Code > **Open with Live Server** or double click the file in Windows File Explorer) to inspect statement-by-statement coverage.

---

### Step 7: Using VS Code Test Explorer GUI
You can run and debug tests visually directly inside VS Code:

1. Click on the **Testing** beaker icon in the left Activity Bar (or press **Ctrl + Shift + O**).
2. Click **Configure Python Tests**.
3. Select **pytest** as the test framework.
4. Select the **tests** directory as the root folder.
5. VS Code will discover all 52 tests. You can click the green **Play** button next to any test or file to run it, or click the **Bug** icon to debug line-by-line with breakpoints.

---

## 6. Interpreting Test Results

### Example of PASS Output:
```text
============================= test session starts =============================
platform win32 -- Python 3.10.x, pytest-8.x.x
collected 52 items

tests/test_white_box.py ................................                [ 61%]
tests/test_black_box.py ....................                            [100%]

======================== 50 passed, 2 skipped in 20.15s ========================
```
- **Dots (`.`) / Green checkmarks**: Test passed successfully; the code met all assertions.
- **Skipped (`s`)**: Browser-specific tests gracefully skipped when optional browser binaries (Playwright) are not installed.

### Example of FAIL Output:
```text
================================== FAILURES ===================================
_________________ TestWhiteBoxSmartPriority.test_priority_urgent ______________
    def test_priority_urgent(self):
>       self.assertEqual(smart_priority("Routine suggestion"), "High")
E       AssertionError: 'Low' != 'High'
E       - Low
E       + High
=========================== 1 failed, 51 passed ===============================
```
- **AssertionError**: Indicates an unexpected return value. Look at the `-` (actual) vs `+` (expected) diff to identify whether the logic rule or test expectation changed.

---

## 7. Troubleshooting Common Errors

1. **`ConnectionRefusedError: [Errno 111] Connection refused` or `Connection refused on http://localhost:3000`**
   - *Cause*: The CampusCare Node.js development server is not running.
   - *Fix*: Open a terminal in the project root and run `npm run dev`. Wait until `Server running on http://0.0.0.0:3000` appears before running black-box tests.

2. **`ModuleNotFoundError: No module named 'pytest'`**
   - *Cause*: The virtual environment is either not activated or dependencies are not installed.
   - *Fix*: Run `.\.venv\Scripts\Activate.ps1` followed by `pip install -r requirements-test.txt`. Alternatively, use `python -m unittest discover tests`, which requires zero pip packages.

3. **`TimeoutError / 504 Gateway Timeout` on AI Assistant Test**
   - *Cause*: The Gemini API key may be experiencing network latency or regional rate limiting.
   - *Fix*: `tests/test_black_box.py` includes a 20-second timeout and structured fallback verification to ensure temporary upstream network latency does not fail the test suite.

4. **Playwright Browser Missing Error**
   - *Cause*: Playwright is installed via pip, but browser binaries haven't been fetched.
   - *Fix*: Run `playwright install chromium` in your activated virtual environment terminal.
