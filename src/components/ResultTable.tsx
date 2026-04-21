import type { ResultTable as ResultTableType } from "../types/finance";

export function ResultTable({ table }: { table: ResultTableType }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <h4 className="font-semibold text-ink">{table.title}</h4>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-mist text-slate-500">
            <tr>
              {table.columns.map((column) => (
                <th key={column} className="px-4 py-3 font-medium">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, index) => (
              <tr key={`${table.title}-${index}`} className="border-t border-slate-100">
                {row.map((cell, cellIndex) => (
                  <td key={`${index}-${cellIndex}`} className="px-4 py-3 text-ink align-top">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
