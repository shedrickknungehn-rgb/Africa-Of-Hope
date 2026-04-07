import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { getSession, initSchoolData } from "./schoolData";
import AdminDashboard from "./AdminDashboard";
import InstructorDashboard from "./InstructorDashboard";
import StudentDashboard from "./StudentDashboard";

export default function SchoolDashboard() {
  const [, navigate] = useLocation();
  const [session, setSession] = useState(getSession());

  useEffect(() => {
    initSchoolData();
    const s = getSession();
    if (!s) {
      navigate("/school");
      return;
    }
    setSession(s);
  }, [navigate]);

  if (!session) return null;

  const { user } = session;

  if (user.role === "admin") return <AdminDashboard user={user} />;
  if (user.role === "instructor" || user.role === "assistant") return <InstructorDashboard user={user} />;
  return <StudentDashboard user={user} />;
}
