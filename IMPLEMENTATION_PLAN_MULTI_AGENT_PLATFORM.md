# 🚀 IMPLEMENTATION PLAN: Multi-Agent Tender Sourcing Platform

**Timeline:** ASAP - Target 1-2 weeks  
**Scope:** Online dashboard + 5 intelligent agents + Google Drive storage  
**Architecture:** Google Cloud-based, Google Workspace integrated  

---

## 📋 PHASE OVERVIEW

```
PHASE 1 (Week 1): Infrastructure & Foundation
├── Set up Google Cloud project
├── Configure Google OAuth with Google Workspace
├── Set up Google Drive folder structure
├── Create data storage system (JSON schemas)
└── Deploy authentication layer

PHASE 2 (Week 1-2): Core Agents & Dashboard
├── Agent 1: SCRAPER (enhanced with document finding)
├── Agent 2: SOURCING FILES (organize documents)
├── Agent 3: SOURCING (search + email history)
├── Agent 4: REPORTING (generate documents)
├── Agent 5: SECRETARY (status tracking)
└── Dashboard (online, read-only for employees)

PHASE 3 (Week 2): Testing & Live Launch
├── End-to-end testing
├── Employee access testing
├── Go live on www.mukatrade.com
└── Monitoring & support
```

---

## 🏗️ RECOMMENDED ARCHITECTURE

### **Hosting: Google Cloud** ✅ (Best for your setup)

**Why Google Cloud?**
- ✅ Integrates perfectly with Google Workspace (OAuth)
- ✅ Easy Google Drive access (data storage)
- ✅ Google Apps Script for agent automation
- ✅ Firebase for real-time database
- ✅ No separate backend to maintain
- ✅ Scalable and cost-effective
- ✅ All-in-one Google ecosystem

**Components:**
```
┌─────────────────────────────────────────────────┐
│         www.mukatrade.com Dashboard             │
│     (React/Vue frontend + Google OAuth)         │
└────────────┬────────────────────────────────────┘
             │
        (authenticated users)
             │
┌────────────┴────────────────────────────────────┐
│      Google Cloud Backend                       │
│  ┌──────────────────────────────────────────┐  │
│  │  Cloud Functions (Agent Orchestration)   │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │ Agent 1: SCRAPER                   │  │  │
│  │  │ - Daily tender scraping            │  │  │
│  │  │ - Find all PDF documents           │  │  │
│  │  │ - Store in Google Drive            │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │ Agent 2: SOURCING FILES            │  │  │
│  │  │ - Download & organize documents    │  │  │
│  │  │ - Create folder structure          │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │ Agent 3: SOURCING                  │  │  │
│  │  │ - Search products (Alibaba, Google)│  │  │
│  │  │ - Check user email history         │  │  │
│  │  │ - Generate sourcing report         │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │ Agent 4: REPORTING                 │  │  │
│  │  │ - Generate PDF briefing            │  │  │
│  │  │ - Create email templates           │  │  │
│  │  │ - Prepare Excel tracking sheet     │  │  │
│  │  │ - Mark for human approval          │  │  │
│  │  └────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────┐  │  │
│  │  │ Agent 5: SECRETARY                 │  │  │
│  │  │ - Update tender status             │  │  │
│  │  │ - Track deadlines                  │  │  │
│  │  │ - Log follow-ups                   │  │  │
│  │  └────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │  Firestore Database (Real-time sync)    │  │
│  └──────────────────────────────────────────┘  │
└────────────┬────────────────────────────────────┘
             │
┌────────────┴────────────────────────────────────┐
│      Google Drive (Data Storage)                │
│  ├── /Tender Scraper Config                     │
│  ├── /Tenders (organized by date/embassy)      │
│  ├── /Sourcing Reports                         │
│  ├── /Documents                                │
│  └── /Submissions                              │
└─────────────────────────────────────────────────┘
```

---

## 👥 FIVE AGENTS DETAILED SPECIFICATIONS

### **AGENT 1: SCRAPER**

**Purpose:** Daily tender discovery and document extraction

**When it runs:** Daily at 9:00 AM

**What it does:**
```
1. Scrape all 120+ embassy websites
2. Find NEW tenders (not seen before)
3. Filter by keywords (exclude: service, fuel, insurance)
4. FOR EACH TENDER:
   ├── Extract basic info (embassy, number, title)
   ├── Find ALL documents (PDFs, Excel, docs)
   ├── Extract document links
   ├── Save to Google Drive folder
   └── Create entry in Firestore database
5. Create tender summary JSON
6. Pass to Agent 2: SOURCING FILES
```

