# 🚀 BUILD PLAN: Multi-Agent Tender Platform - START TODAY

**Timeline:** FULL SYSTEM TODAY - Go all in!  
**Target:** MVP launch by end of week  
**Database:** Neon.tech (PostgreSQL)  
**Admin:** info@mukatrade.com  

---

## 🎯 SCOPE: What Gets Built TODAY

### **PHASE 1: FOUNDATION (TODAY - Morning/Afternoon)**

#### **1. Database Setup (You + Me)**
- [ ] You: Create Neon.tech account (free tier)
- [ ] Me: Create database schema (PostgreSQL)
- [ ] Structure: Tenders, Items, Suppliers, Quotes, Statuses

#### **2. Backend API (Cloud Functions)**
- [ ] Create REST API endpoints
- [ ] Database connections
- [ ] Authentication (Google OAuth)
- [ ] User management

#### **3. Frontend Dashboard (React)**
- [ ] Login page (Google OAuth)
- [ ] Main dashboard shell
- [ ] Navigation structure

### **PHASE 2: AGENTS (TODAY/TONIGHT - Evening)**

#### **4. Agent 1: SCRAPER**
- [ ] Daily tender scraper
- [ ] Document finder
- [ ] Data to database

#### **5. Agent 2: SOURCING FILES**
- [ ] Form pre-fill from Agent 3 findings
- [ ] User customization capability
- [ ] Template from your Master sheet
- [ ] Save as Google Sheet + database

#### **6. Agent 3: SOURCING**
- [ ] Product search (Alibaba, Google)
- [ ] Email history scanning
- [ ] Geographic logic (destination vs origin)
- [ ] Supplier suggestion

#### **7. Agent 4: REPORTING**
- [ ] Status dashboard
- [ ] Priority sorting (by due date)
- [ ] Color coding (Red/Orange/Green)
- [ ] Progress tracking

#### **8. Agent 5: SECRETARY**
- [ ] PDF generation
- [ ] Email template creation
- [ ] Excel quote tracking
- [ ] Follow-up management

### **PHASE 3: INTEGRATION (TOMORROW)**
- [ ] Connect all agents
- [ ] End-to-end workflow
- [ ] Testing
- [ ] Deployment to mukatrade.com

---

## 📊 DATABASE SCHEMA (Neon.tech PostgreSQL)

```sql
-- TENDERS TABLE
CREATE TABLE tenders (
  id UUID PRIMARY KEY,
  tender_number VARCHAR(50) UNIQUE,
  embassy VARCHAR(255),
  country VARCHAR(100),
  title TEXT,
  description TEXT,
  tender_url VARCHAR(500),
  contact_email VARCHAR(100),
  deadline TIMESTAMP,
  deadline_tz VARCHAR(50),
  status VARCHAR(20), -- discovered, sourcing, pending_approval, submitted, won, lost, gave_up
  priority VARCHAR(10), -- calculated by due date: red, orange, green
  discovered_date TIMESTAMP,
  assigned_to VARCHAR(100),
  visibility VARCHAR(10), -- public, private
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- ITEMS TABLE
CREATE TABLE items (
  id UUID PRIMARY KEY,
  tender_id UUID REFERENCES tenders(id),
  item_number INT,
  description TEXT,
  quantity DECIMAL(10,2),
  unit VARCHAR(20),
  specifications TEXT,
  exact_match_required BOOLEAN,
  created_at TIMESTAMP
);

-- SOURCING SUGGESTIONS TABLE
CREATE TABLE sourcing_suggestions (
  id UUID PRIMARY KEY,
  item_id UUID REFERENCES items(id),
  source VARCHAR(50), -- alibaba, google, email, etc
  product_name VARCHAR(255),
  product_url VARCHAR(500),
  supplier_name VARCHAR(255),
  supplier_email VARCHAR(100),
  country VARCHAR(50),
  estimated_price DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP
);

-- SOURCING FILES (QUOTES TEMPLATE)
CREATE TABLE sourcing_files (
  id UUID PRIMARY KEY,
  tender_id UUID REFERENCES tenders(id),
  version INT,
  status VARCHAR(20), -- draft, submitted, approved
  items_json JSONB, -- structured item list for RFQ
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  created_by VARCHAR(100)
);

-- QUOTES TABLE (from suppliers)
CREATE TABLE quotes (
  id UUID PRIMARY KEY,
  sourcing_file_id UUID REFERENCES sourcing_files(id),
  supplier_name VARCHAR(255),
  supplier_email VARCHAR(100),
  total_price DECIMAL(10,2),
  currency VARCHAR(3),
  delivery_days INT,
  terms TEXT,
  status VARCHAR(20), -- received, accepted, rejected
  received_date TIMESTAMP,
  created_at TIMESTAMP
);

-- FOLLOW-UPS TABLE
CREATE TABLE follow_ups (
  id UUID PRIMARY KEY,
  tender_id UUID REFERENCES tenders(id),
  action VARCHAR(255),
  due_date TIMESTAMP,
  status VARCHAR(20), -- pending, completed
  notes TEXT,
  assigned_to VARCHAR(100),
  created_at TIMESTAMP,
  completed_at TIMESTAMP
);

-- DOCUMENTS TABLE
CREATE TABLE documents (
  id UUID PRIMARY KEY,
  tender_id UUID REFERENCES tenders(id),
  document_name VARCHAR(255),
  document_url VARCHAR(500),
  google_drive_link VARCHAR(500),
  document_type VARCHAR(50), -- RFQ, spec, requirement, etc
  downloaded BOOLEAN,
  created_at TIMESTAMP
);
```

