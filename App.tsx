import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { FileUpload } from './components/FileUpload';
import { ImageEditor } from './components/ImageEditor';
import { generateImageFromPrompt } from './services/geminiService';
import { fileToBase64, combineImages } from './utils/imageUtils';
import { AppState } from './types';
import { textStyles } from './components/textStyles';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.UPLOAD);
  const [originalImage, setOriginalImage] = useState<File | null>(null);
  const [productImageSrc, setProductImageSrc] = useState<string | null>(null);
  const [generatedBgSrc, setGeneratedBgSrc] = useState<string | null>(null);
  const [finalImageSrc, setFinalImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [logoImageSrc, setLogoImageSrc] = useState<string | null>(null);
  const [adText, setAdText] = useState<string>('');
  const [selectedStyleKey, setSelectedStyleKey] = useState<string>(Object.keys(textStyles)[0]);

  const handleImageUpload = useCallback(async (file: File) => {
    setError(null);
    setFinalImageSrc(null);
    setGeneratedBgSrc(null);
    setOriginalImage(file);
    try {
      const base64 = await fileToBase64(file);
      setProductImageSrc(base64);
      setAppState(AppState.EDITING);
    } catch (err) {
      setError('Error al cargar la imagen. Por favor, intenta con otro archivo.');
      console.error(err);
    }
  }, []);

  const handleLogoUpload = useCallback(async (file: File) => {
    try {
      const base64 = await fileToBase64(file);
      setLogoImageSrc(base64);
    } catch (err) {
      setError('Error al cargar el logo.');
      console.error(err);
    }
  }, []);

  useEffect(() => {
    if (!productImageSrc) return;

    // Si no hay fondo generado, no hacemos nada más que mostrar la imagen del producto.
    if (!generatedBgSrc) {
      setFinalImageSrc(null);
      return;
    }

    const composeImage = async () => {
      try {
        const finalImage = await combineImages(
          generatedBgSrc,
          productImageSrc, 
          {
            logoSrc: logoImageSrc,
            text: adText,
            style: adText ? textStyles[selectedStyleKey] : undefined,
          }
        );
        setFinalImageSrc(finalImage);
      } catch (err) {
        console.error("Error composing image:", err);
        setError("Error al combinar las imágenes.");
      }
    };
    
    composeImage();
  }, [productImageSrc, generatedBgSrc, logoImageSrc, adText, selectedStyleKey]);

  const handleGenerate = useCallback(async (prompt: string) => {
    if (!productImageSrc) {
      setError('No hay imagen de producto disponible.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAppState(AppState.GENERATING);
    setFinalImageSrc(null); // Limpiar imagen final mientras se genera el fondo
    setGeneratedBgSrc(null);


    try {
      const bgBase64 = await generateImageFromPrompt(prompt);
      const bgSrc = `data:image/png;base64,${bgBase64}`;
      setGeneratedBgSrc(bgSrc); // Esto disparará el useEffect para componer
      setAppState(AppState.RESULT);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error desconocido.';
      setError(`Error al generar la imagen: ${errorMessage}`);
      setAppState(AppState.EDITING);
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [productImageSrc]);

  const handleReset = () => {
    setAppState(AppState.UPLOAD);
    setOriginalImage(null);
    setProductImageSrc(null);
    setGeneratedBgSrc(null);
    setFinalImageSrc(null);
    setError(null);
    setIsLoading(false);
    setLogoImageSrc(null);
    setAdText('');
    setSelectedStyleKey(Object.keys(textStyles)[0]);
  };

  const renderContent = () => {
    switch (appState) {
      case AppState.UPLOAD:
        return <FileUpload onImageUpload={handleImageUpload} />;
      case AppState.EDITING:
      case AppState.GENERATING:
      case AppState.RESULT:
        return (
          <ImageEditor
            productImageSrc={productImageSrc}
            finalImageSrc={finalImageSrc}
            isLoading={isLoading}
            error={error}
            onGenerate={handleGenerate}
            onReset={handleReset}
            appState={appState}
            onLogoUpload={handleLogoUpload}
            logoImageSrc={logoImageSrc}
            adText={adText}
            onAdTextChange={setAdText}
            selectedStyleKey={selectedStyleKey}
            onStyleChange={setSelectedStyleKey}
          />
        );
      default:
        return <FileUpload onImageUpload={handleImageUpload} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-neutral-700">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;