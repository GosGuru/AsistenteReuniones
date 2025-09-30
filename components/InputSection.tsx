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

const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
};

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
  const [elapsedTime, setElapsedTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (recordingStatus === 'recording') {
        timerIntervalRef.current = window.setInterval(() => {
            setElapsedTime(prev => prev + 1);
        }, 1000);
    } else {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    }
    return () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
        }
    };
  }, [recordingStatus]);

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
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' });
          try {
            const transcribedText = await transcribeAudio(audioBlob);
            setTranscript((prev) => (prev ? prev + '\n' + transcribedText : transcribedText));
          } catch (err) {
            setTranscriptionError(err instanceof Error ? err.message : 'Error en la transcripción.');
          } finally {
            setIsTranscribing(false);
            setRecordingStatus('idle');
            cleanupAudio();
          }
        };
        
        mediaRecorder.start();
        setRecordingStatus('recording');
        setElapsedTime(0);
      } catch (err) {
        console.error('Error al iniciar la grabación:', err);
        setTranscriptionError('No se pudo acceder al micrófono. Por favor, comprueba los permisos.');
        cleanupAudio();
        setRecordingStatus('idle');
      }
    } else {
        setTranscriptionError('La grabación de audio no es compatible con este navegador.');
    }
  }, [setTranscript, cleanupAudio]);

  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingStatus('paused');
    }
  }, [recordingStatus]);

  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingStatus === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingStatus('recording');
    }
  }, [recordingStatus]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && (recordingStatus === 'recording' || recordingStatus === 'paused')) {
      setIsTranscribing(true);
      setRecordingStatus('stopped');
      setElapsedTime(0);
      mediaRecorderRef.current.stop();
    }
  }, [recordingStatus]);

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
        <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
        <input type="text" {...props} className="w-full bg-gray-800 border border-gray-700 rounded-md py-2 px-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"/>
    </div>
  );

  const isRecordingActive = recordingStatus === 'recording' || recordingStatus === 'paused';

  return (
    <div className="bg-gray-950 p-6 rounded-lg shadow-lg flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">1. Introduce la Transcripción</h2>
        <div className="flex items-center gap-2 mb-2">
            {!isRecordingActive && !isTranscribing && (
                <Button onClick={startRecording} disabled={isLoading} variant="secondary" size="sm">
                    <Icon name="mic" />
                    Grabar Audio
                </Button>
            )}
            <Button onClick={handlePaste} disabled={isLoading || isTranscribing || isRecordingActive} variant="secondary" size="sm">
                <Icon name="paste" />
                Pegar Texto
            </Button>
        </div>
        
        {(isRecordingActive || isTranscribing) && (
            <div className="my-2 p-4 bg-black/30 rounded-lg flex flex-col items-center gap-3">
                {isTranscribing ? (
                    <div className="flex items-center justify-center gap-3 py-8">
                        <Loader />
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-3 text-lg font-mono text-gray-200">
                           <span className="w-3 h-3 bg-red-500 rounded-full recording-indicator"></span>
                           <span>{formatTime(elapsedTime)}</span>
                        </div>
                        <AudioVisualizer analyserNode={analyserRef.current} status={recordingStatus} />
                        <div className="flex items-center gap-4 mt-2">
                            <Button onClick={isRecordingActive && recordingStatus === 'recording' ? pauseRecording : resumeRecording} variant="secondary" size="sm" className="w-28">
                                <Icon name={recordingStatus === 'recording' ? 'pause' : 'play'} />
                                {recordingStatus === 'recording' ? 'Pausar' : 'Reanudar'}
                            </Button>
                            <Button onClick={stopRecording} variant="secondary" size="sm" className="bg-red-600 hover:bg-red-500 text-white w-28">
                                <Icon name='stop' />
                                Detener
                            </Button>
                        </div>
                    </>
                )}
            </div>
        )}
        {transcriptionError && <p className="text-red-400 text-sm mt-2">{transcriptionError}</p>}

        <textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          placeholder="Pega la transcripción aquí o usa el grabador de audio..."
          className="w-full h-48 bg-gray-800 border border-gray-700 rounded-md p-3 text-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-y"
          disabled={isLoading || isRecordingActive || isTranscribing}
        />
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-3">2. Añade Contexto (Opcional)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <InputField label="Título de la Reunión" value={meetingTitle} onChange={(e) => setMeetingTitle(e.target.value)} placeholder="Ej: Sync Semanal de Q3"/>
           <InputField label="Responsable por Defecto" value={defaultOwner} onChange={(e) => setDefaultOwner(e.target.value)} placeholder="Ej: Ana Pérez"/>
           <div className="md:col-span-2">
             <InputField label="Asistentes (separados por comas)" value={attendees} onChange={(e) => setAttendees(e.target.value)} placeholder="Ej: Juan, María, Carlos"/>
           </div>
        </div>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-white mb-3">3. Genera el Resumen</h2>
        <div className="flex flex-col sm:flex-row gap-4">
            <Button 
                onClick={() => onGenerate('json')}
                disabled={isLoading || !transcript.trim() || isRecordingActive || isTranscribing}
                className="w-full"
            >
                {isLoading && <Loader />}
                {!isLoading && 'Generar Resumen Estructurado (JSON)'}
            </Button>
            <Button 
                onClick={() => onGenerate('markdown')}
                disabled={isLoading || !transcript.trim() || isRecordingActive || isTranscribing}
                variant="secondary"
                className="w-full"
            >
                 {isLoading && <Loader />}
                 {!isLoading && 'Generar Resumen Simple (Markdown)'}
            </Button>
        </div>
      </div>
    </div>
  );
};