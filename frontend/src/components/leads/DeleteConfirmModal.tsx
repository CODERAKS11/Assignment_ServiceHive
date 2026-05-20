import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  leadName: string;
  isDeleting: boolean;
}

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  leadName,
  isDeleting,
}: DeleteConfirmModalProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Lead" size="sm">
      <div className="text-center">
        <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </div>
        <p className="text-slate-700 dark:text-slate-300 mb-1">
          Are you sure you want to delete
        </p>
        <p className="font-semibold text-slate-900 dark:text-white mb-6">
          &ldquo;{leadName}&rdquo;?
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          This action cannot be undone.
        </p>
        <div className="flex justify-center gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
            Delete Lead
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
