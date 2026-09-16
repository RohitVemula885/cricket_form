import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generate and download a comprehensive, beautifully formatted PDF report
 * of player registrations for NextGen Cricket 2026.
 * 
 * @param {Array} players - Array of player registration objects
 * @param {object} options - Additional metadata (adminName, etc.)
 */
export function generateRegistrationsPDF(players = [], options = {}) {
  // Create landscape A4 PDF (297mm x 210mm)
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();
  const formattedDate = now.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const formattedTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const totalPlayers = players.length;
  const verifiedCount = players.filter((p) => p.paymentStatus === 'verified').length;
  const pendingCount = players.filter((p) => p.paymentStatus === 'pending').length;
  const rejectedCount = players.filter((p) => p.paymentStatus === 'rejected').length;

  // 1. TOP HEADER BANNER (Teal Theme)
  doc.setFillColor(15, 118, 110); // #0f766e
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Decorative top accent stripe (gold/amber)
  doc.setFillColor(245, 158, 11); // #f59e0b
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NEXTGEN CRICKET TOURNAMENT 2026', 14, 12);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(204, 251, 241); // #ccfbf1
  doc.text('OFFICIAL PLAYER REGISTRATION & PAYMENT VERIFICATION ROSTER', 14, 18);

  // Date and Admin Info (Right aligned in header)
  doc.setFontSize(8);
  doc.setTextColor(240, 253, 250);
  doc.text(`Generated: ${formattedDate}, ${formattedTime}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Organizer: ${options.adminName || 'Tournament Committee'}`, pageWidth - 14, 18, { align: 'right' });

  // 2. TOURNAMENT METADATA & SUMMARY METRICS BAR
  // Background card for tournament info & stats
  doc.setFillColor(248, 250, 252); // #f8fafc
  doc.setDrawColor(226, 232, 240); // #e2e8f0
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 30, pageWidth - 28, 15, 2, 2, 'FD');

  // Match Details (Left side)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59); // #1e293b
  doc.text('MATCH INFO:', 18, 36.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Sunday, 25 October 2026  |  Venue: J.K. Knowledge Centre, Wadala  |  Fee: Rs. 600', 42, 36.5);

  // Stat Counters (Right side)
  const statsStartX = pageWidth - 130;
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Players: ${totalPlayers}`, statsStartX, 36.5);

  // Verified
  doc.setTextColor(22, 101, 52); // Green
  doc.text(`Verified: ${verifiedCount}`, statsStartX + 32, 36.5);

  // Pending
  doc.setTextColor(180, 83, 9); // Amber
  doc.text(`Pending: ${pendingCount}`, statsStartX + 60, 36.5);

  // Rejected
  doc.setTextColor(185, 28, 28); // Red
  doc.text(`Rejected: ${rejectedCount}`, statsStartX + 88, 36.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.text('Official registered participants sorted by registration timestamp', 18, 41.5);

  // 3. TABLE GENERATION
  const tableData = players.map((player, index) => {
    // Format date cleanly
    let regDate = '-';
    if (player.createdAt) {
      try {
        const d = new Date(player.createdAt);
        regDate = `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
      } catch {
        regDate = player.createdAt;
      }
    }

    return [
      String(index + 1),
      player.id || `REG-${index + 1}`,
      player.fullName || 'Unnamed Player',
      player.mobile || 'N/A',
      player.email || 'N/A',
      player.tshirtSize ? `Size ${player.tshirtSize}` : 'N/A',
      (player.tshirtName || '-').toUpperCase(),
      player.tshirtNumber ? `#${player.tshirtNumber}` : '-',
      regDate,
    ];
  });

  autoTable(doc, {
    startY: 49,
    head: [[
      '#',
      'Registration ID',
      'Player Name',
      'Mobile Number',
      'Email Address',
      'Size',
      'Jersey Name',
      'Jersey #',
      'Registration Date & Time',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110], // Teal
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      halign: 'left',
      cellPadding: 3,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // #f8fafc subtle alternate shading
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' }, // #
      1: { cellWidth: 26, fontStyle: 'bold' }, // Reg ID
      2: { cellWidth: 38, fontStyle: 'bold' }, // Player Name
      3: { cellWidth: 26 }, // Mobile
      4: { cellWidth: 46 }, // Email
      5: { cellWidth: 18, halign: 'center' }, // Size
      6: { cellWidth: 32, fontStyle: 'bold', textColor: [15, 118, 110] }, // Jersey Name
      7: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }, // Jersey #
      8: { cellWidth: 45 }, // Registration Date
    },
    didDrawPage: function (data) {
      // 4. FOOTER (Every Page)
      const pageNumber = doc.internal.getNumberOfPages();
      
      // Divider line above footer
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184); // Slate 400
      
      doc.text(
        'NextGen Cricket 2026 • Official Tournament Committee Records • Confidential',
        14,
        pageHeight - 7
      );

      doc.text(
        `Page ${data.pageNumber} of ${pageNumber}`,
        pageWidth - 14,
        pageHeight - 7,
        { align: 'right' }
      );
    },
    margin: { left: 14, right: 14, top: 49, bottom: 16 },
  });

  // Safe file name with date stamp
  const fileDate = now.toISOString().slice(0, 10);
  const fileName = `NextGen_Cricket_Registrations_${fileDate}.pdf`;

  // Robust Mobile & Desktop Download Engine
  const blob = doc.output('blob');
  const blobUrl = URL.createObjectURL(blob);

  // Device detection
  const isIOS = typeof navigator !== 'undefined' && (
    /iPad|iPhone|iPod/.test(navigator.userAgent || '') || 
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '');
  const isMobile = isIOS || isAndroid;

  try {
    if (isIOS) {
      // iOS Safari blocks anchor download attributes for blobs.
      // Opening in a new tab allows iOS native PDF viewer to render it with the "Save to Files / Share" sheet!
      const newWin = window.open(blobUrl, '_blank');
      if (!newWin || newWin.closed || typeof newWin.closed === 'undefined') {
        // Fallback if popup blocked
        window.location.href = blobUrl;
      }
    } else {
      // Android Chrome & Desktop: Standard anchor click
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) {
          document.body.removeChild(link);
        }
      }, 300);
    }
  } catch (err) {
    console.warn('Direct download attempt encountered error, falling back to doc.save:', err);
    try {
      doc.save(fileName);
    } catch (saveErr) {
      console.error('jsPDF doc.save fallback failed:', saveErr);
    }
  }

  // Delay revoking URL so mobile browsers have ample time to read the blob
  setTimeout(() => {
    try {
      URL.revokeObjectURL(blobUrl);
    } catch {
      // ignore
    }
  }, 120000);

  return {
    success: true,
    fileName,
    blobUrl,
    blob,
    isMobile,
    recordCount: totalPlayers,
  };
}
