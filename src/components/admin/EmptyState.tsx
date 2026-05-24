import type { LucideIcon } from "lucide-react";
import { Gem } from "lucide-react";

export function EmptyState({
  title,
  description,
  icon: Icon = Gem,
}: {
  title: string;
  description: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#d7b46a]/10 text-[#f4d58d]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-[#f6ead0]/60">{description}</p>
    </div>
  );
}
