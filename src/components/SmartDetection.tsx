import { useState, useRef, useEffect, type ChangeEvent, type FormEvent } from 'react';
import { Upload, Mic, Square } from 'lucide-react';
import { analyzeIssueWithGemini } from '../services/geminiService';
import type { AnalysisResult } from '../services/geminiService';

interface SmartDetectionProps {
  onAnalysisStarted: () => void;
  onAnalysisComplete: (result: AnalysisResult) => void;
  apiKey?: string;
  userLocation: { lat: number; lng: number };
}

export const SmartDetection = ({
  onAnalysisStarted,
  onAnalysisComplete,
  apiKey,
  userLocation,
}: SmartDetectionProps) => {
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [gpsMock, setGpsMock] = useState(userLocation);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setGpsMock(userLocation);
  }, [userLocation]);

  const handleSelectPreset = (type: 'pothole' | 'leakage' | 'streetlight') => {
    if (type === 'pothole') {
      setDescription("Massive road crack and pothole in the middle of Oakridge Lane. It's collecting water and cars are swerving aggressively to miss it.");
      setImagePreview("https://images.unsplash.com/photo-1515162305285-0293e4767cc2?q=80&w=400");
      setGpsMock({ lat: userLocation.lat + 0.0018, lng: userLocation.lng - 0.0034 });
    } else if (type === 'leakage') {
      setDescription("Water is gushing out from the pavement next to the sidewalk near Grand Plaza. Looks like a clean water pipeline has burst.");
      setImagePreview("https://images.unsplash.com/photo-1508189860359-777d945909ef?q=80&w=400");
      setGpsMock({ lat: userLocation.lat - 0.0035, lng: userLocation.lng + 0.0049 });
    } else if (type === 'streetlight') {
      setDescription("Streetlights are completely off on 4th Avenue crossroad. Very dark here, feels unsafe for kids walking home from the nearby school.");
      setImagePreview("https://images.unsplash.com/photo-1509395062183-67c5ad6faff9?q=80&w=400");
      setGpsMock({ lat: userLocation.lat + 0.0069, lng: userLocation.lng - 0.0070 });
    }
  };

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFile(file);
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
    setDescription("Transcribed: Heavy pothole reported on the main road grid. It has structural asphalt cracks, water pooling inside, and is presenting a high risk for vehicles.");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    onAnalysisStarted();

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
        <h2 style={{ fontSize: '1.3rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Upload size={20} style={{ color: 'var(--color-primary)' }} />
          Smart Detection Media Ingest
        </h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
          Upload media, record voice report, or select a preconfigured scenario preset.
        </p>
      </div>

      {/* Demo Presets */}
      <div>
        <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-dark)', textTransform: 'uppercase', display: 'block', marginBottom: '8px', letterSpacing: '0.04em' }}>
          Quick Demo Presets
        </span>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => handleSelectPreset('pothole')} className="btn" style={{ 
            fontSize: '0.75rem', 
            padding: '8px 14px', 
            border: '1px solid rgba(220, 38, 38, 0.12)', 
            background: 'rgba(220, 38, 38, 0.03)',
            color: 'var(--color-text-main)'
          }}>
            ⚠️ Pothole
          </button>
          <button type="button" onClick={() => handleSelectPreset('leakage')} className="btn" style={{ 
            fontSize: '0.75rem', 
            padding: '8px 14px', 
            border: '1px solid rgba(8, 145, 178, 0.12)', 
            background: 'rgba(8, 145, 178, 0.03)',
            color: 'var(--color-text-main)'
          }}>
            💧 Pipe Leak
          </button>
          <button type="button" onClick={() => handleSelectPreset('streetlight')} className="btn" style={{ 
            fontSize: '0.75rem', 
            padding: '8px 14px', 
            border: '1px solid rgba(217, 119, 6, 0.12)', 
            background: 'rgba(217, 119, 6, 0.03)',
            color: 'var(--color-text-main)'
          }}>
            💡 Outage
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Upload Area */}
        <div 
          onClick={() => fileInputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            height: '160px',
            border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'rgba(0, 0, 0, 0.1)'}`,
            borderRadius: '12px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            background: isDragging ? 'rgba(37, 99, 235, 0.04)' : imagePreview ? `url(${imagePreview}) center/cover no-repeat` : 'var(--bg-deep)',
            transition: 'var(--transition-smooth)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {imagePreview ? (
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(4px)',
              padding: '6px 12px',
              textAlign: 'center', 
              fontSize: '0.72rem', 
              color: 'var(--color-text-muted)'
            }}>
              Click to replace image
            </div>
          ) : (
            <>
              <Upload size={28} style={{ color: 'var(--color-text-dark)', marginBottom: '8px' }} />
              <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                Drag and drop or <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Browse</span>
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--color-text-dark)', marginTop: '4px' }}>
                JPG, PNG, MP4 up to 10MB
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

        {/* Description */}
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
            <button
              type="button"
              onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
              style={{
                position: 'absolute',
                bottom: '12px',
                right: '12px',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: isRecording ? 'var(--color-critical)' : 'rgba(0, 0, 0, 0.03)',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                color: isRecording ? 'white' : 'var(--color-text-muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'var(--transition-smooth)'
              }}
            >
              {isRecording ? <Square size={14} /> : <Mic size={14} />}
            </button>
          </div>

          {isRecording && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              background: 'rgba(220, 38, 38, 0.04)',
              borderRadius: '10px',
              marginTop: '8px',
              border: '1px solid rgba(220, 38, 38, 0.1)'
            }}>
              <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                <span className="recording-bar" />
                <span className="recording-bar" />
                <span className="recording-bar" />
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--color-text-main)', fontWeight: 500 }}>
                Recording — {recordingTime}s — Speak now...
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={isProcessing}
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '13px',
            fontSize: '0.95rem',
            opacity: isProcessing ? 0.6 : 1
          }}
        >
          {isProcessing ? 'Agents Processing...' : 'Submit to Agent Network'}
        </button>
      </form>
    </div>
  );
};
