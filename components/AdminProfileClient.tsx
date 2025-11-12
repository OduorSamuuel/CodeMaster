'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  User, 
  Mail, 
  Shield, 
  Moon, 
  Sun, 
  Key,
  LogOut,
  Trash2,
  Calendar,
  Crown,
  Loader2,
  CheckCircle2,
  Smartphone,
  Edit
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';
import multiavatar from '@multiavatar/multiavatar/esm';

import { createClient } from '@/lib/supabase/client'; // Assuming you have a client-side Supabase initializer
import { checkMFAStatus, continueExistingEnrollment, deleteAccount, enrollMFA, logoutUser, unenrollMFA, updatePassword, updateProfile, verifyMFAEnrollment } from '@/actions';

interface AdminProfileData {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'admin' | 'moderator';
  avatar?: string;
  created_at: string;
  email_verified: boolean;
  last_login?: string;
}

interface AdminProfileClientProps {
  profile: AdminProfileData;
}

export default function AdminProfileClient({ profile: initialProfile }: AdminProfileClientProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const supabase = createClient(); // Client-side Supabase
  
  const [profile, setProfile] = useState(initialProfile);
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showMFADialog, setShowMFADialog] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  
  // Form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // MFA states
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [mfaQRCode, setMfaQRCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaVerifyCode, setMfaVerifyCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [checkingMFA, setCheckingMFA] = useState(true);

  // Avatar editor states
  const [currentSeed, setCurrentSeed] = useState('');

  const accountAge = Math.floor(
    (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Generate gaming-style random seed
  const generateNewSeed = useCallback(() => {
    const randomId = Math.random().toString(36).substr(2, 9);
    const newSeed = `player-${randomId}-${Date.now().toString(36).substr(-4)}`;
    setCurrentSeed(newSeed);
  }, []);

  // Generate SVG from seed
  const getAvatarSvg = useCallback((seed: string): string => {
    return multiavatar(seed);
  }, []);

  // Generate data URL from seed
  const getAvatarUrl = useCallback((seed: string): string => {
    const svgCode = getAvatarSvg(seed);
    return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgCode)))}`;
  }, [getAvatarSvg]);

  // Auto-generate first avatar when editor opens
  useEffect(() => {
    if (showAvatarEditor) {
      generateNewSeed();
    }
  }, [showAvatarEditor, generateNewSeed]);

  // Check MFA status on mount
  useEffect(() => {
    checkMFAStatusHandler();
  }, []);

  const checkMFAStatusHandler = async () => {
    setCheckingMFA(true);
    try {
      const result = await checkMFAStatus();
      
      if (result.success) {
        setTwoFactorEnabled(result.hasVerifiedFactor);
        
        // Check for pending enrollment
        if (result.hasPendingFactor && !result.hasVerifiedFactor) {
          // Continue with existing enrollment
          const continueResult = await continueExistingEnrollment();
          
          if (continueResult.success && continueResult.qrCode) {
            setMfaQRCode(continueResult.qrCode);
            setMfaSecret(continueResult.secret || '');
            setMfaFactorId(continueResult.factorId || '');
            setShowMFADialog(true);
            toast.info('Continuing your pending MFA enrollment');
          }
        }
      }
    } catch (error) {
      console.error('Error checking MFA status:', error);
    } finally {
      setCheckingMFA(false);
    }
  };

  const handleMFAToggle = async (checked: boolean) => {
    if (checked) {
      // Enable MFA - start enrollment
      await startMFAEnrollment();
    } else {
      // Disable MFA - unenroll
      if (confirm('Are you sure you want to disable two-factor authentication? This will make your account less secure.')) {
        await disableMFA();
      }
    }
  };

  const startMFAEnrollment = async () => {
    setIsLoading(true);
    try {
      const result = await enrollMFA();
      
      if (result.success) {
        setMfaQRCode(result.qrCode || '');
        setMfaSecret(result.secret || '');
        setMfaFactorId(result.factorId || '');
        setShowMFADialog(true);
        toast.success('Scan the QR code with your authenticator app');
      } else {
        toast.error(result.error || 'Failed to start MFA enrollment');
      }
    } catch (error) {
      toast.error('An error occurred while starting MFA enrollment');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMFACode = async () => {
    if (!mfaVerifyCode || mfaVerifyCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyMFAEnrollment(mfaFactorId, mfaVerifyCode);
      
      if (result.success) {
        setTwoFactorEnabled(true);
        setShowMFADialog(false);
        setMfaVerifyCode('');
        setMfaQRCode('');
        setMfaSecret('');
        setMfaFactorId('');
        toast.success('Two-factor authentication enabled successfully!');
        router.refresh();
      } else {
        toast.error(result.error || 'Invalid verification code');
      }
    } catch (error) {
      toast.error('An error occurred while verifying the code');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const disableMFA = async () => {
    setIsLoading(true);
    try {
      const result = await unenrollMFA();
      
      if (result.success) {
        setTwoFactorEnabled(false);
        toast.success('Two-factor authentication disabled');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to disable MFA');
      }
    } catch (error) {
      toast.error('An error occurred while disabling MFA');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await updatePassword(currentPassword, newPassword);

      if (result.success) {
        toast.success('Password updated successfully');
        setShowPasswordDialog(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(result.error || 'Failed to update password');
      }
    } catch (error) {
      console.error('Error updating password:', error);
      toast.error('An error occurred while updating password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await logoutUser();
      if (result.success) {
        router.push('/auth/login');
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to logout');
      }
    } catch (error) {
      toast.error('Failed to logout');
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        toast.success('Account deleted');
        router.push('/');
      } else {
        toast.error(result.error || 'Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('An error occurred while deleting account');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleSelectAvatar = async () => {
    if (!currentSeed) return;

    setIsLoading(true);
    try {
      // Get SVG data URL
      const dataUrl = getAvatarUrl(currentSeed);

      // Convert to PNG using canvas
      const img = new Image();
      img.src = dataUrl;
      await new Promise((resolve) => { img.onload = resolve; });

      const canvas = document.createElement('canvas');
      canvas.width = 256; // Adjustable size
      canvas.height = 256;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');
      ctx.drawImage(img, 0, 0, 256, 256);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('Failed to create PNG blob');

      const fileName = `${profile.id}/${Date.now()}.png`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, { contentType: 'image/png' });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL (using server action)
      const updateResult = await updateProfile({ avatar: publicUrl });

      if (!updateResult.success) {
        throw new Error(updateResult.error || 'Failed to update profile');
      }

      // Update local state
      setProfile((prev) => ({ ...prev, avatar: publicUrl }));
      toast.success('Avatar updated successfully!');
      setShowAvatarEditor(false);
      router.refresh();
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Failed to update avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const RoleBadge = () => {
    const roleConfig = {
      admin: { icon: Crown, color: 'bg-red-500/10 text-red-500 border-red-500/20' },
      moderator: { icon: Shield, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20' },
      user: { icon: User, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' }
    };

    const config = roleConfig[profile.role];
    const Icon = config.icon;

    return (
      <Badge variant="outline" className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground">Manage your admin account preferences and security</p>
        </div>

        {/* Profile Overview Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              <div className="flex flex-col items-center gap-2">
                {profile.avatar ? (
                  <img 
                    src={profile.avatar} 
                    alt="Avatar" 
                    className="w-20 h-20 rounded-full object-cover border-2 border-primary"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-3xl text-white">
                    {profile.username[0].toUpperCase()}
                  </div>
                )}
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={() => setShowAvatarEditor(true)}
                  className="text-xs"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Edit Avatar
                </Button>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold">{profile.username}</h2>
                  <RoleBadge />
                </div>
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {profile.email}
                    {profile.email_verified && (
                      <Badge variant="outline" className="text-xs">Verified</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Member for {accountAge} days
                  </div>
                  {profile.last_login && (
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Last login: {new Date(profile.last_login).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Tabs */}
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
                <CardDescription>Customize how the admin panel looks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Theme</Label>
                    <p className="text-sm text-muted-foreground">
                      Choose your preferred color scheme
                    </p>
                  </div>
                  <Select value={theme} onValueChange={setTheme}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Light
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Dark
                        </div>
                      </SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your basic information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    defaultValue={profile.username}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email"
                    defaultValue={profile.email}
                    placeholder="Enter email"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground">
                    Contact support to change your email address
                  </p>
                </div>
                <Button>Save Changes</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Manage your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => setShowPasswordDialog(true)}>
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 flex-1">
                    <div className="flex items-center gap-2">
                      <Label>Enable 2FA</Label>
                      {checkingMFA && <Loader2 className="w-4 h-4 animate-spin" />}
                      {!checkingMFA && twoFactorEnabled && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                          <CheckCircle2 className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Require a code from your authenticator app when signing in
                    </p>
                  </div>
                  <Switch
                    checked={twoFactorEnabled}
                    onCheckedChange={handleMFAToggle}
                    disabled={isLoading || checkingMFA}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your active login sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Current Session</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date().toLocaleString()}
                      </p>
                    </div>
                    <Badge>Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Delete Account</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete your account and all data
                    </p>
                  </div>
                  <Button 
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Logout Button */}
        <Card>
          <CardContent className="p-6">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleLogout}
              disabled={isLoading}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* MFA Enrollment Dialog */}
      <Dialog open={showMFADialog} onOpenChange={setShowMFADialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Setup Two-Factor Authentication
            </DialogTitle>
            <DialogDescription>
              Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {mfaQRCode && (
              <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-white rounded-lg">
                  <img 
                    src={mfaQRCode} 
                    alt="MFA QR Code" 
                    className="w-48 h-48"
                  />
                </div>
                
                <div className="w-full space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Or enter this code manually:
                  </Label>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={mfaSecret} 
                      readOnly 
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(mfaSecret);
                        toast.success('Secret copied to clipboard');
                      }}
                    >
                      Copy
                    </Button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="mfa-code">Enter 6-digit code from your app</Label>
              <Input
                id="mfa-code"
                type="text"
                maxLength={6}
                placeholder="000000"
                value={mfaVerifyCode}
                onChange={(e) => setMfaVerifyCode(e.target.value.replace(/\D/g, ''))}
                className="text-center text-2xl font-mono tracking-widest"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowMFADialog(false);
                setMfaVerifyCode('');
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleVerifyMFACode}
              disabled={isLoading || mfaVerifyCode.length !== 6}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Verify & Enable'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <AlertDialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Password</AlertDialogTitle>
            <AlertDialogDescription>
              Enter your current password and choose a new one
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="current">Current Password</Label>
              <Input
                id="current"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">New Password</Label>
              <Input
                id="new"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm New Password</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handlePasswordChange}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Password'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account
              and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isLoading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Avatar Editor Dialog */}
      <Dialog open={showAvatarEditor} onOpenChange={setShowAvatarEditor}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Avatar</DialogTitle>
            <DialogDescription>
              Generate and select your avatar
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex justify-center">
              {currentSeed ? (
                <img 
                  src={getAvatarUrl(currentSeed)} 
                  alt="Generated Avatar" 
                  className="w-48 h-48 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-48 h-48 rounded-full bg-muted flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              )}
            </div>
            
            <div className="flex justify-center gap-4">
              <Button 
                onClick={generateNewSeed}
                disabled={isLoading}
              >
                New Avatar
              </Button>
              <Button 
                onClick={handleSelectAvatar}
                variant="default"
                disabled={isLoading || !currentSeed}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  'Select & Upload'
                )}
              </Button>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAvatarEditor(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}