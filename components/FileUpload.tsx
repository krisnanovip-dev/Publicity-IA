import React, { ChangeEvent, useRef } from 'react';
import { UploadIcon } from './Icon';

interface FileUploadProps {
  onImageUpload: (file: File) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onImageUpload }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      onImageUpload(event.target.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.add('border-primary', 'bg-primary/20');
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary', 'bg-primary/20');
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.currentTarget.classList.remove('border-primary', 'bg-primary/20');
    if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      onImageUpload(event.dataTransfer.files[0]);
      event.dataTransfer.clearData();
    }
  };


  return (
    <div className="w-full max-w-2xl mx-auto text-center bg-white/10 backdrop-blur-md p-8 rounded-2xl shadow-lg border border-white/20">
      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className="p-10 border-2 border-dashed rounded-lg cursor-pointer transition-colors border-gray-400 hover:border-primary hover:bg-white/10"
      >
        <input 
          type="file"
          ref={inputRef}
          onChange={handleFileChange}
          accept="image/png, image/jpeg, image/webp"
          className="hidden"
        />
        <div className="flex flex-col items-center justify-center gap-4 text-white">
          <UploadIcon className="w-12 h-12" />
          <p className="text-lg font-semibold">Arrastra y suelta la foto de tu producto aquí</p>
          <p className="text-gray-300">o haz clic para seleccionar un archivo</p>
          <p className="text-xs text-gray-400 mt-2">PNG, JPG, WEBP</p>
        </div>
      </div>
      <div className="mt-6 text-gray-300">
        <h2 className="text-xl font-bold text-white mb-2">¿Cómo funciona?</h2>
        <ol className="list-decimal list-inside text-left space-y-1">
            <li>Sube una foto de tu producto con fondo transparente (PNG recomendado).</li>
            <li>Describe el fondo que quieres que la IA genere para tu anuncio.</li>
            <li>Añade texto y tu logo si lo deseas.</li>
            <li>Descarga tu nueva imagen publicitaria.</li>
        </ol>
      </div>
    </div>
  );
};
