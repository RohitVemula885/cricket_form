import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatTshirtSizeWithNumber } from './tshirtConfig';
import { downloadOrOpenPdf } from './mobilePdfDownloader';
import { DEFAULT_TEAMS, getStoredTeams, getTeamById, hexToRgb } from './teamsConfig';

/**
 * Helper to compute jersey size counts for a list of players
 */
function getTshirtBreakdown(players = []) {
  const counts = {};
  players.forEach((p) => {
    const size = formatTshirtSizeWithNumber(p.tshirtSize);
    counts[size] = (counts[size] || 0) + 1;
  });
  return counts;
}

/**
 * Helper to format size counts as a readable string
 * e.g. "M (38) x 4, L (40) x 3, XL (42) x 2"
 */
function formatBreakdownString(counts) {
  const entries = Object.entries(counts);
  if (entries.length === 0) return 'No jerseys recorded';
  return entries.map(([size, count]) => `${size}: ${count}`).join('   |   ');
}

/**
 * Generate and download the Official 8-Team Separation & Jersey Names PDF Roster.
 * Specifically structured so organizers and kit manufacturers can easily separate
 * jerseys and match kits by team with large, prominent jersey names and numbers.
 * 
 * @param {Array} players - Array of player registration objects
 * @param {Array} teamsList - Array of the 8 official tournament teams
 * @param {object} options - Additional metadata (adminName, etc.)
 */
