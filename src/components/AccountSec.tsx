import React, { useState } from 'react';
import { Camera, Lock, UserCheck, Sun, Moon, Save, Key } from 'lucide-react';
import { User } from '../types';

interface AccountSecProps {
  currentUser: User | null;
  onUpdateProfile: (name: string, photoUrl?: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: (t: 'light' | 'dark') => void;
}

export const AccountSec: React.FC<AccountSecProps> = ({
  currentUser,
  onUpdateProfile,
  theme,
  onToggleTheme
}) => {
  const [displayName, setDisplayName] = useState(currentUser?.name || currentUser?.username || '');
  const [email, setEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile(displayName);
    alert('Profil berhasil disimpan');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('Semua field password harus diisi');
      return;
    }
    if (newPassword.length < 6) {
      alert('Password baru minimal 6 karakter');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Konfirmasi password baru tidak cocok');
      return;
    }
    alert('Password berhasil diubah!');
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div id="sec-account" className="section active">
      <div className="pg-hd">
        <h4>Account Settings</h4>
        <p>Kelola profil, keamanan, dan preferensi tampilan Anda di Purchasing</p>
      </div>

      <div className="content">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Informasi Profil */}
          <div className="acc-card">
            <div className="acc-card-hd flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <h6>Informasi Pengguna</h6>
            </div>
            <div className="acc-card-body">
              <form onSubmit={handleProfileSubmit} className="space-y-3">
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-lbl">Username (Login ID)</label>
                    <input className="form-ctrl text-xs font-mono" value={currentUser?.username || 'admin'} readOnly />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Role</label>
                    <input className="form-ctrl text-xs font-semibold" value={currentUser?.role || 'Administrator'} readOnly />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Nama Tampilan *</label>
                    <input className="form-ctrl text-xs" value={displayName} onChange={e => setDisplayName(e.target.value)} required />
                  </div>
                  <div className="form-group span2">
                    <label className="form-lbl">Email Akun</label>
                    <input className="form-ctrl text-xs" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="purchasing.bms01@gmail.com" />
                  </div>
                </div>
                <button type="submit" className="btn-primary-sm gap-1.5">
                  <Save className="w-3.5 h-3.5" /> Simpan Profil
                </button>
              </form>
            </div>
          </div>

          {/* Ganti Password */}
          <div className="acc-card">
            <div className="acc-card-hd flex items-center gap-2">
              <Lock className="w-4 h-4 text-blue-600" />
              <h6>Keamanan Akun</h6>
            </div>
            <div className="acc-card-body">
              <form onSubmit={handlePasswordSubmit} className="space-y-3">
                <div className="form-grid">
                  <div className="form-group span2">
                    <label className="form-lbl">Password Lama *</label>
                    <input className="form-ctrl text-xs" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} placeholder="Password saat ini..." required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Password Baru *</label>
                    <input className="form-ctrl text-xs" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 karakter" required />
                  </div>
                  <div className="form-group">
                    <label className="form-lbl">Konfirmasi Password Baru *</label>
                    <input className="form-ctrl text-xs" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Ulangi password" required />
                  </div>
                </div>
                <button type="submit" className="btn-primary-sm bg-slate-800 hover:bg-slate-900 gap-1.5">
                  <Key className="w-3.5 h-3.5" /> Ganti Password
                </button>
              </form>
            </div>
          </div>

          {/* Tampilan Tema */}
          <div className="acc-card">
            <div className="acc-card-hd flex items-center gap-2">
              <Sun className="w-4 h-4 text-blue-600" />
              <h6>Mode Tampilan (Theme)</h6>
            </div>
            <div className="acc-card-body flex gap-3">
              <button
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => onToggleTheme('light')}
              >
                <Sun className="w-4 h-4" /> Mode Terang (Light)
              </button>
              <button
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => onToggleTheme('dark')}
              >
                <Moon className="w-4 h-4" /> Mode Gelap (Dark)
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
