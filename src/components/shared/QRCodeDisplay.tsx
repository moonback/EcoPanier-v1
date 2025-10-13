import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
}

export const QRCodeDisplay = ({ value, size = 300, title }: QRCodeDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-2xl border border-gray-200">
      {title && <h3 className="text-xl font-bold text-black">{title}</h3>}
      <div className="p-6 bg-white rounded-xl border border-gray-200">
        <QRCodeSVG value={value} size={size} level="H" />
      </div>
      <p className="text-sm text-gray-600 text-center max-w-xs font-light">
        Présentez ce code QR lors de la récupération
      </p>
    </div>
  );
};