export async function generateTeamsRosterPDF(players = [], teamsList = null, options = {}) {
  const teams = teamsList && teamsList.length === 8 ? teamsList : getStoredTeams();

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

  // Group players by teamId
  const teamBuckets = {};
  teams.forEach((t) => {
    teamBuckets[t.id] = [];
  });
  const unassignedPlayers = [];

  players.forEach((player) => {
    if (player.teamId && teamBuckets[player.teamId]) {
      teamBuckets[player.teamId].push(player);
    } else {
      unassignedPlayers.push(player);
    }
  });

  // ==========================================
  // PAGE 1: TOURNAMENT OVERVIEW & 8-TEAM INDEX
  // ==========================================

  // 1. TOP HEADER BANNER
  doc.setFillColor(15, 118, 110); // Teal
  doc.rect(0, 0, pageWidth, 26, 'F');

  // Decorative top accent stripe (gold/amber)
  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NEXTGEN CRICKET TOURNAMENT 2026', 14, 12);

  // Subtitle
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(204, 251, 241);
  doc.text('OFFICIAL 8 TEAMS SQUAD ROSTER & JERSEY DISTRIBUTION REPORT', 14, 18);

  // Date and Admin Info
  doc.setFontSize(8);
  doc.setTextColor(240, 253, 250);
  doc.text(`Generated: ${formattedDate}, ${formattedTime}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Organizer: ${options.adminName || 'Tournament Committee'}`, pageWidth - 14, 18, { align: 'right' });

  // 2. TOURNAMENT METADATA & SUMMARY METRICS BAR
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 30, pageWidth - 28, 16, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('TOURNAMENT FORMAT:', 18, 36.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('8 Teams  |  Full Match Kit & Custom Jersey Included  |  Venue: J.K. Knowledge Centre', 56, 36.5);

  const statsStartX = pageWidth - 140;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Players: ${totalPlayers}`, statsStartX, 36.5);

  doc.setTextColor(22, 101, 52);
  doc.text(`Verified: ${verifiedCount}`, statsStartX + 35, 36.5);

  doc.setTextColor(180, 83, 9);
  doc.text(`Pending: ${pendingCount}`, statsStartX + 65, 36.5);

  doc.setTextColor(15, 118, 110);
  doc.text(`Teams: 8 Active`, statsStartX + 95, 36.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.text('This official roster is separated team-by-team to simplify jersey packaging, kit allocation, and team sheets.', 18, 42);

  // 3. 8-TEAMS SUMMARY TABLE
  const summaryRows = teams.map((team, idx) => {
    const squad = teamBuckets[team.id] || [];
    const teamVerified = squad.filter((p) => p.paymentStatus === 'verified').length;
    const breakdown = getTshirtBreakdown(squad);
    const breakdownStr = Object.entries(breakdown)
      .map(([sz, qty]) => `${sz}: ${qty}`)
      .join(', ') || 'No players yet';

    return [
      String(idx + 1),
      team.name,
      team.shortName,
      String(squad.length),
      String(teamVerified),
      breakdownStr,
    ];
  });

  // Add unassigned row if any
  if (unassignedPlayers.length > 0) {
    summaryRows.push([
      '-',
      'Unassigned / Draft Pool',
      'UN',
      String(unassignedPlayers.length),
      String(unassignedPlayers.filter((p) => p.paymentStatus === 'verified').length),
      'Awaiting squad allocation',
    ]);
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('8 TEAMS SQUAD & JERSEY SUMMARY', 14, 52);

  autoTable(doc, {
    startY: 56,
    head: [[
      '#',
      'Team Name',
      'Code',
      'Squad Size',
      'Verified',
      'Jersey Sizes Breakdown (Chest)',
    ]],
    body: summaryRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 2.8,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 50, fontStyle: 'bold' },
      2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 26, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 24, halign: 'center' },
      5: { cellWidth: 'auto' },
    },
  });

  // Overall Tournament Jersey Sizes Total box
  const totalBreakdown = getTshirtBreakdown(players);
  const totalBreakdownStr = formatBreakdownString(totalBreakdown);

  const finalSummaryY = doc.lastAutoTable.finalY + 8;
  if (finalSummaryY < pageHeight - 35) {
    doc.setFillColor(241, 245, 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(14, finalSummaryY, pageWidth - 28, 14, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text('TOTAL TOURNAMENT JERSEY QUANTITIES (FOR PRINTING & VENDOR):', 18, finalSummaryY + 5.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 118, 110);
    doc.text(totalBreakdownStr, 18, finalSummaryY + 10.5);
  }

  // ==========================================
  // PAGES 2+: INDIVIDUAL TEAM SQUAD & JERSEY SHEETS
  // Each team gets a dedicated page for clean separation!
  // ==========================================
  teams.forEach((team, teamIndex) => {
    doc.addPage();

    const squad = teamBuckets[team.id] || [];
    const teamColor = team.rgb || (team.color ? hexToRgb(team.color) : [15, 118, 110]);

    // Team Banner Header
    doc.setFillColor(teamColor[0], teamColor[1], teamColor[2]);
    doc.rect(0, 0, pageWidth, 24, 'F');

    // Accent line
    doc.setFillColor(255, 255, 255, 0.4);
    doc.rect(0, 0, pageWidth, 1.5, 'F');

    // Team Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text(`TEAM ${teamIndex + 1}: ${team.name.toUpperCase()} [${team.shortName}]`, 14, 11);

    // Subtitle
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(255, 255, 255);
    doc.text('OFFICIAL TEAM ROSTER & CUSTOM JERSEY KIT DISTRIBUTION SHEET', 14, 17);

    // Right side info
    doc.setFontSize(8);
    doc.text(`Squad: ${squad.length} Players  |  NextGen Cricket 2026`, pageWidth - 14, 14, { align: 'right' });

    // Team Jersey Logistics Strip
    const teamBreakdown = getTshirtBreakdown(squad);
    const teamBreakdownStr = formatBreakdownString(teamBreakdown);

    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, 28, pageWidth - 28, 12, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text(`JERSEY KITS TO DISTRIBUTE:`, 18, 35.5);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(teamColor[0], teamColor[1], teamColor[2]);
    doc.text(`${teamBreakdownStr}  (Total: ${squad.length})`, 65, 35.5);

    // Team Table Data
    const tableData = squad.map((player, pIdx) => {
      const jerseyName = (player.tshirtName || '-').toUpperCase();
      const jerseyNum = player.tshirtNumber ? `#${player.tshirtNumber}` : '-';
      const sizeStr = formatTshirtSizeWithNumber(player.tshirtSize);
      const statusStr = player.paymentStatus === 'verified' ? 'Verified' : 'Pending';

      return [
        String(pIdx + 1),
        jerseyName,
        jerseyNum,
        sizeStr,
        player.fullName || 'Unnamed',
        player.mobile || 'N/A',
        player.id || '-',
        statusStr,
        '', // Blank for player signature / kit handover
      ];
    });

    if (squad.length === 0) {
      tableData.push([
        '-',
        'NO PLAYERS',
        '-',
        '-',
        'No players assigned to this squad yet. Assign players from the Admin Dashboard.',
        '-',
        '-',
        '-',
        '-',
      ]);
    }

    autoTable(doc, {
      startY: 44,
      head: [[
        '#',
        'JERSEY NAME',
        'JERSEY #',
        'SIZE (CHEST)',
        'PLAYER FULL NAME',
        'MOBILE NUMBER',
        'REG ID',
        'STATUS',
        'KIT RECEIVED SIGN',
      ]],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: teamColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'left',
        cellPadding: 3,
      },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 38, fontStyle: 'bold', textColor: teamColor }, // Jersey Name prominent!
        2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },     // Jersey Number
        3: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },     // Size (Chest)
        4: { cellWidth: 46, fontStyle: 'bold' },                       // Player Full Name
        5: { cellWidth: 28 },                                          // Mobile Number
        6: { cellWidth: 28, fontStyle: 'bold', textColor: [100, 116, 139] }, // Reg ID
        7: { cellWidth: 24, halign: 'center' },                        // Status
        8: { cellWidth: 51, halign: 'center' },                        // Signature / kit handover
      },
    });

    // Notes for kit distribution staff
    const kitNoteY = doc.lastAutoTable.finalY + 8;
    if (kitNoteY < pageHeight - 20) {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text(
        `* Instructions: Verify jersey name and chest size before handing kit to player. Collect player signature in the last column.`,
        14,
        kitNoteY
      );
    }
  });

  // ==========================================
  // UNASSIGNED PLAYERS PAGE (If any)
  // ==========================================
  if (unassignedPlayers.length > 0) {
    doc.addPage();

    doc.setFillColor(71, 85, 105); // Slate
    doc.rect(0, 0, pageWidth, 24, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('UNASSIGNED PLAYERS & DRAFT POOL', 14, 11);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text('Players awaiting squad assignment into one of the 8 tournament teams', 14, 17);

    const unassignedData = unassignedPlayers.map((player, pIdx) => [
      String(pIdx + 1),
      (player.tshirtName || '-').toUpperCase(),
      player.tshirtNumber ? `#${player.tshirtNumber}` : '-',
      formatTshirtSizeWithNumber(player.tshirtSize),
      player.fullName || 'Unnamed',
      player.mobile || 'N/A',
      player.id || '-',
      player.paymentStatus === 'verified' ? 'Verified' : 'Pending',
      '', // Blank for assigned team
    ]);

    autoTable(doc, {
      startY: 32,
      head: [[
        '#',
        'JERSEY NAME',
        'JERSEY #',
        'SIZE (CHEST)',
        'PLAYER FULL NAME',
        'MOBILE NUMBER',
        'REG ID',
        'STATUS',
        'ASSIGNED TEAM NOTE',
      ]],
      body: unassignedData,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8.5,
        cellPadding: 3,
      },
      styles: {
        font: 'helvetica',
        fontSize: 8,
        cellPadding: 3,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252],
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 38, fontStyle: 'bold', textColor: [15, 118, 110] },
        2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        3: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 46, fontStyle: 'bold' },
        5: { cellWidth: 28 },
        6: { cellWidth: 28, fontStyle: 'bold' },
        7: { cellWidth: 24, halign: 'center' },
        8: { cellWidth: 51 },
      },
    });
  }

  // Add footer to all pages
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);

    doc.text(
      'NextGen Cricket 2026 • Official 8-Team Jersey & Squad Separation Roster • Confidential',
      14,
      pageHeight - 7
    );

    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14,
      pageHeight - 7,
      { align: 'right' }
    );
  }

  const fileDate = now.toISOString().slice(0, 10);
  const fileName = `NextGen_Cricket_8_Teams_Jersey_Roster_${fileDate}.pdf`;

  const result = await downloadOrOpenPdf(doc, fileName);

  return {
    ...result,
    recordCount: totalPlayers,
    teamCount: teams.length,
  };
}

