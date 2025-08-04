import React from 'react';
import { Button } from './button'; // Adjust import based on your button component
import { Portal } from '@radix-ui/react-portal';

const ConfirmationDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel
}) => {
  if (!open) return null;

  return (
    <Portal>
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        onClick={() => onOpenChange(false)} // Close dialog when clicking outside
      >
        <div
          className="bg-white rounded-lg p-6 shadow-lg w-96"
          onClick={(e) => e.stopPropagation()} // Prevent click propagation to backdrop
        >
          <h2 className="text-xl font-semibold">{title}</h2>
          <p className="my-4">{description}</p>
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="danger" onClick={onConfirm}>
              Confirm
            </Button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ConfirmationDialog;
