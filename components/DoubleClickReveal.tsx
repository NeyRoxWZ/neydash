"use client";

import { useState, useEffect, useRef } from "react";
import { Eye, EyeOff, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface DoubleClickRevealProps {
  value: string;
  masked?: string;
  label?: string;
}

export default function DoubleClickReveal({ value, masked, label }: DoubleClickRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const revealTimerRef = useRef<NodeJS.Timeout | null>(null);

  const defaultMasked = masked || value.substring(0, 6) + "****" + value.substring(value.length - 4);

  const handleClick = () => {
    if (isRevealed) return;

    setClickCount((prev) => prev + 1);

    if (clickCount === 0) {
      // Premier clic, on lance le timer de 3 secondes pour le deuxième clic
      timerRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3000);
    } else if (clickCount === 1) {
      // Deuxième clic dans les 3 secondes
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsRevealed(true);
      setClickCount(0);

      // On re-masque après 3 secondes d'inactivité (ou juste après l'affichage)
      revealTimerRef.current = setTimeout(() => {
        setIsRevealed(false);
      }, 3000);
    }
  };

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      toast.success(`${label || "Donnée"} copiée !`);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast.error("Erreur lors de la copie");
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current);
    };
  }, []);

  return (
    <div 
      className="flex items-center space-x-2 bg-secondary/20 p-2 rounded-md border border-border group cursor-pointer select-none"
      onClick={handleClick}
      title={isRevealed ? "Donnée affichée" : "Double-cliquez (sous 3s) pour révéler"}
    >
      <div className="flex-1 font-mono text-sm overflow-hidden text-ellipsis">
        {isRevealed ? value : defaultMasked}
      </div>
      
      <div className="flex items-center space-x-1">
        {isRevealed ? (
          <EyeOff className="w-4 h-4 text-muted-foreground" />
        ) : (
          <Eye className={`w-4 h-4 ${clickCount === 1 ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
        )}
        
        <button
          onClick={handleCopy}
          className="p-1 hover:bg-secondary rounded-md transition-colors"
          title="Copier la valeur complète"
        >
          {isCopied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>
    </div>
  );
}
