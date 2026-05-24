import type React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  wide = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={`max-h-[90vh] overflow-y-auto border-white/10 bg-[#100d0a] text-white shadow-2xl ${wide ? "sm:max-w-4xl" : "sm:max-w-2xl"}`}
      >
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-white">{title}</DialogTitle>
          {description ? <DialogDescription className="text-[#f6ead0]/60">{description}</DialogDescription> : null}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
}
