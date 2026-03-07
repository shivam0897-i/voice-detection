import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserHistory } from '@/lib/db';
import { Clock, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function HistoryPage() {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadHistory() {
      if (!user) return;
      try {
        const fullHistory = await getUserHistory(user, 100);
        setHistory(fullHistory);
      } catch (err) {
        console.error('Failed to load history:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [user]);

  const handleExportCSV = () => {
    if (history.length === 0) return;
    
    // Simple CSV generator
    const headers = ['Date', 'File Name', 'Classification', 'Risk Score', 'Duration (s)', 'Language'];
    const rows = history.map(item => [
      new Date(item.timestamp).toISOString(),
      `"${(item.fileName || '').replace(/"/g, '""')}"`,
      item.classification,
      item.riskScore,
      item.duration || '',
      item.language || ''
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `voiceguard_history_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
        <div className="h-[400px] w-full bg-muted/40 rounded-xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold mb-2">Analysis History</h1>
          <p className="text-muted-foreground">
            Review your past voice scans and their results.
          </p>
        </div>
        <Button variant="outline" onClick={handleExportCSV} disabled={history.length === 0} className="gap-2">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {history.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <Clock className="w-12 h-12 opacity-50 mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-1">No History Found</h3>
            <p>Your previous analyses will appear here once you run them.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/30">
                <tr>
                  <th className="px-6 py-4 font-medium">Source / File Name</th>
                  <th className="px-6 py-4 font-medium">Classification</th>
                  <th className="px-6 py-4 font-medium">Risk Score</th>
                  <th className="px-6 py-4 font-medium">Duration</th>
                  <th className="px-6 py-4 font-medium">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((scan) => (
                  <tr key={scan.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      <div className="max-w-[250px] truncate" title={scan.fileName}>
                        {scan.fileName}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">{scan.mode} • {scan.language}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        scan.classification === 'HUMAN' 
                          ? 'bg-success-500/10 text-success-500' 
                          : scan.classification === 'AI_GENERATED'
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-warning-500/10 text-warning-500'
                      }`}>
                        {scan.classification}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8">{Math.round(scan.riskScore)}</span>
                        <div className="w-16 h-1.5 bg-muted rounded-full">
                          <div 
                            className={`h-full rounded-full ${scan.classification === 'AI_GENERATED' ? 'bg-destructive' : 'bg-success-500'}`}
                            style={{ width: `${scan.riskScore}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {scan.duration ? `${scan.duration.toFixed(1)}s` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {new Date(scan.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
