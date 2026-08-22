import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Calendar,
  Image as ImageIcon,
  FileText,
  ArrowLeft,
  Globe,
  Lock,
  AlertCircle
} from 'lucide-react';
import { createTrip } from '../../api/trips.api';

interface TripFormData {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  cover_photo_url: string;
  is_public: boolean;
}

interface FormErrors {
  name?: string;
  start_date?: string;
  end_date?: string;
  cover_photo_url?: string;
  description?: string;
}

export const CreateTrip: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FormErrors>({});

  const [formData, setFormData] = useState<TripFormData>({
    name: '',
    description: '',
    start_date: '',
    end_date: '',
    cover_photo_url: '',
    is_public: false,
  });

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    const trimmedName = formData.name.trim();

    if (!trimmedName) {
      errors.name = 'Trip name is required.';
    } else if (trimmedName.length < 3) {
      errors.name = 'Trip name must be at least 3 characters long.';
    } else if (trimmedName.length > 100) {
      errors.name = 'Trip name cannot exceed 100 characters.';
    }

    if (!formData.start_date) {
      errors.start_date = 'Start date is required.';
    }

    if (!formData.end_date) {
      errors.end_date = 'End date is required.';
    } else if (formData.start_date && formData.end_date < formData.start_date) {
      errors.end_date = 'End date cannot be earlier than the start date.';
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters.';
    }

    if (formData.cover_photo_url.trim()) {
      const urlPattern = /^(https?:\/\/).+/i;
      if (!urlPattern.test(formData.cover_photo_url.trim())) {
        errors.cover_photo_url = 'Cover photo must be a valid URL starting with http:// or https://';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear individual field error on change
    if (fieldErrors[name as keyof FormErrors]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setGeneralError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const created = await createTrip({
        ...formData,
        name: formData.name.trim(),
        description: formData.description.trim(),
        cover_photo_url: formData.cover_photo_url.trim() || undefined,
      });
      navigate(`/trips/${created.id}/builder`);
    } catch (err) {
      console.error('Failed to create trip:', err);
      setGeneralError(
        err instanceof Error
          ? err.message
          : 'Failed to create trip. Please check your network connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto font-sans">
        <button
          type="button"
          onClick={() => navigate('/trips')}
          className="flex items-center gap-2 text-[#0F6E6E] font-medium mb-6 hover:underline text-sm"
        >
          <ArrowLeft size={18} />
          Back to My Trips
        </button>

        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-sm border border-gray-100">
          <div className="mb-8">
            <span className="text-xs font-bold text-[#0F6E6E] uppercase tracking-wider">
              Step 1 of Planning
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              Create New Trip Itinerary
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Set up your basic trip dates and destination details. You can add stops and activities in the next step.
            </p>
          </div>

          {generalError && (
            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
              <span>{generalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {/* Trip Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
              >
                Trip Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <MapPin
                  className="absolute left-3.5 top-3 text-gray-400"
                  size={18}
                />
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. Summer in Goa, Japan Cultural Odyssey"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                    fieldErrors.name
                      ? 'border-red-300 bg-red-50/30 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                      : 'border-gray-200 focus:border-[#0F6E6E] focus:ring-1 focus:ring-[#0F6E6E]'
                  }`}
                />
              </div>
              {fieldErrors.name && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {fieldErrors.name}
                </p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start_date"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                >
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3.5 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    id="start_date"
                    name="start_date"
                    type="date"
                    required
                    value={formData.start_date}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                      fieldErrors.start_date
                        ? 'border-red-300 bg-red-50/30 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#0F6E6E]'
                    }`}
                  />
                </div>
                {fieldErrors.start_date && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} /> {fieldErrors.start_date}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="end_date"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
                >
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3.5 top-3 text-gray-400"
                    size={18}
                  />
                  <input
                    id="end_date"
                    name="end_date"
                    type="date"
                    required
                    min={formData.start_date || undefined}
                    value={formData.end_date}
                    onChange={handleChange}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                      fieldErrors.end_date
                        ? 'border-red-300 bg-red-50/30 focus:border-red-500'
                        : 'border-gray-200 focus:border-[#0F6E6E]'
                    }`}
                  />
                </div>
                {fieldErrors.end_date && (
                  <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                    <AlertCircle size={13} /> {fieldErrors.end_date}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="description"
                  className="block text-xs font-bold text-gray-700 uppercase tracking-wider"
                >
                  Trip Description
                </label>
                <span className="text-xs text-gray-400">
                  {formData.description.length}/500
                </span>
              </div>
              <div className="relative">
                <FileText
                  className="absolute left-3.5 top-3.5 text-gray-400"
                  size={18}
                />
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  maxLength={500}
                  placeholder="Describe your travel goals, interests, or companions..."
                  value={formData.description}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                    fieldErrors.description
                      ? 'border-red-300 bg-red-50/30'
                      : 'border-gray-200 focus:border-[#0F6E6E]'
                  }`}
                />
              </div>
              {fieldErrors.description && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {fieldErrors.description}
                </p>
              )}
            </div>

            {/* Cover Photo URL */}
            <div>
              <label
                htmlFor="cover_photo_url"
                className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2"
              >
                Cover Photo URL (Optional)
              </label>
              <div className="relative">
                <ImageIcon
                  className="absolute left-3.5 top-3 text-gray-400"
                  size={18}
                />
                <input
                  id="cover_photo_url"
                  name="cover_photo_url"
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={formData.cover_photo_url}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                    fieldErrors.cover_photo_url
                      ? 'border-red-300 bg-red-50/30 focus:border-red-500'
                      : 'border-gray-200 focus:border-[#0F6E6E]'
                  }`}
                />
              </div>
              {fieldErrors.cover_photo_url && (
                <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">
                  <AlertCircle size={13} /> {fieldErrors.cover_photo_url}
                </p>
              )}
            </div>

            {/* Privacy toggle */}
            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {formData.is_public ? (
                  <Globe className="text-[#0F6E6E]" size={20} />
                ) : (
                  <Lock className="text-gray-500" size={20} />
                )}
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {formData.is_public ? 'Public Itinerary' : 'Private Itinerary'}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formData.is_public
                      ? 'Anyone with the link can view and copy this trip plan.'
                      : 'Only you can view and edit this itinerary.'}
                  </div>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F6E6E]"></div>
              </label>
            </div>

            {/* Form Actions */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate('/trips')}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-[#FF7A59] hover:bg-[#e66948] text-white text-sm font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Trip...' : 'Continue to Itinerary Builder →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};