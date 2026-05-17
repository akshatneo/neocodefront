"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { configs } from "../../../configs";
import Badge from "../ui/badge/Badge";
import Button from "../ui/button/Button";
import page from "@/app/(admin)/(others-pages)/calendar/page";

// type CallRecord = {
//   id: number;
//   sourceNumber: string | null;
//   destinationNumber: string | null;
//   phoneNumber: string | null;
//   status: string | null;
//   recordingUrl: string | null;
//   callTime: string | null;
//   createdAt: string;
//   updatedAt: string;
// };

// type CallsApiResponse = {
//   success: boolean;
//   data?: {
//     calls?: CallRecord[];
//     total?: number;
//     phoneNumber?: string;
//   };
// };

const FETCH_DEBOUNCE_MS = 350;
const DEFAULT_LIMIT = 50;

// function formatCallTime(value: string | null) {
//   if (!value) return "Unknown";

//   const date = new Date(value);
//   if (Number.isNaN(date.getTime())) return value;

//   return new Intl.DateTimeFormat("en-IN", {
//     dateStyle: "medium",
//     timeStyle: "short",
//   }).format(date);
// }

// function getDisplayPhoneNumber(call: CallRecord) {
//   return call.destinationNumber || call.phoneNumber || call.sourceNumber || "Unknown";
// }

function getBadgeColor(status: string | null) {
  const normalized = String(status || "").toLowerCase();

  if (normalized === "answered") return "success" as const;
  if (normalized === "missed") return "error" as const;
  if (normalized === "busy" || normalized === "queued")
    return "warning" as const;
  return "light" as const;
}

