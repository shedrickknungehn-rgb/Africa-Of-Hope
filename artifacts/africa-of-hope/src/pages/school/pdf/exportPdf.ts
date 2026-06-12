import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Grade, Payment, Payroll, Attendance } from "../schoolApi";

const SCHOOL = "Africa of Hope — School of Professional Studies";
const ADDR = "RIA Highway, Schiefflin Township, Lower Margibi County, Liberia";
const GREEN = [13, 61, 26] as [number, number, number];
const GOLD = [212, 160, 23] as [number, number, number];

function addHeader(doc: jsPDF, title: string) {
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(SCHOOL, 14, 12);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(ADDR, 14, 18);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...GOLD);
  doc.text(title, 14, 25.5);
  doc.setTextColor(0, 0, 0);
}

function addFooter(doc: jsPDF) {
  const pageH = doc.internal.pageSize.height;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(14, pageH - 12, 196, pageH - 12);
  doc.setFontSize(7);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()} — ${SCHOOL}`, 14, pageH - 7);
}

/* ─── Grade Transcript ────────────────────────────────────────── */
export function exportTranscriptPdf(studentName: string, grades: Grade[], courses: { id: string; title: string }[]) {
  const doc = new jsPDF();
  addHeader(doc, "Academic Transcript");

  const courseTitle = (id: string) => courses.find(c => c.id === id)?.title || grades.find(g => g.courseId === id)?.courseTitle || id;
  const pct = (g: Grade) => { const s = parseFloat(g.score), m = parseFloat(g.maxScore); return m > 0 ? Math.round((s / m) * 100) : 0; };

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Student: ${studentName}`, 14, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 42);

  const byCourse = grades.reduce<Record<string, Grade[]>>((acc, g) => {
    const k = g.courseId; if (!acc[k]) acc[k] = []; acc[k].push(g); return acc;
  }, {});

  let startY = 50;

  Object.entries(byCourse).forEach(([cid, list]) => {
    const avg = Math.round(list.reduce((a, g) => a + pct(g), 0) / list.length);
    const rows = list.map(g => [g.assessment, `${g.score}/${g.maxScore}`, `${pct(g)}%`, g.grade || "—", g.comment || "—"]);

    autoTable(doc, {
      startY,
      head: [[{ content: `${courseTitle(cid)} — Average: ${avg}%`, colSpan: 5, styles: { fillColor: GREEN, textColor: 255, fontStyle: "bold", fontSize: 9 } }],
             ["Assessment", "Score", "%", "Grade", "Comment"]],
      body: rows,
      headStyles: { fillColor: [245, 245, 240], textColor: [60, 60, 60], fontStyle: "bold", fontSize: 8 },
      bodyStyles: { fontSize: 8 },
      columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 25 }, 2: { cellWidth: 20 }, 3: { cellWidth: 20 }, 4: { cellWidth: "auto" } },
      margin: { left: 14, right: 14 },
      didParseCell: (data) => {
        if (data.row.index === 0 && data.section === "head") { data.cell.styles.fillColor = GREEN; data.cell.styles.textColor = 255; }
      },
    });

    startY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;
    if (startY > 240) { doc.addPage(); startY = 20; }
  });

  if (grades.length > 0) {
    const overallAvg = Math.round(grades.reduce((sum, g) => sum + pct(g), 0) / grades.length);
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable?.finalY ?? startY;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...GREEN);
    doc.text(`Overall Average: ${overallAvg}%`, 14, finalY + 10);
    doc.setTextColor(0, 0, 0);
  }

  addFooter(doc);
  doc.save(`transcript-${studentName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`);
}