**Inputs:** 
- Tender website URLs
- Keyword rules from config

**Outputs:**
- Firestore documents with tender data
- Google Drive folder with documents
- JSON file: `tender_metadata.json`

**Error Handling:**
- If website unreachable → log and continue
- If documents not found → note "No docs available"
- If duplicate tender → skip

---

### **AGENT 2: SOURCING FILES**

**Purpose:** Organize documents and prepare tender for analysis

**Triggered by:** Agent 1 (after scraping)

**What it does:**
```
1. Receive tender from Agent 1
2. Create Google Drive folder structure:
   /Tenders/{YEAR}/{EMBASSY}/{TENDER_NUMBER}
   ├── /Original_Documents (all PDFs/files from tender page)
   ├── /Specifications (extracted specs)
   ├── /Items (item details)
   └── /Submissions (where quotes go)
3. Download all documents to correct folder
4. Extract item list from tender documents
5. Format item data for Agent 3
6. Create file manifest (what documents found)
7. Pass to Agent 3: SOURCING
```

**Inputs:**
- Tender metadata and document links from Agent 1

**Outputs:**
- Organized Google Drive folder structure
- `items_list.json` with all items extracted
- `documents_manifest.json` (what was found)

---

### **AGENT 3: SOURCING**

**Purpose:** Find products and suppliers for tender items

**Triggered by:** Agent 2 (after file organization)

**What it does:**
```
1. Receive items list from Agent 2
2. FOR EACH ITEM:
   ├── Search Alibaba for similar products (with links)
   ├── Search Google Shopping/Trade sites
   ├── Check user's email history:
   │   ├── Search for item keywords
   │   ├── Find past supplier quotes
   │   ├── Extract contacts & prices
   │   └── Note: "Found in email from supplier X"
   ├── Create product options JSON
   │   ├── Top 3-5 product matches
   │   ├── Supplier names & links
   │   ├── Estimated prices
   │   └── Source (Alibaba / Google / Email)
   └── Flag exact match requirement
3. Generate SOURCING REPORT:
   - Table of products per item
   - Supplier contacts
   - Price estimates
   - Comparison notes
4. Pass to Agent 4: REPORTING
```

**Inputs:**
- Items list from Agent 2
- User emails (Gmail access)

**Outputs:**
- `sourcing_report.json`
- `product_matches.json`
- `supplier_contacts.json`

---

### **AGENT 4: REPORTING**

**Purpose:** Generate all documents needed for tender bidding

**Triggered by:** Agent 3 (after sourcing)

**Requires:** Human approval before final output

**What it does:**
```
1. Receive sourcing data from Agent 3
2. GENERATE PDF BRIEFING:
   - Tender summary
   - Items with sourcing options
   - Estimated costs
   - Timeline
   - Next steps
   - For: HUMAN REVIEW & APPROVAL
3. GENERATE EMAIL TEMPLATES:
   - Email to each supplier
   - Subject: "Quote for Tender RYD-2026-04521"
   - Body: Professional inquiry
   - For: HUMAN REVIEW & MODIFICATION
4. GENERATE EXCEL TRACKING SHEET:
   - All items
   - Supplier contacts
   - Quote status
   - Prices
   - Deadline tracking
5. GENERATE DOCUMENT CHECKLIST:
   - All documents from tender file
   - Requirements per item
   - What we need to prepare
6. SAVE TO GOOGLE DRIVE:
   ├── tender_briefing.pdf
   ├── supplier_emails.docx
   ├── quote_tracking.xlsx
   └── document_checklist.xlsx
7. Mark in Firestore: "PENDING APPROVAL"
8. Alert user: "Review and approve in dashboard"
```

**Inputs:**
- Sourcing data from Agent 3
- Tender documents & specifications

**Outputs:**
- PDF briefing document
- Email templates (Word format)
- Excel tracking sheet
- Document checklist
- Status: PENDING APPROVAL

**Human Review:**
- User reviews PDF briefing
- User approves/modifies email templates
- User confirms items and suppliers
- User clicks "APPROVE AND SUBMIT"

---

### **AGENT 5: SECRETARY**

**Purpose:** Manage tender lifecycle and follow-ups

**Triggered by:** Manual updates from dashboard + scheduled checks

