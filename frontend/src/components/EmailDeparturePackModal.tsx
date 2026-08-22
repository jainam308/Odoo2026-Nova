import React, { useState } from 'react';
import { Mail, Calendar, Send, CheckCircle2, AlertCircle, X, Download, ExternalLink } from 'lucide-react';
import { sendDeparturePackEmail, getIcsDownloadUrl } from '../api/email.api';
import { useAuth } from '../context/AuthContext';

export interface EmailDeparturePackModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: number;
  tripName: string;
}

export const EmailDeparturePackModal: React.FC<EmailDeparturePackModalProps> = ({
  isOpen,
  onClose,
  tripId,
  tripName,
}) => {
  const { user } = useAuth();
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [customNote, setCustomNote] = useState('');
  const [attachIcs, setAttachIcs] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<{ message: string; previewUrl?: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);

    const rawEmails = emailInput.split(/[,;\s]+/).map((e) => e.trim()).filter(Boolean);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validEmails = rawEmails.filter((e) => emailRegex.test(e));

    if (validEmails.length === 0) {
      setError('Please enter at least one valid email address.');
      return;
    }

    setLoading(true);
    try {
      const response = await sendDeparturePackEmail({
        tripId,
        emails: validEmails,
        customNote: customNote.trim() || undefined,
        attachIcs,
      });

      setSuccessResult({
        message: response.message || `Departure Pack sent to ${validEmails.length} recipient(s)!`,
        previewUrl: response.previewUrl,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch Departure Pack email.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadIcs = () => {
    window.open(getIcsDownloadUrl(tripId), '_blank');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '520px',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          animation: 'gtModalSlide 0.2s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            background: 'linear-gradient(135deg, #0F6E6E 0%, #2B8A8A 100%)',
            color: '#FFFFFF',
            padding: '24px',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '18px',
              right: '18px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: '#FFFFFF',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '24px' }}>✈️</span>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>Trip Departure Pack</h2>
          </div>
          <p style={{ margin: 0, fontSize: '13px', opacity: 0.9 }}>
            Email your day-by-day itinerary & 1-click calendar sync for <strong>{tripName}</strong>
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                padding: '12px',
                color: '#E5484D',
                fontSize: '13px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {successResult ? (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: '#E6F4F4',
                  color: '#0F6E6E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                }}
              >
                <CheckCircle2 size={32} />
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1F2937', marginBottom: '6px' }}>
                Departure Pack Delivered!
              </h3>
              <p style={{ color: '#6B7280', fontSize: '13px', marginBottom: '20px' }}>
                {successResult.message}
              </p>

              {successResult.previewUrl && (
                <div style={{ marginBottom: '20px' }}>
                  <a
                    href={successResult.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#0F6E6E',
                      fontSize: '13px',
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                  >
                    View Dispatched Email Preview <ExternalLink size={14} />
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#F9FAFB',
                    color: '#1F2937',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={15} /> Download .ICS
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#0F6E6E',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '6px' }}>
                  Recipient Email Address(es)
                </label>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <Mail size={16} style={{ color: '#9CA3AF', marginRight: '10px' }} />
                  <input
                    type="text"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="you@email.com, friend@email.com"
                    required
                    style={{
                      border: 'none',
                      outline: 'none',
                      width: '100%',
                      fontSize: '14px',
                      color: '#1F2937',
                    }}
                  />
                </div>
                <span style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '4px', display: 'block' }}>
                  Separate multiple emails with commas to share with travel companions.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#1F2937', marginBottom: '6px' }}>
                  Personal Note (Optional)
                </label>
                <textarea
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="e.g. Can't wait for this adventure! Check out day 2 activities."
                  rows={3}
                  style={{
                    width: '100%',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    fontSize: '13px',
                    color: '#1F2937',
                    outline: 'none',
                    resize: 'vertical',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '10px',
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={18} style={{ color: '#0F6E6E' }} />
                  <div>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937', display: 'block' }}>
                      Attach 1-Click .ICS Calendar File
                    </span>
                    <span style={{ fontSize: '11px', color: '#6B7280' }}>
                      Syncs stops & activities with Google / Apple Calendar
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={attachIcs}
                  onChange={(e) => setAttachIcs(e.target.checked)}
                  style={{ width: '18px', height: '18px', accentColor: '#0F6E6E', cursor: 'pointer' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={handleDownloadIcs}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    color: '#4B5563',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <Download size={16} /> Download .ICS
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    backgroundColor: '#FF7A59',
                    color: '#FFFFFF',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    boxShadow: '0 4px 10px rgba(255, 122, 89, 0.25)',
                  }}
                >
                  <Send size={16} />
                  <span>{loading ? 'Sending Departure Pack...' : 'Send Departure Pack'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailDeparturePackModal;
