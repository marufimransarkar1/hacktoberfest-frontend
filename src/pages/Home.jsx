import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../api';

// Fix default leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const STATUS_STYLES = {
  Resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
  Pending: 'bg-amber-100 text-amber-800 border-amber-200',
};

export default function Home() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/reports')
      .then((res) => setReports(res.data))
      .catch((err) => console.error('Error fetching reports:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-slate-900">
      {/* Loading Spinner */}
      {loading && (
        <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-slate-900/60 backdrop-blur-sm text-white">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-3 text-sm font-medium">Loading reports...</p>
        </div>
      )}

      {/* Floating Counter Badge */}
      <div className="absolute top-4 right-4 z-[500] rounded-xl bg-white/90 p-3 px-4 shadow-xl backdrop-blur-md border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-600"></span>
          </span>
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Active Reports: <span className="font-bold text-indigo-600">{reports.length}</span>
          </span>
        </div>
      </div>

      {/* Map */}
      <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {reports.map((report) => {
          const lat = report?.location?.lat;
          const lng = report?.location?.lng;

          if (lat == null || lng == null) return null;

          const statusClass = STATUS_STYLES[report.status] || STATUS_STYLES.Pending;

          return (
            <Marker key={report._id} position={[lat, lng]}>
              <Popup className="custom-popup overflow-hidden">
                <div className="w-56 overflow-hidden rounded-lg bg-white p-1 text-slate-800">
                  <div className="relative h-32 w-full overflow-hidden rounded-md bg-slate-100 mb-2.5">
                    {report.imageUrl ? (
                      <img
                        src={report.imageUrl}
                        alt={report.category || 'Issue preview'}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-slate-400">
                        No image provided
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-extrabold tracking-wider text-indigo-600 uppercase">
                      {report.category || 'General'}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusClass}`}>
                      {report.status || 'Pending'}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed text-slate-600 line-clamp-3 mb-2 font-normal">
                    {report.description || 'No description provided.'}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}