**What it does:**
```
1. TRACK TENDER STATUS:
   ├── Status options:
   │   ├── SOURCING (Agent 3 working)
   │   ├── PENDING APPROVAL (Agent 4 output waiting)
   │   ├── APPROVED (Ready to submit)
   │   ├── SUBMITTED (Email sent to suppliers/embassy)
   │   ├── AWAITING QUOTES (Waiting for responses)
   │   ├── QUOTES RECEIVED (Analyzing options)
   │   ├── WON (Contract awarded)
   │   ├── LOST (Competition won)
   │   └── GAVE UP (Decided not to bid)
   │
2. DEADLINE TRACKING:
   ├── Days until deadline (countdown)
   ├── Alert at 7 days
   ├── Alert at 3 days
   ├── CRITICAL at 1 day
   │
3. FOLLOW-UP REMINDERS:
   ├── "Send to suppliers" - daily after 3 days
   ├── "Follow up on quotes" - after 1 week
   ├── "Final deadline approaching" - 1 day before
   │
4. MAINTAIN LOG:
   ├── Date submitted
   ├── Who submitted
   ├── Email log (sent/received)
   ├── Supplier responses
   ├── Quote details
   │
5. FINAL STATUS UPDATE:
   ├── When won → celebrate!
   ├── When lost → analyze why
   ├── When gave up → log reason
   ├── Archive tender
```

**Inputs:**
- Manual status updates from dashboard
- Email activity (if integrated)
- Deadline countdown

**Outputs:**
- Updated Firestore document
- Status timeline
- Deadline alerts
- Follow-up reminders
- Archive record

---

## 🔐 AUTHENTICATION & SECURITY

### **Employee Login System**

```
┌──────────────────────────────────────────────┐
│  Employee visits: www.mukatrade.com/dashboard │
└─────────────────────┬────────────────────────┘
                      │
                      ↓
        ┌─────────────────────────────┐
        │  Sign in with Google Button  │
        └──────────────┬────────────────┘
                       │
                       ↓
    ┌──────────────────────────────────────┐
    │  Google OAuth (via Google Workspace) │
    │  - Redirects to Google login         │
    │  - User enters @mukatrade.com email │
    │  - Google Workspace authenticates    │
    └──────────────┬───────────────────────┘
                   │
                   ↓
    ┌──────────────────────────────────────┐
    │  Backend validates:                  │
    │  - Email from @mukatrade.com domain │
    │  - User is in "employees" list      │
    │  - Email verified via Google        │
    └──────────────┬───────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ↓                     ↓
    ✅ ACCESS              ❌ DENIED
    (Create session)    (Show login error)
        │                    │
        ↓                    ↓
   Dashboard loaded    "Contact admin
   READ-ONLY MODE     to grant access"
```

### **READ-ONLY ACCESS CONTROL**

```javascript
// Frontend enforcement
- All edit buttons DISABLED
- All input fields READ-ONLY
- No save/delete buttons
- Only allowed: View, Search, Export, Print, Download

// Backend enforcement
- All API endpoints check: user.role === 'employee'
- No PUT/POST/DELETE allowed for employees
- Only GET requests permitted
- Audit log of all data accessed
```

---

## 📁 GOOGLE DRIVE FOLDER STRUCTURE

```
Muka Tenders (Root)
├── /Tender_Scraper_Config
│   └── Config sheet + keyword list
│
├── /Tenders_By_Date
│   ├── /2026_04_18 (date of discovery)
│   │   ├── /RYD-2026-04521
│   │   │   ├── /Original_Documents
│   │   │   │   ├── RFQ.pdf
│   │   │   │   ├── Specifications.xlsx
│   │   │   │   └── Technical_Requirements.docx
│   │   │   ├── /Sourcing
│   │   │   │   ├── sourcing_report.json
│   │   │   │   └── product_matches.json
│   │   │   ├── /Reports
│   │   │   │   ├── tender_briefing.pdf
│   │   │   │   ├── supplier_emails.docx
│   │   │   │   ├── quote_tracking.xlsx
│   │   │   │   └── document_checklist.xlsx
│   │   │   └── /Submissions
│   │   │       ├── our_quote.pdf
│   │   │       └── received_quotes (from suppliers)
│   │   │
│   │   └── /MUM-2026-08834 (another tender)
│   │
│   └── /2026_04_19
│       └── ... (more tenders)
│
├── /Tenders_By_Embassy
│   ├── /Saudi_Arabia
│   │   ├── RYD-2026-04521 (link/shortcut)
│   │   └── ...
│   ├── /India
│   │   ├── MUM-2026-08834
│   │   └── ...
│   └── /Indonesia
│       └── ...
│
├── /Active_Tenders
│   ├── /Sourcing (working on)
│   ├── /Approved (ready to submit)
│   ├── /Submitted (sent to suppliers)
│   └── /Awaiting_Quotes
│
├── /Completed_Tenders
│   ├── /Won
│   ├── /Lost
│   └── /Gave_Up
│
└── /Supplier_Database
    ├── supplier_contacts.json
    └── supplier_history.json
```

