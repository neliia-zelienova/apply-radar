import { useState } from "react";
import { Trash2 } from "lucide-react";
import type { Application, Interview } from "@apply-radar/shared";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  InterviewForm,
} from "@apply-radar/ui";
import type { UpdateApplication } from "./interviews";

/**
 * Add / edit / delete interviews of one application. Render `dialogs` once;
 * call the openers from buttons. Every write works on the store's current
 * copy (`prev.interviews`), since the API replaces the whole list it's sent.
 */
export const useInterviewEditor = (app: Application, onUpdate: UpdateApplication) => {
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const close = () => {
    setFormOpen(false);
    setEditId(null);
  };

  const save = async (interview: Interview) => {
    const saved = await onUpdate(app.id, (prev) => {
      const list = prev.interviews ?? [];
      const exists = list.some((i) => i.id === interview.id);
      return {
        ...prev,
        interviews: exists
          ? list.map((i) => (i.id === interview.id ? interview : i))
          : [...list, interview],
      };
    });
    if (!saved) return false;
    close();
  };

  const remove = () => {
    const id = deleteId;
    setDeleteId(null);
    if (!id) return;
    void onUpdate(app.id, (prev) => ({
      ...prev,
      interviews: (prev.interviews ?? []).filter((i) => i.id !== id),
    }));
  };

  const dialogs = (
    <>
      {/* Mounted only while open, so each opens fresh (new, or the interview being edited). */}
      {formOpen && (
        <InterviewForm
          externalOpen
          initialInterview={editId ? app.interviews?.find((i) => i.id === editId) : undefined}
          onSave={save}
          onCancel={close}
        />
      )}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader icon={<Trash2 size={18} />} tone="danger">
            <AlertDialogTitle>Delete interview?</AlertDialogTitle>
            <AlertDialogDescription>This can't be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel asChild>
              <Button variant="secondary" size="sm">
                Cancel
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button variant="danger" size="sm" onClick={remove}>
                Delete
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );

  return {
    addInterview: () => {
      setEditId(null);
      setFormOpen(true);
    },
    editInterview: (id: string) => {
      setEditId(id);
      setFormOpen(true);
    },
    deleteInterview: (id: string) => setDeleteId(id),
    dialogs,
  };
};
