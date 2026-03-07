import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, getUserHistory, FREE_TIER_LIMIT } from '@/lib/db';
import { Activity, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [userProfile, history] = await Promise.all([
          getUserProfile(user),
          getUserHistory(user, 5) // Get latest 5 scans
        ]);
        setProfile(userProfile);
        setRecentScans(history);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-24 bg-muted/50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-muted/50 rounded-xl" />
          <div className="h-32 bg-muted/50 rounded-xl" />
          <div className="h-32 bg-muted/50 rounded-xl" />
        </div>
      </div>
    );
  }

  const limit = profile?.analysesLimit || FREE_TIER_LIMIT;
  const used = profile?.analysesUsed || 0;
  const isDanger = used >= limit;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">
          Welcome back, {profile?.displayName?.split(' ')[0] || 'Analyst'}
        </h1>
        <p className="text-muted-foreground">
          Here is an overview of your voice analysis usage and recent activity.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Usage Stat */}
        <div className="relative group overflow-hidden rounded-[24px] bg-card/40 border border-border/50 p-6 flex flex-col justify-between transition-all duration-300 hover:bg-card/60">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -translate-y-1/2 translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-500" />
          
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Scans Used</h3>
            <div className="w-8 h-8 rounded-full bg-background/50 border border-white/[0.05] flex items-center justify-center backdrop-blur-sm">
              <Activity className="w-4 h-4 text-primary" />
            </div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <span className={`text-5xl font-heading font-bold tracking-tight ${isDanger ? 'text-destructive' : 'text-foreground'}`}>
                {used}
              </span>
              <span className="text-muted-foreground text-sm font-medium">/ {limit}</span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-background/50 rounded-full h-1.5 mt-5 border border-border/30 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${isDanger ? 'bg-destructive shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'bg-primary shadow-[0_0_10px_rgba(16,185,129,0.5)]'}`} 
                style={{ width: `${Math.min((used / limit) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Tier Stat */}
        <div className="relative group overflow-hidden rounded-[24px] bg-card/40 border border-border/50 p-6 flex flex-col justify-between transition-all duration-300 hover:bg-card/60">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] translate-y-1/2 -translate-x-1/2 group-hover:bg-primary/20 transition-colors duration-500" />
          
          <div className="relative z-10 flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Plan</h3>
            <div className="w-8 h-8 rounded-full bg-background/50 border border-white/[0.05] flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-4 h-4 text-primary" />
            </div>
          </div>
          
          <div className="relative z-10">
            <span className="text-4xl font-heading font-bold capitalize bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {profile?.tier || 'Free'} Tier
            </span>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              Upgrade to Pro for unlimited audio scans and advanced API access.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 p-6 flex flex-col justify-center items-center text-center shadow-[inset_0_1px_0_theme(colors.foreground/10%)]">
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
          
          <div className="relative z-10 w-full">
            <h3 className="text-lg font-bold mb-2 text-foreground">Initiate Analysis</h3>
            <p className="text-sm text-muted-foreground/90 mb-6 px-2">
              Deepfake detection via live stream or file upload.
            </p>
            <Button asChild className="w-full rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all" disabled={isDanger}>
              <Link to="/dashboard/scan">
                Launch Scanner
              </Link>
            </Button>
            {isDanger && (
              <p className="text-xs text-destructive mt-3 font-medium flex items-center justify-center gap-1.5 bg-destructive/10 py-1.5 px-3 rounded-full">
                <AlertTriangle className="w-3.5 h-3.5" /> Usage limit reached
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent History Table */}
      <div className="relative overflow-hidden rounded-[24px] bg-card/40 border border-border/50 backdrop-blur-md">
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
        
        <div className="relative z-10 p-6 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-foreground">Recent Scans</h2>
          <Link to="/dashboard/history" className="text-sm text-primary hover:text-primary/80 font-medium transition-colors">
            View All History →
          </Link>
        </div>
        
        {recentScans.length === 0 ? (
          <div className="relative z-10 p-12 text-center text-muted-foreground flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-16 h-16 rounded-full bg-background/50 border border-white/[0.05] flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 opacity-40" />
            </div>
            <p className="text-sm">You haven&apos;t run any analyses yet.</p>
          </div>
        ) : (
          <div className="relative z-10 overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-muted-foreground uppercase tracking-wider bg-background/30 border-b border-border/50">
                <tr>
                  <th className="px-6 py-4 font-medium">Source / File</th>
                  <th className="px-6 py-4 font-medium">Classification</th>
                  <th className="px-6 py-4 font-medium">Risk Score</th>
                  <th className="px-6 py-4 font-medium text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {recentScans.map((scan) => (
                  <tr key={scan.id} className="hover:bg-background/40 transition-colors group">
                    <td className="px-6 py-4 text-foreground/90 font-medium max-w-[200px] truncate" title={scan.fileName}>
                      {scan.fileName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        scan.classification === 'HUMAN' 
                          ? 'bg-success-500/10 text-success-400 border-success-500/20' 
                          : scan.classification === 'AI_GENERATED'
                            ? 'bg-destructive/10 text-destructive border-destructive/20'
                            : 'bg-warning-500/10 text-warning-400 border-warning-500/20'
                      }`}>
                        {scan.classification}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-foreground/80 font-medium">
                      {Math.round(scan.riskScore)}<span className="text-muted-foreground/50 font-normal">/100</span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground text-right">
                      {new Date(scan.timestamp).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
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