---

## 🔗 API ENDPOINTS (Cloud Functions/Node.js)

```javascript
// AUTHENTICATION
POST /auth/google-login (OAuth callback)
POST /auth/logout

// TENDERS
GET /api/tenders (list all)
GET /api/tenders?status=sourcing (filter by status)
GET /api/tenders/:id (detail)
POST /api/tenders (create - from scraper)
PUT /api/tenders/:id (update status/priority)
DELETE /api/tenders/:id (archive)

// ITEMS
GET /api/tenders/:id/items
POST /api/tenders/:id/items (add item)
PUT /api/items/:id (update)

// SOURCING SUGGESTIONS
GET /api/items/:id/suggestions (product options)
POST /api/items/:id/suggestions (add suggestion - from Agent 3)

// SOURCING FILES (Quotes Template)
GET /api/tenders/:id/sourcing-file
POST /api/tenders/:id/sourcing-file (create from template)
PUT /api/sourcing-files/:id (save user edits)
GET /api/sourcing-files/:id/export (download as Excel/PDF)

// QUOTES (from suppliers)
POST /api/sourcing-files/:id/quotes (add received quote)
GET /api/sourcing-files/:id/quotes (list all quotes)
PUT /api/quotes/:id (update)

// FOLLOW-UPS
GET /api/tenders/:id/follow-ups
POST /api/tenders/:id/follow-ups (add action)
PUT /api/follow-ups/:id (update status)

// DOCUMENTS
GET /api/tenders/:id/documents
POST /api/tenders/:id/documents (link new doc)

// REPORTING DASHBOARD
GET /api/dashboard/summary (counts by status)
GET /api/dashboard/tenders-by-priority (color-coded list)
GET /api/dashboard/my-tenders (user's assigned tenders)
```

---

## 🎨 DASHBOARD STRUCTURE

```
┌─────────────────────────────────────────────────────┐
│  www.mukatrade.com/dashboard                        │
│  Welcome, Yaron | Settings | Logout                 │
├─────────────────────────────────────────────────────┤
│                                                     │
│  📊 REPORTING DASHBOARD                             │
│  ┌─────────────────────────────────────────────┐   │
│  │ ACTIVE TENDERS: 12 | WON: 3 | LOST: 1      │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  🔴 URGENT (RED) - Due within 3 days               │
│  ├─ [RYD-2026-04521] Office Equipment... (1 day)  │
│  ├─ [MUM-2026-08834] IT Hardware... (2 days)      │
│  └─ [JKT-2026-12456] Cleaning Supplies (3 days)   │
│                                                     │
│  🟠 MEDIUM (ORANGE) - Due within 7 days             │
│  ├─ [XXX-XXX-XXXXX] Item... (4 days)              │
│  └─ [XXX-XXX-XXXXX] Item... (6 days)              │
│                                                     │
│  🟢 PLANNING (GREEN) - Due in 8+ days              │
│  ├─ [XXX-XXX-XXXXX] Item... (15 days)             │
│  └─ [XXX-XXX-XXXXX] Item... (30 days)             │
│                                                     │
│  📋 RECENT ACTIVITY                                 │
│  ├─ Agent 3 found 5 product options for RYD...    │
│  ├─ You approved sourcing file for MUM...         │
│  └─ Secretary prepared email templates for JKT... │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📁 FOLDER STRUCTURE (Google Drive)

```
/Muka Tenders (Root)
├── /Tender_Scraper_Config
│   └── Keywords + website list
├── /Tenders_2026_04
│   ├── /RYD-2026-04521
│   │   ├── /Original_Documents (PDFs from tender)
│   │   ├── /Sourcing (product findings from Agent 3)
│   │   └── /Submission (quotes + our final offer)
│   ├── /MUM-2026-08834
│   └── /JKT-2026-12456
└── /Completed_Tenders
    ├── /Won
    ├── /Lost
    └── /Gave_Up
```

---

## 🤖 AGENT EXECUTION FLOW

### **Daily 9:00 AM - AUTOMATIC**

```
┌──────────────────────────┐
│  SCRAPER (Agent 1)       │
│  - Scrape 120+ websites  │
│  - Find new tenders      │
│  - Download documents    │
│  - Store in database     │
└──────────┬───────────────┘
           │
           ↓ (for each tender)
