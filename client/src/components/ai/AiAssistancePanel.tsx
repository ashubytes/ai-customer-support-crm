import React, { useState } from 'react';
import { Sparkles, RefreshCw, Send, Copy, Edit3, Check } from 'lucide-react';
import { PriorityBadge, SentimentBadge } from '../common/Badge';
import { Button } from '../common/Button';
import { TicketCategory, TicketPriority, TicketSentiment } from '../../types';

interface AiAssistancePanelProps {
  category: TicketCategory;
  priority: TicketPriority;
  sentiment: TicketSentiment;
  summary: string | null;
  suggestedReply: string | null;
  onUseSuggestion: (text: string) => void;
  onRegenerate: () => Promise<void>;
  onSendReply?: (text: string) => Promise<void>;
  isRegenerating?: boolean;
}

export const AiAssistancePanel: React.FC<AiAssistancePanelProps> = ({
  category,
  priority,
  sentiment,
  summary,
  suggestedReply,
  onUseSuggestion,
  onRegenerate,
  onSendReply,
  isRegenerating = false,
}) => {
  const [editedReply, setEditedReply] = useState<string>(suggestedReply || '');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

  // Synchronize when parent updates suggested reply
  React.useEffect(() => {
    if (suggestedReply) {
      setEditedReply(suggestedReply);
    }
  }, [suggestedReply]);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedReply || suggestedReply || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUseSuggestion = () => {
    onUseSuggestion(editedReply || suggestedReply || '');
  };

  const handleDirectSend = async () => {
    if (!onSendReply || !editedReply.trim()) return;
    try {
      setIsSending(true);
      await onSendReply(editedReply.trim());
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/50 rounded-2xl border border-indigo-100 shadow-sm p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-indigo-100/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              AI Support Intelligence
              <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                Gemini Powered
              </span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated classification, triage, and reply generation
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={onRegenerate}
          isLoading={isRegenerating}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="text-xs bg-white"
        >
          Regenerate AI
        </Button>
      </div>

      {/* AI Analysis Badges Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white/80 p-3.5 rounded-xl border border-indigo-50">
        <div>
          <span className="block text-[11px] font-medium text-slate-400 mb-1">Detected Category</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            {category || 'Other'}
          </span>
        </div>

        <div>
          <span className="block text-[11px] font-medium text-slate-400 mb-1">AI Triage Priority</span>
          <PriorityBadge priority={priority || 'Medium'} />
        </div>

        <div>
          <span className="block text-[11px] font-medium text-slate-400 mb-1">Customer Sentiment</span>
          <SentimentBadge sentiment={sentiment || 'Neutral'} />
        </div>
      </div>

      {/* AI Summary */}
      {summary && (
        <div className="bg-white/90 p-3.5 rounded-xl border border-slate-100">
          <span className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
            Executive Summary
          </span>
          <p className="text-xs text-slate-700 leading-relaxed font-medium">{summary}</p>
        </div>
      )}

      {/* Suggested Response Panel */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            Suggested Response
            <span className="text-[11px] text-slate-400 font-normal">(Review before sending)</span>
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              {isEditing ? 'Done Editing' : 'Edit Suggestion'}
            </button>
            <button
              onClick={handleCopy}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors ml-2"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {isEditing ? (
          <textarea
            value={editedReply}
            onChange={(e) => setEditedReply(e.target.value)}
            rows={4}
            className="w-full text-xs rounded-xl border border-indigo-300 p-3 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            placeholder="Edit draft response..."
          />
        ) : (
          <div className="p-3.5 rounded-xl bg-white border border-indigo-100/80 text-xs text-slate-800 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap shadow-inner font-sans">
            {editedReply || suggestedReply || 'No suggestion generated yet.'}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseSuggestion}
            className="text-xs bg-white"
          >
            Insert into Reply Box
          </Button>

          {onSendReply && (
            <Button
              variant="primary"
              size="sm"
              onClick={handleDirectSend}
              isLoading={isSending}
              leftIcon={<Send className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Approve & Send
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
