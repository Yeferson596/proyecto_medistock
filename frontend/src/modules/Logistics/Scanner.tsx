import React from 'react';
import { Barcode, Camera, MapPin, Package } from 'lucide-react';
import { Badge, Button, Card } from '@/src/components/ui/Base';

export type LogisticsTask = {
  id: number;
  name: string;
  urgency: 'critical' | 'high' | 'medium';
  loc: string;
  due: string;
  items: number;
  progress: number;
};

interface LogisticsScannerProps {
  pickupTasks: LogisticsTask[];
  onGoToRoute: () => void;
}

export const LogisticsScanner: React.FC<LogisticsScannerProps> = ({ pickupTasks, onGoToRoute }) => {
  const [cameraReady, setCameraReady] = React.useState(false);
  const [scannedBarcode, setScannedBarcode] = React.useState<string | null>(null);
  const [scanMessage, setScanMessage] = React.useState('En espera de cámara...');
  const [cameraSupported, setCameraSupported] = React.useState(true);
  const [scannerIndex, setScannerIndex] = React.useState(0);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);

  const barcodeToTaskIndex = React.useMemo(
    () => ({
      '1234567890123': 0,
      '2345678901234': 1,
      '3456789012345': 2,
      '4567890123456': 3,
    }),
    []
  );

  const activeScannerTask = React.useMemo(
    () => pickupTasks[scannerIndex % pickupTasks.length],
    [pickupTasks, scannerIndex]
  );

  React.useEffect(() => {
    let stream: MediaStream | null = null;
    let timeoutId: number | null = null;
    let detector: BarcodeDetector | null = null;
    let active = true;

    const stopCamera = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setCameraReady(false);
    };

    const scanFrame = async () => {
      if (!active || !videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx || video.readyState !== HTMLMediaElement.HAVE_ENOUGH_DATA) {
        timeoutId = window.setTimeout(scanFrame, 250);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      if (detector) {
        try {
          const barcodes = await detector.detect(canvas);
          if (barcodes.length) {
            const raw = barcodes[0]?.rawValue ?? '';
            if (raw) {
              setScannedBarcode(raw);
              if (barcodeToTaskIndex[raw] !== undefined) {
                setScannerIndex(barcodeToTaskIndex[raw]);
                setScanMessage(`Producto reconocido: ${pickupTasks[barcodeToTaskIndex[raw]].name}`);
              } else {
                setScanMessage(`Código no reconocido: ${raw}`);
              }
            }
          }
        } catch (error) {
          setScanMessage('No se pudo procesar el código. Vuelva a intentar.');
        }
      }

      timeoutId = window.setTimeout(scanFrame, 250);
    };

    const startCamera = async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setCameraSupported(false);
        setScanMessage('Cámara no compatible en este navegador.');
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
        setCameraSupported(true);
        setScanMessage('Escaneando productos...');

        if ('BarcodeDetector' in window) {
          detector = new (window as any).BarcodeDetector({
            formats: ['ean_13', 'ean_8', 'code_128', 'qr_code', 'upc_a', 'upc_e'],
          });
        } else {
          setScanMessage('BarcodeDetector no disponible. Actualice su navegador.');
        }

        timeoutId = window.setTimeout(scanFrame, 250);
      } catch (error) {
        setCameraSupported(false);
        setScanMessage('Permiso rechazado o cámara no disponible.');
      }
    };

    startCamera();
    return () => {
      active = false;
      stopCamera();
    };
  }, [pickupTasks]);

  return (
    <>
      <Card className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/5 p-5 shadow-xl shadow-black/20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_42%)]" />
        <div className="relative space-y-4">
          <div className="rounded-[32px] overflow-hidden border border-cyan-400/20 bg-slate-950/90 h-72">
            {cameraSupported ? (
              <div className="relative h-full w-full">
                <video
                  ref={videoRef}
                  className="h-full w-full object-cover"
                  autoPlay
                  playsInline
                  muted
                  preload="auto"
                />
                <div className="pointer-events-none absolute inset-0 border-[4px] border-cyan-400/25 rounded-[32px]" />
                <div className="pointer-events-none absolute inset-x-8 top-8 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80" />
                <div className="pointer-events-none absolute inset-x-8 bottom-8 h-1 bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80" />
                <div className="pointer-events-none absolute inset-y-8 left-8 w-1 bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-80" />
                <div className="pointer-events-none absolute inset-y-8 right-8 w-1 bg-gradient-to-b from-transparent via-cyan-300 to-transparent opacity-80" />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center bg-slate-950/80 px-4 text-center text-sm text-slate-300">
                Cámara no compatible o permiso denegado.
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Estado del scanner</p>
                <p className="mt-1 text-sm font-bold text-white">{cameraReady ? 'Cámara activa' : 'Esperando cámara...'}</p>
              </div>
              <Badge variant={cameraReady ? 'success' : 'secondary'}>{cameraReady ? 'Listo' : 'Pendiente'}</Badge>
            </div>
            <p className="mt-2 text-sm text-slate-300">{scanMessage}</p>
            {scannedBarcode && (
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-cyan-300">Código: {scannedBarcode}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="rounded-full border-white/10 text-white hover:bg-white/10"
              onClick={() => setScannerIndex((currentIndex) => (currentIndex + 1) % pickupTasks.length)}
            >
              <Barcode size={16} />
              Simular escaneo
            </Button>
            <Button className="rounded-full bg-cyan-400 text-slate-950 hover:bg-cyan-300" onClick={onGoToRoute}>
              Ver ruta
            </Button>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Últimas lecturas</h3>
        {pickupTasks.map((task, index) => (
          <Card key={task.id} className="rounded-[22px] border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/15">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 space-y-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Escaneo {index + 1}</p>
                <h4 className="truncate text-base font-bold text-white">{task.loc}</h4>
                <p className="text-xs text-slate-400">{task.name}</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-full border-white/10 text-white hover:bg-white/10" onClick={onGoToRoute}>
                Abrir
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};
