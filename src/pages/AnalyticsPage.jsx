import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/AnalyticsPage.css";
import { DATE_LOCALE } from "../styles/utils/dateFormat";

import {
  HiOutlineChartBar,
  HiOutlineVideoCamera,
  HiOutlineExclamationCircle,
  HiOutlinePlusCircle,
  HiOutlineArrowRight,
  HiOutlineClock,
  HiOutlineArrowDownTray,
  HiOutlineCalendarDays,
  HiOutlineDocumentText,
  HiOutlineExclamationTriangle,
  HiOutlineEye,
} from "react-icons/hi2";

const API_BASE_URL = "http://localhost:8081";
const DASHBOARD_SUMMARY_URL = `${API_BASE_URL}/api/dashboard/summary`;
const CANDIDATES_URL = `${API_BASE_URL}/api/candidates`;
const INTERVIEWS_URL = `${API_BASE_URL}/api/interviews`;

const MAX_VIDEO_CANDIDATES_TO_CHECK = 8;
const MAX_VIDEO_PREVIEWS = 4;
const RESPONSE_TREND_DAYS = 14;
const STALLED_DAYS_THRESHOLD = 3;

// Use the browser's local timezone for date calculations.
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

function getResponseList(candidate) {
  if (!candidate) return [];

  if (Array.isArray(candidate.responses)) {
    return candidate.responses;
  }

  if (Array.isArray(candidate.answerResponses)) {
    return candidate.answerResponses;
  }

  if (Array.isArray(candidate.interviewResponses)) {
    return candidate.interviewResponses;
  }

  return [];
}

function getQuestionType(response) {
  if (!response) return "";

  const possibleTypes = [
    response.questionType,
    response.answerType,
    response.type,
    response.answerMode,
    response.mode,
    response.question?.questionType,
    response.question?.answerType,
    response.question?.type,
  ];

  const type = possibleTypes.find(
    (value) =>
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
  );

  return String(type || "")
    .trim()
    .toUpperCase()
    .replace(/[\s-]+/g, "_");
}

function getRawVideoUrl(response) {
  if (!response) return "";

  const possibleUrls = [
    response.videoUrl,
    response.videoURL,
    response.videoPath,
    response.videoFile,
    response.videoFileUrl,
    response.fileUrl,
    response.fileURL,
    response.mediaUrl,
    response.mediaURL,
    response.video,
    response.url,
  ];

  const value = possibleUrls.find(
    (url) =>
      url !== null &&
      url !== undefined &&
      String(url).trim() !== ""
  );

  return value ? String(value).trim() : "";
}

function isVideoResponse(response) {
  const type = getQuestionType(response);

  if (
    type === "VIDEO" ||
    type === "VIDEO_RESPONSE" ||
    type === "VIDEO_ANSWER"
  ) {
    return true;
  }

  if (getRawVideoUrl(response)) {
    return true;
  }

  const answer = String(response?.answer || "").toLowerCase();

  return (
    answer.includes("video response") ||
    answer.includes("video recorded")
  );
}

