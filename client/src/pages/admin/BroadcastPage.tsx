import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { useToast } from '../../components/common/Toast';
import { Radio, Send, Users, ShieldAlert, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';

export const BroadcastPage: React.FC = () => {
  const { toast } = useToast();
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState<'ALL' | 'CITIZEN' | 'DRIVER' | 'ADMIN'>('ALL');
  const [type, setType] = useState<'BROADCAST' | 'SYSTEM' | 'STATUS_UPDATE'>('BROADCAST');
  const [sending, setSending] = useState(false);
  const [lastBroadcast, setLastBroadcast] = useState<string | null>(null);

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast('Please write a notification message to dispatch', 'error');
      return;
    }

    setSending(true);
    try {
      const res = await axiosClient.post('/notifications', {
        message: message.trim(),
        targetRole,
        type,
      });

      toast(res.data?.message || 'Notification broadcasted successfully!', 'success');
      setLastBroadcast(message.trim());
      setMessage('');
    } catch (err: any) {
      toast(err.response?.data?.message || 'Failed to dispatch broadcast', 'error');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Public Announcements
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-0.5">
          Municipal Broadcast Center
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
          Send instant push & in-app alerts to citizens and green drivers across Chennai.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
        <form onSubmit={handleSendBroadcast} className="space-y-6">
          {/* Target Audience */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
              Select Target Audience
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setTargetRole('ALL')}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                  targetRole === 'ALL'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Users className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">All Users</div>
                  <div className="text-[11px] text-gray-400">Citizens & Drivers</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetRole('CITIZEN')}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                  targetRole === 'CITIZEN'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">Citizens Only</div>
                  <div className="text-[11px] text-gray-400">Community residents</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetRole('DRIVER')}
                className={`flex items-center gap-3 p-4 rounded-2xl border text-left transition-all ${
                  targetRole === 'DRIVER'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/40 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Radio className="w-5 h-5 text-purple-600" />
                <div>
                  <div className="font-bold text-sm text-gray-900 dark:text-white">Drivers Only</div>
                  <div className="text-[11px] text-gray-400">Fleet personnel</div>
                </div>
              </button>
            </div>
          </div>

          {/* Message Textarea */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
              Broadcast Message Content
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="e.g. Special plastic waste drive scheduled this Saturday across Adyar and Besant Nagar. Please segregate dry recyclables."
              maxLength={500}
              className="w-full px-4 py-3 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
              required
            />
            <div className="text-right text-[11px] text-gray-400 mt-1">
              {message.length} / 500 characters
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={sending}
            className="w-full py-3.5 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Dispatch Broadcast Notification</span>
              </>
            )}
          </button>
        </form>

        {lastBroadcast && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                Last Successfully Dispatched:
              </div>
              <div className="text-xs text-emerald-800/80 dark:text-emerald-200/80 mt-0.5">
                "{lastBroadcast}"
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

