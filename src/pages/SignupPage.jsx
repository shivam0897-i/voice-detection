import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Shield } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUpWithEmail, signInWithGoogle, signInWithGithub } = useAuth();
  const toast = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUpWithEmail(formData.email, formData.password);
      toast.success('Account created successfully!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error('Failed to create account: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success('Successfully logged in with Google!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('Google login failed: ' + error.message);
      }
    }
  };

  const handleGithubLogin = async () => {
    try {
      await signInWithGithub();
      toast.success('Successfully logged in with GitHub!');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        toast.error('GitHub login failed: ' + error.message);
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-background flex text-foreground">
      {/* Left Panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-muted/30 border-r border-border items-center justify-center p-12">
        <div className="absolute top-6 left-6 z-10">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-background/50 backdrop-blur-md border border-border rounded-full flex items-center justify-center hover:bg-muted transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        
        <div className="max-w-md text-center space-y-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-8 border border-primary/20">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-3xl font-heading font-bold text-foreground">Join VoiceGuard</h2>
          <p className="text-muted-foreground text-lg">
            Start protecting your platform from AI generated voices, deepfakes, and audio manipulation today.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Section */}
      <div className="flex-1 flex items-center justify-center bg-background px-4 sm:px-6">
        {/* Mobile Back Button */}
        <div className="absolute top-6 left-6 z-10 lg:hidden">
          <button
            onClick={() => navigate('/')}
            className="w-10 h-10 bg-muted/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-muted transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>

        <div className="w-full max-w-md">
          <div className="mb-8 text-center lg:text-left">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              Create an account
            </h1>
            <p className="text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>

          <form onSubmit={handleEmailSignup} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="John Doe"
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="you@example.com"
                className="w-full px-4 py-3 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 pr-12 bg-muted/30 border border-border rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-primary-foreground py-3 px-4 rounded-xl font-medium hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-70 disabled:pointer-events-none mt-6 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="px-3 bg-background text-muted-foreground font-medium">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="flex items-center justify-center px-4 py-2.5 border border-border bg-muted/20 hover:bg-muted/50 rounded-xl transition-colors text-foreground text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <button
                type="button"
                onClick={handleGithubLogin}
                className="flex items-center justify-center px-4 py-2.5 border border-border bg-muted/20 hover:bg-muted/50 rounded-xl transition-colors text-foreground text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
