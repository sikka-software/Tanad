/**
 * Converts an array of objects to a CSV string.
 * @param data Array of objects to convert.
 * @param headers Array of { label: string, key: string } objects for CSV headers.
 * @returns The CSV string.
 */
function convertToCSV(
  data: Record<string, any>[],
  headers: { label: string; key: string }[],
): string {
  const headerRow = headers.map((header) => `"${header.label.replace(/"/g, '""')}"`).join(",");
  const dataRows = data.map((row) => {
    return headers
      .map((header) => {
        let value = row[header.key];
        // Handle null/undefined
        if (value === null || value === undefined) {
          value = "";
        }
        // Handle objects/arrays (e.g., JSON details)
        else if (typeof value === "object") {
          value = JSON.stringify(value);
        }
        // Escape double quotes within values
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",");
  });
  return [headerRow, ...dataRows].join("\n");
}

/**
 * Triggers a browser download for the given CSV content.
 * @param csvContent The CSV string content.
 * @param filename The desired filename for the downloaded file.
 */
function triggerDownload(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  if (link.download !== undefined) {
    // Browsers that support HTML5 download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Fallback for older browsers (less common now)
    console.warn("Browser does not support direct download attribute.");
    // Potentially show the CSV in a new tab or provide alternative instructions
  }
}

/**
 * Converts data to CSV and triggers a download.
 * @param data Array of objects.
 * @param headers Array of { label: string, key: string } for headers.
 * @param filename Desired download filename.
 */
export function downloadCSV(
  data: Record<string, any>[],
  headers: { label: string; key: string }[],
  filename: string,
): void {
  const csvString = convertToCSV(data, headers);
  triggerDownload(csvString, filename);
}