/**
 * Generate a single team's squad & jersey sheet PDF
 * Perfect for sending to a specific team captain or umpire!
 */
export async function generateSingleTeamPDF(team, squad = [], options = {}) {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const now = new Date();
  const teamColor = team.rgb || (team.color ? hexToRgb(team.color) : [15, 118, 110]);

  // Team Banner Header
  doc.setFillColor(teamColor[0], teamColor[1], teamColor[2]);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFillColor(255, 255, 255, 0.4);
  doc.rect(0, 0, pageWidth, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(`${team.name.toUpperCase()} [${team.shortName}] - OFFICIAL SQUAD & JERSEY SHEET`, 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('NEXTGEN CRICKET TOURNAMENT 2026  •  OFFICIAL MATCH ROSTER', 14, 18);

  doc.setFontSize(8);
  doc.text(`Squad: ${squad.length} Players  |  ${now.toLocaleDateString('en-IN')}`, pageWidth - 14, 14, { align: 'right' });

  // Team Jersey Logistics Strip
  const teamBreakdown = getTshirtBreakdown(squad);
  const teamBreakdownStr = formatBreakdownString(teamBreakdown);

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 30, pageWidth - 28, 14, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text(`TEAM JERSEY KITS SUMMARY:`, 18, 38.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(teamColor[0], teamColor[1], teamColor[2]);
  doc.text(`${teamBreakdownStr}  (Total Kits: ${squad.length})`, 70, 38.5);

  const tableData = squad.map((player, pIdx) => [
    String(pIdx + 1),
    (player.tshirtName || '-').toUpperCase(),
    player.tshirtNumber ? `#${player.tshirtNumber}` : '-',
    formatTshirtSizeWithNumber(player.tshirtSize),
    player.fullName || 'Unnamed',
    player.mobile || 'N/A',
    player.id || '-',
    player.paymentStatus === 'verified' ? 'Verified' : 'Pending',
    '', // Signature
  ]);

  if (squad.length === 0) {
    tableData.push([
      '-',
      'NO PLAYERS',
      '-',
      '-',
      'No players assigned to this squad yet.',
      '-',
      '-',
      '-',
      '-',
    ]);
  }

  autoTable(doc, {
    startY: 49,
    head: [[
      '#',
      'JERSEY NAME',
      'JERSEY #',
      'SIZE (CHEST)',
      'PLAYER FULL NAME',
      'MOBILE NUMBER',
      'REG ID',
      'STATUS',
      'KIT RECEIVED SIGN',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: teamColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: 3,
    },
    styles: {
      font: 'helvetica',
      fontSize: 8,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 38, fontStyle: 'bold', textColor: teamColor },
      2: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 46, fontStyle: 'bold' },
      5: { cellWidth: 28 },
      6: { cellWidth: 28, fontStyle: 'bold' },
      7: { cellWidth: 24, halign: 'center' },
      8: { cellWidth: 51, halign: 'center' },
    },
  });

  // Footer
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`${team.name} • Official Team Sheet • NextGen Cricket 2026`, 14, pageHeight - 7);
  doc.text('Page 1 of 1', pageWidth - 14, pageHeight - 7, { align: 'right' });

  const safeTeam = team.name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `${safeTeam}_Squad_Jersey_Sheet.pdf`;

  const result = await downloadOrOpenPdf(doc, fileName);
  return {
    ...result,
    recordCount: squad.length,
  };
}

/**
 * Original chronological registrations master list PDF
 */
export async function generateRegistrationsPDF(players = [], options = {}) {
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
  doc.setFillColor(15, 118, 110);
  doc.rect(0, 0, pageWidth, 26, 'F');

  doc.setFillColor(245, 158, 11);
  doc.rect(0, 0, pageWidth, 2.5, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('NEXTGEN CRICKET TOURNAMENT 2026', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(204, 251, 241);
  doc.text('MASTER PLAYER REGISTRATION & PAYMENT VERIFICATION ROSTER', 14, 18);

  doc.setFontSize(8);
  doc.setTextColor(240, 253, 250);
  doc.text(`Generated: ${formattedDate}, ${formattedTime}`, pageWidth - 14, 12, { align: 'right' });
  doc.text(`Organizer: ${options.adminName || 'Tournament Committee'}`, pageWidth - 14, 18, { align: 'right' });

  // 2. SUMMARY METRICS BAR
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 30, pageWidth - 28, 15, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text('MATCH INFO:', 18, 36.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('Sunday, 25 October 2026  |  Venue: J.K. Knowledge Centre, Wadala  |  Fee: Rs. 600', 42, 36.5);

  const statsStartX = pageWidth - 130;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`Total Players: ${totalPlayers}`, statsStartX, 36.5);

  doc.setTextColor(22, 101, 52);
  doc.text(`Verified: ${verifiedCount}`, statsStartX + 32, 36.5);

  doc.setTextColor(180, 83, 9);
  doc.text(`Pending: ${pendingCount}`, statsStartX + 60, 36.5);

  doc.setTextColor(185, 28, 28);
  doc.text(`Rejected: ${rejectedCount}`, statsStartX + 88, 36.5);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(7.5);
  doc.text('Official registered participants sorted by registration timestamp', 18, 41.5);

  // 3. TABLE GENERATION WITH ALL PLAYER DETAILS
  const teams = getStoredTeams();
  const tableData = players.map((player, index) => {
    let regDate = '-';
    if (player.createdAt) {
      try {
        const d = new Date(player.createdAt);
        regDate = `${d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
      } catch {
        regDate = player.createdAt;
      }
    }

    const playerTeam = getTeamById(player.teamId, teams);
    const teamDisplayName = player.teamId ? `${playerTeam.name} [${playerTeam.shortName}]` : 'Unassigned (Draft)';
    const statusText = player.paymentStatus === 'verified' ? 'Verified' : player.paymentStatus === 'rejected' ? 'Rejected' : 'Pending';

    return [
      String(index + 1),
      player.fullName || 'Unnamed Player',
      player.mobile || 'N/A',
      player.email || '-',
      teamDisplayName,
      (player.tshirtName || '-').toUpperCase(),
      player.tshirtNumber ? `#${player.tshirtNumber}` : '-',
      formatTshirtSizeWithNumber(player.tshirtSize),
      statusText,
      regDate,
    ];
  });

  autoTable(doc, {
    startY: 49,
    head: [[
      '#',
      'PLAYER NAME',
      'MOBILE',
      'EMAIL ADDRESS',
      'ASSIGNED TEAM',
      'JERSEY NAME',
      'JERSEY #',
      'SIZE',
      'STATUS',
      'REGISTRATION DATE',
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
      halign: 'left',
      cellPadding: 3,
    },
    styles: {
      font: 'helvetica',
      fontSize: 7.5,
      cellPadding: 2.5,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      overflow: 'linebreak',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 38, fontStyle: 'bold', textColor: [15, 23, 42] },
      2: { cellWidth: 25 },
      3: { cellWidth: 38, textColor: [71, 85, 105] },
      4: { cellWidth: 32, fontStyle: 'bold', textColor: [15, 118, 110] },
      5: { cellWidth: 30, fontStyle: 'bold' },
      6: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      8: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
      9: { cellWidth: 34, fontSize: 7 },
    },
    didDrawPage: function (data) {
      const pageNumber = doc.internal.getNumberOfPages();
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.2);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(148, 163, 184);
      doc.text('NextGen Cricket 2026 • Master Players Directory with All Details • Confidential', 14, pageHeight - 7);
      doc.text(`Page ${data.pageNumber} of ${pageNumber}`, pageWidth - 14, pageHeight - 7, { align: 'right' });
    },
    margin: { left: 14, right: 14, top: 49, bottom: 16 },
  });

  const fileDate = now.toISOString().slice(0, 10);
  const fileName = `NextGen_Cricket_All_Players_Complete_Roster_${fileDate}.pdf`;

  const result = await downloadOrOpenPdf(doc, fileName);

  return {
    ...result,
    recordCount: totalPlayers,
  };
}

/**
 * Instant CSV / Excel Export of all player registrations with complete details
 * @param {Array} players 
 * @param {Array} teamsList 
 */
export function downloadAllPlayersCSV(players = [], teamsList = null) {
  const teams = teamsList || getStoredTeams();

  const headers = [
    'No.',
    'Player Full Name',
    'Mobile Number',
    'Email Address',
    'Assigned Tournament Team',
    'Team Code',
    'Jersey Name',
    'Jersey Number',
    'T-Shirt Size',
    'Payment Verification Status',
    'Registration Date & Time',
    'Payment Proof Screenshot Status',
    'Notes / Details',
  ];

  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '""';
    const stringVal = String(value).replace(/"/g, '""');
    return `"${stringVal}"`;
  };

  const rows = players.map((p, idx) => {
    const team = getTeamById(p.teamId, teams);
    const regDate = p.createdAt ? new Date(p.createdAt).toLocaleString('en-IN') : 'N/A';
    const proofStatus = p.paymentScreenshot ? 'Receipt Screenshot Uploaded' : 'No Receipt';

    return [
      idx + 1,
      escapeCSV(p.fullName),
      escapeCSV(p.mobile),
      escapeCSV(p.email),
      escapeCSV(p.teamId ? team.name : 'Unassigned Draft Pool'),
      escapeCSV(p.teamId ? team.shortName : '-'),
      escapeCSV(p.tshirtName || '-'),
      escapeCSV(p.tshirtNumber ? `#${p.tshirtNumber}` : '-'),
      escapeCSV(formatTshirtSizeWithNumber(p.tshirtSize)),
      escapeCSV(p.paymentStatus === 'verified' ? 'Verified' : p.paymentStatus === 'rejected' ? 'Rejected' : 'Pending'),
      escapeCSV(regDate),
      escapeCSV(proofStatus),
      escapeCSV(p.notes || ''),
    ].join(',');
  });

  // UTF-8 BOM prefix (\uFEFF) ensures Excel and Numbers render non-ASCII symbols correctly
  const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `NextGen_Cricket_All_Players_Full_Details_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  return { success: true, count: players.length };
}
