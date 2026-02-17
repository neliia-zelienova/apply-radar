import { Calendar, Clock, Edit, Link, MapPin, X } from "lucide-react";
import type { Interview } from "../../types/applications";

interface InterviewCardProps {
  interview: Interview;
  handleEdit: (id: string) => void;
  handleDelete: (id: string) => void;
}

export const InterviewCard = ({
  interview,
  handleEdit,
  handleDelete,
}: InterviewCardProps) => {
  const isUpcoming = new Date(interview.date).getTime() >= Date.now();

  const formatRelative = (dateStr: string) => {
    const target = new Date(dateStr).getTime();
    const now = Date.now();
    const diff = target - now;
    const abs = Math.abs(diff);
    const minutes = Math.round(abs / 60000);
    const hours = Math.round(abs / 3600000);
    const days = Math.round(abs / 86400000);
    if (minutes < 60)
      return diff >= 0 ? `in ${minutes} min` : `${minutes} min ago`;
    if (hours < 24) return diff >= 0 ? `in ${hours} h` : `${hours} h ago`;
    return diff >= 0 ? `in ${days} d` : `${days} d ago`;
  };

  // Heuristics to detect and validate URLs for interview location/link
  const isProbablyUrl = (value: string) => {
    const v = value.trim();
    if (!v) return false;
    return /^(https?:\/\/)/.test(v) || /\.[a-z]{2,}$/i.test(v) || /\//.test(v);
  };
  const ensureHref = (value: string) => {
    const v = value.trim();
    if (/^(https?:\/\/)/.test(v)) return v;
    // If it looks like a URL but lacks protocol, default to https
    return isProbablyUrl(v) ? `https://${v}` : v;
  };

  return (
    <li
      key={interview.id}
      className="flex flex-col relative gap-1 p-3 rounded-lg border border-teal-400 dark:border-gray-100/20 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-1 h-full bg-neutral-800/30 dark:bg-teal-500/30"></div>
      <div className="flex flex-col gap-2 items-start">
        <div className="text-base flex items-center gap-2">
          {interview.name ? `${interview.name}` : ""}
          <span
            className={`text-xs border-2 px-1 rounded-md ${
              isUpcoming
                ? "border-teal-500 text-teal-500"
                : "border-gray-200 text-gray-100"
            }`}
          >
            {isUpcoming ? "UPCOMING" : "PAST"}
          </span>
        </div>
        <div className="text-sm flex items-start gap-2 text-sm font-roboto">
          <Calendar className="inline-block h-4 w-4 mr-1 text-gray-400" />
          {new Date(interview.date).toLocaleString()}
        </div>
        <div className="flex items-center gap-2 text-sm font-roboto">
          <Clock className="inline-block h-4 w-4 mr-1 text-gray-400" />
          {formatRelative(interview.date)}
        </div>
        {interview.locationLink &&
          (isProbablyUrl(interview.locationLink) ? (
            <div className="flex items-start gap-2">
              <Link className="inline-block h-4 w-4 mr-1 text-gray-400" />
              <a
                href={ensureHref(interview.locationLink)}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-teal-500 hover:underline"
              >
                {interview.locationLink}
              </a>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              <MapPin className="inline-block h-4 w-4 mr-1 text-gray-400" />
              <span className="text-xs text-gray-600 dark:text-gray-300">
                {interview.locationLink}
              </span>
            </div>
          ))}
        {interview.notes && (
          <span className="text-xs text-gray-500 text-left w-full">
            {interview.notes}
          </span>
        )}
      </div>
      <div className="w-full flex flex-row justify-end gap-2 mt-1 transition-opacity duration-150 ease-in-out">
        <button
          className="text-xs text-gray-500 hover:text-teal-600 flex items-center gap-1"
          onClick={() => handleEdit(interview.id)}
        >
          <Edit className="h-3 w-3" /> Edit
        </button>
        <button
          className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1"
          onClick={() => handleDelete(interview.id)}
        >
          <X className="h-3 w-3" /> Delete
        </button>
      </div>
    </li>
  );
};
