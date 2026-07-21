'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function SettingsPage() {
  const [name, setName] = useState('Demo User');
  const [email, setEmail] = useState('demo@ladestack.com');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Settings</h2>
        <p className="text-surface-500 mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Profile</h3>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              id="name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <div className="flex items-center gap-3">
              <Button type="submit" loading={saving}>
                {saved ? 'Saved!' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Change Password</h3>
        </CardHeader>
        <CardContent>
          <form className="space-y-4">
            <Input
              id="currentPassword"
              label="Current Password"
              type="password"
              placeholder="Enter current password"
            />
            <Input
              id="newPassword"
              label="New Password"
              type="password"
              placeholder="Enter new password"
              minLength={8}
            />
            <Input
              id="confirmPassword"
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
            />
            <Button type="submit">Update Password</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
