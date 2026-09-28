import React, { useState } from 'react';
import { AssetType, Condition, Criticality, AssetStatus } from '../types/asset';
import { api } from '../services/api';
import { X, Building2, Navigation, Landmark, CheckCircle, AlertCircle } from 'lucide-react';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newAsset: any) => void;
}

export const AddAssetModal: React.FC<AddAssetModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [assetType, setAssetType] = useState<AssetType>('ROAD');
  const [assetCode, setAssetCode] = useState('');
  const [name, setName] = useState('');
  const [district, setDistrict] = useState('Ahmedabad');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState('23.0225');
  const [longitude, setLongitude] = useState('72.5714');
  const [constructionDate, setConstructionDate] = useState('2018-05-15');
  const [currentCondition, setCurrentCondition] = useState<Condition>('GOOD');
  const [criticality, setCriticality] = useState<Criticality>('MEDIUM');
  const [responsibleDivision, setResponsibleDivision] = useState('Ahmedabad R&B Division 1');
  const [status, setStatus] = useState<AssetStatus>('ACTIVE');

  // Road
  const [roadLength, setRoadLength] = useState('15.5');
  const [roadCategory, setRoadCategory] = useState('State Highway');
  const [surfaceType, setSurfaceType] = useState('Asphalt Concrete');

  // Bridge
  const [bridgeLength, setBridgeLength] = useState('250');
  const [bridgeType, setBridgeType] = useState('PSC Box Girder');
  const [numberOfLanes, setNumberOfLanes] = useState('4');

  // Building
  const [buildingType, setBuildingType] = useState('Administrative Office');
  const [numberOfFloors, setNumberOfFloors] = useState('6');
  const [builtUpArea, setBuiltUpArea] = useState('12500');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        assetCode: assetCode.trim() || undefined,
        name: name.trim(),
        assetType,
        district,
        location: location.trim(),
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        constructionDate,
        currentCondition,
        criticality,
        responsibleDivision,
        status,
      };

      if (assetType === 'ROAD') {
        payload.roadLength = parseFloat(roadLength);
        payload.roadCategory = roadCategory;
        payload.surfaceType = surfaceType;
      } else if (assetType === 'BRIDGE') {
        payload.bridgeLength = parseFloat(bridgeLength);
        payload.bridgeType = bridgeType;
        payload.numberOfLanes = parseInt(numberOfLanes);
      } else if (assetType === 'BUILDING') {
        payload.buildingType = buildingType;
        payload.numberOfFloors = parseInt(numberOfFloors);
        payload.builtUpArea = parseFloat(builtUpArea);
      }

      const created = await api.createAsset(payload);
      onSuccess(created);
      onClose();
    } catch (err: any) {
      console.error('Error adding asset:', err);
      setError(err.message || 'Failed to register new asset');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              +
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 font-outfit">Register New Infrastructure Asset</h2>
              <p className="text-xs text-slate-500">Add asset to R&B Central Inventory Database</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Asset Category Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Asset Category</label>
            <div className="grid grid-cols-3 gap-3">
              {(['ROAD', 'BRIDGE', 'BUILDING'] as AssetType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setAssetType(type)}
                  className={`p-3 rounded-xl border font-bold text-xs flex items-center justify-center gap-2 transition ${
                    assetType === type
                      ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {type === 'ROAD' && <Navigation className="w-4 h-4" />}
                  {type === 'BRIDGE' && <Landmark className="w-4 h-4" />}
                  {type === 'BUILDING' && <Building2 className="w-4 h-4" />}
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Common Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Asset Code (Optional)</label>
              <input
                type="text"
                value={assetCode}
                onChange={(e) => setAssetCode(e.target.value)}
                placeholder="Auto-generated if empty (e.g. RD-AMD-101)"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Asset Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ahmedabad-Gandhinagar SH-41 Link"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">District *</label>
              <select
                value={district}
                onChange={(e) => {
                  setDistrict(e.target.value);
                  setResponsibleDivision(`${e.target.value} R&B Division`);
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                {['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Junagadh', 'Kutch', 'Anand', 'Mehsana'].map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Location Address *</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. S.G. Highway Stretch Km 12 to 24"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Latitude</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Longitude</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Construction Date</label>
              <input
                type="date"
                value={constructionDate}
                onChange={(e) => setConstructionDate(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Responsible Division</label>
              <input
                type="text"
                value={responsibleDivision}
                onChange={(e) => setResponsibleDivision(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Initial Condition</label>
              <select
                value={currentCondition}
                onChange={(e) => setCurrentCondition(e.target.value as Condition)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GOOD">GOOD</option>
                <option value="MODERATE">MODERATE</option>
                <option value="POOR">POOR</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Criticality Level</label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as Criticality)}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="VERY_HIGH">VERY_HIGH</option>
              </select>
            </div>
          </div>

          {/* Subtype Specific Fields */}
          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
              {assetType} Subtype Specifications
            </h4>

            {assetType === 'ROAD' && (
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Road Length (km)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={roadLength}
                    onChange={(e) => setRoadLength(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Road Category</label>
                  <input
                    type="text"
                    value={roadCategory}
                    onChange={(e) => setRoadCategory(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Surface Type</label>
                  <input
                    type="text"
                    value={surfaceType}
                    onChange={(e) => setSurfaceType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {assetType === 'BRIDGE' && (
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bridge Length (m)</label>
                  <input
                    type="number"
                    value={bridgeLength}
                    onChange={(e) => setBridgeLength(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bridge Type</label>
                  <input
                    type="text"
                    value={bridgeType}
                    onChange={(e) => setBridgeType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Number of Lanes</label>
                  <input
                    type="number"
                    value={numberOfLanes}
                    onChange={(e) => setNumberOfLanes(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {assetType === 'BUILDING' && (
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Building Type</label>
                  <input
                    type="text"
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Number of Floors</label>
                  <input
                    type="number"
                    value={numberOfFloors}
                    onChange={(e) => setNumberOfFloors(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Built-up Area (sq m)</label>
                  <input
                    type="number"
                    value={builtUpArea}
                    onChange={(e) => setBuiltUpArea(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-800 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm flex items-center gap-2 transition"
            >
              {submitting ? 'Registering...' : 'Save & Register Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
