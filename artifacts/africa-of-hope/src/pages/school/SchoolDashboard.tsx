import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getSession } from "./schoolApi";
import AdminDashboard from "./AdminDashboard";
import InstructorDashboard from "./InstructorDashboard";
import StudentDashboard from "./StudentDashboard";

export default function SchoolDashboard() {
  const [, navigate] = useLocation();
  const [session, setSessionState] = useState(getSession);

  useEffect(() => {
    const s = getSession();
    if (!s) {
      navigate("/school");
      return;
    }
    setSessionState(s);
  }, [navigate]);

  if (!session) return null;

  const { user } = session;
  if (user.role === "admin") return <AdminDashboard user={user} />;
  if (user.role === "instructor" || user.role === "assistant") return <InstructorDashboard user={user} />;
  return <StudentDashboard user={user} />;
}
