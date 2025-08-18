import React from "react";

type ContentTableProps = {
  headers: string[];
  rows: (string | number | null)[][];
};

const ContentTable: React.FC<ContentTableProps> = ({ headers, rows }) => {
  if (!headers?.length) return null;

  return (
    <div className="my-4 overflow-x-auto bg-white rounded-lg shadow border border-gray-200">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((h, i) => (
              <th
                key={i}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, ri) => (
            <tr
              key={ri}
              className="hover:bg-dsp-orange_light transition-colors duration-150"
            >
              {row.map((c, ci) => (
                <td
                  key={ci}
                  className="px-6 py-4 whitespace-pre-wrap text-sm text-gray-700"
                >
                  {String(c ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ContentTable;
