// Exact link allowlist. Never render model-supplied HTML or arbitrary URLs.
export const VERIFIED_LINKS = Object.freeze({
  'https://www.jotform.com/262954506255058':'Request a business review',
  'https://inboxedgeagency.com/forms/':'Preparation forms',
  'https://calendar.google.com/calendar/u/0/appointments/schedules/AcZssZ36XgbTOIiL19F4vxOlDXK5-YOFHp4iMMaWG3KBht_XL6MU38wI_tvIcX-62Ot0tDEwUt_tSgOf?gv=true':'Book a 30-minute consultation',
});
export function validatedAnswer(data) {
  if (!data || data.tenant !== 'inboxedge' || typeof data.message !== 'string' || !data.message.trim() || data.message.length > 2000 || !Array.isArray(data.actionsPerformed) || data.actionsPerformed.length) throw new Error('Unverified assistant response');
  const links = (Array.isArray(data.links) ? data.links : []).slice(0,3)
    .filter(link => typeof link?.url === 'string' && Object.hasOwn(VERIFIED_LINKS,link.url))
    .map(link => ({url:link.url,label:VERIFIED_LINKS[link.url]}));
  return {message:data.message,links};
}
export function failureMessage(status) {
  return status === 429 ? 'The assistant has reached its request limit. Please try again later or contact InboxEdge below.'
    : status === 400 ? 'Your question could not be accepted. Use a short public business question without credentials or payment details.'
      : 'The assistant is temporarily unavailable. No action was performed. Please use the consultation link, business review form or contact details below.';
}
