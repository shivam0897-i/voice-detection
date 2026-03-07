import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile } from '@/lib/db';
import { Shield, Mail, Key, User, Zap, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/Toast';

export default function SettingsPage() {
  const { user, resetPassword, deleteAccount } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;
      try {
        const data = await getUserProfile(user);
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6 max-w-2xl">
        <div className="h-40 bg-muted/40 rounded-2xl" />
        <div className="h-40 bg-muted/40 rounded-2xl" />
      </div>
    );
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setIsResetting(true);
    try {
      await resetPassword(user.email);
      toast.success('Password reset email sent to ' + user.email);
    } catch (err) {
      toast.error('Failed to send reset email: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action is permanent and cannot be undone."
    );
    
    if (confirmDelete) {
      setIsDeleting(true);
      try {
        await deleteAccount();
        // The auth state listener in AuthContext will push them to /login automatically 
        toast.info("Account successfully deleted.");
      } catch (err) {
        // Known issue: users who logged in a long time ago need to re-authenticate before deleting
        if (err.code === 'auth/requires-recent-login') {
            toast.error("Security requirement: Please sign out and sign back in to delete your account.");
        } else {
            toast.error('Failed to delete account: ' + err.message);
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="max-w-3xl space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold mb-2">Account Settings</h1>
        <p className="text-muted-foreground">
          Manage your profile, preferences, and subscription plan.
        </p>
      </div>

      <div className="grid gap-6">
        {/* Profile Card */}
        <div className="relative overflow-hidden rounded-[24px] bg-card/40 border border-border/50 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
          
          <div className="relative z-10 px-6 py-4 border-b border-border/50 bg-background/30">
            <h2 className="font-semibold flex items-center gap-2 text-foreground/90">
              <User className="w-4 h-4 text-primary" /> 
              Profile Details
            </h2>
          </div>
          <div className="relative z-10 p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Display Name
                </label>
                <div className="px-4 py-3 bg-background/50 border border-border/50 rounded-xl font-medium text-foreground/90 shadow-[inset_0_1px_0_theme(colors.foreground/5%)]">
                  {user?.displayName || 'Not Set'}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Email Address
                </label>
                <div className="px-4 py-3 bg-background/50 border border-border/50 rounded-xl font-medium flex items-center gap-2 text-foreground/90 shadow-[inset_0_1px_0_theme(colors.foreground/5%)]">
                  <Mail className="w-4 h-4 text-muted-foreground/50" />
                  {user?.email}
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                Account ID
              </label>
              <div className="px-4 py-3 bg-background/50 border border-border/50 rounded-xl font-mono text-sm text-muted-foreground/70 overflow-hidden text-ellipsis shadow-[inset_0_1px_0_theme(colors.foreground/5%)]">
                {user?.uid}
              </div>
            </div>
          </div>
        </div>

        {/* Subscription Plan */}
        <div className="relative overflow-hidden rounded-[24px] bg-card/40 border border-border/50 backdrop-blur-md group">
          <div className="absolute inset-0 bg-gradient-to-br from-foreground/[0.02] to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[60px] -translate-y-1/2 translate-x-1/3 group-hover:bg-primary/20 transition-colors duration-500" />
          
          <div className="relative z-10 px-6 py-4 border-b border-border/50 bg-background/30">
            <h2 className="font-semibold flex items-center gap-2 text-foreground/90">
              <Shield className="w-4 h-4 text-primary" /> 
              Subscription Plan
            </h2>
          </div>
          <div className="relative z-10 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl font-bold capitalize text-primary">{profile?.tier || 'Free'} Tier</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide bg-primary/20 text-primary">
                    ACTIVE
                  </span>
                </div>
                <p className="text-muted-foreground mb-5 leading-relaxed">
                  You are currently using the Free tier, which includes up to {profile?.analysesLimit || 20} analyses.
                </p>
                
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success-500/10 flex items-center justify-center border border-success-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                    </div> Basic voice analysis
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success-500/10 flex items-center justify-center border border-success-500/20">
                      <div className="w-1.5 h-1.5 rounded-full bg-success-500" />
                    </div> Up to 20 scans total
                  </li>
                  <li className="flex items-center gap-3 opacity-60">
                    <div className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center border border-border/50">
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    </div> API Access (Pro only)
                  </li>
                </ul>
              </div>

              <div className="bg-background/40 border border-border/50 p-6 rounded-[20px] min-w-[220px] text-center shadow-[inset_0_1px_0_theme(colors.foreground/5%)] relative overflow-hidden group/upgrade">
                <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
                
                <div className="relative z-10 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20 group-hover/upgrade:scale-110 transition-transform duration-300">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="relative z-10 font-bold mb-1 text-foreground/90">Need more power?</h3>
                <p className="relative z-10 text-xs text-muted-foreground mb-5">Unlimited scans & API</p>
                <Button className="relative z-10 w-full rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all">
                  Upgrade to Pro
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="relative overflow-hidden rounded-[24px] bg-card/40 border border-border/50 backdrop-blur-md">
          <div className="absolute inset-0 bg-gradient-to-b from-foreground/[0.02] to-transparent pointer-events-none" />
          
          <div className="relative z-10 px-6 py-4 border-b border-border/50 bg-background/30">
            <h2 className="font-semibold flex items-center gap-2 text-foreground/90">
              <Key className="w-4 h-4 text-primary" /> 
              Security
            </h2>
          </div>
          <div className="p-6">
            <p className="text-muted-foreground text-sm mb-6 max-w-lg leading-relaxed">
              Your authentication is managed securely via Firebase. Providers such as Google OAuth do not store passwords locally. If you signed up via email, you can request a password reset below.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
               <Button 
                variant="outline" 
                onClick={handlePasswordReset}
                disabled={isResetting || !user?.email}
                className="bg-background/50 border-border/50 hover:bg-background/80"
              >
                {isResetting ? 'Sending Email...' : 'Send Password Reset Email'}
              </Button>
            </div>

            {/* Danger Zone */}
            <div className="pt-6 mt-6 border-t border-danger/20">
               <h3 className="text-danger font-semibold flex items-center gap-2 mb-2">
                 <AlertTriangle className="w-4 h-4" /> Danger Zone
               </h3>
               <p className="text-muted-foreground text-xs mb-4 max-w-xl">
                 Permanently delete your account and all associated data. This action cannot be reversed. If you logged in recently via a social provider, this will immediately remove your VoiceGuard profile.
               </p>
               <Button 
                 variant="outline" 
                 onClick={handleDeleteAccount}
                 disabled={isDeleting}
                 className="text-danger border-danger/20 hover:bg-danger/10 hover:text-danger hover:border-danger/30 transition-colors"
               >
                 {isDeleting ? 'Deleting Account...' : 'Delete Account'}
               </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