┌──────────────────────────┐
│  SOURCING (Agent 3)      │
│  - Search Alibaba        │
│  - Search Google         │
│  - Scan user emails      │
│  - Geographic logic      │
│  - Suggest products      │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│  SOURCING FILES (Agent 2)│
│  - Pre-fill form         │
│  - User customization    │
│  - Save template         │
└──────────┬───────────────┘
           │
    ┌──────┴──────┐
    │             │
    ↓             ↓
[Dashboard]  [Email Notify]
 "Review      "New tender
  findings"    ready for
               review"
```

### **User Action: APPROVE**

```
┌──────────────────────────┐
│ User reviews in dashboard│
│ - Approves items         │
│ - Selects suppliers      │
│ - Customizes quote       │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│  SECRETARY (Agent 5)     │
│  - Generate PDF briefing │
│  - Create email templates│
│  - Create Excel tracking │
│  - Prepare documents     │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│ User reviews output      │
│ - Edits emails           │
│ - Finalizes             │
│ - Clicks SUBMIT         │
└──────────┬───────────────┘
           │
           ↓
┌──────────────────────────┐
│ SECRETARY (Agent 5)      │
│ - Send emails to buyers  │
│ - Update status          │
│ - Start deadline tracking│
└──────────────────────────┘
```

### **Ongoing: SECRETARY UPDATES**

```
Daily:
- Update tender status (sourcing/submitted/awaiting quotes/won/lost)
- Calculate priority (by deadline)
- Auto-color code (red/orange/green)
- Track follow-ups
- Log email responses
```

---

## 🚦 PRIORITY COLOR CODING LOGIC

```javascript
function calculatePriority(deadlineDate) {
  const today = new Date();
  const daysUntilDeadline = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24));
  
  if (daysUntilDeadline <= 3) return 'RED';      // 🔴 URGENT
  if (daysUntilDeadline <= 7) return 'ORANGE';   // 🟠 MEDIUM
  return 'GREEN';                                 // 🟢 PLANNING
}

// Sub-priorities (color shades)
1-2 days   = RED (darkest)
3-5 days   = RED (lighter)
6-7 days   = ORANGE (darker)
8-14 days  = ORANGE (lighter)
15+ days   = GREEN (lighter)
```

---

## 📝 WHAT YOU NEED TO PROVIDE

**RIGHT NOW:**

1. **Neon.tech Account Setup:**
   - [ ] Go to https://neon.tech
   - [ ] Sign up (free tier)
   - [ ] Create a project
   - [ ] Share connection string with me
   - **Time:** 5 minutes

2. **Gmail Access (for Agent 3):**
   - [ ] Confirm: Can Agent 3 scan your Gmail?
   - [ ] OAuth permission needed
   - [ ] Which labels to prioritize? (e.g., "suppliers", "quotes")

3. **Confirmation:**
   - [ ] Ready to start building?
   - [ ] Any last-minute requests?

---

## 🏗️ WHAT I'LL BUILD TODAY

### **By END OF DAY:**

- [x] Neon.tech database schema
- [x] Node.js/Express backend (Cloud Functions)
- [x] React dashboard frontend
- [x] Google OAuth integration
- [x] Agent 1: SCRAPER (schedule setup)
- [x] Agent 3: SOURCING (product search)
- [x] Agent 2: SOURCING FILES (form template)
- [x] Agent 4: REPORTING (dashboard + status)
- [x] Agent 5: SECRETARY (document generation)

### **By END OF WEEK:**

- [x] Full end-to-end testing
- [x] Deployment to mukatrade.com
- [x] Employee access setup
- [x] Live launch

---

## 🎯 NEXT IMMEDIATE ACTIONS

**For you (RIGHT NOW):**
1. Create Neon.tech account
2. Share connection details
3. Confirm Gmail access for Agent 3
4. Review this plan - any changes?

**For me (STARTING NOW):**
1. Set up database schema in Neon
2. Build backend API
3. Create React dashboard
4. Integrate Google OAuth
5. Deploy Agent 1 (Scraper)
6. Test everything

---

## ⚡ QUICK DECISION: Which approach?

**Option A: Complete Integration**
- All agents + dashboard integrated
- Single unified system
- More complex, takes longer

**Option B: Modular (RECOMMENDED)**
- Start with MVP: Scraper + Dashboard
- Agents added one by one
- Faster to launch, easier to test
- Each agent perfected before next

**Option C: Fast & Furious**
- Build everything in parallel
- Hope it works together
- Risky but could be amazing

**My Recommendation:** **Option B (Modular)** - Fast launch + reliable system

---

**READY TO START? Let's build this! 🚀**

Need you to:
1. Create Neon.tech account NOW
2. Share the connection string
3. Approve the plan above

Then I'll start coding immediately!
