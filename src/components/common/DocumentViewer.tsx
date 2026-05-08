import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Printer, Download, EyeOff } from 'lucide-react';

interface DocumentViewerProps {
  url: string;
  fileName: string;
  watermarkText?: string;
  isViewOnly?: boolean;
  onClose: () => void;
}

export default function DocumentViewer({ 
  url, 
  fileName, 
  watermarkText, 
  isViewOnly = false,
  onClose 
}: DocumentViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (watermarkText && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const drawWatermark = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.font = '20px Inter';
          ctx.fillStyle = 'rgba(150, 150, 150, 0.15)';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const stepX = 250;
          const stepY = 150;
          
          ctx.rotate(-20 * Math.PI / 180);
          
          for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
            for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
              ctx.fillText(watermarkText, x, y);
            }
          }
        };

        drawWatermark();
        window.addEventListener('resize', drawWatermark);
        return () => window.removeEventListener('resize', drawWatermark);
      }
    }
  }, [watermarkText]);

  // Block basic shortcuts if view only
  useEffect(() => {
    if (isViewOnly) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's')) {
          e.preventDefault();
          alert('出于安全原因，此文档禁止打印或下载。');
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isViewOnly]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-slate-900/95 flex flex-col backdrop-blur-sm"
      onContextMenu={(e) => isViewOnly && e.preventDefault()}
    >
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
            <Lock size={16} />
          </div>
          <div>
            <h2 className="text-white font-bold text-sm truncate max-w-md">{fileName}</h2>
            {isViewOnly && (
              <p className="text-red-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1">
                <EyeOff size={10} /> 安全受控文档 • 禁止传播
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {!isViewOnly && (
            <>
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Printer size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-white transition-colors">
                <Download size={20} />
              </button>
            </>
          )}
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
          >
            <X size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden flex items-center justify-center p-4">
        <div className="w-full h-full max-w-5xl bg-white rounded-xl shadow-2xl relative overflow-hidden group">
          {/* Simulation of a document - normally an iframe or PDF viewer */}
          <iframe 
            src={url} 
            className="w-full h-full border-none pointer-events-auto"
            title="Viewer"
          />
          
          {/* Watermark Canvas overlay */}
          {watermarkText && (
            <canvas 
              ref={canvasRef} 
              className="absolute inset-0 pointer-events-none z-10"
            />
          )}

          {/* Screenshot protection mask (visual hint) */}
          {isViewOnly && (
            <div className="absolute inset-0 border-[20px] border-red-500/5 pointer-events-none z-20">
               <div className="absolute top-4 right-4 bg-red-600 text-white px-2 py-1 rounded text-[8px] font-bold uppercase tracking-widest shadow-lg">
                 Secure View Active
               </div>
            </div>
          )}
        </div>
      </main>

      <footer className="px-6 py-3 bg-slate-900 border-t border-white/5 flex justify-center">
        <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.2em]">
          Powered by Bidding Resource Control System • End-to-End Encryption
        </p>
      </footer>
    </motion.div>
  );
}
