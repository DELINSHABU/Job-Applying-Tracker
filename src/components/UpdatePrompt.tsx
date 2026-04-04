import { Dialog, DialogContent } from './ui/dialog';
import { Rocket, Loader2, CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';

declare const __APP_VERSION__: string;

interface UpdatePromptProps {
  open: boolean;
  onUpdate: () => void;
  onLater: () => void;
}

export function UpdatePrompt({ open, onUpdate, onLater }: UpdatePromptProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [updateComplete, setUpdateComplete] = useState(false);

  useEffect(() => {
    if (isUpdating && !updateComplete) {
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval);
            return prev;
          }
          return prev + Math.random() * 12;
        });
      }, 200);
      return () => clearInterval(interval);
    } else if (updateComplete) {
      setProgress(100);
    } else {
      setProgress(0);
    }
  }, [isUpdating, updateComplete]);

  useEffect(() => {
    if (progress >= 95 && isUpdating && !updateComplete) {
      setUpdateComplete(true);
    }
  }, [progress, isUpdating, updateComplete]);

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateComplete(false);
    onUpdate();
  };

  const handleLater = () => {
    onLater();
  };

  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '2.0.0';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleLater()}>
      <DialogContent 
        hideClose 
        className="max-w-sm mx-auto p-0 overflow-visible"
      >
        <div className="bg-[#171b28] rounded-[2rem] p-[2px] shadow-2xl overflow-hidden" style={{ boxShadow: '0 0 40px -10px rgba(139, 92, 246, 0.3)' }}>
          <div className="bg-[#0a0e1a] rounded-[1.9rem] p-8 flex flex-col items-center text-center">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
              <div className="relative w-24 h-24 flex items-center justify-center bg-[#262a37] rounded-full border border-primary/20">
                {updateComplete ? (
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                ) : (
                  <Rocket className="w-10 h-10 text-secondary" />
                )}
                {!updateComplete && (
                  <div className="absolute -top-1 -right-1 flex h-6 w-6">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-6 w-6 bg-primary items-center justify-center"></span>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#dfe2f4] mb-2 font-display">
              {updateComplete ? 'Update Ready!' : 'Mission Update Ready'}
            </h1>
            <p className="text-[#cbc3d7] text-sm px-4 leading-relaxed font-medium">
              {updateComplete 
                ? 'Update downloaded. Restarting...' 
                : `Version ${version} is now available with improved features.`
              }
            </p>

            {isUpdating && (
              <div className="w-full mt-6">
                <div className="h-2 bg-[#262a37] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300 ease-out rounded-full"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-[#cbc3d7] mt-2">
                  {updateComplete ? 'Restarting app...' : 'Downloading update...'}
                </p>
              </div>
            )}

            <div className="w-full mt-10 space-y-3">
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="w-full py-4 rounded-xl text-white font-bold text-base tracking-wide active:scale-[0.98] transition-all shadow-lg flex items-center justify-center gap-2"
                style={{ background: updateComplete 
                  ? 'linear-gradient(135deg, #10B981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #8B5CF6 0%, #F59E0B 100%)' 
                }}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className={`w-5 h-5 animate-spin ${updateComplete ? 'hidden' : ''}`} />
                    {updateComplete ? 'Restarting...' : 'Updating...'}
                  </>
                ) : (
                  'Update Now'
                )}
              </button>
              {!isUpdating && (
                <button
                  onClick={handleLater}
                  className="w-full py-3 rounded-xl text-[#cbc3d7] font-medium text-sm hover:text-[#dfe2f4] transition-colors active:scale-[0.98]"
                >
                  Maybe Later
                </button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
