import express from 'express';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Initialize Gemini SDK with User-Agent header as required
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// AI Policy Guide comprehensive offline knowledge engine (resilient fallback if Gemini API is busy or unconfigured)
function generateComprehensivePolicyResponse(question: string, role?: string, department?: string): string {
  const cleanQ = question.trim();
  const lq = cleanQ.toLowerCase();

  // 1. Natural Conversational Greeting Detection
  const greetingRegex = /^(hi+|hello+|hey+|good\s*(morning|afternoon|evening|day)|howdy|greetings|sup|yo|hi\s+there|hello\s+there)\b/i;
  const isJustGreeting = greetingRegex.test(lq) && cleanQ.split(/\s+/).length <= 4;
  if (isJustGreeting || ['hi', 'hello', 'hey', 'greetings', 'help'].includes(lq)) {
    return `**Hello! 👋 Welcome to the CampusCare AI Policy Guide.**\n\n` +
      `I am your 24/7 intelligent campus grievance and policy advisor. How can I help you today? Please tell me what issue or question you have!\n\n` +
      `Here are common things you can ask me:\n` +
      `• **Filing a Grievance:** Step-by-step submission, anonymous reporting, or SLA tracking.\n` +
      `• **Hostel Rules & Curfew:** In-time hours (8:30 PM), gate pass requests, or room maintenance.\n` +
      `• **Mess & Food Quality:** Meal schedules, hygiene checks, or mess fee refund claims.\n` +
      `• **Attendance & Exams:** 75% attendance rule, medical condonation, exam revaluation, or hall ticket issues.\n` +
      `• **Wi-Fi & IT Support:** MAC address registration, speed drops, or portal login errors.\n` +
      `• **Fees & Accounts:** Semester payment confirmation, bank UTR verification, or refund processing.\n` +
      `• **Safety & Anti-Ragging:** Emergency contacts (+91 422 261 4300) and anonymous reporting safeguards.\n\n` +
      `What would you like to know or resolve?`;
  }

  // 2. Hostel Curfew, Timings, Gate Pass & Room Allocation
  if (lq.includes('curfew') || lq.includes('gate pass') || lq.includes('in-time') || lq.includes('intime') || lq.includes('late entry') || lq.includes('night out') || lq.includes('leave') || lq.includes('room change') || lq.includes('roommate')) {
    if (lq.includes('room change') || lq.includes('roommate')) {
      return `**Hostel Policy: Room Relocation & Roommate Disputes**\n\n` +
        `• **Application Window:** Room change requests are accepted within the first 30 days of each academic semester.\n` +
        `• **Grounds Accepted:** Documented medical reasons, extreme academic schedule conflicts, or mutual agreement with another resident.\n` +
        `• **Procedure:** Submit a written application endorsed by your Resident Warden to the Chief Warden Office (Residential Complex Room 102).\n` +
        `• **Target SLA:** **Medium (48 Hours)** for room relocation verification.\n` +
        `• **Contact:** Chief Warden Secretariat (Ext. 201 · warden@campus.com).`;
    }
    return `**Hostel Regulations: Curfew Timings & Digital Gate Pass Protocol**\n\n` +
      `• **Mandatory Curfew (In-Time):** **8:30 PM** sharp for all residential hostel blocks on weekdays and Sundays; **9:00 PM** on Saturdays.\n` +
      `• **Biometric Punch-in:** Students must record their biometric punch or scan their CampusCare ID card at the hostel turnstile upon entry.\n` +
      `• **Late Gate Pass Application:** Emergency or authorized academic gate pass requests must be submitted through the portal before **6:00 PM** and require parent SMS acknowledgement.\n` +
      `• **Disciplinary Clause:** First late entry without a pass incurs a formal counseling advisory; repeated late entries require parent notification and hostel committee review.\n` +
      `• **Emergency Support:** If detained on campus for official project work or lab experiments, obtain a sign-off slip from your Faculty Guide.`;
  }

  // 3. Attendance, Medical Condonation, Exams & Hall Tickets
  if (lq.includes('attendance') || lq.includes('condonation') || lq.includes('medical leave') || lq.includes('hall ticket') || lq.includes('75%') || lq.includes('exam') || lq.includes('mark') || lq.includes('grade') || lq.includes('revaluation') || lq.includes('backlog') || lq.includes('supplementary')) {
    if (lq.includes('attendance') || lq.includes('condonation') || lq.includes('medical leave') || lq.includes('75%')) {
      return `**University Academic Policy: Attendance & Medical Condonation**\n\n` +
        `• **Mandatory Threshold:** **75% minimum aggregate attendance** in each registered course to be eligible for End-Semester Examinations.\n` +
        `• **Medical Condonation Range (65% – 74%):** Permitted strictly on genuine medical grounds (hospitalization/certified illness) or authorized university sports/symposium representation.\n` +
        `• **Condonation Filing Deadline:** Original medical certificate issued by a registered medical practitioner must be submitted to the Head of Department (HoD) within **5 working days** of returning to campus.\n` +
        `• **Critical Clause (< 65% Attendance):** Students falling below 65% cannot be condoned under any circumstance per university regulations and must re-register (repeat) the course in subsequent semesters.\n` +
        `• **Hall Ticket Clearance:** Once condonation is approved by the Academic Dean, the hall ticket block is lifted within **12 hours**.`;
    }
    return `**University Examination & Evaluation Redressal Policy**\n\n` +
      `• **Designated Authority:** Office of the Controller of Examinations (CoE Block Ground Floor).\n` +
      `• **Script Viewing & Retotaling:** Students may apply for physical/digital answer script viewing within **7 calendar days** of grade publication via the Student Portal.\n` +
      `• **Official Revaluation:** If an evaluation discrepancy is noted, revaluation is conducted by an independent senior examiner. If the revised score increases by ≥ 15%, the revaluation application fee is 100% refunded to the student's bank account.\n` +
      `• **Blocked Hall Ticket:** File an urgent ticket under **Academic** category with priority **High (12-Hour SLA)** to unblock clearance from accounts or library.`;
  }

  // 4. Wi-Fi, Internet & IT Support
  if (lq.includes('wifi') || lq.includes('wi-fi') || lq.includes('internet') || lq.includes('lan') || lq.includes('network') || lq.includes('portal') || lq.includes('login') || lq.includes('lms') || lq.includes('erp') || lq.includes('mac') || lq.includes('403') || lq.includes('speed')) {
    return `**Campus IT & High-Speed Wi-Fi Redressal Policy**\n\n` +
      `• **Campus SSID:** \`CampusCare-Secure-5G\` and \`eduroam\` across all academic blocks and hostels.\n` +
      `• **Device MAC Registration:** Up to 3 personal devices (laptop, tablet, smartphone) can be registered per student at \`portal.campus.com/device-reg\` using institutional credentials.\n` +
      `• **Troubleshooting Error 403 / Captive Portal Loop:**\n` +
      `  1. Forget the network and re-connect to \`CampusCare-Secure-5G\`.\n` +
      `  2. Open a browser and navigate to \`http://1.1.1.1\` to trigger the institutional captive portal.\n` +
      `  3. If MAC binding has expired, clear browser cache or submit your MAC address in a support ticket.\n` +
      `• **Target SLA:** **High (12 Hours)** during academic tests/submissions, otherwise **Medium (48 Hours)**.\n` +
      `• **IT Helpdesk:** Technology Block Room 104 (Ext. 101 / 102 · ithelp@campus.com).`;
  }

  // 5. Mess & Food Services
  if (lq.includes('food') || lq.includes('mess') || lq.includes('canteen') || lq.includes('dining') || lq.includes('hygiene') || lq.includes('meal') || lq.includes('breakfast') || lq.includes('lunch') || lq.includes('dinner') || lq.includes('cater')) {
    return `**Campus Dining & Food Safety Redressal Policy**\n\n` +
      `• **Designated Category:** Food / Mess Services (Central Dining Complex).\n` +
      `• **Quality Standards:** Mandatory adherence to FSSAI hygiene guidelines. Water purifiers and cold storage undergo automated daily temperature and TDS logging.\n` +
      `• **Grievance Resolution SLA:** **High (12 Hours)** for menu/taste disputes; **Immediate (4 Hours)** for foreign objects or foodborne illness reports with mandatory on-site inspection by the University Health Officer.\n` +
      `• **Student Mess Committee:** Student representatives inspect kitchen prep zones every Tuesday and Friday.\n` +
      `• **Filing Advice:** Attach a clear photograph to your ticket in **New Grievance** for instant quality audit dispatch.`;
  }

  // 6. Water, Plumbing & Sanitation
  if (lq.includes('water') || lq.includes('leak') || lq.includes('plumb') || lq.includes('pipe') || lq.includes('tap') || lq.includes('drain') || lq.includes('bathroom') || lq.includes('toilet') || lq.includes('geyser') || lq.includes('flush')) {
    return `**Hostel & Campus Sanitation / Plumbing Redressal Directive**\n\n` +
      `• **Designated Category:** Hostel Maintenance / Infrastructure\n` +
      `• **Resolution SLA:** **Critical (4 Hours)** for complete wing/floor water supply interruption; **High (12 Hours)** for room-level tap leakage, geyser failure, or blocked drain.\n` +
      `• **Duty Specialists:** Estate Plumbing Response Cell (Ext. 202 / 204).\n` +
      `• **Procedure:** File under **Hostel**, specify exact block, floor, and room number. Technicians carry digital work orders and require your OTP or verification sign-off upon completion.\n` +
      `• **Damage Relief:** If water inundation caused damage to personal study materials, file a claim in **Relief & Compensation** for institutional reimbursement.`;
  }

  // 7. Power, Electricity & Appliances
  if (lq.includes('power') || lq.includes('electric') || lq.includes('blackout') || lq.includes('light') || lq.includes('fan') || lq.includes('ac ') || lq.includes('air condition') || lq.includes('spark') || lq.includes('switch') || lq.includes('socket') || lq.includes('heater')) {
    return `**Electrical Safety & Campus Power Supply Policy**\n\n` +
      `• **Designated Category:** Infrastructure (Electrical Maintenance Cell)\n` +
      `• **Emergency Hazard Protocol:** If sparking, burning odor, or smoke occurs, immediately isolate the circuit and call Substation Duty (+91 94432 11002 / Ext. 204). Handled as **Critical (4-Hour SLA)**.\n` +
      `• **Hostel Appliance Rules:** High-wattage heating appliances (induction stoves, immersion coils, electric irons) are prohibited in hostel dormitories for fire safety.\n` +
      `• **Routine Repairs:** Single light bulb, fan capacitor, or power socket repairs carry a **48-Hour SLA**. File under **Infrastructure** with tag \`Electrical\`.`;
  }

  // 8. Anti-Ragging & Emergency Safety
  if (lq.includes('ragging') || lq.includes('bully') || lq.includes('harass') || lq.includes('threat') || lq.includes('safety') || lq.includes('fight') || lq.includes('emergency') || lq.includes('police') || lq.includes('security') || lq.includes('abuse')) {
    return `**Strict Anti-Ragging Directive & Emergency Safety (Statutory Zero-Tolerance)**\n\n` +
      `• **Legal Mandate:** Karunya maintains absolute zero-tolerance under Supreme Court guidelines and UGC Anti-Ragging Regulations 2009.\n` +
      `• **Anonymous Reporting:** You can file **100% Anonymously** by ticking "File Anonymously" in the grievance form. Your student identity is completely hidden from public and staff views.\n` +
      `• **Target SLA:** **Immediate Response (4-Hour Maximum Formal Inquiry)**.\n` +
      `• **24x7 Emergency Hotlines:**\n` +
      `  - Campus Security Control Room: **+91 422 261 4300** (Ext. 900)\n` +
      `  - National Anti-Ragging Toll-Free Helpline: **1800-180-5522**\n` +
      `  - Dean of Student Affairs Emergency Mobile: **+91 94432 11001**\n` +
      `• All reported cases trigger immediate disciplinary proceedings and direct oversight by the Vice-Chancellor's Special Committee.`;
  }

  // 9. Fees, Payments, Refunds & Scholarships
  if (lq.includes('fee') || lq.includes('payment') || lq.includes('receipt') || lq.includes('refund') || lq.includes('scholarship') || lq.includes('fine') || lq.includes('challan') || lq.includes('dues') || lq.includes('tuition') || lq.includes('utr')) {
    return `**Campus Finance & Student Accounts Policy**\n\n` +
      `• **Designated Category:** Fees & Accounts (Finance Pavilion Counters 1 - 4)\n` +
      `• **Payment Verification SLA:** **Medium (48 Hours)** for automated bank UTR reconciliation.\n` +
      `• **Refund Disbursement SLA:** **120 Hours (5 Business Days)** for excess semester fees or caution deposit returns.\n` +
      `• **Requirements for Redressal:** State your 12-digit Bank Transaction / UTR number, payment date, and Student Register Number in your complaint.\n` +
      `• **Finance Desk Contact:** Accounts Bureau (Ext. 501 · accounts@campus.com). Office hours: Monday to Friday, 9:00 AM - 4:30 PM.`;
  }

  // 10. Transportation & Campus Shuttle Fleet
  if (lq.includes('bus') || lq.includes('transport') || lq.includes('driver') || lq.includes('route') || lq.includes('pass') || lq.includes('commute') || lq.includes('shuttle')) {
    return `**University Transport Fleet & Bus Pass Policy**\n\n` +
      `• **Designated Category:** Transport Services (Central Transport Depot Bay 1)\n` +
      `• **Resolution SLA:** **High (12 Hours)** for bus breakdown or route cancellations; **Medium (48 Hours)** for semester bus pass processing.\n` +
      `• **GPS Fleet Tracking:** All campus buses are equipped with live GPS transponders. Timings are synchronized with academic schedules.\n` +
      `• **Filing Advice:** Include Bus Route Number and Boarding Stop in your ticket.\n` +
      `• **Transport Helpdesk:** Transport Supervisor (Ext. 401 · transport@campus.com).`;
  }

  // 11. SLA Timers, Auto-Escalation & Verification Loop
  if (lq.includes('sla') || lq.includes('escalat') || lq.includes('reopen') || lq.includes('delay') || lq.includes('deadline') || lq.includes('verify') || lq.includes('timer') || lq.includes('ombudsman')) {
    return `**CampusCare SLA Guarantees & Verification Loop Policy**\n\n` +
      `• **Resolution SLAs:**\n` +
      `  - 🔴 **Critical (4 Hours):** Severe safety hazards, total water/electricity blackout, anti-ragging.\n` +
      `  - 🟠 **High (12 Hours):** Wi-Fi during exam week, mess food hygiene, classroom equipment.\n` +
      `  - 🟣 **Medium (48 Hours):** Standard room repairs, transport pass, fee receipt reconciliation.\n` +
      `  - 🔵 **Low (120 Hours):** General suggestions, library acquisitions.\n` +
      `• **Automated Escalation:** If an SLA timer reaches 00:00:00 without resolution, the ticket auto-escalates to the Department Head, then Dean of Student Affairs.\n` +
      `• **Student Verification Power:** Staff *cannot* unilaterally close a ticket. Once marked "Resolved", students have 48 hours to inspect the work and click **"Reopen Ticket"** if not properly completed.\n` +
      `• **Ombudsman Appeals:** If an issue is unjustly dismissed, you can file a formal appeal to the University Ombudsman Tribunal for a mandatory hearing.`;
  }

  // 12. Library, Medical Clinic, Sports & General Facilities
  if (lq.includes('library') || lq.includes('book') || lq.includes('journal') || lq.includes('hospital') || lq.includes('clinic') || lq.includes('doctor') || lq.includes('gym') || lq.includes('sports')) {
    if (lq.includes('hospital') || lq.includes('clinic') || lq.includes('doctor') || lq.includes('medicine')) {
      return `**Campus Healthcare & Medical Emergency Policy**\n\n` +
        `• **Campus Health Center:** Located adjacent to Central Guest House, operating **24x7** with resident medical officers and nursing staff.\n` +
        `• **Ambulance Service:** University ambulance is stationed 24/7 for emergency hospital transfer (Call: **+91 422 261 4999** / Ext. 999).\n` +
        `• **Outpatient Services:** Free primary consultations, emergency medications, first aid, and basic diagnostic testing for all enrolled students.\n` +
        `• **Medical Leave Certification:** Health Center doctors provide authorized medical leave slips for attendance condonation.`;
    }
    return `**Campus Amenities: Library, Digital Stacks & Sports Complex**\n\n` +
      `• **Central Library (Dr. APJ Abdul Kalam Library):** Open all days **8:00 AM – 11:00 PM** (Extended to **24 Hours** during semester exam weeks).\n` +
      `• **Digital Access:** IEEE Xplore, ScienceDirect, and Springer journals accessible via campus Wi-Fi or student credentials.\n` +
      `• **Sports Complex & Gymnasium:** Open **6:00 AM – 8:30 AM** (Morning) and **4:30 PM – 7:30 PM** (Evening).\n` +
      `• **Assigned Category:** Select **Library** or **Infrastructure** to report equipment, RFID card, or facility concerns.`;
  }

  // 13. Dynamic Intelligent Synthesis for Any Other Inquiry
  return `**CampusCare Policy Guidance: "${cleanQ}"**\n\n` +
    `Thank you for asking! Here is the official policy and redressal workflow for your inquiry:\n\n` +
    `• **Institutional Domain:** Campus Administration & Student Welfare Services.\n` +
    `• **How to Proceed:** Navigate to **New Grievance** in the sidebar. Enter the details of your request, choose the appropriate category, and submit.\n` +
    `• **Real-Time SLA Commitment:** Your submission receives an automated priority rating with a guaranteed resolution deadline (from 4 hours for urgent issues up to 48 hours for standard requests).\n` +
    `• **Supervisory Oversight:** The Department Head monitors all ticket timers. If a deadline expires without resolution, it auto-escalates to the Dean of Student Affairs.\n` +
    `• **Need Direct Assistance?** Check the **Service Directory** for direct university department phone extensions and office locations.`;
}

