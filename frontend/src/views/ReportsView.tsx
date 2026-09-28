import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { FileSpreadsheet, Download, Building2, BarChart2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid
} from 'recharts';

export const ReportsView: React.FC = () => {
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getReportSummary()
      .then(setReportData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleExportCsv = () => {
    window.location.href = api.exportCsvUrl();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 font-outfit flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" /> R&B Governance Reports & CSV Export
          </h2>
          <p className="text-xs text-slate-500 mt-1">District-wise infrastructure breakdown, structural safety audits & data export</p>
        </div>

        <button
          onClick={handleExportCsv}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-2 transition"
        >
          <Download className="w-4 h-4" /> Export Complete CSV Report
        </button>
      </div>

      {loading || !reportData ? (
        <div className="py-20 text-center text-slate-500 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span>Generating report summary from PostgreSQL...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* District Breakdown Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 font-outfit flex items-center gap-2 uppercase tracking-wider">
              <BarChart2 className="w-4 h-4 text-blue-600" /> Infrastructure Asset Count by District
            </h3>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.districtBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="district" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '8px', fontSize: '12px', color: '#0f172a' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Bar dataKey="roads" name="Roads" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="bridges" name="Bridges" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="buildings" name="Buildings" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* District Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-200 font-bold text-sm text-slate-800 font-outfit">
              District Infrastructure Summary Table
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="py-3 px-4">District</th>
                    <th className="py-3 px-4">Total Assets</th>
                    <th className="py-3 px-4">Roads</th>
                    <th className="py-3 px-4">Bridges</th>
                    <th className="py-3 px-4">Buildings</th>
                    <th className="py-3 px-4">Critical / Poor Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {reportData.districtBreakdown.map((row: any) => (
                    <tr key={row.district} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{row.district}</td>
                      <td className="py-3 px-4 font-semibold text-blue-600">{row.total}</td>
                      <td className="py-3 px-4">{row.roads}</td>
                      <td className="py-3 px-4">{row.bridges}</td>
                      <td className="py-3 px-4">{row.buildings}</td>
                      <td className="py-3 px-4">
                        {row.critical > 0 ? (
                          <span className="font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200">
                            {row.critical} Assets
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
