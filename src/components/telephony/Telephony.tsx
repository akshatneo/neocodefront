"use client";

import { useEffect, useMemo, useState } from "react";
import { configs } from "../../../configs";
import Badge from "../ui/badge/Badge";

type CallRecord = {
  id: number;
  sourceNumber: string | null;
  destinationNumber: string | null;
  phoneNumber: string | null;
  status: string | null;
  recordingUrl: string | null;
  callTime: string | null;
  createdAt: string;
  updatedAt: string;
};

type CallsApiResponse = {
  success: boolean;
  data?: {
    calls?: CallRecord[];
    total?: number;
    phoneNumber?: string;
  };
};

const FETCH_DEBOUNCE_MS = 350;
const DEFAULT_LIMIT = 50;

function formatCallTime(value: string | null) {
  if (!value) return "Unknown";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getDisplayPhoneNumber(call: CallRecord) {
  return call.destinationNumber || call.phoneNumber || call.sourceNumber || "Unknown";
}

function getBadgeColor(status: string | null) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "answered") return "success" as const;
  if (normalized === "missed") return "error" as const;
  if (normalized === "busy" || normalized === "queued") return "warning" as const;
  return "light" as const;
}

export default function TelephonyComponent() {
  const [searchValue, setSearchValue] = useState("");
  const [calls, setCalls] = useState<CallRecord[]>([]);
  const [totalCalls, setTotalCalls] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          limit: String(DEFAULT_LIMIT),
        });

        const trimmed = searchValue.trim();
        if (trimmed) {
          params.set("phoneNumber", trimmed);
        }

        const response = await fetch(
          `${configs.NEO_HOST}${configs.TELEPHONY_CALLS_PATH}?${params.toString()}`,
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch calls");
        }

        const payload: CallsApiResponse = await response.json();

        setCalls(payload.data?.calls || []);
        setTotalCalls(payload.data?.total || 0);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Telephony fetch failed", err);
        setCalls([]);
        setTotalCalls(0);
        setError("Unable to load call history right now.");
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, FETCH_DEBOUNCE_MS);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [searchValue]);

  const answeredCount = useMemo(
    () => calls.filter((call) => String(call.status || "").toLowerCase() === "answered").length,
    [calls],
  );

  const missedCount = useMemo(
    () => calls.filter((call) => String(call.status || "").toLowerCase() === "missed").length,
    [calls],
  );

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white/90">
              Call History
            </h3>
            <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
              Recent telephony calls, recordings, and call outcomes.
            </p>
          </div>

          <div className="w-full max-w-md">
            <label
              htmlFor="telephony-search"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Search by phone number
            </label>

            <div className="relative">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-gray-400 dark:text-gray-500">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>

              <input
                id="telephony-search"
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Enter a phone number"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Total Calls
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {totalCalls}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Answered
            </p>
            <p className="mt-2 text-2xl font-semibold text-success-600 dark:text-success-500">
              {answeredCount}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-theme-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Missed
            </p>
            <p className="mt-2 text-2xl font-semibold text-error-600 dark:text-error-500">
              {missedCount}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-white/[0.05] sm:px-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Calls
            </h4>
            <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
              Latest {calls.length} result{calls.length === 1 ? "" : "s"} from the backend.
            </p>
          </div>

          {isLoading && (
            <span className="text-theme-sm text-brand-500 dark:text-brand-400">
              Loading...
            </span>
          )}
        </div>

        {error && (
          <div className="border-b border-gray-100 bg-error-50 px-5 py-3 text-sm text-error-600 dark:border-white/[0.05] dark:bg-error-500/10 dark:text-error-400 sm:px-6">
            {error}
          </div>
        )}

        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="text-theme-xs px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Phone Number
                </th>
                <th className="text-theme-xs px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Recording
                </th>
                <th className="text-theme-xs px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Time Of Call
                </th>
                <th className="text-theme-xs px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {isLoading &&
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-5 py-4">
                      <div className="h-4 w-36 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-4 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    </td>
                    <td className="px-5 py-4">
                      <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
                    </td>
                  </tr>
                ))}

              {!isLoading && calls.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No calls found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                calls.map((call) => (
                  <tr key={call.id}>
                    <td className="px-5 py-4">
                      <div>
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {getDisplayPhoneNumber(call)}
                        </span>
                        <span className="text-theme-xs mt-1 block text-gray-500 dark:text-gray-400">
                          Source: {call.sourceNumber || "Unknown"}
                        </span>
                      </div>
                    </td>

                    <td className="text-theme-sm px-5 py-4 text-gray-500 dark:text-gray-400">
                      {call.recordingUrl ? (
                        <a
                          href={call.recordingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
                        >
                          Open recording
                        </a>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">
                          Not available
                        </span>
                      )}
                    </td>

                    <td className="text-theme-sm px-5 py-4 text-gray-500 dark:text-gray-400">
                      {formatCallTime(call.callTime || call.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <Badge size="sm" color={getBadgeColor(call.status)}>
                        {call.status || "Unknown"}
                      </Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}