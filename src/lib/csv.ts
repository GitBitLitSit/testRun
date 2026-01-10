export function escapeCsvCell(value: unknown): string {
  if (value === null || value === undefined) return "\"\"";
  const s = String(value).replace(/"/g, "\"\"");
  return `"${s}"`;
}

export function stringifyCsv(rows: unknown[][], newline = "\n"): string {
  return rows.map((row) => row.map(escapeCsvCell).join(",")).join(newline);
}

// Minimal RFC4180-ish CSV parser (supports quoted fields, escaped quotes, commas and newlines).
export function parseCsv(input: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i++) {
    const c = input[i];

    if (inQuotes) {
      if (c === "\"") {
        const next = input[i + 1];
        if (next === "\"") {
          field += "\"";
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === "\"") {
      inQuotes = true;
      continue;
    }

    if (c === ",") {
      row.push(field);
      field = "";
      continue;
    }

    if (c === "\n" || c === "\r") {
      // Handle CRLF
      if (c === "\r" && input[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
      continue;
    }

    field += c;
  }

  // Flush last field/row
  if (inQuotes) {
    // Tolerate missing closing quote by treating remaining as field content.
    inQuotes = false;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  // Drop trailing empty rows (common from ending newline)
  while (rows.length > 0 && rows[rows.length - 1]?.every((v) => v === "")) {
    rows.pop();
  }

  return rows;
}

