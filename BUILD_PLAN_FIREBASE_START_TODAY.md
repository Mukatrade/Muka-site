# 🚀 BUILD PLAN: Multi-Agent Tender Platform with FIREBASE - START TODAY

**Timeline:** FULL SYSTEM TODAY - Go all in!  
**Database:** Firebase (Firestore)  
**Backend:** Cloud Functions  
**Frontend:** React  
**Auth:** Google OAuth  
**Admin:** info@mukatrade.com  
**Hosting:** Firebase Hosting (mukatrade.com integration)

---

## ✨ FIREBASE ADVANTAGES

✅ **No Database Setup** - Firestore is built-in, automatic scaling  
✅ **Google OAuth** - Native Firebase integration  
✅ **Real-time Updates** - Dashboard updates instantly  
✅ **Cloud Functions** - Serverless agents run automatically  
✅ **Hosting** - Deploy directly to mukatrade.com  
✅ **FREE TIER** - Great for starting  

---

## 🎯 WHAT GETS BUILT TODAY

### **PHASE 1: FOUNDATION (TODAY - Now)**

#### **1. Firebase Project Setup**
```
[START HERE]
1. Create Firebase project (free)
2. Enable Firestore database
3. Enable Authentication (Google OAuth)
4. Enable Cloud Functions
5. Enable Storage (for documents)
6. Share project link with me
Time: 10 minutes
```

#### **2. Firestore Database Structure**
```
tenders/
  ├── [tender_id]
  │   ├── tender_number
  │   ├── embassy
  │   ├── country
  │   ├── title
  │   ├── deadline
  │   ├── status (sourcing, submitted, won, lost, gave_up)
  │   ├── priority (red, orange, green)
  │   ├── assigned_to
  │   ├── visibility (public, private)
  │   └── timestamps
  │
  └── [tender_id]/items/
      ├── [item_id]
      │   ├── description
      │   ├── quantity
      │   ├── unit
      │   ├── exact_match_required
      │   └── specifications
      │
      └── [item_id]/sourcing_suggestions/
          ├── [suggestion_id]
          │   ├── source (alibaba, google, email)
          │   ├── product_name
          │   ├── product_url
          │   ├── supplier_name
          │   ├── estimated_price
          │   └── country

sourcing_files/
  ├── [tender_id]
  │   ├── status (draft, submitted, approved)
  │   ├── items (JSON structure for RFQ)
  │   ├── template_url (Google Sheet link)
  │   └── quotes
  │       ├── [quote_id]
  │       │   ├── supplier_name
  │       │   ├── total_price
  │       │   ├── currency
  │       │   └── delivery_days

follow_ups/
  ├── [follow_up_id]
  │   ├── tender_id
  │   ├── action
  │   ├── due_date
  │   ├── status
  │   └── assigned_to

documents/
  ├── [document_id]
  │   ├── tender_id
  │   ├── document_name
  │   ├── url
  │   ├── document_type
  │   └── google_drive_link

users/
  ├── [user_id]
  │   ├── email
  │   ├── role (admin, secretary, viewer)
  │   ├── company_email
  │   └── display_name
```

#### **3. Backend (Cloud Functions)**

```javascript
// index.js - Cloud Functions
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});

admin.initializeApp();
const db = admin.firestore();

// AUTHENTICATION
exports.verifyToken = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new Error('Not authenticated');
  return { uid: context.auth.uid, email: context.auth.token.email };
});

// TENDERS
exports.getTenders = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new Error('Not authenticated');
  const snapshot = await db.collection('tenders')
    .where('assigned_to', '==', context.auth.token.email)
    .orderBy('deadline', 'asc')
    .get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
});

// Add more functions as needed...
exports.createTender = functions.https.onCall(async (data, context) => {
  // Create new tender in Firestore
});

exports.updateTenderStatus = functions.https.onCall(async (data, context) => {
  // Update status and recalculate priority
});

exports.getAllTendersForDashboard = functions.https.onCall(async (data, context) => {
  // Return color-coded list for reporting dashboard
});
```

#### **4. Frontend (React + Firebase)**

```javascript
// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tender/:id" element={<TenderDetail />} />
        <Route path="/sourcing/:id" element={<SourcingForm />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## 🤖 AGENTS (Cloud Functions)

### **Agent 1: SCRAPER**
```javascript
exports.runScraper = functions.pubsub
  .schedule('0 9 * * *') // Daily at 9 AM
  .timeZone('America/Chicago')
  .onRun(async (context) => {
    // 1. Scrape all 120+ embassy websites
    // 2. Find new tenders (not in DB)
    // 3. Extract documents
    // 4. Save to Firestore
    // 5. Create notifications
  });
