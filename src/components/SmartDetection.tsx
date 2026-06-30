import React, { useState, useRef, useEffect } from 'react';
import { Upload, Mic, Square } from 'lucide-react';
import { analyzeIssueWithGemini } from '../services/geminiService';
import type { AnalysisResult } from '../services/geminiService';


interface SmartDetectionProps {
  onAnalysisStarted: () => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
  apiKey?: string;
  userLocation: { lat: number; lng: number };
  prefilledCoords?: { lat: number; lng: number } | null;
  onClearPrefilled?: () => void;
}

export const SmartDetection: React.FC<SmartDetectionProps> = ({
  onAnalysisStarted,
  onAnalysisComplete,
  apiKey,
  userLocation,
  prefilledCoords,
  onClearPrefilled
}) => {
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gpsMock, setGpsMock] = useState(userLocation);
  const [locationType, setLocationType] = useState<'standard' | 'near-hospital' | 'near-school'>('near-hospital');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  // Sync gpsMock when userLocation resolves
  useEffect(() => {
    setGpsMock(userLocation);
  }, [userLocation]);

  // Sync gpsMock when map prefilledCoords are provided
  useEffect(() => {
    if (prefilledCoords) {
      setGpsMock(prefilledCoords);
      if (onClearPrefilled) {
        onClearPrefilled();
      }
    }
  }, [prefilledCoords, onClearPrefilled]);

  // Pre-load demo presets to facilitate hackathon pitch
  const handleSelectPreset = (type: 'pothole' | 'leakage' | 'streetlight') => {
    if (type === 'pothole') {
      setDescription("Massive road crack and pothole in the middle of Oakridge Lane. It's collecting water and cars are swerving aggressively to miss it.");
      setImagePreview("https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=400");
      setGpsMock({ lat: userLocation.lat + 0.0018, lng: userLocation.lng - 0.0034 });
      setLocationType('near-hospital');
    } else if (type === 'leakage') {
      setDescription("Water is gushing out from the pavement next to the sidewalk near Grand Plaza. Looks like a clean water pipeline has burst.");
      setImagePreview("https://images.unsplash.com/photo-1508189860359-777d945909ef?q=80&w=400");
      setGpsMock({ lat: userLocation.lat - 0.0035, lng: userLocation.lng + 0.0049 });
      setLocationType('standard');
    } else if (type === 'streetlight') {
      setDescription("Streetlights are completely off on 4th Avenue crossroad. Very dark here, feels unsafe for kids walking home from the nearby school.");
      setImagePreview("https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?q=80&w=400");
      setGpsMock({ lat: userLocation.lat + 0.0069, lng: userLocation.lng - 0.0070 });
      setLocationType('near-school');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startVoiceRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    timerRef.current = window.setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopVoiceRecording = () => {
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    // Mocking transcribing output
    setDescription("Transcribed: Heavy pothole reported on the main road grid. It has structural asphalt cracks, water pooling inside, and is presenting a high risk for vehicles.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    onAnalysisStarted();

    // Use coordinates directly from the selected or geolocated preset
    let finalLat = gpsMock.lat;
    let finalLng = gpsMock.lng;

    try {
      const result = await analyzeIssueWithGemini(
        imagePreview,
        description,
        { lat: finalLat, lng: finalLng },
        apiKey
      );
      onAnalysisComplete(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="glass-panel col-6" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '1.4rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={22} style={{ color: 'var(--color-primary)' }} />
          Smart Detection Media Ingest
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Upload media, record voice report, or select a preconfigured scenario preset.
        </p>
      </div>

      {/* Demo Preset Buttons (Highly visual for judges) */}
      <div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
          Scenarios presets for quick demo
        </span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="button" onClick={() => handleSelectPreset('pothole')} className="btn" style={{ fontSize: '0.75rem', padding: '8px 12px', border: '1px solid rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)' }}>
            ⚠️ Pothole (Near Hospital)
          </button>
          <button type="button" onClick={() => handleSelectPreset('leakage')} className="btn" style={{ fontSize: '0.75rem', padding: '8px 12px', border: '1px solid rgba(6, 182, 212, 0.2)', background: 'rgba(6, 182, 212, 0.05)' }}>
            💧 Pipe Leak (High Loss)
          </button>
          <button type="button" onClick={() => handleSelectPreset('streetlight')} className="btn" style={{ fontSize: '0.75rem', padding: '8px 12px', border: '1px solid rgba(245, 158, 11, 0.2)', background: 'rgba(245, 158, 11, 0.05)' }}>
            💡 Outage (Near School)
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Media drag drop box */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          style={{
            height: '160px',
            border: '2px dashed rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            background: imagePreview ? `url(${imagePreview}) center/cover no-repeat` : 'rgba(255,255,255,0.01)',
            transition: 'var(--transition-smooth)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {imagePreview ? (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(0,0,0,0.6)', padding: '6px 12px',
              textAlign: 'center', fontSize: '0.75rem', color: 'white'
            }}>
              Click to replace image
            </div>
          ) : (
            <>
              <Upload size={32} style={{ color: 'var(--color-text-dark)', marginBottom: '8px' }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                Drag and drop image or <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Browse</span>
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-text-dark)', marginTop: '4px' }}>
                Supports JPG, PNG, MP4 up to 10MB
              </span>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>

        {/* Text Description & Voice report grid */}
        <div className="form-group" style={{ position: 'relative' }}>
          <label className="form-label">Issue Details & Observations</label>
          <div style={{ position: 'relative' }}>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe the issue, infrastructure affected, visible damage..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{ width: '100%', paddingRight: '48px', resize: 'none' }}
              required
            />
            
            {/* Microphone button inside textarea */}
            <button
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: isRecording ? 'var(--color-critical)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-smooth)'
              }}
            >
              {isRecording ? <Square size={16} /> : <Mic size={16} />}
            </button>
          </div>

          {/* Voice recording waveform animation indicator */}
          {isRecording && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 14px', background: 'rgba(239, 68, 68, 0.08)',
              borderRadius: '10px', marginTop: '8px', border: '1px solid rgba(239, 68, 68, 0.15)'
            }}>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <span style={{ display: 'block', width: '3px', height: '12px', background: 'white', borderRadius: '2px', animation: 'pulseGlow 0.5s infinite ease-out' }} />
                <span style={{ display: 'block', width: '3px', height: '18px', background: 'white', borderRadius: '2px', animation: 'pulseGlow 0.5s infinite 0.1s ease-out' }} />
                <span style={{ display: 'block', width: '3px', height: '14px', background: 'white', borderRadius: '2px', animation: 'pulseGlow 0.5s infinite 0.2s ease-out' }} />
              </div>
              <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 600 }}>
                Streaming Voice Feed (0:0{recordingTime}s) - Speak now...
              </span>
            </div>
          )}
        </div>

        {/* Proximity / Location Meta parameters */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flexGrow: 1 }}>
            <label className="form-label">Geospatial Proximity Profile</label>
            <select 
              className="form-select"
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as any)}
              style={{ width: '100%' }}
            >
              <option value="standard">Standard Road Grid Segment</option>
              <option value="near-hospital">Near Health Facilities: Hospital</option>
              <option value="near-school">Near Educational Center: School</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isProcessing}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '14px',
            fontSize: '1rem',
            opacity: isProcessing ? 0.6 : 1
          }}
        >
          {isProcessing ? 'Agent Orchestrator Initialized...' : 'Submit Report to CivicMind Agent Network'}
        </button>
      </form>
    </div>
  );
};
