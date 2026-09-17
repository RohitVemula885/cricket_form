/**
 * Direct PDF Downloader Utility
 * Ensures PDF files download directly to the device storage without invoking
 * the Web Share dialog or share options.
 */

/**
 * Direct file download trigger for mobile and desktop browsers
 */
export function triggerDirectDownload(blobOrUrl, fileName) {
  let objectUrl = null;
  let href = blobOrUrl;

  if (blobOrUrl instanceof Blob) {
    objectUrl = URL.createObjectURL(blobOrUrl);
    href = objectUrl;
  }

  try {
    const a = document.createElement('a');
    a.href = href;
    a.download = fileName;
    a.setAttribute('download', fileName);
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (a.parentNode) {
        document.body.removeChild(a);
      }
      if (objectUrl) {
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60000);
      }
    }, 400);
  } catch (err) {
    console.warn('Anchor direct download failed:', err);
    try {
      window.location.href = href;
    } catch {
      // ignore
    }
  }
}

export async function downloadOrOpenPdf(doc, fileName) {
  const isIOS =
    typeof navigator !== 'undefined' &&
    (/iPad|iPhone|iPod/.test(navigator.userAgent || '') ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));

  const isAndroid =
    typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '');

  const isMobile = isIOS || isAndroid;

  // 1. Generate Blob & Data URI
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  const dataUriString = doc.output('datauristring');

  // 2. Direct Download - save directly without showing any share dialog
  try {
    // jsPDF's built-in save triggers direct file download
    doc.save(fileName);
  } catch (saveErr) {
    console.warn('doc.save failed, falling back to direct anchor download:', saveErr);
    triggerDirectDownload(pdfBlob, fileName);
  }

  // 3. For iOS Safari: if doc.save does not trigger a file save in iOS webkit,
  // we provide the direct blob link so the user can open/view it directly
  if (isIOS) {
    try {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (link.parentNode) document.body.removeChild(link);
      }, 400);
    } catch {
      // fallback handled by return
    }
  }

  return {
    success: true,
    fileName,
    blobUrl,
    dataUriString,
    isMobile,
    method: 'direct-download',
  };
}