```

### **Agent 2: SOURCING FILES**
```javascript
exports.prepareSourcingFile = functions.firestore
  .document('tenders/{tenderId}')
  .onWrite(async (change, context) => {
    const tender = change.after.data();
    // 1. Get items from Agent 3 suggestions
    // 2. Create template (like your Master sheet)
    // 3. Pre-fill form
    // 4. Save as Firestore document + Google Sheet
  });
```

### **Agent 3: SOURCING**
```javascript
exports.findProducts = functions.firestore
  .document('tenders/{tenderId}/items/{itemId}')
  .onCreate(async (snap, context) => {
    const item = snap.data();
    const tenderId = context.params.tenderId;
    const tendDoc = await db.collection('tenders').doc(tenderId).get();
    const country = tendDoc.data().country;
    
    // 1. Determine search location based on country
    //    - If USA -> search USA suppliers
    //    - Else -> search Dubai, China, etc
    // 2. Search Alibaba API
    // 3. Search Google Shopping API
    // 4. Scan user Gmail (Agent 3 Email Helper)
    // 5. Create suggestions in Firestore
  });
```

### **Agent 4: REPORTING**
```javascript
exports.updateDashboard = functions.firestore
  .document('tenders/{tenderId}')
  .onWrite(async (change, context) => {
    const tender = change.after.data();
    
    // Calculate priority based on deadline
    const deadline = tender.deadline.toDate();
    const today = new Date();
    const daysLeft = Math.floor((deadline - today) / (1000*60*60*24));
    
    let priority = 'green';
    if (daysLeft <= 3) priority = 'red';
    else if (daysLeft <= 7) priority = 'orange';
    
    // Update in database
    await db.collection('tenders').doc(context.params.tenderId)
      .update({ priority });
  });
```

### **Agent 5: SECRETARY**
```javascript
exports.generateDocuments = functions.https.onCall(async (data, context) => {
  const { tenderId, action } = data;
  const tender = await db.collection('tenders').doc(tenderId).get();
  
  if (action === 'generate_pdf') {
    // Generate PDF briefing using PDFKit
  }
  if (action === 'create_email_templates') {
    // Generate email templates
  }
  if (action === 'prepare_excel') {
    // Create Excel quote tracking
  }
  
  return { status: 'success' };
});
```

---

## 🎨 DASHBOARD INTERFACE (React)

### **Page 1: Reporting Dashboard**
```jsx
<Dashboard>
  <div className="dashboard-header">
    <h1>Tender Pipeline</h1>
    <div className="stats">
      <Stat label="Active" value={12} />
      <Stat label="Urgent (Red)" value={3} />
      <Stat label="Medium (Orange)" value={5} />
      <Stat label="Planning (Green)" value={4} />
    </div>
  </div>
  
  <div className="tender-list">
    {/* RED SECTION */}
    <TenderGroup priority="red" label="🔴 URGENT - Due within 3 days">
      {redTenders.map(tender => (
        <TenderCard key={tender.id} tender={tender} />
      ))}
    </TenderGroup>
    
    {/* ORANGE SECTION */}
    <TenderGroup priority="orange" label="🟠 MEDIUM - Due within 7 days">
      {orangeTenders.map(tender => (
        <TenderCard key={tender.id} tender={tender} />
      ))}
    </TenderGroup>
    
    {/* GREEN SECTION */}
    <TenderGroup priority="green" label="🟢 PLANNING - Due in 8+ days">
      {greenTenders.map(tender => (
        <TenderCard key={tender.id} tender={tender} />
      ))}
    </TenderGroup>
  </div>
</Dashboard>
```

### **Page 2: Tender Detail**
```jsx
<TenderDetail tenderId={id}>
  <TenderHeader />
  <TabBar>
    <Tab label="Overview" content={<Overview />} />
    <Tab label="Items" content={<ItemsList />} />
    <Tab label="Sourcing" content={<SourcingForm />} />
    <Tab label="Quotes" content={<QuotesList />} />
    <Tab label="Documents" content={<DocumentsList />} />
    <Tab label="Follow-ups" content={<FollowUpsList />} />
  </TabBar>
