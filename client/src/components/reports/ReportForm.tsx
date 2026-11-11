import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocationPicker } from '../map/LocationPicker';
import { WasteType } from '../../types';
import { useToast } from '../common/Toast';
import axiosClient from '../../api/axiosClient';
import { Upload, X, Loader2, Apple, Recycle, AlertTriangle, Cpu, ShieldAlert, Layers } from 'lucide-react';

export const ReportForm: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const { toast } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wasteType, setWasteType] = useState<WasteType>('MIXED');
  const [location, setLocation] = useState({
    lat: 13.0827,
    lng: 80.2707,
    address: 'Ripon Building, Greater Chennai Corporation, Chennai',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const wasteTypesList: Array<{ type: WasteType; label: string; icon: React.ReactNode; desc: string }> = [
    { type: 'ORGANIC', label: 'Organic', icon: <Apple className="w-4 h-4 text-lime-500" />, desc: 'Food scraps, yard trimmings' },
    { type: 'PLASTIC', label: 'Plastic', icon: <Recycle className="w-4 h-4 text-amber-500" />, desc: 'Bottles, bags, wrappers' },
    { type: 'METAL', label: 'Metal', icon: <AlertTriangle className="w-4 h-4 text-slate-500" />, desc: 'Cans, rods, scrap iron' },
    { type: 'E-WASTE', label: 'E-Waste', icon: <Cpu className="w-4 h-4 text-indigo-500" />, desc: 'Electronics, cables, batteries' },
    { type: 'HAZARDOUS', label: 'Hazardous', icon: <ShieldAlert className="w-4 h-4 text-rose-500" />, desc: 'Chemicals, paints, lamps' },
    { type: 'MIXED', label: 'Mixed', icon: <Layers className="w-4 h-4 text-teal-500" />, desc: 'Unsegregated general refuse' },
  ];

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast('Please upload an image file (JPEG, PNG, WebP)', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast('Image file size must be under 5MB', 'error');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast('Please enter a brief report title', 'error');
      return;
    }
    if (!description.trim()) {
      toast('Please provide a description of the waste condition', 'error');
      return;
    }
    if (!location.lat || !location.lng) {
      toast('Please pinpoint the waste location on the map', 'error');
      return;
    }

    setSubmitting(true);

    try {
      let uploadedUrl = '';

      // Upload image if selected
      if (imageFile) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', imageFile);

        const uploadRes = await axiosClient.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        if (uploadRes.data?.data?.url) {
          uploadedUrl = uploadRes.data.data.url;
        }
        setUploadingImage(false);
      }

      // Create Report
      const payload = {
        title: title.trim(),
        description: description.trim(),
        wasteType,
        location,
        imageUrl: uploadedUrl || imagePreview || '',
      };

      await axiosClient.post('/reports', payload);

      toast('Garbage report submitted successfully! Thank you.', 'success');
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/citizen/reports');
      }
    } catch (err: any) {
      console.error('Report submission failed:', err);
      const msg = err.response?.data?.message || 'Failed to submit report. Please try again.';
      toast(msg, 'error');
    } finally {
      setSubmitting(false);
      setUploadingImage(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 1. Title and Description */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Report Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Overflowing garbage container on 4th Main Road"
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
            required
            maxLength={150}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Description & Landmarks <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe the severity, odor, blockage to traffic or pedestrians, nearby landmarks..."
            className="w-full px-4 py-3 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 dark:text-gray-100"
            required
            maxLength={1000}
          />
        </div>
      </div>

      {/* 2. Waste Classification */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
          Waste Category <span className="text-rose-500">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {wasteTypesList.map((w) => {
            const isSelected = wasteType === w.type;
            return (
              <button
                type="button"
                key={w.type}
                onClick={() => setWasteType(w.type)}
                className={`flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700 bg-white dark:bg-gray-900'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {w.icon}
                  <span className="font-bold text-sm text-gray-900 dark:text-white">{w.label}</span>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">{w.desc}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Photo Upload */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
          Evidence Photo (Optional but Recommended)
        </label>
        {imagePreview ? (
          <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-800 max-w-md">
            <img src={imagePreview} alt="Preview" className="w-full h-56 object-cover" />
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-3 right-3 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 transition-colors backdrop-blur-sm"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl cursor-pointer bg-white/50 dark:bg-gray-900/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Click to upload garbage photo
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 mt-1">PNG, JPG, WebP up to 5MB</span>
            <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
          </label>
        )}
      </div>

      {/* 4. Click-to-pin Map */}
      <LocationPicker value={location} onChange={setLocation} />

      {/* Submit Button */}
      <button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.99] transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-70 flex items-center justify-center gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>{uploadingImage ? 'Uploading photo...' : 'Submitting report...'}</span>
          </>
        ) : (
          <span>Submit Waste Report</span>
        )}
      </button>
    </form>
  );
};
