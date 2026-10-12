import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { apiGetMe, clearSession, getSession, isManagement } from "./schoolApi";
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
      .then((user) => setSessionState({ user }))
      .catch(() => {
        clearSession();
        setSessionState(null);
        navigate("/school");
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