</TenderDetail>
```

### **Page 3: Sourcing Form (Your Master Sheet)**
```jsx
<SourcingForm tenderId={id}>
  <div className="form-header">
    <h2>RFQ Template: {tender.title}</h2>
    <p>Pre-filled suggestions from Agent 3 - Customize as needed</p>
  </div>
  
  <div className="items-section">
    {items.map((item, idx) => (
      <ItemRow key={idx}>
        <input name="description" defaultValue={item.suggestion} />
        <input name="quantity" defaultValue={item.qty} />
        <input name="unit_price" />
        <input name="total" formula="quantity * unit_price" />
      </ItemRow>
    ))}
  </div>
  
  <div className="totals">
    <h3>Total: ${calculateTotal()}</h3>
  </div>
  
  <div className="actions">
    <button onClick={saveAsDraft}>Save Draft</button>
    <button onClick={exportToSheet}>Export to Google Sheet</button>
    <button onClick={sendToSuppliers}>Send to Suppliers</button>
  </div>
</SourcingForm>
```

---

## 🚀 SETUP STEPS (FOR YOU - RIGHT NOW)

### **Step 1: Firebase Project (5 min)**

1. Go to https://firebase.google.com
2. Click "Go to console"
3. Create new project:
   - Name: "Muka Tenders"
   - Analytics: Yes
4. Click "Create project"
5. Wait for creation

### **Step 2: Enable Services**

In Firebase Console:

```
1. Firestore Database
   - Click "Create Database"
   - Location: us-central1
   - Security Rules: Production (we'll update)

2. Authentication
   - Click "Get started"
   - Enable: Google
   - Add domain: mukatrade.com

3. Cloud Functions
   - Already available in console

4. Storage
   - Click "Get started"
   - Location: us-central1

5. Hosting
   - Click "Get started"
```

### **Step 3: Google Workspace OAuth Setup**

In Google Cloud Console:

```
1. Go to https://console.cloud.google.com
2. Select your Firebase project
3. APIs & Services → Credentials
4. Create OAuth 2.0 ID:
   - Application type: Web
   - Authorized redirect URIs:
     - http://localhost:3000/callback
     - https://mukatrade.com/callback
     - https://mukatrade.com/dashboard
5. Copy Client ID and Secret
```

### **Step 4: Security Rules**

```javascript
// Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only see their own tenders OR tenders assigned to them
    match /tenders/{document=**} {
      allow read: if request.auth.token.email.endsWith('@mukatrade.com') &&
                     (resource.data.visibility == 'public' || 
                      resource.data.assigned_to == request.auth.token.email);
      allow write: if request.auth.token.email == 'info@mukatrade.com';
    }
    
    // Read-only for employees
    match /tenders/{tenderId}/{document=**} {
      allow read: if request.auth.token.email.endsWith('@mukatrade.com');
      allow write: if request.auth.token.email == 'info@mukatrade.com';
    }
  }
}
```

---

## 📋 REQUIREMENTS CHECKLIST

**You need to provide:**

1. [ ] Firebase project created
2. [ ] Firebase Console URL link
3. [ ] Confirm: Can Agent 3 scan Gmail for suppliers?
4. [ ] Confirm: Which Google Workspace accounts are "@mukatrade.com"?
5. [ ] Confirm: Ready to start building?

---

## ⏱️ TIMELINE

**TODAY:**
- [ ] You: Set up Firebase (15 min)
- [ ] Me: Build backend + frontend (6-8 hours)
- [ ] Me: Deploy Agent 1 (SCRAPER)
- [ ] Testing

**TOMORROW:**
- [ ] Deploy Agents 2-5
- [ ] End-to-end testing
- [ ] Deploy to mukatrade.com

**THIS WEEK:**
- [ ] Live launch
- [ ] Employee training
- [ ] Monitoring

---

## 🎯 WHAT I'LL BUILD (Once you set up Firebase)

✅ React dashboard with Google OAuth  
✅ Firestore collections and structure  
✅ Cloud Functions for all agents  
✅ Real-time updates  
✅ Color-coded priority system  
✅ Sourcing form (from your Master sheet)  
✅ Quote tracking  
✅ Document management  
✅ Email notifications  
✅ Deployment to Firebase Hosting  

---

## 🚦 NEXT: YOUR ACTION ITEMS

**RIGHT NOW:**
1. Create Firebase project (15 min)
2. Enable services (as listed above)
3. Share Firebase Console URL with me
4. Confirm Gmail access for Agent 3

**Then:** I'll start building immediately!

---

**READY TO LAUNCH THIS WEEK? LET'S DO IT!** 🚀

Send me:
1. Firebase Console link
2. Confirmation on the plan above
3. Gmail access approval for Agent 3

Then I'll start coding NOW!
