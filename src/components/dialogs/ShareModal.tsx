import React, { useState } from 'react';
import {
  Share2,
  Copy,
  CheckCircle,
  Users,
  Lock,
  Globe,
  X,
  Mail,
  UserPlus,
} from 'lucide-react';
import { CollaborationUser } from '../../types/presentation';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  activeUsers: CollaborationUser[];
  presentationTitle: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  activeUsers,
  presentationTitle,
}) => {
  const [copied, setCopied] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSent, setInviteSent] = useState(false);

  if (!isOpen) return null;

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail.trim()) {
      setInviteSent(true);
      setInviteEmail('');
      setTimeout(() => setInviteSent(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-150">
      <div
        className={`w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden flex flex-col ${
          isDarkMode ? 'bg-[#18181B] border-[#27272A] text-zinc-100' : 'bg-white border-zinc-200 text-zinc-900'
        }`}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-inherit flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
              <Share2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Compartir "{presentationTitle}"</h2>
              <p className="text-xs opacity-70">
                Colabora en tiempo real con cursores en vivo y comentarios simultáneos.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-zinc-500/20 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Invite Form */}
          <form onSubmit={handleSendInvite} className="flex gap-2">
            <div className="flex-1 relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-50" />
              <input
                type="email"
                placeholder="Ingresa correos de colaboradores (ej: equipo@empresa.com)..."
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border outline-none ${
                  isDarkMode
                    ? 'bg-zinc-900 border-zinc-700 text-zinc-100 focus:border-orange-500'
                    : 'bg-zinc-50 border-zinc-300 text-zinc-900 focus:border-orange-500'
                }`}
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Invitar</span>
            </button>
          </form>

          {inviteSent && (
            <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Invitación enviada con éxito. El usuario se unirá a la sesión en tiempo real.</span>
            </div>
          )}

          {/* Active Collaborators Roster */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2.5">
              Colaboradores en Esta Sesión ({activeUsers.length})
            </h4>

            <div className="space-y-2">
              {activeUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 rounded-xl border flex items-center justify-between ${
                    isDarkMode ? 'bg-zinc-900/60 border-zinc-800' : 'bg-zinc-50 border-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt=""
                        className="w-8 h-8 rounded-full object-cover border-2 shadow-xs"
                        style={{ borderColor: user.color }}
                      />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 absolute -bottom-0.5 -right-0.5 border-2 border-white dark:border-zinc-900" />
                    </div>
                    <div>
                      <h5 className="font-bold text-xs flex items-center gap-1.5">
                        <span>{user.name}</span>
                        {user.isHost && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-orange-500/20 text-orange-400 font-normal">
                            Organizador
                          </span>
                        )}
                      </h5>
                      <p className="text-[10px] opacity-60">
                        Editando en {user.currentSlideId} • En línea
                      </p>
                    </div>
                  </div>

                  <span className="text-xs text-zinc-400 font-medium">Editor</span>
                </div>
              ))}
            </div>
          </div>

          {/* Shareable Link Box */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-zinc-100 border-zinc-200'
            }`}
          >
            <div className="flex items-center gap-2 truncate">
              <Globe className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-xs truncate font-mono opacity-80">{shareUrl}</span>
            </div>

            <button
              onClick={handleCopyLink}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shrink-0 transition ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white shadow-xs'
              }`}
            >
              {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar Enlace'}</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-inherit flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border hover:bg-zinc-500/20 text-xs font-semibold cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
