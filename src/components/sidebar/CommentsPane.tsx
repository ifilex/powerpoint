import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  CheckCircle,
  X,
  User,
  Trash2,
  CornerDownRight,
} from 'lucide-react';
import { Slide, SlideComment, CollaborationUser } from '../../types/presentation';

interface CommentsPaneProps {
  isOpen: boolean;
  onClose: () => void;
  slide: Slide;
  onAddComment: (text: string) => void;
  onResolveComment: (commentId: string) => void;
  currentUser: CollaborationUser;
  isDarkMode: boolean;
}

export const CommentsPane: React.FC<CommentsPaneProps> = ({
  isOpen,
  onClose,
  slide,
  onAddComment,
  onResolveComment,
  currentUser,
  isDarkMode,
}) => {
  const [commentText, setCommentText] = useState('');

  if (!isOpen) return null;

  const comments = slide.comments || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onAddComment(commentText);
      setCommentText('');
    }
  };

  return (
    <aside
      id="slide-comments-pane"
      className={`w-72 border-l flex flex-col select-none transition-colors ${
        isDarkMode ? 'bg-[#18181B] border-[#27272A] text-zinc-100' : 'bg-white border-[#E5E7EB] text-zinc-900'
      }`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-inherit flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold">
          <MessageSquare className="w-4 h-4 text-orange-500" />
          <span>Comentarios ({comments.length})</span>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-zinc-500/20 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Comment List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3">
        {comments.length === 0 ? (
          <div className="py-12 text-center text-xs opacity-50">
            No hay comentarios en esta diapositiva. Escribe una nota para iniciar la discusión del equipo.
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`p-3 rounded-xl border space-y-2 ${
                comment.resolved
                  ? 'opacity-40 bg-zinc-500/5'
                  : isDarkMode
                  ? 'bg-zinc-900/80 border-zinc-800'
                  : 'bg-zinc-50 border-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={comment.author.avatar}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover border"
                    style={{ borderColor: comment.author.color }}
                  />
                  <span className="font-bold text-xs">{comment.author.name}</span>
                </div>
                <span className="text-[10px] opacity-60">
                  {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <p className="text-xs leading-relaxed text-zinc-700 dark:text-zinc-300">
                {comment.text}
              </p>

              <div className="flex items-center justify-end gap-2 pt-1 border-t border-inherit/10">
                {!comment.resolved && (
                  <button
                    onClick={() => onResolveComment(comment.id)}
                    className="text-[11px] text-emerald-500 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <CheckCircle className="w-3 h-3" />
                    <span>Resolver</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Comment Input Form */}
      <form onSubmit={handleSend} className="p-3 border-t border-inherit flex gap-2">
        <input
          type="text"
          placeholder="Escribe un comentario..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          className={`flex-1 px-3 py-1.5 rounded-lg text-xs border outline-none ${
            isDarkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-50 border-zinc-300'
          }`}
        />
        <button
          type="submit"
          disabled={!commentText.trim()}
          className="p-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white disabled:opacity-40 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </aside>
  );
};
