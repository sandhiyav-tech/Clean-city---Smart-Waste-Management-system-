import React from 'react';
import { StatusHistoryItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { Clock, User, MessageSquare, X } from 'lucide-react';

interface StatusTimelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportTitle: string;
  statusHistory: StatusHistoryItem[];
}

export const StatusTimelineModal: React.FC<StatusTimelineModalProps> = ({
  isOpen,
  onClose,
  reportTitle,
  statusHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Audit Trail
            </span>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5 line-clamp-1">
              {reportTitle}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Timeline Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {(!statusHistory || statusHistory.length === 0) ? (
            <p className="text-sm text-gray-500 text-center py-6">No status history available.</p>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-200 dark:before:bg-emerald-900/60">
              {statusHistory.map((item, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100 dark:ring-emerald-950"></div>

                  <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge status={item.status} size="sm" />
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(item.at).toLocaleString()}</span>
                      </div>
                    </div>

                    {item.changedBy && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                        <User className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          Updated by <strong className="font-semibold">{item.changedBy.name}</strong> ({item.changedBy.role})
                        </span>
                      </div>
                    )}

                    {item.note && (
                      <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-white/80 dark:bg-gray-900/80 p-2.5 rounded-xl border border-gray-100 dark:border-gray-800/60">
                        <MessageSquare className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
                        <span>{item.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800/40 border-t border-gray-100 dark:border-gray-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
