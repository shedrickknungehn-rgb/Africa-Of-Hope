import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  ApiError,
  apiGetMe,
  clearSession,
  getSession,
  isManagement,
  persistSessionUser,
} from "./schoolApi";
import AdminDashboard from "./AdminDashboard";
import InstructorDashboard from "./InstructorDashboard";
import StudentDashboard from "./StudentDashboard";

export default function SchoolDashboard() {
  const [, navigate] = useLocation();
  const [session, setSessionState] = useState(getSession);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const current = getSession();
    if (!current) {
      setCheckingSession(false);
      navigate("/school");
      return;
    }

    apiGetMe()
      .then((user) => {
        persistSessionUser(user);
        setSessionState({ user });
      })
      .catch((error: unknown) => {
        if (
          error instanceof ApiError &&
          [401, 403].includes(error.status ?? 0)
        ) {
          clearSession();
          setSessionState(null);
          navigate("/school");
        }
      })
      .finally(() => setCheckingSession(false));
  }, [navigate]);

  if (checkingSession || !session) return null;
  if (isManagement(session.user.role))
    return <AdminDashboard user={session.user} />;
  if (session.user.role === "instructor")
    return <InstructorDashboard user={session.user} />;
  return <StudentDashboard user={session.user} />;
}