---

## 🔌 DATA STORAGE: JSON SCHEMAS

### **Tender Metadata** (`tender_metadata.json`)
```json
{
  "id": "RYD-2026-04521",
  "embassy": "U.S. Embassy - Riyadh, Saudi Arabia",
  "country": "Saudi Arabia",
  "title": "Supply of Office Equipment",
  "tender_type": "RFQ",
  "published_date": "2026-04-10",
  "deadline": "2026-05-10T14:00:00",
  "deadline_local_tz": "AST (UTC+3)",
  "contact_email": "procurement@riyadh.usembassy.gov",
  "tender_page_url": "https://sa.usembassy.gov/...",
  "documents": [
    {
      "name": "RFQ.pdf",
      "url": "https://...",
      "google_drive_link": "https://drive.google.com/...",
      "downloaded": true
    }
  ],
  "status": "PENDING_APPROVAL",
  "items_count": 3,
  "created_at": "2026-04-18T09:15:00",
  "updated_at": "2026-04-18T10:30:00"
}
```

### **Items List** (`items_list.json`)
```json
{
  "tender_id": "RYD-2026-04521",
  "items": [
    {
      "item_number": 1,
      "description": "Office Desks",
      "quantity": 25,
      "unit": "units",
      "specifications": "Wooden, 1.6m x 0.8m",
      "exact_match_required": false,
      "product_links": [
        {
          "source": "Alibaba",
          "product_name": "Executive Wooden Desk",
          "url": "https://...",
          "supplier": "Company A",
          "estimated_price": "$150-200 per unit"
        }
      ],
      "email_references": [
        {
          "from": "supplier@example.com",
          "subject": "Office Furniture Quote",
          "date": "2026-03-15",
          "mention": "We supply office desks similar to your requirements"
        }
      ]
    }
  ]
}
```

### **Tender Status** (`tender_status.json`)
```json
{
  "tender_id": "RYD-2026-04521",
  "current_status": "PENDING_APPROVAL",
  "timeline": [
    {
      "date": "2026-04-18T09:00:00",
      "status": "DISCOVERED",
      "agent": "SCRAPER",
      "notes": "Tender found, 3 documents downloaded"
    },
    {
      "date": "2026-04-18T09:30:00",
      "status": "ORGANIZED",
      "agent": "SOURCING_FILES",
      "notes": "Documents organized, 3 items extracted"
    },
    {
      "date": "2026-04-18T10:15:00",
      "status": "SOURCED",
      "agent": "SOURCING",
      "notes": "Found 5 product options, 2 from past emails"
    },
    {
      "date": "2026-04-18T10:45:00",
      "status": "PENDING_APPROVAL",
      "agent": "REPORTING",
      "notes": "PDF briefing, email templates, tracking sheet ready"
    }
  ],
  "next_deadline": "2026-05-10T14:00:00",
  "days_remaining": 22,
  "assigned_to": "yaron@mukatrade.com",
  "follow_ups": []
}
```

---

## 🎯 WORKFLOW EXECUTION

### **Agent Sequence (Recommended: Sequential + Async)**

```
DAILY 9:00 AM
    ↓
┌─────────────────────────────────────┐
│  Agent 1: SCRAPER                   │
│  - Scrape all websites              │
│  - Find documents                   │
│  - Create tender metadata           │
└─────────────────┬───────────────────┘
                  │ (wait for completion)
                  ↓
         ┌─────────────────────────┐
         │ IF NO TENDERS FOUND     │
         │ → Stop, notify user     │
         └─────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
      (For each tender found)
        │
        ↓
┌─────────────────────────────────────┐
│  Agent 2: SOURCING FILES            │
│  - Organize documents               │
│  - Extract items                    │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│  Agent 3: SOURCING (PARALLEL OK)    │
│  - Search products                  │
│  - Check email history              │
│  - Generate sourcing report         │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│  Agent 4: REPORTING                 │
│  - Generate PDF briefing            │
│  - Create email templates           │
│  - Prepare Excel sheets             │
│  - MARK: PENDING APPROVAL           │
│  - NOTIFY USER                      │
└─────────────────┬───────────────────┘
                  │
         ┌────────┴────────┐
         │                 │
         ↓                 ↓
    DAILY DIGEST      USER REVIEWS
    EMAIL SENT        DASHBOARD
                          │
                          ↓
                    [HUMAN DECISION POINT]
                    - Review PDF
                    - Modify emails
                    - Click APPROVE
                          │
                          ↓
┌─────────────────────────────────────┐
│  Agent 5: SECRETARY                 │
│  - Update status → APPROVED         │
│  - Prepare submission files         │
│  - Set deadline reminders           │
│  - Wait for user to submit          │
└─────────────────────────────────────┘
```

