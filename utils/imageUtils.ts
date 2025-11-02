import { TextStyle } from '../types';

/**
 * Converts a File object to a Base64 encoded string.
 * @param file The image file to convert.
 * @returns A promise that resolves to the Base64 data URL.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    const lines = [];

    for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
            lines.push(line);
            line = words[n] + ' ';
        } else {
            line = testLine;
        }
    }
    lines.push(line);

    let currentY = y - (lineHeight * (lines.length -1) / 2);
    if (ctx.textBaseline === 'bottom') {
       currentY = y - (lineHeight * (lines.length -1));
    } else if (ctx.textBaseline === 'top') {
       currentY = y;
    }


    for (let i = 0; i < lines.length; i++) {
        if (ctx.strokeStyle && ctx.lineWidth) {
            ctx.strokeText(lines[i].trim(), x, currentY);
        }
        ctx.fillText(lines[i].trim(), x, currentY);
        currentY += lineHeight;
    }
};

/**
 * Combines a background, foreground, logo, and text onto a canvas.
 * @returns A promise that resolves to the data URL of the combined image.
 */
export const combineImages = (backgroundSrc: string, foregroundSrc: string, options: {
  logoSrc?: string | null;
  text?: string;
  style?: TextStyle;
}): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return reject(new Error('Could not get canvas context'));
    }

    const bgImage = new Image();
    bgImage.crossOrigin = 'anonymous';
    bgImage.onload = () => {
      canvas.width = bgImage.width;
      canvas.height = bgImage.height;
      ctx.drawImage(bgImage, 0, 0);

      const fgImage = new Image();
      fgImage.crossOrigin = 'anonymous';
      fgImage.onload = () => {
        const scaleFactor = Math.min(
          canvas.width / (fgImage.width * 1.2), 
          canvas.height / (fgImage.height * 1.2)
        );
        const fgWidth = fgImage.width * scaleFactor;
        const fgHeight = fgImage.height * scaleFactor;
        const fgX = (canvas.width - fgWidth) / 2;
        const fgY = (canvas.height - fgHeight) / 2;
        ctx.drawImage(fgImage, fgX, fgY, fgWidth, fgHeight);

        const drawTextAndResolve = () => {
          if (options.text && options.style) {
            const style = options.style;
            ctx.font = style.font;
            ctx.textAlign = style.textAlign;
            ctx.textBaseline = style.textBaseline;

            const fontSize = parseInt(style.font, 10) || 50;
            const x = canvas.width * style.position.x;
            const y = canvas.height * style.position.y;
            
            // Handle gradient fill
            if (typeof style.fillStyle === 'object' && style.fillStyle.gradient) {
                const gradient = ctx.createLinearGradient(0, y - fontSize, 0, y + fontSize);
                const colors = style.fillStyle.gradient;
                colors.forEach((color, index) => {
                   gradient.addColorStop(index / (colors.length - 1), color);
                });
                ctx.fillStyle = gradient;
            } else if (typeof style.fillStyle === 'string') {
                ctx.fillStyle = style.fillStyle;
            }
            
            if (style.shadowColor) {
              ctx.shadowColor = style.shadowColor;
              ctx.shadowBlur = style.shadowBlur || 0;
              ctx.shadowOffsetX = style.shadowOffsetX || 0;
              ctx.shadowOffsetY = style.shadowOffsetY || 0;
            }
             if (style.strokeColor && style.strokeWidth) {
                ctx.strokeStyle = style.strokeColor;
                ctx.lineWidth = style.strokeWidth;
            }

            const maxWidth = canvas.width * (style.maxWidthFactor || 0.8);
            const lineHeight = fontSize * 1.1;

            wrapText(ctx, options.text.trim(), x, y, maxWidth, lineHeight);
          }
          resolve(canvas.toDataURL('image/png'));
        };

        if (options.logoSrc) {
          const logoImage = new Image();
          logoImage.crossOrigin = 'anonymous';
          logoImage.onload = () => {
            const logoScale = 0.15;
            const logoWidth = canvas.width * logoScale;
            const logoHeight = logoImage.height * (logoWidth / logoImage.width);
            const padding = canvas.width * 0.03;
            const logoX = canvas.width - logoWidth - padding;
            const logoY = canvas.height - logoHeight - padding;
            ctx.drawImage(logoImage, logoX, logoY, logoWidth, logoHeight);
            drawTextAndResolve();
          };
          logoImage.onerror = (e) => {
              console.error("Error loading logo, skipping.", e);
              drawTextAndResolve();
          };
          logoImage.src = options.logoSrc;
        } else {
          drawTextAndResolve();
        }
      };
      fgImage.onerror = reject;
      fgImage.src = foregroundSrc;
    };
    bgImage.onerror = reject;
    bgImage.src = backgroundSrc;
  });
};