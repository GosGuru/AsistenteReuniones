import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './common/Button';
import { Icon } from './common/Icon';
import { Loader } from './common/Loader';
import { AudioVisualizer } from './common/AudioVisualizer';
import { transcribeAudio } from '../services/geminiService';
import type { OutputFormat, RecordingStatus } from '../types';

interface InputSectionProps {
  transcript: string;
  setTranscript: (transcript: string) => void;
  meetingTitle: string;
  setMeetingTitle: (title: string) => void;
  attendees: string;
  setAttendees: (attendees: string) => void;
  defaultOwner: string;
  setDefaultOwner: (owner: string) => void;
  onGenerate: (format: OutputFormat) => void;
  isLoading: boolean;
}

export const InputSection: React.FC<InputSectionProps> = ({
  transcript,
  setTranscript,
  meetingTitle,
  setMeetingTitle,
  attendees,
  setAttendees,
  defaultOwner,
  setDefaultOwner,
  onGenerate,
  isLoading,
}) => {
  const [recordingStatus, setRecordingStatus] = useState<RecordingStatus>('idle');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanupAudio = useCallback(() => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
        sourceRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(console.error);
        audioContextRef.current = null;
    }
    mediaRecorderRef.current = null;
    analyserRef.current = null;
    audioChunksRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
        cleanupAudio();
    };
  }, [cleanupAudio]);

  const startRecording = useCallback(async () => {
    setTranscriptionError(null);
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;

        const source = audioContext.createMediaStreamSource(stream);
        sourceRef.current = source;

        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        source.connect(analyser);
        analyserRef.current = analyser;

        const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
        mediaRecorderRef.current = mediaRecorder;
        
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorder.onstop = async () => {
          setIsTranscribing(true);
          setRecordingStatus('stopped');
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          try {
            const transcribedText = await transcribeAudio(audioBlob);
            setTranscript((prev) => (prev ? prev + '\n' + transcribedText : transcribedText));
          } catch (err) {
            setTranscriptionError(err instanceof Error ? err.message : 'Error en la transcripción.');
          } finally {
            setIsTranscribing(false);
            cleanupAudio();
          }
        };
        
        mediaRecorder.start();
        setRecordingStatus('recording');
      } catch (err) {
        console.error('Error al iniciar la grabación:', err);
        setTranscriptionError('No se pudo acceder al micrófono. Por favor, comprueba los permisos.');
        cleanupAudio();
      }
    } else {
        setTranscriptionError('La grabación de audio no es compatible con este navegador.');
    }
  }, [setTranscript, cleanupAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, [recordingStatus]);

  const handleRecordClick = () => {
    if (recordingStatus === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handlePaste = async () => {
    try {
        const text = await navigator.clipboard.readText();
        setTranscript(text);
    } catch (err) {
        console.error('Failed to read clipboard contents: ', err);
    }
  };
  
  const InputField: React.FC<{ label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }> = ({ label, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-slate-400 mb-1">{label}</label>
        <input type="text" {...props} className="w-full bg-slate-700/50 border border-slate-600 rounded-md py-2 px-3 text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"/>
    </div>
  );

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-teal-400 mb-2">1. Introduce la Transcripción</h2>
        <div className="flex items-center gap-2 mb-2">
            <Button
                onClick={handleRecordClick}
                disabled={isLoading || isTranscribing}
                variant="secondary"
                size="sm"
            >
                <Icon name={recordingStatus === 'recording' ? 'stop' : 'mic'} />
                {recordingStatus === 'recording' ? 'Detener Grabación' : 'Grabar Audio'}
            </Button>
            <Button onClick={handlePaste} disabled={isLoading || isTranscribing} variant="secondary" size="sm">
                Pegar Texto
            </Button>
        </div>
        
        {(recordingStatus === 'recording' || isTranscribing) && (
            <div className="my-2 p-3 bg-slate-900/50 rounded-md">
                {isTranscribing ? (
                    <div className="flex items-center justify-center gap-2">
                        <Loader />
                        <span className="text-slate-400 text-sm">Transcribiendo...</span>
                    </div>
                ) : (
                    <AudioVisualizer analyserNode={analyserRef.current} status={recordingStatus} />
                )}
            </div>
        )}
        {transcriptionError && <p className="text-red-400 text-sm mt-2">{transcriptionError}</p>}

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Pega la transcripción aquí o usa el grabador de audio..."
          className="w-full h-48 bg-slate-700/50 border border-slate-600 rounded-md p-3 text-slate-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition resize-y"
          disabled={isLoading || recordingStatus === 'recording' || isTranscribing}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-teal-400 mb-3">2. Añade Contexto (Opcional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <InputField label="Título de la Reunión" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} placeholder="Ej: Sync Semanal de Q3"/>
           <InputField label="Responsable por Defecto" value={defaultOwner} onChange={(e) => setDefaultOwner(e.target.value)} placeholder="Ej: Ana Pérez"/>
           <div className="md:col-span-2">
             <InputField label="Asistentes (separados por comas)" value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="Ej: Juan, María, Carlos"/>
           </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-teal-400 mb-3">3. Genera el Resumen</h2>
        <div className="flex flex-col sm:flex-row gap-4">
            <Button 
                onClick={() => onGenerate('json')}
                disabled={isLoading || !transcript.trim()}
                className="w-full"
            >
                {isLoading ? <Loader /> : 'Generar Resumen Estructurado (JSON)'}
            </Button>
            <Button 
                onClick={() => onGenerate('markdown')}
                disabled={isLoading || !transcript.trim()}
                variant="secondary"
                className="w-full"
            >
                {isLoading ? <Loader /> : 'Generar Resumen Simple (Markdown)'}
            </Button>
        </div>
      </div>
    </div>
  );
};