export default function TelephonyComponent() {
  const abortControllerRef = useRef<AbortController | null>(null);

  // const [controller, setController] = useState(new AbortController());

  const [searchValue, setSearchValue] = useState("");
  const [calls, setCalls] = useState([]);

  const [pageIndex, setPageIndex] = useState(1);
  // const [pageDirection, setPageDirection] = useState("");

  const [totalCalls, setTotalCalls] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);
  const [totalMissed, setTotalMissed] = useState(0);

  const [isLoading, setIsLoading] = useState(true);

  const [nextCursor, setNextCursor] = useState(null);
  const [backCursor, setBackCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);

  const [error, setError] = useState<string | null>(null);

  async function loadCalls(direction = "") {
    abortControllerRef.current?.abort();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    console.log("Debug React State 1", {
      pageIndex,
      // pageDirection,
      nextCursor,
      backCursor,
      searchValue,
    });

    setIsLoading(true);
    setError(null);
    // setPageDirection(direction);

    // try {
    const params = new URLSearchParams({
      limit: String(DEFAULT_LIMIT),
    });

    const trimmed = searchValue.trim();
    if (trimmed) {
      params.set("phone", trimmed);
    }

    if (direction) {
      params.set("direction", direction);
    }

    try {
      let url = configs.NEO_HOST + configs.TELEPHONY_CALLS_PATH;

      if (direction == "backward") {
        params.set("anchor", String(backCursor));
      } else if (direction == "forward") {
        //forward
        params.set("anchor", String(nextCursor));
      }

      console.log(
        `Final URL being hit - ${url}?${params.toString()}, signal: ${controller.signal}`,
      );

      const response = await fetch(`${url}?${params.toString()}`, {
        credentials: "include",
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error("Failed to fetch calls");
      }

      // const payload = json.data;

      // setCalls((prev) =>
      //   cursor ? [...prev, ...payload.calls] : payload.calls
      // );
      // setNextCursor(payload.nextCursor);
      // setHasMore(payload.hasMore);

      const payload = await response.json();

      if (direction === "forward") {
        setPageIndex((pageIndex) => pageIndex + 1);
      } else if (direction === "backward") {
        setPageIndex((pageIndex) => Math.max(pageIndex - 1, 1));
      }

      setCalls(payload.data.calls || []);
      setTotalCalls(payload.data.totalCalls || 0);
      setTotalAnswered(payload.data.totalAnsweredCalls || 0);
      setTotalMissed(payload.data.totalMissedCalls || 0);

      var mostRecentCall;
      var oldestCall;

      if (payload.data.calls.length < DEFAULT_LIMIT) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (payload.data.calls.length > 0) {
        mostRecentCall = payload.data.calls[0]; //since backend is sending list in descending, the first call in the list is actually the most recent call
        setBackCursor(mostRecentCall.id);

        oldestCall = payload.data.calls[payload.data.calls.length - 1];
        setNextCursor(oldestCall.id);
      } else {
        setNextCursor(null);
        setBackCursor(null);
      }

      console.log("Debug React State 2 - Wannabe", {
        pageIndex: Math.max(pageIndex - 1, 1),
        // pageDirection,
        nextCursor: oldestCall ? oldestCall.id : null,
        backCursor: mostRecentCall ? mostRecentCall.id : null,
      });

      console.log("Debug React State 2", {
        pageIndex,
        // pageDirection,
        nextCursor,
        backCursor,
      });
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

    // finally {
    //   setIsLoading(false);
    // }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(async () => {
      await loadCalls();
    }, FETCH_DEBOUNCE_MS);

    return () => {
      abortControllerRef.current?.abort();
      window.clearTimeout(timeoutId);
    };
  }, []);

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

          <form
            onSubmit={(e) => {
              e.preventDefault();
              loadCalls();
            }}
            className="w-full max-w-md"
          >
            <label
              htmlFor="telephony-search"
              className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Search by phone number
            </label>

            <div className="flex items-center gap-3">
              <div className="relative flex-1">
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

              <Button className="h-11 min-w-[110px]">
                Search
              </Button>
            </div>
          </form>

          {/* <div className="w-full max-w-md">
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
                maxLength={10}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  if(e.target.value.length == 0) {
                    loadCalls();
                  } else if (e.target.value.length > 3){
                    loadCalls(); 
                  }
                }}
                placeholder="Enter a phone number"
                className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pr-4 pl-11 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30"
              />
            </div>
          </div> */}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Total Calls
            </p>
            <p className="mt-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              {totalCalls}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Answered
            </p>
            <p className="text-success-600 dark:text-success-500 mt-2 text-2xl font-semibold">
              {totalAnswered}
            </p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-800 dark:bg-gray-900/50">
            <p className="text-theme-xs font-medium tracking-wide text-gray-500 uppercase dark:text-gray-400">
              Missed
            </p>
            <p className="text-error-600 dark:text-error-500 mt-2 text-2xl font-semibold">
              {totalMissed}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6 dark:border-white/[0.05]">
          <div>
            <h4 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Recent Calls
            </h4>
            <p className="text-theme-sm mt-1 text-gray-500 dark:text-gray-400">
              Latest {calls.length} result{calls.length === 1 ? "" : "s"} from
              the backend.
            </p>
          </div>

          {isLoading && (
            <span className="text-theme-sm text-brand-500 dark:text-brand-400">
              Loading...
            </span>
          )}
        </div>

        {error && (
          <div className="bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400 border-b border-gray-100 px-5 py-3 text-sm sm:px-6 dark:border-white/[0.05]">
            {error}
          </div>
        )}

        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full">
            <thead className="border-b border-gray-100 dark:border-white/[0.05]">
              <tr>
                <th className="text-theme-xs px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Call ID
                </th>
                <th className="text-theme-xs px-5 py-3 text-left font-medium text-gray-500 dark:text-gray-400">
                  Customer Number
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
                    colSpan={5}
                    className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No calls found.
                  </td>
                </tr>
              )}

              {!isLoading &&
                calls.map((call) => (
                  <tr key={call["id"]}>
                    <td className="text-theme-sm px-5 py-4 text-gray-500 dark:text-gray-400">
                      {call["id"]}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <span className="text-theme-sm block font-medium text-gray-800 dark:text-white/90">
                          {call["CustomerNumber"]}
                        </span>
                        <span className="text-theme-xs mt-1 block text-gray-500 dark:text-gray-400">
                          Agent: {call["AgentName"] || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="text-theme-sm px-5 py-4 text-gray-500 dark:text-gray-400">
                      {call["RecordingURL"] ? (
                        <audio controls preload="none" className="h-10 w-64">
                          <source src={call["RecordingURL"]} />
                          Your browser does not support the audio element.
                        </audio>
                      ) : (
                        <span className="text-gray-400 dark:text-gray-500">
                          Not available
                        </span>
                      )}
                    </td>

                    <td className="text-theme-sm px-5 py-4 text-gray-500 dark:text-gray-400">
                      {call["StartTime"]}
                    </td>

                    <td className="px-5 py-4">
                      <Badge size="sm" color={getBadgeColor(call["Status"])}>
                        {call["Status"]}
                      </Badge>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          <div className="flex flex-col items-center justify-center gap-3 border-t border-gray-100 px-5 py-5 sm:px-6 dark:border-white/[0.05]">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {pageIndex}
            </p>

            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => loadCalls("backward")}
                disabled={pageIndex === 1 || isLoading}
                className="min-w-[120px]"
              >
                Previous
              </Button>

              <Button
                onClick={() => loadCalls("forward")}
                disabled={!hasMore || isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? "Loading..." : hasMore ? "Next" : "No More Calls"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
