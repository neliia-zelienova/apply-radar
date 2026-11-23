/**
 * What a form's `onSave` returns: nothing / true when saved, `false` when the
 * save failed (the form then stays open and keeps the draft). May be async.
 */
export type SaveResult = void | boolean | Promise<void | boolean>;
