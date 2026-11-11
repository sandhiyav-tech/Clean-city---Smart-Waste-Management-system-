import React from 'react';
import { ReportForm } from '../../components/reports/ReportForm';
import { MapPin, Info, Apple, Recycle, AlertTriangle, ShieldCheck } from 'lucide-react';

export const NewReportPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          Citizen Reporting
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white mt-1">
          Report Garbage or Waste Hotspot
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
          Help municipal cleanup crews locate and collect refuse quickly by providing an accurate location pin and clear photo.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Reporting Form (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm">
          <ReportForm />
        </div>

        {/* Reporting Guide & Eco Tips Sidebar (1 col) */}
        <div className="space-y-6">
          <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-900/60 space-y-4">
            <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold text-sm">
              <Info className="w-4 h-4 shrink-0" />
              <span>Guidelines for Quick Collection</span>
            </div>
            <ul className="space-y-3 text-xs text-emerald-900/80 dark:text-emerald-200/80 leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">•</span>
                <span><strong>Accurate Pin:</strong> Use the "Current Location" button or click directly on the map near prominent buildings or street signs.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">•</span>
                <span><strong>Clear Photo:</strong> Capture the size and accessibility of the garbage heap so the appropriate vehicle (truck vs compactor) is dispatched.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-600">•</span>
                <span><strong>Hazardous Waste:</strong> If toxic chemicals, needles, or e-waste are present, select 'HAZARDOUS' so drivers take special protective equipment.</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Waste Segregation Guide
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 p-2 rounded-xl bg-lime-50 dark:bg-lime-950/40 text-lime-900 dark:text-lime-300">
                <Apple className="w-4 h-4 shrink-0 text-lime-600" />
                <span><strong>Organic:</strong> Food scraps, wet leaves, peels</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">
                <Recycle className="w-4 h-4 shrink-0 text-amber-600" />
                <span><strong>Plastic:</strong> Single-use carry bags, bottles, cartons</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span><strong>Hazardous:</strong> Broken glass, paints, medical refuse</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

