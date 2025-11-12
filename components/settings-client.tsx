"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Settings,  Palette,  User, Shield, Loader2, CheckCircle2, Smartphone } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Switch } from './ui/switch';


import { toast } from 'sonner';
import { checkMFAStatus, continueExistingEnrollment, enrollMFA, unenrollMFA, verifyMFAEnrollment } from '@/actions';
import { UserProfile } from '@/types';

interface SettingsClientProps {
  profile: UserProfile;
}

export default function SettingsClient({ profile }: SettingsClientProps) {
  const router = useRouter();


  // MFA states
  const [isLoading, setIsLoading] = useState(false);
  const [showMFADialog, setShowMFADialog] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [mfaQRCode, setMfaQRCode] = useState('');
  const [mfaSecret, setMfaSecret] = useState('');
  const [mfaVerifyCode, setMfaVerifyCode] = useState('');
  const [mfaFactorId, setMfaFactorId] = useState('');
  const [checkingMFA, setCheckingMFA] = useState(true);



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
      await startMFAEnrollment();
    } else {
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <Settings className="w-10 h-10 text-primary" />
            Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your account preferences and customization
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>Manage your profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Username</Label>
                  <p className="text-sm text-muted-foreground">{profile.username}</p>
                </div>
                <Badge variant="outline">Read Only</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Current Level</Label>
                  <p className="text-sm text-muted-foreground">Level {profile.level}</p>
                </div>
                <Badge>{profile.totalXP.toLocaleString()} XP</Badge>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Experience Level</Label>
                  <p className="text-sm text-muted-foreground capitalize">{profile.experienceLevel}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security
              </CardTitle>
              <CardDescription>Manage your account security settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Label>Two-Factor Authentication</Label>
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

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Appearance
              </CardTitle>
              <CardDescription>Customize how the app looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">Choose your preferred color theme</p>
                </div>
                <ThemeSwitcher />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Reduce Motion</Label>
                  <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>High Contrast</Label>
                  <p className="text-sm text-muted-foreground">Increase color contrast for better visibility</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </div>
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
    </div>
  );
}