import { Download, FileSpreadsheet } from "lucide-react";
import { Button } from "./ui/Button";

interface ExportActionsProps {
  onExportAnalysis: () => void;
  onExportComparison?: () => void;
  compact?: boolean;
  isExporting?: boolean;
}

export function ExportActions({
  onExportAnalysis,
  onExportComparison,
  compact = false,
  isExporting = false,
}: ExportActionsProps) {
  return (
    <div className={`flex ${compact ? "flex-col" : "flex-wrap"} gap-3`}>
      <div className="flex flex-col gap-1">
        <Button
          variant="secondary"
          onClick={onExportAnalysis}
          disabled={isExporting}
          icon={<FileSpreadsheet className="h-4 w-4" />}
        >
          {isExporting ? "Generando..." : "Descargar reporte para cliente"}
        </Button>
        <p className="text-xs text-slate-500">
          Genera un reporte listo para compartir o presentar.
        </p>
      </div>
      {onExportComparison ? (
        <div className="flex flex-col gap-1">
          <Button
            variant="secondary"
            onClick={onExportComparison}
            disabled={isExporting}
            icon={<Download className="h-4 w-4" />}
          >
            {isExporting ? "Generando..." : "Descargar comparacion"}
          </Button>
          <p className="text-xs text-slate-500">
            Genera un comparativo listo para compartir o presentar.
          </p>
        </div>
      ) : null}
    </div>
  );
}
