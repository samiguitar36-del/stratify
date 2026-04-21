const objectToCsv = (data: Record<string, unknown>) => {
  const rows = Object.entries(data).map(([key, value]) => ({
    campo: key,
    valor:
      typeof value === "object" && value !== null ? JSON.stringify(value) : String(value ?? ""),
  }));

  const headers = ["campo", "valor"];
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => `"${String(row[header as keyof typeof row]).replace(/"/g, '""')}"`)
        .join(","),
    ),
  ];

  return lines.join("\n");
};

const downloadBlob = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

export const exportToJson = (filename: string, data: Record<string, unknown>) => {
  downloadBlob(JSON.stringify(data, null, 2), `${filename}.json`, "application/json");
};

export const exportToCsv = (filename: string, data: Record<string, unknown>) => {
  downloadBlob(objectToCsv(data), `${filename}.csv`, "text/csv;charset=utf-8;");
};
