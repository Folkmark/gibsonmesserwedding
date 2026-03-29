/**
 * Validate.gs — Gibson–Messer Wedding RSVP
 * Server-side payload validation.
 * Throws an Error with a descriptive message on any invalid input.
 */

function validatePayload(payload) {
  if (!payload)                              throw new Error('missing payload');
  if (!payload.household_id)                 throw new Error('missing household_id');
  if (!Array.isArray(payload.guests) || payload.guests.length === 0) {
    throw new Error('guests array missing or empty');
  }

  var valid = ['yes', 'no', 'not_invited'];

  payload.guests.forEach(function (g, idx) {
    if (!g.guest_id)    throw new Error('guest[' + idx + '] missing guest_id');
    if (valid.indexOf(g.attending_saturday)       < 0) throw new Error('guest[' + idx + '] invalid attending_saturday');
    if (valid.indexOf(g.attending_friday_cruise)  < 0) throw new Error('guest[' + idx + '] invalid attending_friday_cruise');
    if (valid.indexOf(g.attending_friday_party)   < 0) throw new Error('guest[' + idx + '] invalid attending_friday_party');
  });
}
