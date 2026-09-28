import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Message } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../common/Button';
import { Send, Lock, User as UserIcon } from 'lucide-react';

export interface MessageThreadHandle {
  setMessageText: (text: string) => void;
}

interface MessageThreadProps {
  messages: Message[];
  onSendMessage: (message: string, isInternal: boolean) => Promise<void>;
  isLoading?: boolean;
}

export const MessageThread = forwardRef<MessageThreadHandle, MessageThreadProps>(
  ({ messages, onSendMessage, isLoading = false }, ref) => {
    const { user } = useAuth();
    const [replyText, setReplyText] = useState<string>('');
    const [isInternalNote, setIsInternalNote] = useState<boolean>(false);
    const [isSending, setIsSending] = useState<boolean>(false);

    useImperativeHandle(ref, () => ({
      setMessageText: (text: string) => {
        setReplyText(text);
        setIsInternalNote(false);
      },
    }));

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!replyText.trim() || isSending) return;

      try {
        setIsSending(true);
        await onSendMessage(replyText.trim(), isInternalNote);
        setReplyText('');
        setIsInternalNote(false);
      } finally {
        setIsSending(false);
      }
    };

    const isStaff = user?.role === 'agent' || user?.role === 'admin';

    return (
      <div className="flex flex-col space-y-6">
        {/* Messages List */}
        <div className="space-y-4 max-h-[600px] overflow-y-auto px-1">
          {messages.map((m) => {
            const isMe = m.sender_id === user?.id;
            const isCustomer = m.sender_type === 'customer';
            const isInternal = m.is_internal;

            if (isInternal) {
              return (
                <div
                  key={m.id}
                  className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 my-2 text-xs shadow-xs"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 text-amber-900 font-bold">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Internal Staff Note</span>
                      <span className="text-slate-400 font-normal">•</span>
                      <span className="text-amber-800 font-medium">{m.sender_name}</span>
                    </div>
                    <span className="text-[11px] text-amber-700/70 font-medium">
                      {new Date(m.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-amber-950 font-sans leading-relaxed whitespace-pre-wrap">
                    {m.message}
                  </p>
                </div>
              );
            }

            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-2xl ${
                  isMe ? 'ml-auto flex-row-reverse' : 'mr-auto flex-row'
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    isCustomer
                      ? 'bg-slate-200 text-slate-700'
                      : 'bg-indigo-600 text-white shadow-xs'
                  }`}
                >
                  {m.sender_name ? m.sender_name.charAt(0).toUpperCase() : <UserIcon className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs shadow-xs space-y-1 ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div
                    className={`flex items-center justify-between gap-4 text-[11px] font-semibold ${
                      isMe ? 'text-indigo-100' : 'text-slate-500'
                    }`}
                  >
                    <span>{m.sender_name}</span>
                    <span className="text-[10px] opacity-80">
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="font-sans leading-relaxed whitespace-pre-wrap text-[13px]">
                    {m.message}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Message Input Box */}
        <form
          onSubmit={handleSubmit}
          className={`rounded-2xl border transition-all ${
            isInternalNote
              ? 'bg-amber-50/50 border-amber-300 ring-2 ring-amber-400/20'
              : 'bg-white border-slate-200 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20'
          } p-4 shadow-sm`}
        >
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              isInternalNote
                ? 'Type an internal note (only visible to support agents and admins)...'
                : 'Type your message or response to the customer...'
            }
            rows={3}
            className="w-full text-xs font-sans text-slate-800 placeholder-slate-400 bg-transparent resize-none focus:outline-none leading-relaxed"
          />

          <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
            {isStaff ? (
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInternalNote}
                  onChange={(e) => setIsInternalNote(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                />
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-600" />
                  Internal Note (Hidden from Customer)
                </span>
              </label>
            ) : (
              <div />
            )}

            <Button
              type="submit"
              size="sm"
              variant={isInternalNote ? 'secondary' : 'primary'}
              isLoading={isSending || isLoading}
              disabled={!replyText.trim()}
              rightIcon={<Send className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              {isInternalNote ? 'Save Internal Note' : 'Send Reply'}
            </Button>
          </div>
        </form>
      </div>
    );
  }
);

MessageThread.displayName = 'MessageThread';
