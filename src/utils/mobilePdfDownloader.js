/**
 * Robust Mobile and Desktop File Saver Utility
 * Handles mobile browser security sandboxes (Chrome on Android, Safari on iOS,
 * in-app webviews like Instagram/WhatsApp/Facebook browsers, Samsung Internet, etc.)
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
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
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
    console.warn('Anchor download failed, redirecting:', err);
    window.location.href = href;
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

  // 2. Try native Web Share API with files (Android Chrome & iOS Safari support sharing files directly!)
  if (navigator.share && navigator.canShare) {
    try {
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'NextGen Cricket 2026 Roster',
          text: 'Official Player Registrations PDF',
          files: [file],
        });
        return {
          success: true,
          fileName,
          blobUrl,
          dataUriString,
          isMobile,
          method: 'share',
        };
      }
    } catch (shareErr) {
      // User cancelled share or browser fell back - proceed to standard open/save
      if (shareErr.name !== 'AbortError') {
        console.warn('Web Share API attempt did not complete, falling back:', shareErr);
      }
    }
  }

  // 3. For iOS: Safari completely ignores the "download" attribute on <a> tags.
  // Instead, opening the Data URI or Blob in a new tab allows iOS native PDF viewer to render it.
  if (isIOS) {
    try {
      const opened = window.open(blobUrl, '_blank');
      if (!opened || opened.closed || typeof opened.closed === 'undefined') {
        window.location.href = blobUrl;
      }
    } catch {
      window.location.href = dataUriString;
    }
    return {
      success: true,
      fileName,
      blobUrl,
      dataUriString,
      isMobile,
      method: 'ios-view',
    };
  }

  // 4. For Android & Desktop:
  try {
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = fileName;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      if (link.parentNode) {
        document.body.removeChild(link);
      }
    }, 500);

    // If mobile Android, also attempt data URI trigger if blob is restricted by browser
    if (isAndroid) {
      setTimeout(() => {
        try {
          doc.save(fileName);
        } catch {
          // ignore
        }
      }, 250);
    }
  } catch (err) {
    console.warn('Anchor tag download failed:', err);
    try {
      doc.save(fileName);
    } catch (saveErr) {
      console.error('doc.save fallback failed:', saveErr);
    }
  }

  return {
    success: true,
    fileName,
    blobUrl,
    dataUriString,
    isMobile,
    method: 'download',
  };
}