function getVideoUrl(rawVideoUrl) {
  if (!rawVideoUrl) return "";

  let value = String(rawVideoUrl).trim();

  if (!value) return "";

  value = value.replace(/^["']|["']$/g, "");

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (value.startsWith("//")) {
    return `http:${value}`;
  }

  if (value.startsWith("/")) {
    return `${API_BASE_URL}${value}`;
  }

  return `${API_BASE_URL}/${value}`;
}

function getVideoMimeType(rawVideoUrl) {
  const value = String(rawVideoUrl || "").toLowerCase();

  if (value.includes(".mp4")) return "video/mp4";
  if (value.includes(".webm")) return "video/webm";
  if (value.includes(".ogg") || value.includes(".ogv")) {
    return "video/ogg";
  }
  if (value.includes(".mov")) return "video/quicktime";

  return "";
}

function findFirstVideoResponse(candidate) {
  const responses = getResponseList(candidate);

  for (const response of responses) {
    if (isVideoResponse(response)) {
      const rawVideoUrl = getRawVideoUrl(response);
      const videoUrl = getVideoUrl(rawVideoUrl);

      if (videoUrl) {
        return {
          rawVideoUrl,
          videoUrl,
          videoMimeType: getVideoMimeType(rawVideoUrl),
        };
      }
    }
  }

  return null;
}

/*
 * =========================================================
 * SMALL FORMAT HELPERS
 * =========================================================
 */

function getStatusClass(status) {
  return String(status || "unknown")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function formatDate(value) {
  if (!value) return "-";

  try {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(DATE_LOCALE, {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return String(value);
  }
}

// "YYYY-MM-DD" for a real instant, as seen in a given IANA timezone.
function dateKeyInTimeZone(date, timeZone) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      ...(timeZone ? { timeZone } : {}),
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

function shiftDateKey(key, days) {
  const [y, m, d] = key.split("-").map(Number);

  const date = new Date(Date.UTC(y, m - 1, d));

  date.setUTCDate(date.getUTCDate() + days);

  return date.toISOString().slice(0, 10);
}

// Single timestamp helper.
// submittedAtIso is preferred when available.
function timestampOf(candidate) {
  const value =
    candidate?.submittedAtIso ||
    candidate?.submittedAt ||
    candidate?.completedAt ||
    candidate?.createdAt;

  const time = value ? new Date(value).getTime() : NaN;

  return Number.isNaN(time) ? 0 : time;
}

/*
 * =========================================================
 * ANALYTICS PAGE
 * =========================================================
 */

function AnalyticsPage() {
  const [summary, setSummary] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [allInterviews, setAllInterviews] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [videoPreviews, setVideoPreviews] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [videoErrors, setVideoErrors] = useState({});

  const [responseFormatStats, setResponseFormatStats] = useState({
    video: 0,
    text: 0,
    other: 0,
    sampleSize: 0,
  });

  const [asOf, setAsOf] = useState(0);

  const loadVideoPreviews = async (candidateList) => {
    const candidatesWithSubmissions = candidateList
      .filter(
        (c) =>
          String(c.status || "").toLowerCase() !== "pending"
      )
      .sort((a, b) => timestampOf(b) - timestampOf(a))
      .slice(0, MAX_VIDEO_CANDIDATES_TO_CHECK);

    if (candidatesWithSubmissions.length === 0) {
      setVideoPreviews([]);

      setResponseFormatStats({
        video: 0,
        text: 0,
        other: 0,
        sampleSize: 0,
      });

      return;
    }

    setVideosLoading(true);

    try {
      const details = await Promise.all(
        candidatesWithSubmissions.map(async (candidate) => {
          try {
            const response = await fetch(
              `${API_BASE_URL}/api/candidates/${candidate.id}`,
              {
                method: "GET",
                credentials: "include",
                headers: {
                  Accept: "application/json",
                },
              }
            );

            if (!response.ok) return null;

            const data = await response.json();

            const responses = getResponseList(data);
            const video = findFirstVideoResponse(data);

            return {
              candidateId: candidate.id,
              name:
                data.name ||
                candidate.name ||
                "Unnamed Candidate",
              position:
                data.position ||
                data.jobTitle ||
                candidate.position ||
                "-",
              interview:
                data.interview ||
                data.interviewName ||
                data.interviewTitle ||
                candidate.interview ||
                "-",
              status: data.status || candidate.status,
              submittedAt:
                data.submittedAt ||
                data.completedAt ||
                candidate.submittedAt,
              submittedAtIso:
                data.submittedAtIso ||
                candidate.submittedAtIso,
              responses,
              video,
            };
          } catch (err) {
            console.error(
              `Error checking video for candidate ${candidate.id}:`,
              err
            );

            return null;
          }
        })
      );

      const validDetails = details.filter(Boolean);

      const formatCounts = {
        video: 0,
        text: 0,
        other: 0,
      };

      validDetails.forEach((detail) => {
        detail.responses.forEach((response) => {
          if (isVideoResponse(response)) {
            formatCounts.video += 1;
          } else if (
            String(response?.answer ?? "").trim() !== ""
          ) {
            formatCounts.text += 1;
          } else {
            formatCounts.other += 1;
          }
        });
      });

      setResponseFormatStats({
        ...formatCounts,
        sampleSize: validDetails.length,
      });

      const previews = validDetails
        .filter((detail) => detail.video)
        .map(
          ({
            candidateId,
            name,
            position,
            interview,
            status,
            submittedAt,
            submittedAtIso,
            video,
          }) => ({
            candidateId,
            name,
            position,
            interview,
            status,
            submittedAt,
            submittedAtIso,
            ...video,
          })
        );

      setVideoPreviews(
        previews.slice(0, MAX_VIDEO_PREVIEWS)
      );
    } finally {
      setVideosLoading(false);
    }
  };

  const handleVideoError = (candidateId) => {
    setVideoErrors((prev) => ({
      ...prev,
      [candidateId]: true,
    }));
  };

  const handleVideoLoaded = (candidateId) => {
    setVideoErrors((prev) => {
      if (!prev[candidateId]) return prev;

      const updated = { ...prev };

      delete updated[candidateId];

      return updated;
    });
  };

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");

    try {
      const [summaryRes, candidatesRes, interviewsRes] =
        await Promise.all([
          fetch(DASHBOARD_SUMMARY_URL, {
            method: "GET",
            credentials: "include",
          }),
          fetch(CANDIDATES_URL, {
            method: "GET",
            credentials: "include",
          }),
          fetch(INTERVIEWS_URL, {
            method: "GET",
            credentials: "include",
          }),
        ]);

      if (
        summaryRes.status === 401 ||
        candidatesRes.status === 401
      ) {
        throw new Error(
          "You are not logged in. Please log in again."
        );
      }

      if (!summaryRes.ok) {
        throw new Error(
          "Failed to load analytics data."
        );
      }

      const summaryData = await summaryRes.json();

      setSummary(summaryData);

      const candidatesData = candidatesRes.ok
        ? await candidatesRes.json()
        : [];

      const candidateList = Array.isArray(candidatesData)
        ? candidatesData
        : [];

      setCandidates(candidateList);
      setAsOf(Date.now());

      /*
       * The dashboard summary only returns a capped, "recent"
       * slice of interviews. For real analysis (role breakdown,
       * stalled-interview detection) we want the full, uncapped
       * list. If this fetch fails, we fall back to the capped
       * summary list further down rather than breaking the page.
       */
      if (interviewsRes.ok) {
        const interviewsData = await interviewsRes.json();

        setAllInterviews(
          Array.isArray(interviewsData)
            ? interviewsData
            : []
        );
      } else {
        setAllInterviews(null);
      }

      loadVideoPreviews(candidateList);
    } catch (err) {
      console.error(
        "Error loading analytics:",
        err
      );

      setError(
        err.message ||
          "Unable to load analytics right now."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*
   * =========================================================
   * DERIVED DATA
   * =========================================================
   */

  const stats = summary?.stats || {};
  const candidateOverview =
    summary?.candidateOverview || {};

  const attentionActions = useMemo(
    () => summary?.actionsRequiringAttention || [],
    [summary]
  );

  /*
   * candidateOverview.awaitingReview is unreliable — it has been seen
   * returning 0 while the backend's own actionsRequiringAttention feed
   * (type "CANDIDATES_AWAITING_REVIEW") reports the correct, non-zero
   * count for the same data. Prefer that action's count; fall back to
   * the candidateOverview field only if the action isn't present.
   */
  const awaitingReviewCount = useMemo(() => {
    const action = attentionActions.find(
      (a) => a.type === "CANDIDATES_AWAITING_REVIEW"
    );

    if (action && typeof action.count === "number") {
      return action.count;
    }

    return candidateOverview.awaitingReview ?? 0;
  }, [attentionActions, candidateOverview.awaitingReview]);

  const recentInterviews = useMemo(
    () => summary?.recentInterviews || [],
    [summary]
  );

  /*
   * Prefer the full, uncapped interview list for any real analysis.
   * It doesn't come with candidate counts attached (unlike the capped
   * summary list), so we compute them here the same way the backend
   * does: matching candidates to interviews by title. Falls back to
   * the capped summary list if that fetch failed.
   */
  const interviewsWithCounts = useMemo(() => {
    if (!Array.isArray(allInterviews)) {
      return recentInterviews;
    }

    return allInterviews.map((interview) => {
      const matched = candidates.filter(
        (c) => c.interview === interview.title
      );

      const responded = matched.filter(
        (c) =>
          String(c.status || "").toLowerCase() !==
          "pending"
      ).length;

      return {
        ...interview,
        candidateCount: matched.length,
        completedResponseCount: responded,
      };
    });
  }, [allInterviews, candidates, recentInterviews]);

  const totalInterviews =
    stats.totalInterviews ?? 0;

  const totalCandidates =
    stats.totalCandidates ?? candidates.length;

  const respondedCount = useMemo(() => {
    if (candidates.length === 0) {
      return stats.completedInterviews ?? 0;
    }

    return candidates.filter(
      (c) =>
        String(c.status || "").toLowerCase() !==
        "pending"
    ).length;
  }, [candidates, stats.completedInterviews]);

  const responseRate =
    totalCandidates > 0
      ? Math.round(
          (respondedCount / totalCandidates) * 100
        )
      : 0;

  const hasAnyData =
    totalInterviews > 0 ||
    totalCandidates > 0;

  /*
   * =========================================================
   * RESPONSE TREND
   * =========================================================
   */

  const responseTrend = useMemo(() => {
    if (!asOf) return [];

    const todayKey = dateKeyInTimeZone(
      new Date(asOf),
      timezone
    );

    const days = [];

    for (
      let i = RESPONSE_TREND_DAYS - 1;
      i >= 0;
      i -= 1
    ) {
      const key = shiftDateKey(
        todayKey,
        -i
      );

      const [y, m, d] = key
        .split("-")
        .map(Number);

      days.push({
        key,
        date: new Date(
          Date.UTC(y, m - 1, d)
        ),
        count: 0,
      });
    }

    const dayMap = new Map(
      days.map((d) => [d.key, d])
    );

    candidates.forEach((candidate) => {
      const time = timestampOf(candidate);

      if (!time) return;

      const key = dateKeyInTimeZone(
        new Date(time),
        timezone
      );

      const entry = dayMap.get(key);

      if (entry) {
        entry.count += 1;
      }
    });

    return days;
  }, [candidates, asOf]);

  const maxTrendCount = Math.max(
    1,
    ...responseTrend.map((d) => d.count)
  );

  /*
   * =========================================================
   * ROLE BREAKDOWN
   * =========================================================
   */

  const roleBreakdown = useMemo(() => {
    const map = new Map();

    interviewsWithCounts.forEach((interview) => {
      const key =
        interview.position ||
        interview.department ||
        "Unspecified Role";

      const existing =
        map.get(key) || {
          role: key,
          invited: 0,
          responded: 0,
        };

      existing.invited +=
        interview.candidateCount ?? 0;

      existing.responded +=
        interview.completedResponseCount ?? 0;

      map.set(key, existing);
    });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        rate:
          item.invited > 0
            ? Math.round(
                (item.responded /
                  item.invited) *
                  100
              )
            : 0,
      }))
      .sort(
        (a, b) =>
          b.invited - a.invited
      )
      .slice(0, 5);
  }, [interviewsWithCounts]);

  /*
   * =========================================================
   * STALLED INTERVIEWS
   * =========================================================
   */

  const stalledInterviews = useMemo(() => {
    if (!asOf) return [];

    return interviewsWithCounts.filter(
      (interview) => {
        const invited =
          interview.candidateCount ?? 0;

        const responded =
          interview.completedResponseCount ?? 0;

        if (
          invited === 0 ||
          responded > 0
        ) {
          return false;
        }

        const created = interview.createdAt
          ? new Date(
              interview.createdAt
            ).getTime()
          : NaN;

        if (Number.isNaN(created)) {
          return false;
        }

        const daysOld =
          (asOf - created) /
          (1000 * 60 * 60 * 24);

        return (
          daysOld >=
          STALLED_DAYS_THRESHOLD
        );
      }
    );
  }, [interviewsWithCounts, asOf]);

  /*
   * =========================================================
   * NEEDS REVIEW
   * =========================================================
   */

  const needsReviewAll = useMemo(() => {
    return candidates
      .filter(
        (c) =>
          String(c.status || "")
            .toLowerCase() ===
          "completed"
      )
      .sort(
        (a, b) =>
          timestampOf(a) -
          timestampOf(b)
      );
  }, [candidates]);

  const needsReview = useMemo(
    () => needsReviewAll.slice(0, 5),
    [needsReviewAll]
  );

  const daysWaiting = (candidate) => {
    const time = timestampOf(candidate);

    if (!time || !asOf) {
      return null;
    }

    return Math.max(
      0,
      Math.floor(
        (asOf - time) /
          (1000 * 60 * 60 * 24)
      )
    );
  };

  /*
   * =========================================================
   * CSV EXPORT
   * =========================================================
   */

  const handleExportCsv = () => {
    const header = [
      "Name",
      "Email",
      "Position",
      "Interview",
      "Status",
      "Submitted",
    ];

    const rows = candidates.map((c) => [
      c.name || "",
      c.email || "",
      c.position || "",
      c.interview || "",
      c.status || "",
      c.submittedAt ||
        c.completedAt ||
        c.createdAt ||
        "",
    ]);

    const escapeCell = (value) =>
      `"${String(value).replace(
        /"/g,
        '""'
      )}"`;

    const csvContent = [
      header,
      ...rows,
    ]
      .map((row) =>
        row
          .map(escapeCell)
          .join(",")
      )
      .join("\n");

    const blob = new Blob(
      [csvContent],
      {
        type: "text/csv;charset=utf-8;",
      }
    );

    const url =
      URL.createObjectURL(blob);

    const link =
      document.createElement("a");

    link.href = url;

    link.download = `covira-candidates-${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);

    link.click();

    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  };

  /*
   * =========================================================
   * LOADING STATE
   * =========================================================
   */

  if (loading) {
    return (
      <section className="module-page analytics-page">
        <h1>Analytics</h1>

        <p>
          Monitor interview and candidate
          activity.
        </p>

        <div className="analytics-loading">
          Loading analytics...
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * ERROR STATE
   * =========================================================
   */

  if (error) {
    return (
      <section className="module-page analytics-page">
        <h1>Analytics</h1>

        <p>
          Monitor interview and candidate
          activity.
        </p>

        <div className="module-empty-state">
          <h2>
            Unable to load analytics
          </h2>

          <p>{error}</p>

          <button
            type="button"
            className="analytics-retry-btn"
            onClick={loadAnalytics}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * RICH EMPTY STATE
   * =========================================================
   */

  if (!hasAnyData) {
    return (
      <section className="module-page analytics-page">
        <h1>Analytics</h1>

        <p>
          Monitor interview and candidate
          activity.
        </p>

        <div className="analytics-empty-hero">
          <div className="analytics-empty-icon">
            <HiOutlineChartBar />
          </div>

          <h2>No analytics yet</h2>

          <p>
            Analytics will appear here as soon
            as you create an interview and
            candidates start responding.
            Here&apos;s how to get started:
          </p>

          <div className="analytics-empty-steps">
            <div className="analytics-empty-step">
              <span>1</span>

              <div>
                <strong>
                  Create an interview
                </strong>

                <p>
                  Set up questions for the
                  role you're hiring for.
                </p>
              </div>
            </div>

            <div className="analytics-empty-step">
              <span>2</span>

              <div>
                <strong>
                  Invite candidates
                </strong>

                <p>
                  Share the interview link so
                  candidates can respond.
                </p>
              </div>
            </div>

            <div className="analytics-empty-step">
              <span>3</span>

              <div>
                <strong>
                  Track results here
                </strong>

                <p>
                  Response counts, statuses
                  and video answers will show
                  up on this page.
                </p>
              </div>
            </div>
          </div>

          <div className="analytics-empty-actions">
            <Link
              to="/dashboard/interviews/create"
              className="analytics-primary-btn"
            >
              <HiOutlinePlusCircle />
              Create Interview
            </Link>

            <Link
              to="/dashboard/interviews"
              className="analytics-secondary-btn"
            >
              View Interviews
              <HiOutlineArrowRight />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  /*
   * =========================================================
   * MAIN ANALYTICS VIEW
   * =========================================================
   */

  return (
    <section className="module-page analytics-page">
      <div className="analytics-page-header">
        <div>
          <h1>Analytics</h1>

          <p>
            Monitor interview and candidate
            activity.
          </p>
        </div>

        <button
          type="button"
          className="analytics-secondary-btn"
          onClick={handleExportCsv}
          disabled={
            candidates.length === 0
          }
        >
          <HiOutlineArrowDownTray />
          Export Candidates CSV
        </button>
      </div>

      {/* ==================== OVERVIEW STATS ==================== */}

      <div className="analytics-stats-grid">
        <div className="analytics-stat-card">
          <div className="analytics-stat-icon analytics-stat-icon-blue">
            <HiOutlineEye />
          </div>

          <div>
            <h3>{needsReviewAll.length}</h3>
            <span>Awaiting Review</span>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon analytics-stat-icon-teal">
            <HiOutlineExclamationTriangle />
          </div>

          <div>
            <h3>{stalledInterviews.length}</h3>
            <span>Stalled Interviews</span>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon analytics-stat-icon-green">
            <HiOutlineChartBar />
          </div>

          <div>
            <h3>{respondedCount}</h3>
            <span>
              Candidates Responded
            </span>
          </div>
        </div>

        <div className="analytics-stat-card">
          <div className="analytics-stat-icon analytics-stat-icon-purple">
            <HiOutlineClock />
          </div>

          <div>
            <h3>{responseRate}%</h3>
            <span>Response Rate</span>
          </div>
        </div>
      </div>

      {/* ==================== NEEDS ATTENTION ==================== */}

      {(stalledInterviews.length > 0 ||
        needsReview.length > 0) && (
        <section className="analytics-card analytics-attention-card">
          <h2>
            <HiOutlineExclamationTriangle className="analytics-card-title-icon" />
            Needs Attention
          </h2>

          <p className="analytics-card-subtitle">
            Things that might be worth a
            follow-up.
          </p>

          <div className="analytics-attention-grid">
            {stalledInterviews.length >
              0 && (
              <div className="analytics-attention-column">
                <h3>
                  Interviews with no
                  responses yet
                </h3>

                <ul className="analytics-attention-list">
                  {stalledInterviews.map(
                    (interview) => (
                      <li key={interview.id}>
                        <span>
                          {interview.title ||
                            "Untitled Interview"}
                        </span>

                        <Link
                          to={`/dashboard/interviews/${interview.id}/questions`}
                        >
                          View{" "}
                          <HiOutlineArrowRight />
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

            {needsReview.length > 0 && (
              <div className="analytics-attention-column">
                <h3>
                  <HiOutlineEye
                    style={{
                      marginRight: "4px",
                    }}
                  />
                  Awaiting review
                </h3>

                <ul className="analytics-attention-list">
                  {needsReview.map(
                    (candidate) => {
                      const waiting =
                        daysWaiting(
                          candidate
                        );

                      return (
                        <li
                          key={
                            candidate.id
                          }
                        >
                          <span>
                            {candidate.name ||
                              "Unnamed Candidate"}

                            {waiting !==
                              null && (
                              <em>
                                {" "}
                                &middot; waiting{" "}
                                {waiting} day
                                {waiting === 1
                                  ? ""
                                  : "s"}
                              </em>
                            )}
                          </span>

                          <Link
                            to={`/dashboard/candidates/${candidate.id}`}
                          >
                            View{" "}
                            <HiOutlineArrowRight />
                          </Link>
                        </li>
                      );
                    }
                  )}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ==================== RESPONSE TREND ==================== */}

      <section className="analytics-card">
        <h2>
          <HiOutlineCalendarDays className="analytics-card-title-icon" />
          Responses Over Time
        </h2>

        <p className="analytics-card-subtitle">
          Candidate submissions over the last{" "}
          {RESPONSE_TREND_DAYS} days.
        </p>

        {candidates.length === 0 ? (
          <div className="analytics-inline-empty">
            <p>
              No submissions yet to chart.
            </p>
          </div>
        ) : (
          <div className="analytics-trend-chart">
            {responseTrend.map((day) => (
              <div
                className="analytics-trend-bar-wrap"
                key={day.key}
                title={`${day.count} on ${formatDate(
                  day.date
                )}`}
              >
                <div
                  className={`analytics-trend-bar ${
                    day.count > 0
                      ? "has-data"
                      : ""
                  }`}
                  style={{
                    height: `${Math.max(
                      4,
                      (day.count /
                        maxTrendCount) *
                        100
                    )}%`,
                  }}
                />

                <span className="analytics-trend-label">
                  {day.date.toLocaleDateString(
                    DATE_LOCALE,
                    {
                      day: "2-digit",
                      month: "short",
                    }
                  )}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================== STATUS BREAKDOWN + RESPONSE FORMAT ==================== */}

      <div className="analytics-card-row">
        <section className="analytics-card">
          <h2>
            Candidate Status Breakdown
          </h2>

          <p className="analytics-card-subtitle">
            Where candidates currently stand
            across all interviews.
          </p>

          <div className="analytics-status-grid">
            <div className="analytics-status-pill">
              <span className="status-badge status-completed">
                Completed
              </span>

              <strong>
                {candidateOverview.completed ??
                  0}
              </strong>
            </div>

            <div className="analytics-status-pill">
              <span className="status-badge status-reviewed">
                Awaiting Review
              </span>

              <strong>
                {awaitingReviewCount}
              </strong>
            </div>

            <div className="analytics-status-pill">
              <span className="status-badge status-pending">
                Pending
              </span>

              <strong>
                {stats.pendingResponses ?? 0}
              </strong>
            </div>
          </div>
        </section>

        {responseFormatStats.sampleSize >
          0 && (
          <section className="analytics-card">
            <h2>
              <HiOutlineDocumentText className="analytics-card-title-icon" />
              Response Format
            </h2>

            <p className="analytics-card-subtitle">
              Video vs. text answers across
              recent submissions.
            </p>

            
            {(() => {
              const totalAnswers =
                responseFormatStats.video +
                responseFormatStats.text +
                responseFormatStats.other;

              const videoPct =
                totalAnswers > 0
                  ? Math.round(
                      (responseFormatStats.video /
                        totalAnswers) *
                        100
                    )
                  : 0;

              const textPct =
                totalAnswers > 0
                  ? Math.round(
                      (responseFormatStats.text /
                        totalAnswers) *
                        100
                    )
                  : 0;

              return (
                <div className="analytics-status-grid">
                  <div className="analytics-status-pill">
                    <span className="status-badge status-completed">
                      <HiOutlineVideoCamera
                        style={{
                          marginRight: "4px",
                        }}
                      />
                      Video
                    </span>

                    <strong>
                      {videoPct}%
                    </strong>
                  </div>

                  <div className="analytics-status-pill">
                    <span className="status-badge status-reviewed">
                      <HiOutlineDocumentText
                        style={{
                          marginRight: "4px",
                        }}
                      />
                      Text
                    </span>

                    <strong>
                      {textPct}%
                    </strong>
                  </div>
                </div>
              );
            })()}
          </section>
        )}
      </div>

      {/* ==================== TOP ROLES ==================== */}

      {roleBreakdown.length > 0 && (
        <section className="analytics-card">
          <h2>
            Top Roles by Candidates
          </h2>

          <p className="analytics-card-subtitle">
            Which roles are attracting the
            most candidates and how well
            they're responding.
          </p>

          <div className="analytics-interview-list">
            {roleBreakdown.map((role) => (
              <div
                className="analytics-interview-row"
                key={role.role}
              >
                <div className="analytics-interview-main">
                  <div>
                    <strong>
                      {role.role}
                    </strong>
                  </div>
                </div>

                <div className="analytics-interview-progress">
                  <div className="analytics-progress-bar">
                    <div
                      className="analytics-progress-fill"
                      style={{
                        width: `${
                          role.invited > 0
                            ? role.rate
                            : 0
                        }%`,
                      }}
                    />
                  </div>

                  <span className="analytics-progress-label">
                    {role.invited > 0
                      ? `${role.responded}/${role.invited} candidates responded (${role.rate}%)`
                      : "No candidates invited yet"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== RECENT VIDEO RESPONSES ==================== */}

      <section className="analytics-card">
        <h2>
          Recent Video Responses
        </h2>

        <p className="analytics-card-subtitle">
          The latest video answers submitted
          by candidates.
        </p>

        {videosLoading ? (
          <div className="analytics-inline-empty">
            <p>
              Checking recent submissions for
              video answers...
            </p>
          </div>
        ) : videoPreviews.length ===
          0 ? (
          <div className="analytics-inline-empty">
            <div className="analytics-inline-empty-icon">
              <HiOutlineVideoCamera />
            </div>

            <h3>
              No video responses yet
            </h3>

            <p>
              {respondedCount > 0
                ? "Candidates who have responded so far haven't submitted a video answer. Once someone records a video response, it will show up here."
                : "Once candidates start submitting video answers, you'll be able to preview them right here."}
            </p>

            <Link
              to="/dashboard/candidates"
              className="analytics-secondary-btn"
            >
              View All Candidates
              <HiOutlineArrowRight />
            </Link>
          </div>
        ) : (
          <div className="analytics-video-grid">
            {videoPreviews.map(
              (preview) => {
                const hasError =
                  Boolean(
                    videoErrors[
                      preview.candidateId
                    ]
                  );

                return (
                  <div
                    className="analytics-video-card"
                    key={
                      preview.candidateId
                    }
                  >
                    <div className="analytics-video-card-header">
                      <div>
                        <strong>
                          {preview.name}
                        </strong>

                        <span>
                          {preview.interview}
                        </span>
                      </div>

                      {preview.status && (
                        <span
                          className={`status-badge status-${getStatusClass(
                            preview.status
                          )}`}
                        >
                          {preview.status}
                        </span>
                      )}
                    </div>

                    {hasError ? (
                      <div className="analytics-video-placeholder">
                        <HiOutlineExclamationCircle />

                        <p>
                          Video could not
                          be played.
                        </p>
                      </div>
                    ) : (
                      <video
                        className="analytics-video"
                        controls
                        playsInline
                        preload="metadata"
                        src={
                          preview.videoUrl
                        }
                        onError={() =>
                          handleVideoError(
                            preview.candidateId
                          )
                        }
                        onLoadedData={() =>
                          handleVideoLoaded(
                            preview.candidateId
                          )
                        }
                      >
                        {preview.videoMimeType && (
                          <source
                            src={
                              preview.videoUrl
                            }
                            type={
                              preview.videoMimeType
                            }
                          />
                        )}

                        Your browser does not
                        support video playback.
                      </video>
                    )}

                    <div className="analytics-video-card-footer">
                      <span>
                        Submitted{" "}
                        {formatDate(
                          preview.submittedAtIso ||
                            preview.submittedAt
                        )}
                      </span>

                      <Link
                        to={`/dashboard/candidates/${preview.candidateId}`}
                      >
                        View Candidate
                        <HiOutlineArrowRight />
                      </Link>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </section>
    </section>
  );
}

export default AnalyticsPage;
