/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  Gift, 
  ArrowUp, 
  Upload, 
  Eraser, 
  CheckCircle2,
  PenTool
} from 'lucide-react';
import { contractConfig } from './contractConfig';

// Signature Modal Component
const SignatureModal = ({ 
  isOpen, 
  onClose, 
  onConfirm 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: (dataUrl: string) => void;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Set canvas size based on screen
      const updateCanvasSize = () => {
        const parent = canvas.parentElement;
        if (parent) {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
          
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.strokeStyle = '#1e3a8a';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
          }
        }
      };
      
      updateCanvasSize();
      window.addEventListener('resize', updateCanvasSize);
      return () => window.removeEventListener('resize', updateCanvasSize);
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    setHasSigned(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => setIsDrawing(false);

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    let x, y;
    if ('touches' in e) {
      x = e.touches[0].clientX - rect.left;
      y = e.touches[0].clientY - rect.top;
    } else {
      x = e.clientX - rect.left;
      y = e.clientY - rect.top;
    }
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSigned(false);
  };

  const handleConfirm = () => {
    const canvas = canvasRef.current;
    if (canvas && hasSigned) {
      onConfirm(canvas.toDataURL());
    } else {
      alert(contractConfig.signatures.alertRequired);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-4 md:p-10 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[80vh]">
        <div className="p-6 border-b flex justify-between items-center bg-stone-50">
          <h3 className="text-xl font-bold text-blue-900 uppercase tracking-tight">{contractConfig.signatures.modalTitle}</h3>
          <button onClick={onClose} className="p-2 hover:bg-stone-200 rounded-full transition-colors">
            <Eraser size={20} className="text-stone-400" />
          </button>
        </div>
        
        <div className="flex-grow relative bg-white cursor-crosshair touch-none">
          <canvas
            ref={canvasRef}
            className="w-full h-full"
            onMouseDown={startDrawing}
            onMouseUp={stopDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={stopDrawing}
            onTouchMove={draw}
          />
          {!hasSigned && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-20">
              <PenTool size={48} className="text-blue-900 mb-4" />
              <p className="text-xl font-bold text-blue-900 uppercase tracking-widest">{contractConfig.signatures.signHereLabel}</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-stone-50 flex gap-4">
          <button 
            onClick={clear}
            className="flex-1 py-4 border-2 border-stone-200 rounded-xl font-bold text-stone-500 hover:bg-stone-100 transition-all uppercase tracking-widest"
          >
            {contractConfig.signatures.clearBtn}
          </button>
          <button 
            onClick={handleConfirm}
            className="flex-[2] py-4 bg-blue-900 text-white rounded-xl font-bold hover:bg-blue-800 transition-all uppercase tracking-widest shadow-lg shadow-blue-900/20"
          >
            {contractConfig.signatures.confirmBtn}
          </button>
        </div>
      </div>
      <p className="mt-6 text-white/60 text-sm italic">{contractConfig.signatures.tip}</p>
    </div>
  );
};

export default function App() {
  const [balanceImage, setBalanceImage] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState(contractConfig.settings.initialCustomerName);
  const [contractCode] = useState(contractConfig.settings.initialContractCode);
  const [signature, setSignature] = useState<string | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(() => {
    const d = new Date();
    return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBalanceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmSignature = (dataUrl: string) => {
    const d = new Date();
    const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    
    setSignature(dataUrl);
    setCurrentDate(formattedDate);
    setIsSignModalOpen(false);
    setTimeout(() => {
      alert(contractConfig.signatures.successAlert);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-stone-200 flex items-center justify-center p-4 md:p-10 font-sans">
      <SignatureModal 
        isOpen={isSignModalOpen} 
        onClose={() => setIsSignModalOpen(false)} 
        onConfirm={handleConfirmSignature} 
      />

      {/* Main Contract Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-[800px] bg-white shadow-2xl p-1 md:p-2 border-[1px] border-amber-400"
      >
        {/* Inner Border */}
        <div className="border-[1px] border-amber-400 p-8 md:p-12 relative flex flex-col min-h-[1100px]">
          
          {/* Watermark */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-[0.02] select-none">
            <div className="w-96 h-96 border-[40px] border-stone-900 rounded-full flex items-center justify-center">
              <div className="w-48 h-48 border-[20px] border-stone-900 rounded-full" />
            </div>
          </div>

          {/* Header */}
          <div className="flex justify-between items-start mb-12 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center overflow-hidden shadow-sm border border-stone-100">
                <img src={contractConfig.header.logoUrl} alt="Logo Con Cưng" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-serif font-bold text-blue-900 tracking-wide uppercase">{contractConfig.header.brandName}</h2>
                <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest">{contractConfig.header.subTitle}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[9px] text-amber-600 font-bold uppercase tracking-widest">{contractConfig.header.contractCodeLabel}</p>
              <p className="text-sm font-bold text-stone-700">{contractCode}</p>
            </div>
          </div>

          {/* Main Title */}
          <div className="text-center mb-12 relative z-10">
            <h1 className="text-4xl font-serif font-bold text-blue-900 mb-4 tracking-tight">{contractConfig.title.main}</h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-[1px] w-16 bg-amber-400" />
              <p className="text-amber-600 italic font-serif text-sm">{contractConfig.title.sub}</p>
              <div className="h-[1px] w-16 bg-amber-400" />
            </div>
          </div>

          {/* Parties Section */}
          <div className="grid grid-cols-2 gap-12 mb-10 relative z-10">
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3">{contractConfig.parties.partyALabel}</h3>
              <p className="text-lg font-serif font-bold text-stone-900">{contractConfig.parties.partyAName}</p>
              <p className="text-[10px] text-stone-500 leading-relaxed">
                {contractConfig.parties.partyAAddress}<br />
                {contractConfig.parties.partyATaxCode}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mb-3">{contractConfig.parties.partyBLabel}</h3>
              <input 
                type="text" 
                value={customerName} 
                onChange={(e) => setCustomerName(e.target.value.toUpperCase())}
                className="text-lg font-serif font-bold text-stone-900 bg-transparent border-none outline-none w-full"
              />
              <p className="text-[10px] text-stone-500">{contractConfig.settings.customerIdLabel}</p>
            </div>
          </div>

          {/* Content Sections */}
          <div className="space-y-8 relative z-10 text-[11px] text-stone-700 leading-relaxed">
            {contractConfig.sections.map((section, idx) => (
              <section key={idx}>
                <h4 className="font-bold text-stone-900 mb-2 flex items-center gap-2">
                  <span className="text-amber-600">{section.id}</span> {section.title}
                </h4>
                {section.content && <p>{section.content}</p>}
                {section.highlight && (
                  <p className="italic font-bold mb-3">
                    {section.highlight}
                  </p>
                )}
                {section.list && (
                  <ul className="space-y-2">
                    {section.list.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span className={i === 1 ? "text-blue-700 font-bold" : ""}>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {section.perks && (
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    {section.perks.map((perk, i) => (
                      <div key={i} className="p-4 border border-stone-100 rounded-sm text-center space-y-2 bg-stone-50/30">
                        <div className="mx-auto text-amber-500 mb-2">
                          {i === 0 && <Shield size={20} />}
                          {i === 1 && <Gift size={20} />}
                          {i === 2 && <ArrowUp size={20} />}
                        </div>
                        <p className="text-[9px] font-bold text-stone-900 uppercase">{perk.title}</p>
                        <p className="text-[8px] text-stone-400 leading-tight">{perk.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
                {section.uploadLabel && (
                  <div className="bg-stone-50 p-4 border border-stone-200 rounded-sm flex items-center gap-6">
                    <div className="flex flex-col items-center gap-1 text-stone-400">
                      <CheckCircle2 size={24} className="text-amber-500" />
                      <span className="text-[8px] font-bold uppercase">{section.uploadLabel}</span>
                    </div>
                    <div className="flex-grow relative group">
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="border border-dashed border-stone-300 bg-white h-16 rounded-sm flex items-center justify-center gap-2 group-hover:border-amber-400 transition-colors">
                        {balanceImage ? (
                          <img src={balanceImage} alt="Balance" className="h-full object-contain" referrerPolicy="no-referrer" />
                        ) : (
                          <>
                            <Upload size={16} className="text-stone-400" />
                            <span className="text-[10px] text-stone-400 font-bold uppercase">{section.uploadPlaceholder}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* Signature Section */}
          <div className="mt-auto pt-16 grid grid-cols-2 gap-20 relative z-10">
            <div className="text-center space-y-4">
              <p className="text-[11px] font-bold text-stone-900 uppercase">{contractConfig.signatures.partyALabel}</p>
              <div className="h-32 flex items-center justify-center relative">
                <img 
                  src={contractConfig.signatures.stampUrl} 
                  alt="Con dấu Con Cưng" 
                  className="w-32 h-32 object-contain mix-blend-multiply pointer-events-none rotate-[-5deg]" 
                  referrerPolicy="no-referrer"
                />
              </div>
              <p className="text-[10px] font-bold text-stone-400 uppercase">{contractConfig.signatures.partyANameFooter}</p>
            </div>

            <div className="text-center space-y-4">
              <p className="text-[11px] font-bold text-stone-900 uppercase">{contractConfig.signatures.partyBLabel}</p>
              <div 
                onClick={() => setIsSignModalOpen(true)}
                className="relative border border-dashed border-amber-400 rounded-md bg-white overflow-hidden group cursor-pointer h-24 flex items-center justify-center hover:bg-stone-50 transition-colors"
              >
                {signature ? (
                  <img src={signature} alt="Chữ ký khách hàng" className="h-full object-contain" referrerPolicy="no-referrer" />
                ) : (
                  <div className="flex flex-col items-center text-amber-600 opacity-40 group-hover:opacity-100 transition-opacity">
                    <PenTool size={20} />
                    <span className="text-[10px] font-bold uppercase">{contractConfig.signatures.signHereLabel}</span>
                  </div>
                )}
              </div>
              <p className="text-[11px] font-serif font-bold text-stone-900 uppercase tracking-widest">{customerName}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-16 pt-6 border-t border-stone-100 flex justify-between items-center text-[8px] text-stone-400 font-medium uppercase tracking-widest relative z-10">
            <p>{contractConfig.footer.copy}</p>
            <p>{currentDate}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
