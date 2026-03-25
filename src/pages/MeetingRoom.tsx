import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Phone, Settings } from 'lucide-react';

export const MeetingRoom: React.FC = () => {
  const _meeting = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isRecording, setIsRecording] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [showEndDialog, setShowEndDialog] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    setShowEndDialog(true);
    setIsGenerating(true);
    // Simulate transcript generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
  };

  const handleLeave = () => {
    navigate('/meetings');
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      {/* Meeting Room */}
      <div className="w-full max-w-4xl space-y-4">
        {/* Video area - placeholder */}
        <div className="bg-black rounded-lg aspect-video flex items-center justify-center relative overflow-hidden border-2 border-slate-700">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-slate-700 mx-auto mb-4 flex items-center justify-center text-3xl">
                📹
              </div>
              <p className="text-white text-lg">Meeting Room</p>
              <p className="text-slate-400 text-sm mt-2">Camera and audio disabled for demo</p>
            </div>
          </div>

          {/* Duration timer */}
          <div className="absolute top-4 right-4 bg-black/70 px-4 py-2 rounded-lg text-white font-mono text-lg">
            {formatDuration(duration)}
          </div>

          {/* Recording indicator */}
          {isRecording && (
            <div className="absolute top-4 left-4 bg-red-600 px-3 py-2 rounded-lg flex items-center gap-2 animate-pulse">
              <span className="w-2 h-2 bg-white rounded-full" />
              <span className="text-white text-sm font-medium">RECORDING</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4 pb-4">
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-4 rounded-full transition-colors ${
              isMicOn
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isMicOn ? 'Mute' : 'Unmute'}
          >
            {isMicOn ? <Mic size={24} /> : <MicOff size={24} />}
          </button>

          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`p-4 rounded-full transition-colors ${
              isCameraOn
                ? 'bg-slate-700 hover:bg-slate-600 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            title={isCameraOn ? 'Stop Camera' : 'Start Camera'}
          >
            {isCameraOn ? <Video size={24} /> : <VideoOff size={24} />}
          </button>

          <button
            onClick={() => setIsRecording(!isRecording)}
            className={`p-4 rounded-full transition-colors ${
              isRecording
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-slate-700 hover:bg-slate-600 text-white'
            }`}
            title={isRecording ? 'Stop Recording' : 'Start Recording'}
          >
            <span className={`w-4 h-4 ${isRecording ? 'bg-white rounded-full' : 'bg-white rounded'}`} />
          </button>

          <button
            onClick={() => {}}
            className="p-4 rounded-full bg-slate-700 hover:bg-slate-600 text-white transition-colors"
            title="Settings"
          >
            <Settings size={24} />
          </button>

          <button
            onClick={handleEndCall}
            className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors ml-4"
            title="End Call"
          >
            <Phone size={24} />
          </button>
        </div>
      </div>

      {/* End call dialog */}
      {showEndDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            {isGenerating ? (
              <div className="text-center space-y-4">
                <div className="animate-spin w-12 h-12 border-4 border-slate-200 border-t-sidebar-accent rounded-full mx-auto" />
                <p className="text-lg font-semibold text-slate-900">Generating transcript...</p>
                <p className="text-sm text-slate-600">Processing meeting audio and creating summary</p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900">Meeting Summary</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">AI Summary</p>
                    <p className="text-sm text-slate-700">
                      Discussed student progress in mathematics and science. Identified areas for improvement and created action items for next month.
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Duration</p>
                    <p className="text-sm text-slate-700">{formatDuration(duration)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Action Items</p>
                    <ul className="text-sm text-slate-700 space-y-1">
                      <li>• Complete mathematics practice problems (Student)</li>
                      <li>• Schedule follow-up session (Mentor)</li>
                    </ul>
                  </div>
                </div>
                <div className="flex gap-2 pt-4">
                  <button
                    onClick={handleLeave}
                    className="flex-1 py-2 px-4 bg-sidebar-accent text-white font-medium rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    Finish & Save
                  </button>
                  <button
                    onClick={() => setShowEndDialog(false)}
                    className="flex-1 py-2 px-4 border border-slate-300 text-slate-900 font-medium rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    Continue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
