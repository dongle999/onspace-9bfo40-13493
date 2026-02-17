import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import type { Finding, Scan } from '@/types';

// Export findings to CSV
export function exportFindingsToCSV(findings: Finding[], filename = 'nuclei-findings.csv') {
  const headers = [
    'ID',
    'Severity',
    'Template',
    'Template ID',
    'Target',
    'Description',
    'Matched At',
    'CVSS',
    'CWE',
    'Tags',
    'False Positive',
    'Notes',
  ];

  const rows = findings.map((f) => [
    f.id,
    f.severity,
    f.templateName,
    f.templateId,
    f.target,
    f.description,
    f.matchedAt,
    f.cvss || '',
    f.cwe || '',
    f.tags.join('; '),
    f.isFalsePositive ? 'Yes' : 'No',
    f.notes || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
}

// Export findings to JSON
export function exportFindingsToJSON(findings: Finding[], filename = 'nuclei-findings.json') {
  const jsonContent = JSON.stringify(findings, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
}

// Export findings to Excel
export function exportFindingsToExcel(findings: Finding[], filename = 'nuclei-findings.xlsx') {
  const data = findings.map((f) => ({
    ID: f.id,
    Severity: f.severity,
    Template: f.templateName,
    'Template ID': f.templateId,
    Target: f.target,
    Description: f.description,
    'Matched At': f.matchedAt,
    CVSS: f.cvss || '',
    CWE: f.cwe || '',
    Tags: f.tags.join('; '),
    'False Positive': f.isFalsePositive ? 'Yes' : 'No',
    Notes: f.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Findings');

  // Auto-size columns
  const maxWidth = 50;
  const colWidths = Object.keys(data[0] || {}).map((key) => ({
    wch: Math.min(
      maxWidth,
      Math.max(
        key.length,
        ...data.map((row) => String(row[key as keyof typeof row]).length)
      )
    ),
  }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, filename);
}

// Export findings to PDF
export function exportFindingsToPDF(findings: Finding[], filename = 'nuclei-findings.pdf') {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Nuclei Security Findings Report', margin, yPos);
  yPos += 10;

  // Metadata
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPos);
  yPos += 5;
  doc.text(`Total Findings: ${findings.length}`, margin, yPos);
  yPos += 10;

  // Findings
  doc.setFontSize(9);
  findings.forEach((finding, index) => {
    // Check if we need a new page
    if (yPos > pageHeight - 40) {
      doc.addPage();
      yPos = margin;
    }

    // Severity badge background
    const severityColors: Record<string, [number, number, number]> = {
      critical: [220, 38, 38],
      high: [234, 88, 12],
      medium: [234, 179, 8],
      low: [37, 99, 235],
      info: [6, 182, 212],
    };
    const color = severityColors[finding.severity] || [100, 100, 100];
    doc.setFillColor(color[0], color[1], color[2]);
    doc.rect(margin, yPos - 3, 20, 5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text(finding.severity.toUpperCase(), margin + 1, yPos);
    
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(`${index + 1}. ${finding.templateName}`, margin + 22, yPos);
    yPos += 6;

    doc.setFont('helvetica', 'normal');
    doc.text(`Target: ${finding.target}`, margin + 5, yPos);
    yPos += 5;
    doc.text(`Template: ${finding.templateId}`, margin + 5, yPos);
    yPos += 5;
    
    // Description with word wrap
    const descLines = doc.splitTextToSize(finding.description, pageWidth - margin * 2 - 5);
    doc.text(descLines, margin + 5, yPos);
    yPos += descLines.length * 4 + 3;

    if (finding.cvss) {
      doc.text(`CVSS: ${finding.cvss}`, margin + 5, yPos);
      yPos += 5;
    }

    yPos += 3;
  });

  doc.save(filename);
}

// Export scans summary to Excel
export function exportScansToExcel(scans: Scan[], filename = 'nuclei-scans.xlsx') {
  const data = scans.map((s) => ({
    Name: s.name,
    Status: s.status,
    Progress: `${s.progress.toFixed(1)}%`,
    'Total Findings': s.totalFindings,
    Critical: s.findingsCount.critical,
    High: s.findingsCount.high,
    Medium: s.findingsCount.medium,
    Low: s.findingsCount.low,
    Info: s.findingsCount.info,
    Templates: `${s.templatesProcessed}/${s.templatesTotal}`,
    Targets: `${s.targetsScanned}/${s.targetsTotal}`,
    'Elapsed Time': s.elapsedTime,
    'Created At': s.createdAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Scans');

  XLSX.writeFile(workbook, filename);
}

// Helper function to trigger download
function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
