import type {
  AnalysisContext,
  ComparisonMetricRow,
  ModuleDefinition,
  ModuleResult,
  SavedScenario,
  ScenarioComparisonResult,
} from "../types/finance";

type ExcelJSModule = typeof import("exceljs");
type Workbook = import("exceljs").Workbook;
type Worksheet = import("exceljs").Worksheet;
type Row = import("exceljs").Row;

interface ExportAnalysisWorkbookOptions {
  filename: string;
  moduleDefinition: ModuleDefinition<Record<string, number>>;
  inputs: Record<string, number>;
  result: ModuleResult;
  scenarioName: string;
  scenarioContext: AnalysisContext;
  conclusion: string;
  comparison?: ScenarioComparisonResult | null;
}

interface ExportComparisonWorkbookOptions {
  filename: string;
  moduleDefinition: ModuleDefinition<Record<string, number>>;
  comparison: ScenarioComparisonResult;
}

const BRAND_NAME = "Stratify";
const BRAND_SUBTITLE = "Decision Engine for Finance & Business";
const HEADER_FILL = "10243E";
const SUBHEADER_FILL = "0D9488";
const LABEL_FILL = "EDF3F8";
const ACCENT_FILL = "D8EBF7";

const loadExcelJS = async (): Promise<ExcelJSModule> => import("exceljs");

const downloadBuffer = async (filename: string, workbook: Workbook) => {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
};

const styleBrandHeader = (worksheet: Worksheet, rowNumber: number) => {
  const row = worksheet.getRow(rowNumber);
  row.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 16 };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: HEADER_FILL },
  };
};

const styleSectionHeader = (worksheet: Worksheet, rowNumber: number) => {
  const row = worksheet.getRow(rowNumber);
  row.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 12 };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: SUBHEADER_FILL },
  };
};

const styleTableHeader = (row: Row) => {
  row.font = { bold: true, color: { argb: HEADER_FILL } };
  row.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: LABEL_FILL },
  };
  row.alignment = { vertical: "middle", horizontal: "left" };
};

const setCommonWorksheetLayout = (worksheet: Worksheet) => {
  worksheet.columns = [
    { width: 30 },
    { width: 22 },
    { width: 22 },
    { width: 20 },
    { width: 18 },
    { width: 18 },
  ];
};

const appendWorkbookHeader = (
  worksheet: Worksheet,
  moduleName: string,
  scenarioName: string,
) => {
  const brandRow = worksheet.addRow([BRAND_NAME]);
  worksheet.mergeCells(`A${brandRow.number}:F${brandRow.number}`);
  styleBrandHeader(worksheet, brandRow.number);

  const subtitleRow = worksheet.addRow([BRAND_SUBTITLE]);
  worksheet.mergeCells(`A${subtitleRow.number}:F${subtitleRow.number}`);
  subtitleRow.font = { italic: true, color: { argb: "FFFFFFFF" } };
  subtitleRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: HEADER_FILL },
  };

  const metaTitleRow = worksheet.addRow(["Resumen de exportacion"]);
  worksheet.mergeCells(`A${metaTitleRow.number}:F${metaTitleRow.number}`);
  styleSectionHeader(worksheet, metaTitleRow.number);

  const exportDate = new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  [
    ["Fecha de exportacion", exportDate],
    ["Modulo", moduleName],
    ["Escenario", scenarioName],
  ].forEach(([label, value]) => {
    const row = worksheet.addRow([label, value]);
    row.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: LABEL_FILL },
    };
  });
};

const appendKeyValueSection = (
  worksheet: Worksheet,
  title: string,
  entries: Array<{ label: string; value: number | string }>,
) => {
  worksheet.addRow([]);
  const titleRow = worksheet.addRow([title]);
  worksheet.mergeCells(`A${titleRow.number}:D${titleRow.number}`);
  styleSectionHeader(worksheet, titleRow.number);

  const headerRow = worksheet.addRow(["Concepto", "Valor"]);
  styleTableHeader(headerRow);

  entries.forEach((entry) => {
    const row = worksheet.addRow([entry.label, entry.value]);
    row.getCell(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: ACCENT_FILL },
    };
  });
};

const appendTextListSection = (
  worksheet: Worksheet,
  title: string,
  items: string[],
) => {
  worksheet.addRow([]);
  const titleRow = worksheet.addRow([title]);
  worksheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
  styleSectionHeader(worksheet, titleRow.number);

  items.forEach((item) => {
    const row = worksheet.addRow([item]);
    worksheet.mergeCells(`A${row.number}:F${row.number}`);
    row.alignment = { wrapText: true };
  });
};

const appendComparisonTable = (
  worksheet: Worksheet,
  title: string,
  rows: ComparisonMetricRow[],
) => {
  worksheet.addRow([]);
  const titleRow = worksheet.addRow([title]);
  worksheet.mergeCells(`A${titleRow.number}:F${titleRow.number}`);
  styleSectionHeader(worksheet, titleRow.number);

  const headerRow = worksheet.addRow([
    "Concepto",
    "Escenario A",
    "Escenario B",
    "Diferencia absoluta",
    "Variacion %",
    "Lectura",
  ]);
  styleTableHeader(headerRow);

  rows.forEach((rowData) => {
    worksheet.addRow([
      rowData.label,
      rowData.scenarioAValue,
      rowData.scenarioBValue,
      rowData.differenceAbsolute ?? "N/D",
      rowData.differencePercent ?? "N/D",
      rowData.betterScenario === "equal"
        ? "Empate"
        : rowData.betterScenario === "A"
          ? "Mejor A"
          : rowData.betterScenario === "B"
            ? "Mejor B"
            : "Referencia",
    ]);
  });
};

