/**
 * Lookup.gs — Gibson–Messer Wedding RSVP
 * Finds a household by guest name.
 */

/**
 * Given a raw name string from the form, search the Guests sheet and
 * return the full household if found.
 *
 * @param {string} rawName
 * @returns {{ found: boolean, household_id?: string, household_label?: string, members?: Array }}
 */
function findHousehold(rawName) {
  if (!rawName || typeof rawName !== 'string') {
    return { found: false };
  }

  var name  = rawName.trim().toLowerCase();
  var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_GUESTS);
  var data  = sheet.getDataRange().getValues();

  if (data.length < 2) return { found: false };

  // Build column index map from header row
  var headers = data[0];
  var col = {};
  headers.forEach(function (h, i) { col[String(h).trim()] = i; });

  // Match: does the entered text contain the guest's first or last name,
  // or does their display name contain the entered text?
  var rows = data.slice(1);
  var match = null;

  for (var i = 0; i < rows.length; i++) {
    var row     = rows[i];
    var first   = String(row[col['first_name']]   || '').toLowerCase();
    var last    = String(row[col['last_name']]    || '').toLowerCase();
    var display = String(row[col['display_name']] || '').toLowerCase();

    if (
      name.indexOf(first)   >= 0 ||
      name.indexOf(last)    >= 0 ||
      display.indexOf(name) >= 0 ||
      name.indexOf(display) >= 0
    ) {
      match = row;
      break;
    }
  }

  if (!match) return { found: false };

  var householdId = String(match[col['household_id']]);

  // Collect all members of the matched household
  var members = rows
    .filter(function (r) { return String(r[col['household_id']]) === householdId; })
    .map(function (r) {
      return {
        guest_id:        String(r[col['guest_id']]),
        display_name:    String(r[col['display_name']]),
        invited_saturday: Boolean(r[col['invited_saturday']]),
        invited_friday:   Boolean(r[col['invited_friday']]),
      };
    });

  return {
    found:           true,
    household_id:    householdId,
    household_label: String(match[col['household_label']] || ''),
    members:         members,
  };
}
