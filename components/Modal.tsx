import React from "react";
import { Button } from "@/components/ui/button";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-zinc-950 p-6 rounded-lg max-w-md w-full shadow-lg relative">
        <Button
          onClick={onClose}
          className="absolute top-2 right-2 text-zinc-400 hover:text-zinc-200 w-[36px] bg-red-900 hover:bg-red-800"
        >
          ✕
        </Button>
        {children}
      </div>
    </div>
  );
};