const appendScenarioContextSection = (
  worksheet: Worksheet,
  title: string,
  context: AnalysisContext,
) => {
  appendKeyValueSection(worksheet, title, [
    { label: "Cliente", value: context.clientName || "Sin definir" },
    { label: "Proyecto", value: context.projectName || "Sin definir" },
    { label: "Responsable", value: context.advisorName || "Sin definir" },
    { label: "Fecha", value: context.analysisDate || "Sin definir" },
    { label: "Tags", value: context.tags.length > 0 ? context.tags.join(", ") : "Sin tags" },
    {
      label: "Notas ejecutivas",
      value: context.executiveNotes || "Sin notas ejecutivas",
    },
    {
      label: "Recomendacion",
      value: context.finalRecommendation || "Sin recomendacion",
    },
  ]);
};

const appendSavedScenarioContextSection = (
  worksheet: Worksheet,
  title: string,
  scenario: SavedScenario,
) => {
  appendScenarioContextSection(worksheet, title, scenario.context);
};

export const exportAnalysisToXlsx = async ({
  filename,
  moduleDefinition,
  inputs,
  result,
  scenarioName,
  scenarioContext,
  conclusion,
  comparison,
}: ExportAnalysisWorkbookOptions) => {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = BRAND_NAME;
  workbook.created = new Date();

  const analysisSheet = workbook.addWorksheet("Analisis");
  setCommonWorksheetLayout(analysisSheet);
  appendWorkbookHeader(analysisSheet, moduleDefinition.name, scenarioName);
  appendScenarioContextSection(analysisSheet, "Contexto del analisis", scenarioContext);

  appendKeyValueSection(
    analysisSheet,
    "Inputs capturados",
    moduleDefinition.fields.map((field) => ({
      label: field.label,
      value: inputs[field.name],
    })),
  );
  appendKeyValueSection(
    analysisSheet,
    "Resultados calculados",
    result.summary.map((item) => ({ label: item.label, value: item.value })),
  );
  appendKeyValueSection(analysisSheet, "Desglose ejecutivo", result.details);
  appendTextListSection(analysisSheet, "Resumen ejecutivo", result.insights);
  appendTextListSection(analysisSheet, "Conclusion automatica", [conclusion]);

  result.tables?.forEach((table) => {
    analysisSheet.addRow([]);
    const titleRow = analysisSheet.addRow([table.title]);
    analysisSheet.mergeCells(`A${titleRow.number}:E${titleRow.number}`);
    styleSectionHeader(analysisSheet, titleRow.number);

    const headerRow = analysisSheet.addRow(table.columns);
    styleTableHeader(headerRow);

    table.rows.forEach((row) => {
      analysisSheet.addRow(row);
    });
  });

  if (comparison) {
    const comparisonSheet = workbook.addWorksheet("Comparacion");
    setCommonWorksheetLayout(comparisonSheet);
    appendWorkbookHeader(
      comparisonSheet,
      `${moduleDefinition.name} - Comparacion`,
      `${comparison.scenarioA.name} vs ${comparison.scenarioB.name}`,
    );
    appendSavedScenarioContextSection(
      comparisonSheet,
      `Contexto - ${comparison.scenarioA.name}`,
      comparison.scenarioA,
    );
    appendSavedScenarioContextSection(
      comparisonSheet,
      `Contexto - ${comparison.scenarioB.name}`,
      comparison.scenarioB,
    );
    appendComparisonTable(comparisonSheet, "Inputs relevantes", comparison.inputs);
    appendComparisonTable(comparisonSheet, "Resultados clave", comparison.metrics);
    appendTextListSection(comparisonSheet, "Conclusion comparativa", [comparison.conclusion]);
  }

  await downloadBuffer(filename, workbook);
};

export const exportComparisonToXlsx = async ({
  filename,
  moduleDefinition,
  comparison,
}: ExportComparisonWorkbookOptions) => {
  const ExcelJS = await loadExcelJS();
  const workbook = new ExcelJS.Workbook();
  workbook.creator = BRAND_NAME;
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet("Comparacion");
  setCommonWorksheetLayout(worksheet);
  appendWorkbookHeader(
    worksheet,
    `${moduleDefinition.name} - Comparacion`,
    `${comparison.scenarioA.name} vs ${comparison.scenarioB.name}`,
  );
  appendSavedScenarioContextSection(
    worksheet,
    `Contexto - ${comparison.scenarioA.name}`,
    comparison.scenarioA,
  );
  appendSavedScenarioContextSection(
    worksheet,
    `Contexto - ${comparison.scenarioB.name}`,
    comparison.scenarioB,
  );
  appendComparisonTable(worksheet, "Inputs relevantes", comparison.inputs);
  appendComparisonTable(worksheet, "Resultados clave", comparison.metrics);
  appendTextListSection(worksheet, "Conclusion comparativa", [comparison.conclusion]);

  await downloadBuffer(filename, workbook);
};
