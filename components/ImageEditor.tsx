import React, { useState, ChangeEvent, useRef } from 'react';
import { AppState } from '../types';
import { Spinner } from './Spinner';
import { DownloadIcon, RedoIcon } from './Icon';
import { textStyles } from './textStyles';

interface ImageEditorProps {
  productImageSrc: string | null;
  finalImageSrc: string | null;
  isLoading: boolean;
  error: string | null;
  onGenerate: (prompt: string) => void;
  onReset: () => void;
  appState: AppState;
  onLogoUpload: (file: File) => void;
  logoImageSrc: string | null;
  adText: string;
  onAdTextChange: (text: string) => void;
  selectedStyleKey: string;
  onStyleChange: (key: string) => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  productImageSrc,
  finalImageSrc,
  isLoading,
  error,
  onGenerate,
  onReset,
  appState,
  onLogoUpload,
  logoImageSrc,
  adText,
  onAdTextChange,
  selectedStyleKey,
  onStyleChange,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateClick = () => {
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  const handleDownload = () => {
    if (finalImageSrc) {
      const link = document.createElement('a');
      link.href = finalImageSrc;
      link.download = 'anuncio-ia.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  const handleLogoUploadClick = () => {
    logoInputRef.current?.click();
  }

  const handleLogoFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onLogoUpload(event.target.files[0]);
    }
  };

  const imageToDisplay = finalImageSrc || productImageSrc;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      {/* Columna de Controles */}
      <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/20 flex flex-col gap-4 text-white">
        <div>
          <label htmlFor="prompt" className="block text-lg font-bold mb-2">1. Describe el fondo</label>
          <p className="text-sm text-gray-300 mb-2">Sé detallado. Por ejemplo: "una playa tropical al atardecer con palmeras y arena blanca".</p>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ej: una encimera de mármol de cocina con luz natural..."
            className="w-full h-24 p-2 rounded-md bg-white/80 backdrop-blur-sm border border-white/30 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-neutral-800 placeholder:text-neutral-500"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-3">
            <h3 className="text-lg font-bold">2. Añade texto (Opcional)</h3>
             <input
                type="text"
                value={adText}
                onChange={(e) => onAdTextChange(e.target.value)}
                placeholder="Ej: ¡50% DE DESCUENTO!"
                className="w-full p-2 rounded-md bg-white/80 backdrop-blur-sm border border-white/30 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-neutral-800 placeholder:text-neutral-500"
                disabled={isLoading}
            />
             <select
                value={selectedStyleKey}
                onChange={(e) => onStyleChange(e.target.value)}
                className="w-full p-2 rounded-md bg-white/80 backdrop-blur-sm border border-white/30 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-neutral-800"
                disabled={isLoading || !adText}
            >
                {Object.keys(textStyles).map(key => (
                    <option key={key} value={key} className="text-neutral-800">{key}</option>
                ))}
            </select>
        </div>
        
        <div className="space-y-3">
             <h3 className="text-lg font-bold">3. Sube tu logo (Opcional)</h3>
             <input
                type="file"
                ref={logoInputRef}
                onChange={handleLogoFileChange}
                accept="image/png, image/jpeg"
                className="hidden"
             />
             <button
                onClick={handleLogoUploadClick}
                className="w-full bg-gray-700/50 hover:bg-gray-600/50 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                disabled={isLoading}
            >
                {logoImageSrc ? 'Cambiar logo' : 'Seleccionar logo'}
            </button>
        </div>


        <div className="mt-auto pt-4 flex flex-col gap-3">
           <button
            onClick={handleGenerateClick}
            disabled={isLoading || !prompt.trim()}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? <><Spinner /> Generando...</> : '✨ Generar Fondo'}
          </button>
          
           {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <div className="flex gap-2">
             {appState === AppState.RESULT && (
                <button
                    onClick={handleDownload}
                    disabled={!finalImageSrc}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <DownloadIcon className="w-5 h-5" />
                    Descargar
                </button>
            )}
             <button
                onClick={onReset}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <RedoIcon className="w-5 h-5" />
                Empezar de nuevo
            </button>
          </div>
        </div>
      </div>

      {/* Columna de Imagen */}
      <div className="aspect-square bg-black/20 rounded-2xl flex items-center justify-center p-4 relative overflow-hidden border border-white/20">
        {isLoading && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10">
            <Spinner />
            <p className="mt-4 text-white text-lg">Creando magia...</p>
          </div>
        )}
        {imageToDisplay ? (
          <img src={imageToDisplay} alt="Product" className="max-w-full max-h-full object-contain" />
        ) : (
          <div className="text-center text-gray-400">
            <p>La imagen aparecerá aquí.</p>
          </div>
        )}
         {logoImageSrc && appState === AppState.EDITING && (
          <img src={logoImageSrc} alt="Logo preview" className="absolute bottom-4 right-4 max-w-[15%] max-h-[15%] object-contain opacity-50" />
        )}
      </div>
    </div>
  );
};