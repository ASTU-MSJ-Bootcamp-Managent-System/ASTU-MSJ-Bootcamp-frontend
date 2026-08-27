import { Button } from "./ui";
export function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-emerald-950/45 p-4">
      <section className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex justify-between">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} className="text-2xl text-stone-400">
            ×
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
export function Confirm({ text, onClose, onConfirm }) {
  return (
    <Modal title="Please confirm" onClose={onClose}>
      <p className="text-sm text-stone-500">{text}</p>
      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="rounded-lg border px-4 py-2">
          Cancel
        </button>
        <Button className="bg-rose-700" onClick={onConfirm}>
          Confirm
        </Button>
      </div>
    </Modal>
  );
}
