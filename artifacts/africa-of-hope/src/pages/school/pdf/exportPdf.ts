import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Grade, Payment } from "../schoolApi";

const SCHOOL = "Africa of Hope — School of Professional Studies";
const GREEN = [13, 61, 26] as [number, number, number];
const GOLD = [212, 160, 23] as [number, number, number];

function addHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(SCHOOL, 14, 12);
  doc.setTextColor(...GOLD);
  doc.setFontSize(13);
  doc.text(title, 14, 24);
  doc.setTextColor(0, 0, 0);
}
function addFooter(doc: jsPDF) {
  const height = doc.internal.pageSize.height;
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Generated ${new Date().toLocaleDateString()} — ${SCHOOL}`,
    14,
    height - 8,
  );
}

export function exportTranscriptPdf(
  studentName: string,
  grades: Grade[],
  courses: { id: string; title: string }[],
) {
  const doc = new jsPDF();
  addHeader(doc, "Academic Transcript");
  doc.setFontSize(10);
  doc.text(`Student: ${studentName}`, 14, 36);
  doc.setFontSize(9);
  doc.text(`Date issued: ${new Date().toLocaleDateString()}`, 14, 42);
  const titleFor = (grade: Grade) =>
    grade.courseTitle ||
    courses.find((course) => course.id === grade.courseId)?.title ||
    grade.courseId;
  autoTable(doc, {
    startY: 50,
    head: [["Course", "Assessment", "Score", "Grade", "Comment"]],
    body: grades.map((grade) => [
      titleFor(grade),
      grade.assessment,
      `${grade.score}/${grade.maxScore}`,
      grade.grade || "—",
      grade.comment || "—",
    ]),
    headStyles: { fillColor: GREEN },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });
  addFooter(doc);
  doc.save(
    `transcript-${studentName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`,
  );
}

export function exportReceiptPdf(payment: Payment, studentName: string) {
  const doc = new jsPDF();
  addHeader(doc, "Payment Receipt");
  doc.setFontSize(10);
  doc.text(`Student: ${studentName}`, 14, 38);
  doc.text(`Receipt: ${payment.reference || payment.id}`, 14, 45);
  doc.text(`Status: ${payment.status}`, 14, 52);
  autoTable(doc, {
    startY: 60,
    head: [["Course", "Amount", "Method", "Date"]],
    body: [
      [
        payment.courseTitle || payment.courseId || "Course payment",
        payment.amount,
        payment.method || "—",
        payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "—",
      ],
    ],
    headStyles: { fillColor: GREEN },
    margin: { left: 14, right: 14 },
  });
  addFooter(doc);
  doc.save(
    `receipt-${payment.id.slice(-8)}-${studentName.replace(/\s+/g, "-").toLowerCase()}.pdf`,
  );
}

export function exportAllReceiptsPdf(payments: Payment[], studentName: string) {
  const doc = new jsPDF();
  addHeader(doc, "Payment History");
  const amount = (value: string) =>
    parseFloat(value.replace(/[^0-9.]/g, "")) || 0;
  const paid = payments
    .filter((payment) => payment.status === "paid")
    .reduce((total, payment) => total + amount(payment.amount), 0);
  const outstanding = payments
    .filter(
      (payment) => payment.status === "pending" || payment.status === "overdue",
    )
    .reduce((total, payment) => total + amount(payment.amount), 0);
  doc.setFontSize(10);
  doc.text(`Student: ${studentName}`, 14, 38);
  doc.setFontSize(9);
  doc.text(
    `Paid: $${paid.toFixed(2)}   Outstanding: $${outstanding.toFixed(2)}`,
    14,
    45,
  );
  autoTable(doc, {
    startY: 53,
    head: [["Course", "Amount", "Method", "Status", "Date"]],
    body: payments.map((payment) => [
      payment.courseTitle || payment.courseId || "Course payment",
      payment.amount,
      payment.method || "—",
      payment.status,
      payment.paidAt
        ? new Date(payment.paidAt).toLocaleDateString()
        : payment.dueDate
          ? `Due ${new Date(payment.dueDate).toLocaleDateString()}`
          : "—",
    ]),
    headStyles: { fillColor: GREEN },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });
  addFooter(doc);
  doc.save(
    `payments-${studentName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`,
  );
}

export function exportAcademyReportPdf(title: string, rows: string[][]) {
  const doc = new jsPDF();
  addHeader(doc, title);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
  autoTable(doc, {
    startY: 46,
    head: [["Metric", "Value"]],
    body: rows,
    headStyles: { fillColor: GREEN },
    margin: { left: 14, right: 14 },
  });
  addFooter(doc);
  doc.save(
    `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}.pdf`,
  );
}
