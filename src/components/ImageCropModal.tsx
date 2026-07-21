import { useState, useCallback } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { RotateCw, ZoomIn, X, Check } from 'lucide-react';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  aspectRatio?: number; // 1 for profile (1:1), 2.5 for banner (5:2)
  title?: string;
  cropShape?: 'rect' | 'round';
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area, rotation = 0): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const radians = (rotation * Math.PI) / 180;
  const sin = Math.abs(Math.sin(radians));
  const cos = Math.abs(Math.cos(radians));
  const bBoxWidth = image.width * cos + image.height * sin;
  const bBoxHeight = image.width * sin + image.height * cos;

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(radians);
  ctx.translate(-image.width / 2, -image.height / 2);
  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d')!;
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob((blob) => {
      resolve(blob!);
    }, 'image/jpeg', 0.9);
  });
}

export function ImageCropModal({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  title = 'Ajustar Imagem',
  cropShape,
}: ImageCropModalProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const activeCropShape = cropShape || (aspectRatio === 1 ? 'round' : 'rect');

  const onCropCompleteHandler = useCallback((_: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
    onCropComplete(croppedBlob);
    resetState();
    onClose();
  };

  const resetState = () => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-border">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-foreground">{title}</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-72 bg-black">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspectRatio}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropCompleteHandler}
            cropShape={activeCropShape}
            showGrid={activeCropShape !== 'round'}
          />
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={([val]) => setZoom(val)}
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <Slider
                value={[rotation]}
                min={0}
                max={360}
                step={1}
                onValueChange={([val]) => setRotation(val)}
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleConfirm} className="flex-1">
              <Check className="w-4 h-4 mr-2" />
              OK
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
