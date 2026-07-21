'use client';

import { useState } from 'react';
import { Users, Mail, UserPlus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockTeam = [
  { id: '1', name: 'Demo User', email: 'demo@ladestack.com', role: 'owner', status: 'active' },
];

export default function TeamPage() {
  const [team, setTeam] = useState(mockTeam);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setTeam([...team, { id: Date.now().toString(), name: inviteEmail.split('@')[0], email: inviteEmail, role: 'editor', status: 'pending' }]);
    setInviteEmail('');
    setShowInvite(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-surface-100">Team</h2>
          <p className="text-surface-500 mt-1">Manage your team members and permissions</p>
        </div>
        <Button onClick={() => setShowInvite(!showInvite)}>
          <UserPlus size={18} className="mr-1" /> Invite Member
        </Button>
      </div>

      {showInvite && (
        <Card>
          <CardContent className="py-4">
            <form onSubmit={handleInvite} className="flex gap-3 items-end">
              <div className="flex-1">
                <Input
                  id="inviteEmail"
                  label="Email Address"
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                />
              </div>
              <Button type="submit" className="mb-0.5">Send Invite</Button>
              <button type="button" onClick={() => setShowInvite(false)} className="p-2 text-surface-400 hover:text-surface-600 mb-0.5">
                <X size={18} />
              </button>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {team.map((member) => (
            <div key={member.id} className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-surface-700 last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400 font-medium text-sm">
                    {member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-surface-900 dark:text-surface-100">{member.name}</p>
                  <p className="text-xs text-surface-500">{member.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="default" className="capitalize">{member.role}</Badge>
                <Badge variant={member.status === 'active' ? 'success' : 'warning'}>{member.status}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
