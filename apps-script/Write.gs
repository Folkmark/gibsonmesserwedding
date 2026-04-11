/**
 * Write.gs — Gibson–Messer Wedding RSVP
 * Writes (or overwrites) RSVP responses to the Responses sheet.
 * One row is written per guest in the household.
 * Re-submission is supported: existing rows for the household are deleted first.
 */

/**
 * @param {Object} payload
 *   { household_id, submitted_by_name, guests: [...], dietary_notes, notes }
 * @returns {{ success: boolean, response_id: string }}
 */
function upsertResponse(payload) {
  validatePayload(payload);

  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  // Verify each guest_id belongs to the claimed household
  var guestSheet = ss.getSheetByName(SHEET_GUESTS);
  var guestData  = guestSheet.getDataRange().getValues();
  var gHeaders   = guestData[0];
  var gCol       = {};
  gHeaders.forEach(function (h, i) { gCol[String(h).trim()] = i; });

  var validGuestIds = {};
  guestData.slice(1).forEach(function (row) {
    if (String(row[gCol['household_id']]) === String(payload.household_id)) {
      validGuestIds[String(row[gCol['guest_id']])] = true;
    }
  });

  payload.guests.forEach(function (g, idx) {
    if (!validGuestIds[String(g.guest_id)]) {
      throw new Error('guest[' + idx + '] does not belong to household');
    }
  });

  var sheet = ss.getSheetByName(SHEET_RESPONSES);
  var data  = sheet.getDataRange().getValues();

  // Build column index from header row for robust lookup
  var headers = data[0];
  var rCol    = {};
  headers.forEach(function (h, i) { rCol[String(h).trim()] = i; });

  var householdColIdx = rCol['household_id'];

  // Delete existing rows for this household (bottom-up to avoid index shift)
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][householdColIdx]) === String(payload.household_id)) {
      sheet.deleteRow(i + 1); // Sheets rows are 1-indexed
    }
  }

  var responseId  = Utilities.getUuid();
  var submittedAt = new Date().toISOString();

  payload.guests.forEach(function (guest) {
    sheet.appendRow([
      responseId,
      submittedAt,
      payload.household_id,
      guest.guest_id,
      guest.display_name,
      guest.attending_saturday,
      guest.attending_friday_cruise,
      guest.attending_friday_party,
      payload.dietary_notes  || '',
      payload.notes          || '',
      payload.submitted_by_name || '',
    ]);
  });

  return { success: true, response_id: responseId };
}
