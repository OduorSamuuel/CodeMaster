"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Bell, Palette, Code, User, Save } from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";

import { useRouter } from 'next/navigation';

import { Badge } from '@/components/ui/badge';
import { Switch } from './ui/switch';
import { UserProfile } from '@/types/exercise';
import { createClient } from '@/lib/supabase/client';

interface SettingsClientProps {
  profile: UserProfile;
}

export default function SettingsClient({ profile }: SettingsClientProps) {
  const router = useRouter();

  
  const [saving, setSaving] = useState(false);

  const updateUserLanguage = async (language: string): Promise<boolean> => {
    try {
      const supabase = createClient();

      const { data } = await supabase.auth.getClaims();
      const user = data?.claims;

    
    if (!user?.sub) return false;

    const { error } = await supabase
      .from('user_profiles')
      .update({ programming_language: language })
      .eq('user_id', user.sub);

    return !error;
  } catch (error) {
    return false;
  }
}


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
                <Switch/>
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

    

          {/* Goals & Preferences */}
        

          {/* Preferred Topics */}
    
        </div>
      </div>
    </div>
  );
}