---

## 📅 TIMELINE & DELIVERABLES

### **Week 1**

**Days 1-2: Infrastructure Setup**
- [ ] Create Google Cloud project
- [ ] Set up Google OAuth with Workspace
- [ ] Configure Firestore database
- [ ] Create Google Drive folder structure
- [ ] Deploy authentication service

**Days 3-5: Agent Development**
- [ ] Agent 1: SCRAPER (enhanced document finding)
- [ ] Agent 2: SOURCING FILES (with document download)
- [ ] Start Agent 3: SOURCING (basic product search)

**Days 6-7: Testing & Integration**
- [ ] Test Agent 1 + 2 workflow
- [ ] Test Google Drive integration
- [ ] Test OAuth login flow
- [ ] Prepare for Week 2

### **Week 2**

**Days 8-10: Continue Agents**
- [ ] Complete Agent 3: SOURCING (with email search)
- [ ] Agent 4: REPORTING (document generation)
- [ ] Agent 5: SECRETARY (status tracking)

**Days 11-13: Dashboard**
- [ ] Build online dashboard interface
- [ ] Integrate authentication
- [ ] Connect to Firestore
- [ ] Employee read-only access
- [ ] Testing & bug fixes

**Days 14: Launch**
- [ ] Final testing
- [ ] Deploy to www.mukatrade.com
- [ ] Employee training
- [ ] Go live! 🎉

---

## 🔑 KEY TECHNICAL REQUIREMENTS

### **Must-Have Tech Stack**

✅ **Frontend:**
- React or Vue.js (for dashboard)
- Google OAuth library
- Responsive design (mobile + desktop)

✅ **Backend:**
- Google Cloud Functions (Node.js)
- Google Apps Script (for agent automation)
- Firestore (real-time database)

✅ **Integrations:**
- Google Drive API (store documents)
- Gmail API (scan email history)
- Web scraping (Puppeteer/Cheerio for tenders)

✅ **Search APIs:**
- Alibaba API
- Google Custom Search API
- Trade site APIs (if available)

---

## 📊 NEXT IMMEDIATE QUESTIONS FOR YOU

Before I start building, I need clarification on:

1. **Hosting Decision:**
   - ✅ Recommendation: **Google Cloud** (Firebase + Cloud Functions)
   - Alternative: Your own server
   - **Confirm: Proceed with Google Cloud?**

2. **Agent Approval Flow:**
   - Agent 4 generates documents
   - User reviews in dashboard
   - User clicks "Approve & Submit"
   - **Question: Should Agent 4 actually send emails, or only prepare templates?**
   - **Answer: I recommend TEMPLATES ONLY, user sends manually**

3. **Supplier Email Search:**
   - Should Agent 3 scan Gmail automatically?
   - Or search specific folder?
   - **How should we access user emails securely?**

4. **Product Link Strategy (Phased):**
   - Phase 1 (Week 1): Manual links added by user
   - Phase 2 (After launch): Auto-search Alibaba
   - Phase 3: Auto-search multiple platforms
   - **Confirm phased approach?**

5. **Website Integration:**
   - Build dashboard as separate app (mukatrade.com/dashboard)?
   - Or embed in existing website?
   - **What's your current website structure?**

---

## 🎯 WHAT YOU GET

After 2 weeks, you'll have:

✅ **Scraper Agent** - Finds 50-100+ tenders/month  
✅ **Online Dashboard** - Employee access with Google OAuth  
✅ **Sourcing System** - Finds products + checks email history  
✅ **Document Management** - All PDFs organized in Google Drive  
✅ **Report Generation** - PDF, Excel, Email templates ready  
✅ **Status Tracking** - Follow-up management  
✅ **Multi-Timezone Support** - Local, Kerala, Kampala dates  
✅ **Read-Only for Employees** - Secure, no accidental changes  
✅ **Scalable Architecture** - Ready to add more agents later  

---

**Ready to start building? Please answer the 5 questions above, and we'll begin!** 🚀