/* ─── Attendance Report ──────────────────────────────────────── */
export function exportAttendancePdf(studentName: string, attendance: Attendance[]) {
  const doc = new jsPDF();
  addHeader(doc, "Attendance Report");

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Student: ${studentName}`, 14, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 42);

  const presentCount = attendance.filter(a => a.status === "present").length;
  const pct = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0;

  doc.setFontSize(9);
  doc.text(`Total Sessions: ${attendance.length}   Present: ${presentCount}   Attendance Rate: ${pct}%`, 14, 49);

  autoTable(doc, {
    startY: 56,
    head: [["Date", "Course", "Status", "Notes"]],
    body: attendance.map(a => [
      new Date(a.sessionDate).toLocaleDateString(),
      a.courseTitle || a.courseId,
      a.status,
      a.notes || "—",
    ]),
    headStyles: { fillColor: GREEN, textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    columnStyles: { 2: { cellWidth: 30 } },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`attendance-${studentName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`);
}

/* ─── Payment Receipt ─────────────────────────────────────────── */
export function exportReceiptPdf(payment: Payment, studentName: string) {
  const doc = new jsPDF();
  addHeader(doc, "Payment Receipt");

  const num = (s: string) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RECEIPT", 196, 36, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`No. ${payment.id.slice(-8).toUpperCase()}`, 196, 42, { align: "right" });

  const details = [
    ["Student", studentName],
    ["Course", payment.courseTitle || payment.courseId],
    ["Amount", `$${num(payment.amount).toFixed(2)}`],
    ["Status", payment.status.toUpperCase()],
    ["Method", payment.method || "—"],
    ["Reference", payment.reference || "—"],
    ["Due Date", payment.dueDate ? new Date(payment.dueDate).toLocaleDateString() : "—"],
    ["Paid On", payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "—"],
    ["Notes", payment.notes || "—"],
  ];

  autoTable(doc, {
    startY: 48,
    body: details,
    theme: "plain",
    styles: { fontSize: 9 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 40, textColor: [80, 80, 80] }, 1: { cellWidth: "auto" } },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  doc.setFillColor(...GREEN);
  doc.rect(14, finalY, 182, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`TOTAL: $${num(payment.amount).toFixed(2)}`, 105, finalY + 9, { align: "center" });
  doc.setTextColor(0, 0, 0);

  if (payment.status === "paid") {
    doc.setFontSize(24);
    doc.setTextColor(0, 150, 0);
    doc.setFont("helvetica", "bold");
    doc.text("PAID", 170, 80, { angle: -30, align: "center" });
    doc.setTextColor(0, 0, 0);
  }

  addFooter(doc);
  doc.save(`receipt-${payment.id.slice(-8)}-${studentName.replace(/\s+/g, "-").toLowerCase()}.pdf`);
}

/* ─── Bulk Receipts ──────────────────────────────────────────── */
export function exportAllReceiptsPdf(payments: Payment[], studentName: string) {
  const doc = new jsPDF();
  addHeader(doc, "Payment History");
  const num = (s: string) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Student: ${studentName}`, 14, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 14, 42);

  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + num(p.amount), 0);
  const totalPending = payments.filter(p => p.status === "pending" || p.status === "overdue").reduce((s, p) => s + num(p.amount), 0);
  doc.text(`Total Paid: $${totalPaid.toFixed(2)}   Outstanding: $${totalPending.toFixed(2)}`, 14, 49);

  autoTable(doc, {
    startY: 56,
    head: [["Course", "Amount", "Method", "Due Date", "Paid On", "Status"]],
    body: payments.map(p => [
      p.courseTitle || p.courseId,
      `$${num(p.amount).toFixed(2)}`,
      p.method || "—",
      p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—",
      p.paidAt ? new Date(p.paidAt).toLocaleDateString() : "—",
      p.status.toUpperCase(),
    ]),
    headStyles: { fillColor: GREEN, textColor: 255, fontStyle: "bold", fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`payments-${studentName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`);
}

/* ─── Payslip ─────────────────────────────────────────────────── */
export function exportPayslipPdf(payroll: Payroll, staffName: string) {
  const doc = new jsPDF();
  addHeader(doc, "Payslip");

  const num = (s: string) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Staff: ${staffName}`, 14, 36);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Pay Period: ${payroll.period}   Date Issued: ${new Date().toLocaleDateString()}`, 14, 42);

  autoTable(doc, {
    startY: 50,
    body: [
      ["Gross Pay", `$${num(payroll.gross).toFixed(2)}`],
      ["Deductions", `-$${num(payroll.deductions).toFixed(2)}`],
    ],
    theme: "plain",
    styles: { fontSize: 10 },
    columnStyles: { 0: { fontStyle: "bold", cellWidth: 80 }, 1: { cellWidth: "auto", halign: "right" } },
    margin: { left: 14, right: 14 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 4;
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.5);
  doc.line(14, finalY, 196, finalY);

  doc.setFillColor(...GREEN);
  doc.rect(14, finalY + 3, 182, 14, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`NET PAY: $${num(payroll.net).toFixed(2)}`, 105, finalY + 12, { align: "center" });
  doc.setTextColor(0, 0, 0);

  if (payroll.notes) {
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Notes: ${payroll.notes}`, 14, finalY + 25);
    doc.setTextColor(0, 0, 0);
  }

  if (payroll.status === "paid") {
    doc.setFontSize(20);
    doc.setTextColor(0, 150, 0);
    doc.setFont("helvetica", "bold");
    doc.text("PAID", 170, 80, { angle: -30, align: "center" });
    if (payroll.paidAt) {
      doc.setFontSize(8);
      doc.setTextColor(0, 150, 0);
      doc.text(`Paid: ${new Date(payroll.paidAt).toLocaleDateString()}`, 14, finalY + 35);
    }
    doc.setTextColor(0, 0, 0);
  }

  addFooter(doc);
  doc.save(`payslip-${staffName.replace(/\s+/g, "-").toLowerCase()}-${payroll.period}.pdf`);
}
