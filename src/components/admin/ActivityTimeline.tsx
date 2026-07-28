import React from "react";
import { MessageSquare, Phone, Mail, GitCommitHorizontal } from "lucide-react";
import { relativeTime } from "@/lib/format";
import type { ActivityType } from "@/lib/crm";

export interface TimelineItem {
  id: string;
  type: string;
  body: string;
  createdAt: Date;
  author: { name: string } | null;
}

const icons: Record<ActivityType, React.ElementType> = {
  NOTE: MessageSquare,
  CALL: Phone,
  EMAIL: Mail,
  STATUS_CHANGE: GitCommitHorizontal,
};

export default function ActivityTimeline({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return <p className="text-sm text-neutral-500 py-4">No activity recorded yet.</p>;
  }

  return (
    <ol className="space-y-4">
      {items.map((item) => {
        const Icon = icons[item.type as ActivityType] ?? MessageSquare;
        const isSystem = item.type === "STATUS_CHANGE";
        return (
          <li key={item.id} className="flex gap-3">
            <div
              className={`shrink-0 w-8 h-8 rounded-full grid place-items-center ${
                isSystem ? "bg-neutral-100 text-neutral-500" : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className={`text-sm ${isSystem ? "text-neutral-600 italic" : "text-neutral-800"} whitespace-pre-wrap break-words`}>
                {item.body}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">
                {item.author?.name ?? "System"} · {relativeTime(item.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
