import React, { useRef, useEffect } from 'react';
import type { RecordingStatus } from '../../types';

interface AudioVisualizerProps {
  analyserNode: AnalyserNode | null;
  status: RecordingStatus;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ analyserNode, status }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameId = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserNode) return;

    const canvasCtx = canvas.getContext('2d');
    if (!canvasCtx) return;

    const draw = () => {
      if (status !== 'recording' || !analyserNode) {
        if(animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
        return;
      }

      animationFrameId.current = requestAnimationFrame(draw);

      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteTimeDomainData(dataArray);

      canvasCtx.fillStyle = '#374151'; // gray-700
      canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

      canvasCtx.lineWidth = 2;
      canvasCtx.strokeStyle = '#ffffff'; // white

      canvasCtx.beginPath();

      const sliceWidth = canvas.width * 1.0 / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = v * canvas.height / 2;

        if (i === 0) {
          canvasCtx.moveTo(x, y);
        } else {
          canvasCtx.lineTo(x, y);
        }

        x += sliceWidth;
      }

      canvasCtx.lineTo(canvas.width, canvas.height / 2);
      canvasCtx.stroke();
    };

    if (status === 'recording') {
      draw();
    } else {
        // Clear canvas when not recording
        canvasCtx.fillStyle = '#374151';
        canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
    }

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [analyserNode, status]);

  return <canvas ref={canvasRef} width="300" height="75" className="w-full h-16 rounded-md bg-gray-800" />;
};