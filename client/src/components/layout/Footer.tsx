import React from 'react';
import { Recycle, Heart, Shield, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800/80 py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                <Recycle className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">CleanCity</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
              Empowering citizens, municipal authorities, and green drivers to collaboratively maintain zero-waste urban ecosystems through smart geospatial routing and real-time tracking.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link to="/" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Live City Map
                </Link>
              </li>
              <li>
                <Link to="/citizen/new" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Report Waste
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-emerald-600 dark:hover:text-emerald-400">
                  Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Environmental Mission */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
              Green Initiative
            </h4>
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 font-medium mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Smart Eco-Routing</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Utilizing 2-Opt TSP heuristic to minimize fleet fuel consumption and urban carbon footprint.
            </p>
          </div>
        </div>

        <div className="border-t border-gray-100 dark:border-gray-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 dark:text-gray-400 gap-4">
          <p>© {new Date().getFullYear()} CleanCity. Built for a cleaner, greener tomorrow.</p>
          <div className="flex items-center gap-1">
            <span>Made with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Sustainable Smart Cities</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

