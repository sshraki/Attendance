import React, { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ReasonModalProps {
  type: 'late' | 'break' | 'checkout';
  onSubmit: (reason: string, type?: string) => void;
  onClose: () => void;
}

export const ReasonModal: React.FC<ReasonModalProps> = ({ type, onSubmit, onClose }) => {
  const [reason, setReason] = useState('');
  const [checkoutType, setCheckoutType] = useState('work');

  const getTitle = () => {
    switch (type) {
      case 'late': return 'Late Arrival Reason';
      case 'break': return 'Extended Break Reason';
      case 'checkout': return 'Early/Reasonable Checkout';
      default: return 'Reason Required';
    }
  };

  const getPresetReasons = () => {
    switch (type) {
      case 'late':
        return [
          'Traffic congestion',
          'Public transport delay',
          'Personal emergency',
          'Medical appointment',
          'Weather conditions'
        ];
      case 'break':
        return [
          'Important personal call',
          'Medical consultation',
          'Family emergency',
          'Bank/Government work',
          'Other urgent matter'
        ];
      case 'checkout':
        return [
          'Client meeting',
          'Medical appointment',
          'Family emergency',
          'Personal commitment',
          'Feeling unwell'
        ];
      default:
        return [];
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      onSubmit(reason.trim(), type === 'checkout' ? checkoutType : undefined);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <AlertCircle className="mr-2 h-5 w-5 text-amber-500" />
            {getTitle()}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {type === 'checkout' && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Checkout Type
              </label>
              <select
                value={checkoutType}
                onChange={(e) => setCheckoutType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="work">Work Related</option>
                <option value="sick">Sick Leave</option>
                <option value="personal">Personal</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Select
            </label>
            <div className="grid grid-cols-1 gap-2">
              {getPresetReasons().map((presetReason, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setReason(presetReason)}
                  className="text-left px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {presetReason}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Custom Reason
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Please provide a reason..."
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};