import { useState, useEffect, type FormEvent } from 'react';
import type { Lead, CreateLeadPayload, UpdateLeadPayload, LeadStatus, LeadSource } from '../../types';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

interface LeadFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLeadPayload | UpdateLeadPayload) => Promise<void>;
  lead?: Lead | null;
  isSubmitting: boolean;
}

const statusOptions = [
  { value: 'New', label: 'New' },
  { value: 'Contacted', label: 'Contacted' },
  { value: 'Qualified', label: 'Qualified' },
  { value: 'Lost', label: 'Lost' },
];

const sourceOptions = [
  { value: 'Website', label: 'Website' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'Referral', label: 'Referral' },
];

const LeadFormModal = ({
  isOpen,
  onClose,
  onSubmit,
  lead,
  isSubmitting,
}: LeadFormModalProps) => {
  const isEditing = !!lead;
  const [name, setName] = useState(lead?.name || '');
  const [email, setEmail] = useState(lead?.email || '');
  const [status, setStatus] = useState<LeadStatus>(lead?.status || 'New');
  const [source, setSource] = useState<LeadSource>(lead?.source || 'Website');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when lead changes
  useEffect(() => {
    setName(lead?.name || '');
    setEmail(lead?.email || '');
    setStatus(lead?.status || 'New');
    setSource(lead?.source || 'Website');
    setErrors({});
  }, [lead, isOpen]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    else if (name.trim().length < 2) newErrors.name = 'Name must be at least 2 characters';
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({ name: name.trim(), email: email.trim(), status, source });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Edit Lead' : 'Add New Lead'}>
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Input
          label="Name"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Input
          label="Email"
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />
        <Select
          label="Status"
          value={status}
          onChange={(e) => setStatus(e.target.value as LeadStatus)}
          options={statusOptions}
        />
        <Select
          label="Source"
          value={source}
          onChange={(e) => setSource(e.target.value as LeadSource)}
          options={sourceOptions}
        />
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t border-slate-200 dark:border-white/10">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            {isEditing ? 'Update Lead' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default LeadFormModal;
