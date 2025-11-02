import React from 'react';
import { SparklesIcon } from './Icon';

export const Header: React.FC = () => {
  return (
    <header className="w-full">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center gap-3">
        <SparklesIcon className="w-8 h-8 text-white" />
        <h1 className="text-2xl font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">
          Generador de Fotos para Anuncios con IA
        </h1>
      </div>
    </header>
  );
};