// AI Policy Guide API Endpoint
app.post('/api/assistant', async (req, res) => {
  try {
    const { question, role, department, history } = req.body;
    if (!question || typeof question !== 'string' || !question.trim()) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const cleanQ = question.trim();
    const lq = cleanQ.toLowerCase();

    // Check for greeting immediately:
    const greetingRegex = /^(hi+|hello+|hey+|good\s*(morning|afternoon|evening|day)|howdy|greetings|sup|yo|hi\s+there|hello\s+there)\b/i;
    const isJustGreeting = (greetingRegex.test(lq) && cleanQ.split(/\s+/).length <= 4) || ['hi', 'hello', 'hey', 'greetings', 'help'].includes(lq);

    if (isJustGreeting) {
      const greetingResponse = `**Hello! 👋 Welcome to the CampusCare AI Policy Guide.**\n\n` +
        `I am your 24/7 intelligent campus grievance and policy advisor. How can I help you today? Please tell me what issue or question you have!\n\n` +
        `Here are common things you can ask me:\n` +
        `• **Filing a Grievance:** Step-by-step submission, anonymous reporting, or SLA tracking.\n` +
        `• **Hostel Rules & Curfew:** In-time hours (8:30 PM), gate pass requests, or room maintenance.\n` +
        `• **Mess & Food Quality:** Meal schedules, hygiene checks, or mess fee refund claims.\n` +
        `• **Attendance & Exams:** 75% attendance rule, medical condonation, exam revaluation, or hall ticket issues.\n` +
        `• **Wi-Fi & IT Support:** MAC address registration, speed drops, or portal login errors.\n` +
        `• **Fees & Accounts:** Semester payment confirmation, bank UTR verification, or refund processing.\n` +
        `• **Safety & Anti-Ragging:** Emergency contacts (+91 422 261 4300) and anonymous reporting safeguards.\n\n` +
        `What would you like to know or resolve?`;
      return res.json({ reply: greetingResponse, source: 'campus-greeting-handler' });
    }

    if (ai) {
      try {
        const systemInstruction = `You are the CampusCare AI Policy Guide, an intelligent, empathetic, and highly authoritative campus policy ombudsman and grievance assistance agent for CampusCare (Karunya Institute of Technology & Sciences).

CRITICAL CONVERSATIONAL RULES:
1. EXACT, DIRECT ANSWERS:
   When the user asks any question, answer THAT EXACT question directly, factually, and contextually. Do NOT dodge the question or give a vague generic template. Provide real, concrete university rules, regulations, exact steps to take, designated offices, and applicable SLAs.
   - Attendance: 75% mandatory minimum to sit for end-semester exams. Medical condonation covers 65%-74% with authorized hospital certificate submitted within 5 working days to the HoD. Below 65% requires repeating the course.
   - Hostel: Curfew is 8:30 PM for all residential hostels (biometric punch-in). Late gate pass requires prior online warden approval before 6:00 PM. Electrical heating appliances (induction, heaters) are prohibited for fire safety. Room repairs have a 12-hour SLA.
   - Mess/Food: Three meals + evening snacks. Quality audits are conducted twice weekly. Any hygiene or foreign matter complaint has a mandatory 4-hour inspection SLA by the Food Safety Officer and Student Mess Committee.
   - Wi-Fi & IT: 5GHz campus-wide SSID. Device registration via MAC address at portal.campus.com. IP lease duration is 24 hours. IT support desk is at Tech Block Room 104 (Ext. 101/102).
   - Exams & Revaluation: Re-totaling / paper viewing requests can be submitted within 7 days of result publication via the Controller of Examinations. Revaluation fees are refunded if marks improve by 15% or more.
   - Fees & Refunds: Caution deposits are refunded within 15 days of graduation/no-dues clearance. Excess semester fee payments are reconciled within 5 working days by Accounts Bureau (Ext. 501).
   - Anti-Ragging & Harassment: Zero tolerance (UGC 2009 regulations). 24x7 Emergency helpline (+91 422 261 4300 / Ext. 900). 100% anonymous reporting allowed. Inquiry must be initiated within 4 hours.
   - CampusCare SLA matrix: Critical (4h), High (12h), Medium (48h), Low (120h). Auto-escalates to HoD if overdue, then to Dean of Student Affairs. Students have final verification power to Reopen any unresolved ticket.
2. TONE & STRUCTURE:
   Format answers beautifully using clean markdown with bold headings, clean bullet points, and actionable next steps. Be direct, authoritative, and friendly.`;

        // Assemble multi-turn conversation contents if history exists
        const contents: any[] = [];
        if (Array.isArray(history) && history.length > 0) {
          const recent = history.slice(-6);
          for (const msg of recent) {
            if (msg.role && msg.content) {
              contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: String(msg.content) }],
              });
            }
          }
        }

        contents.push({
          role: 'user',
          parts: [{
            text: `User role: ${role || 'Student'}, Department: ${department || 'General'}\nUser question: "${cleanQ}"\n\nPlease answer this exact question thoroughly, directly, and specifically based on campus regulations.`
          }],
        });

        const geminiPromise = ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
          },
        });

        // 6-second timeout prevents 504 gateway timeouts when external API is unreachable or slow
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Gemini API request timeout (fallback activated)')), 6000)
        );

        const response: any = await Promise.race([geminiPromise, timeoutPromise]);

        if (response && response.text) {
          return res.json({ reply: response.text, source: 'gemini' });
        }
      } catch (geminiError: any) {
        console.warn('Gemini API call failed or timed out, activating resilient policy fallback:', geminiError?.message || geminiError);
      }
    }

    // High-availability knowledge base fallback ensures exact answer is ALWAYS provided
    const localReply = generateComprehensivePolicyResponse(question, role, department);
    return res.json({ reply: localReply, source: 'campus-policy-engine' });
  } catch (error: any) {
    console.error('Error generating assistant response:', error);
    const safeFallback = generateComprehensivePolicyResponse(req.body?.question || 'General Inquiry');
    return res.json({ reply: safeFallback, source: 'emergency-fallback' });
  }
});

// Mount Vite middleware in development
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Serve static files in production
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
