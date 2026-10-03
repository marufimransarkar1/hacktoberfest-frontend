import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import API from '../api';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ location, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation({
        lat: Number(e.latlng.lat),
        lng: Number(e.latlng.lng),
      });
    },
  });

  return location ? <Marker position={[location.lat, location.lng]} /> : null;
}

export default function ReportIssue() {
  const [category, setCategory] = useState('Water & Sewage');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Convert uploaded image file to Base64 string
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!location || location.lat == null || location.lng == null) {
      alert('Please click on the map to select a valid location!');
      return;
    }

    setSubmitting(true);

    // Format payload cleanly for Mongoose Schema
    const payload = {
      category: category.trim(),
      description: description.trim(),
      imageUrl: image || '',
      location: {
        lat: Number(location.lat),
        lng: Number(location.lng),
      },
    };

    try {
      const response = await API.post('/reports', payload);
      alert('Report submitted successfully!');

      // Reset Form State
      setDescription('');
      setImage('');
      setLocation(null);
    } catch (err) {
      console.error('Error submitting report:', err.response?.data || err.message);
      alert(`Submission failed: ${err.response?.data?.message || 'Check console details'}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full flex-col md:flex-row bg-slate-50">
      {/* Form Section */}
      <div className="w-full md:w-1/3 p-6 bg-white shadow-md z-10 overflow-y-auto">
        <h2 className="text-2xl font-bold text-slate-800 mb-1">Report Issue</h2>
        <p className="text-xs text-slate-500 mb-6">
          Help us improve your city by reporting problems.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none"
            >
              <option value="Water & Sewage">💧 Water & Sewage</option>
              <option value="Pothole / Road">🛣️ Pothole / Road</option>
              <option value="Garbage / Waste">🗑️ Garbage / Waste</option>
              <option value="Electricity / Streetlight">💡 Electricity / Streetlight</option>
              <option value="Other">⚠️ Other</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Description
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail..."
              required
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:border-indigo-500 focus:outline-none resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Upload Photo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            />
          </div>

          <div className="rounded-lg bg-slate-100 p-3 border border-slate-200">
            <span className="text-xs font-medium text-slate-600">
              {location ? (
                <span className="text-emerald-600 font-semibold">
                  📍 Location Selected: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </span>
              ) : (
                <span className="text-amber-600 font-semibold">
                  ⚠️ Click on the map to set location
                </span>
              )}
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:bg-slate-400"
          >
            {submitting ? 'Submitting...' : 'Submit Report'}
          </button>
        </form>
      </div>

      {/* Map Section */}
      <div className="h-full w-full md:w-2/3">
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker location={location} setLocation={setLocation} />
        </MapContainer>
      </div>
    </div>
  );
}