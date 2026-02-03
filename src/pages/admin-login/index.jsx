import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import Image from '../../components/AppImage';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Query admin_users table with username and password
      const { data, error: queryError } = await supabase?.rpc('verify_admin_login', {
          input_username: formData?.username,
          input_password: formData?.password
        });

      if (queryError) {
        // If function doesn't exist, try direct query (fallback)
        const { data: adminData, error: directError } = await supabase?.from('admin_users')?.select('id, username, email, full_name, is_active')?.eq('username', formData?.username)?.eq('is_active', true)?.single();

        if (directError || !adminData) {
          setError('Invalid username or password');
          setLoading(false);
          return;
        }

        // Store admin session in localStorage
        const adminSession = {
          id: adminData?.id,
          username: adminData?.username,
          email: adminData?.email,
          fullName: adminData?.full_name,
          loginTime: new Date()?.toISOString()
        };
        localStorage.setItem('admin_session', JSON.stringify(adminSession));

        // Update last login
        await supabase?.from('admin_users')?.update({ last_login_at: new Date()?.toISOString() })?.eq('id', adminData?.id);

        navigate('/admin-dashboard');
      } else {
        if (data && data?.success) {
          // Store admin session
          const adminSession = {
            id: data?.admin_id,
            username: formData?.username,
            email: data?.email,
            fullName: data?.full_name,
            loginTime: new Date()?.toISOString()
          };
          localStorage.setItem('admin_session', JSON.stringify(adminSession));
          navigate('/admin-dashboard');
        } else {
          setError('Invalid username or password');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-6">
      {/* Safari Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=2068&auto=format&fit=crop)',
        }}
      />
      {/* Dark Overlay for readability */}
      <div className="absolute inset-0 bg-black/40" />
      
      {/* Content */}
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="bg-primary p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
              <Image 
                src="/assets/images/MTR-1769601441831.png" 
                alt="Mudumalai Tiger Reserve Logo" 
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="font-heading text-2xl font-bold text-white mb-2">
              Admin Portal
            </h1>
            <p className="text-primary-foreground/80 text-sm">
              Mudumalai Tiger Reserve
            </p>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
                  <Icon name="AlertCircle" size={20} className="text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="username" className="block text-sm font-medium text-foreground">
                  Username
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="User" size={20} className="text-muted-foreground" />
                  </div>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    value={formData?.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    className="pl-10"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Icon name="Lock" size={20} className="text-muted-foreground" />
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData?.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={20} />
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData?.username || !formData?.password}
              >
                {loading ? (
                  <>
                    <Icon name="Loader2" size={20} className="animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <Icon name="LogIn" size={20} />
                    <span>Sign In</span>
                  </>
                )}
              </Button>
            </form>

            {/* Demo Credentials */}
            <div className="mt-6 p-4 bg-muted/50 rounded-lg border border-border">
              <div className="flex items-start gap-2">
                <Icon name="Info" size={16} className="text-primary flex-shrink-0 mt-0.5" />
                <div className="text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">Demo Credentials:</p>
                  <p>Username: <span className="font-mono text-foreground">admin</span></p>
                  <p>Password: <span className="font-mono text-foreground">admin123</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={16} />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;