/* ---------------------------------------------------------------------------
   The one place the salon's WhatsApp contact is configured.

   To change the number, edit WHATSAPP_NUMBER below and nothing else.
   Format: international dialling code first, digits only — no '+', no spaces,
   no dashes or brackets. That is what wa.me requires; anything else silently
   resolves to WhatsApp's "invalid number" page rather than raising an error.

   Italy example: +39 0185 123456  ->  '390185123456'
--------------------------------------------------------------------------- */
export const WHATSAPP_NUMBER = '390000000000'; // PLACEHOLDER — replace

/** Prefilled into the chat. WhatsApp shows it as a draft the visitor can edit. */
export const WHATSAPP_MESSAGE = 'Ciao, vorrei prenotare un appuntamento.';

export const whatsappHref =
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
