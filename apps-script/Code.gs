/**
 * Code.gs — Gibson–Messer Wedding RSVP
 * Entry point for the Google Apps Script web app.
 *
 * Deploy as: Execute as "Me", Access "Anyone (even anonymous)"
 * After deploying, copy the deployment URL into rsvp/rsvp.js (GAS_ENDPOINT).
 */

/**
 * doGet — health check / preflight fallback.
 * GAS does not support true CORS OPTIONS requests, but returning JSON from
 * doGet satisfies any in-browser health checks.
 */
function doGet(e) {
  return buildResponse({ status: 'ok' });
}

/**
 * doPost — main dispatch.
 * Frontend sends: { action: 'lookup'|'submit', name?, payload? }
 *
 * CORS note: the frontend sends without a Content-Type header to avoid a
 * preflight request. GAS reads the raw body via e.postData.contents
 * regardless of content type, so this works correctly.
 */
function doPost(e) {
  try {
    var body   = JSON.parse(e.postData.contents);
    var action = body.action;
    var result;

    if (action === 'lookup') {
      result = findHousehold(body.name);
    } else if (action === 'submit') {
      result = upsertResponse(body.payload);
    } else {
      result = { error: 'unknown_action' };
    }

    return buildResponse(result);

  } catch (err) {
    return buildResponse({ error: 'server_error', message: err.message });
  }
}

/**
 * Wrap data as JSON ContentService output.
 */
function buildResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
