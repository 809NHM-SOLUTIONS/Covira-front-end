import {
  FaVideo,
  FaClock,
  FaHourglassEnd,
  FaStar,
  FaTimesCircle,
  FaBell,
} from "react-icons/fa";

export const NOTIFICATION_TYPES = {

  CANDIDATE_SUBMITTED: { icon: FaVideo, navigate: "candidate" },
  INTERVIEW_DEADLINE_APPROACHING: { icon: FaClock, navigate: "interview" },
  INTERVIEW_EXPIRED: { icon: FaHourglassEnd, navigate: "interview" },
  CANDIDATE_SHORTLISTED: { icon: FaStar, navigate: "candidate" },
  CANDIDATE_REJECTED: { icon: FaTimesCircle, navigate: "candidate" },
};

const DEFAULT_NOTIFICATION_TYPE = { icon: FaBell, navigate: "auto" };


export function getNotificationIcon(type) {
  return (NOTIFICATION_TYPES[type] || DEFAULT_NOTIFICATION_TYPE).icon;
}

export function getNotificationTarget(notification) {
  const config = NOTIFICATION_TYPES[notification.type] || DEFAULT_NOTIFICATION_TYPE;

  const preferInterview = config.navigate === "interview";

  if (preferInterview && notification.interviewId) {
    return { type: "interview", id: notification.interviewId };
  }

  if (notification.candidateId) {
    return { type: "candidate", id: notification.candidateId };
  }

  if (notification.interviewId) {
    return { type: "interview", id: notification.interviewId };
  }

  return null;
}