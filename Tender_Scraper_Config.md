# Tender Scraper Configuration Guide

## 📊 How to Use This Configuration

The daily tender scraper reads settings from a **Google Sheet** called **"Tender Scraper Config"** in your Google Drive. You can manage all settings directly in that sheet without any technical knowledge.

---

## 🔧 Configuration Sections

### **1. EXCLUDE KEYWORDS (Column A)**
Words/phrases that will **disqualify a tender** from the report.

**Default Keywords:**
- service
- fuel
- insurance

**How to Add More:**
- Simply type the keyword in Column A
- One keyword per row
- NOT case-sensitive

**Examples of exclude keywords:**
- consulting
- maintenance
- janitorial
- catering
- transportation

---

### **2. INCLUDE KEYWORDS (Column B)**
Words/phrases to **prioritize** in the report. Leave empty to include all non-excluded tenders.

**Default Keywords:**
- supply
- procurement
- equipment

**How to Add More:**
- Type keywords in Column B
- One keyword per row
- If this column is empty, ALL tenders (except excluded ones) will be reported
- If you add keywords here, ONLY tenders matching these keywords will be included

**Examples of include keywords:**
- equipment
- office
- furniture
- computers
- materials

---

### **3. REPORT SETTINGS (Column C)**

**Report Time:**
- Default: 9:00 AM
- Format: HH:MM (24-hour format)
- Example: 09:00, 14:30, 17:45

**Email Recipient:**
- Default: info@mukatrade.com
- Change if you want reports sent to a different email

**Include Empty Days:**
- Default: NO (only send emails when tenders found)
- Change to YES if you want daily confirmation emails even with no tenders

---

### **4. WEBSITE MANAGEMENT (Column D)**
List of tender websites being monitored.

The scraper automatically tracks which websites have been scraped and stores the results.

**How to Add/Remove Websites:**
- To disable a website: add "DISABLED" at the end
- Example: "https://br.usembassy.gov/procurement/ DISABLED"

---

## 📝 Sheet Structure

Your **"Tender Scraper Config"** Google Sheet should look like this:

```
EXCLUDE KEYWORDS | INCLUDE KEYWORDS | REPORT SETTINGS | STATUS
service          | supply           | Report Time     | Last Run
fuel             | procurement      | 09:00           | 2026-04-18 09:15 AM
insurance        | equipment        | Email           | Tenders Found: 3
                 |                  | info@mukatrade.com | Status: ✓
```

---

## 🎯 Real-World Examples

### **Example 1: Only Supply/Equipment Tenders**
```
EXCLUDE:
- service
- fuel
- insurance
- consulting

INCLUDE:
- supply
- equipment
- procurement
- materials
- furniture
```

### **Example 2: Focus on Specific Regions**
```
EXCLUDE:
- service
- fuel
- insurance

INCLUDE:
- saudi
- middle east
- gcc
```

### **Example 3: All Tenders (Except Services/Fuel/Insurance)**
```
EXCLUDE:
- service
- fuel
- insurance

INCLUDE:
(leave empty - includes everything)
```

---

## 📧 Email Report Format

Your daily reports will include:

```
SUBJECT: Daily Tender Report - [DATE]

Dear Yaron,

New tenders found today: 3

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Organization/Embassy: U.S. Embassy Riyadh
   Tender Number: RYD-2026-04521
   Title: Supply of Office Equipment and Furniture

2. Organization/Embassy: U.S. Consulate Mumbai
   Tender Number: MUM-2026-08834
   Title: Procurement of IT Hardware

3. Organization/Embassy: U.S. Embassy Jakarta
   Tender Number: JKT-2026-12456
   Title: Supply of Janitorial Materials

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Configuration Note:
You can customize keywords by editing the 
"Tender Scraper Config" sheet.

Next scheduled run: Tomorrow at 9:00 AM
```

---

## 🔄 How It Works

1. **9:00 AM Daily** - Scraper wakes up
2. **Reads Config** - Gets your exclude/include keywords from Google Sheet
3. **Scrapes Websites** - Checks all 120+ embassy procurement pages
4. **Filters Tenders** - Applies your keyword rules
5. **Identifies NEW** - Only reports tenders found since yesterday
6. **Sends Email** - Delivers report to info@mukatrade.com
7. **Logs Activity** - Updates the "Last Run" info in config sheet

---

## ⚡ Advanced Tips

### Keyword Matching Rules
- **Exclude keywords**: If ANY excluded keyword appears in tender title/description → REJECTED
- **Include keywords**: If empty → include all; if filled → ONLY include tenders with matching keywords
- Matching is NOT case-sensitive
- Partial matches count (e.g., "service" matches "consulting services")

### Best Practices
1. **Start Simple** - Begin with just service/fuel/insurance exclusions
2. **Adjust Gradually** - Add include keywords only when you have specific focus
3. **Test Keywords** - Monitor a few days of reports before locking in settings
4. **Review Monthly** - Update keywords based on what you find useful

### Common Keyword Combinations

**For General Supply Tenders:**
```
EXCLUDE: service, fuel, insurance, consulting, maintenance
INCLUDE: (empty)
```

**For Government Supplies:**
```
EXCLUDE: service, fuel, insurance, legal, construction
INCLUDE: supply, equipment, materials, office
```

**For Specific Equipment:**
```
EXCLUDE: service, fuel, insurance, general
INCLUDE: it, computer, technology, equipment, hardware
```

---

## ❓ FAQ

**Q: How often does the scraper run?**
A: Daily at 9:00 AM (you can change the time in the config)

**Q: What if I get too many tenders?**
A: Add more exclude keywords or specify include keywords for your target tenders

**Q: Can I pause the scraper?**
A: Yes - set all websites to "DISABLED" status

**Q: How far back does it search?**
A: Only NEW tenders since the last run (no duplicates)

**Q: What if a tender appears in multiple places?**
A: Only reported once (system prevents duplicates)

---

## 📞 Support

The scraper automatically logs all activity. Check the dashboard for:
- Last run time
- Number of tenders found
- Any errors or issues
- Configuration changes

Questions? Check the activity log in your Tender Scraper Dashboard.
