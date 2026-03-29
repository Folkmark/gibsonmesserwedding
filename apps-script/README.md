# RSVP Backend Setup

This folder contains the Google Apps Script files that power the RSVP form backend.
You need to set this up manually — it takes about 10 minutes.

---

## Step 1 — Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet.
2. Name it something like "Gibson–Messer RSVP".
3. Copy the spreadsheet ID from the URL — it's the long string between `/d/` and `/edit`.

### Tab 1: `Guests`

Rename the first sheet tab to `Guests` and add these column headers in row 1:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| guest_id | household_id | first_name | last_name | display_name | invited_saturday | invited_friday | household_label |

Fill in one row per guest. Example:

| guest_id | household_id | first_name | last_name | display_name | invited_saturday | invited_friday | household_label |
|---|---|---|---|---|---|---|---|
| G001 | H001 | Riley | Gibson | Riley Gibson | TRUE | TRUE | The Gibsons |
| G002 | H001 | Sam | Messer | Sam Messer | TRUE | TRUE | The Gibsons |
| G003 | H002 | Jane | Doe | Jane Doe | TRUE | FALSE | Jane Doe |

- `household_id` groups people on the same invitation.
- `household_label` is shown on the confirmation screen ("We'll see you in Amsterdam, The Gibsons").
- `invited_friday` = TRUE means this guest will see the Friday events step (canal cruise + welcome party).
- `invited_saturday` = TRUE for all ceremony/reception guests (almost everyone).

### Tab 2: `Responses`

Add a second sheet tab named `Responses` with these column headers in row 1:

| A | B | C | D | E | F | G | H | I | J | K |
|---|---|---|---|---|---|---|---|---|---|---|
| response_id | submitted_at | household_id | guest_id | display_name | attending_saturday | attending_friday_cruise | attending_friday_party | dietary_notes | additional_notes | submitted_by_name |

Leave the rest of this tab empty — the script will write rows here as guests RSVP.

---

## Step 2 — Create the Apps Script project

1. In your Google Sheet, go to **Extensions → Apps Script**.
2. Delete any existing code in `Code.gs`.
3. Create five script files and paste the contents from this folder:
   - `Code.gs` → paste `Code.gs`
   - `Lookup.gs` → paste `Lookup.gs`
   - `Write.gs` → paste `Write.gs`
   - `Validate.gs` → paste `Validate.gs`
   - `Config.gs` → paste `Config.gs`
4. In `Config.gs`, replace `REPLACE_WITH_YOUR_SPREADSHEET_ID` with your actual spreadsheet ID.
5. Save the project (Cmd/Ctrl + S).

---

## Step 3 — Deploy the web app

1. Click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set:
   - **Description**: RSVP v1
   - **Execute as**: Me
   - **Who has access**: Anyone (even anonymous)
4. Click **Deploy**.
5. Copy the **Web app URL** — it will look like:
   `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 4 — Connect the frontend

1. Open `rsvp/rsvp.js` in this project.
2. Find the line:
   ```
   const GAS_ENDPOINT = 'REPLACE_WITH_YOUR_DEPLOYMENT_URL';
   ```
3. Replace `REPLACE_WITH_YOUR_DEPLOYMENT_URL` with your web app URL from Step 3.
4. Save and push the change to GitHub Pages.

---

## Step 5 — Test it

Open the RSVP page on the live site, enter a guest name from your Guests sheet, and complete the flow.
Check the Responses tab in your Google Sheet — you should see a new row appear within a few seconds.

If you see errors in the browser console, the most common causes are:
- Wrong spreadsheet ID in Config.gs
- Script not deployed (or deployed but not redeployed after changes)
- Guest name not found (check for typos in the Guests sheet)

---

## Re-deploying after changes

If you edit any `.gs` file, you must create a **new deployment** (not update the existing one) for changes to take effect. Update the URL in `rsvp/rsvp.js` if it changes.

---

## Useful Sheets formulas

Paste these somewhere in the Responses tab to track headcount:

```
=COUNTIF(F:F,"yes")       — total attending Saturday
=COUNTIF(G:G,"yes")       — total attending canal cruise
=COUNTIF(H:H,"yes")       — total attending welcome party
```
