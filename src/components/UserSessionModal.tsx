import React, { useState } from 'react';
import {
  X,
  UserCheck,
  ShieldCheck,
  Building2,
  Lock,
  LogOut,
  LogIn,
  Key,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { UserRole, UserSession } from '../types';

interface UserSessionModalProps {
  session: UserSession;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSession: (newSession: UserSession) => void;
}

export const UserSessionModal: React.FC<UserSessionModalProps> = ({
  session,
  isOpen,
  onClose,
  onUpdateSession,
}) => {
  if (!isOpen) return null;

  const [selectedRole, setSelectedRole] = useState<UserRole>(session.role);
  const [userName, setUserName] = useState(session.name);

  const handleSave = () => {
    const hasAuthority = selectedRole !== 'Operations Analyst (Read-Only)';
    onUpdateSession({
      ...session,
      name: userName,
      role: selectedRole,
      hasDispatchAuthority: hasAuthority,
      authenticated: true,
    });
    onClose();
  };

  const handleToggleAuth = () => {
    if (session.authenticated) {
      onUpdateSession({
        ...session,
        authenticated: false,
      });
    } else {
      onUpdateSession({
        ...session,
        authenticated: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-200 text-xs">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">
              User Profile & Role-Based Access Control (RBAC)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Badge */}
          <div className="p-3 rounded-xl border border-teal-900/60 bg-teal-950/20 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  session.authenticated ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500'
                }`}
              ></span>
              <span className="font-semibold text-white">
                {session.authenticated ? 'Authenticated Session' : 'Logged Out (Guest Mode)'}
              </span>
            </div>
            <button
              onClick={handleToggleAuth}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                session.authenticated
                  ? 'bg-rose-950/60 text-rose-300 border border-rose-800/60 hover:bg-rose-900/50'
                  : 'bg-teal-600 text-white hover:bg-teal-500'
              }`}
            >
              {session.authenticated ? (
                <>
                  <LogOut className="w-3 h-3" />
                  <span>Log Out</span>
                </>
              ) : (
                <>
                  <LogIn className="w-3 h-3" />
                  <span>Log In</span>
                </>
              )}
            </button>
          </div>

          {/* User Name */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-slate-400 font-medium">
              Administrator / Officer Name
            </label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              disabled={!session.authenticated}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-teal-500 disabled:opacity-50"
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-[11px] text-slate-400 font-medium flex items-center justify-between">
              <span>Security Role Credentials</span>
              <span className="text-[10px] text-teal-400 font-mono">
                {selectedRole.includes('Read-Only') ? 'Read-Only Tier' : 'Full Dispatch Tier'}
              </span>
            </label>

            <div className="space-y-2">
              {[
                {
                  role: 'Director of Pharmacy Supply Chain' as UserRole,
                  authority: true,
                  desc: 'Full mutual-aid transfer dispatch signing authority. Access to emergency reserves.',
                },
                {
                  role: 'Regional Health Logistics Officer' as UserRole,
                  authority: true,
                  desc: 'Courier cross-docking authorization. Route dispatch and logistics coordination.',
                },
                {
                  role: 'Operations Analyst (Read-Only)' as UserRole,
                  authority: false,
                  desc: 'View dashboards, run simulations, query Gemini. Cannot authorize physical shipments.',
                },
              ].map((item) => (
                <div
                  key={item.role}
                  onClick={() => session.authenticated && setSelectedRole(item.role)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedRole === item.role
                      ? 'border-teal-500 bg-teal-950/40 ring-1 ring-teal-500/50'
                      : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                  } ${!session.authenticated ? 'opacity-50 pointer-events-none' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">{item.role}</span>
                    {item.authority ? (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-teal-400 bg-teal-950 border border-teal-800">
                        Dispatch Authorized
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-amber-400 bg-amber-950 border border-amber-800">
                        Read-Only
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Prototype RBAC Disclaimer */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 text-[10px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              <span>Prototype Governance Note</span>
            </div>
            <p className="leading-relaxed">
              In this hackathon prototype, role switching simulates enterprise hospital authentication. In production, this layer integrates with OAuth 2.0 / SAML 2.0 and Hospital Active Directory.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!session.authenticated}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white font-semibold transition-colors"
          >
            Save Role Settings
          </button>
        </div>
      </div>
    </div>
  );
};
