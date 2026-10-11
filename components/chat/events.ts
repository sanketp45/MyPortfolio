// Window events that let the mobile nav pill drive the chat widget without
// the two components sharing state or a context provider.

/** Fired by anything that wants to open/close the chat. detail.opener is the
 *  element focus should return to when the panel closes. */
export const CHAT_TOGGLE_EVENT = "sanket-chat:toggle";

/** Fired by ChatWidget whenever the panel opens or closes; detail.open. */
export const CHAT_STATE_EVENT = "sanket-chat:state";
