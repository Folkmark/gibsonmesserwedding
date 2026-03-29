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

  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_RESPONSES);
  var data  = sheet.getDataRange().getValues();

  // Delete existing rows for this household (bottom-up to avoid index shift)
  // Column C (index 2) is household_id
  for (var i = data.length - 1; i >= 1; i--) {
    if (String(data[i][2]) === String(payload.household_id)) {
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
