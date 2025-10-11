import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
}

export const QRCodeDisplay = ({ value, size = 200, title }: QRCodeDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-md">
      {title && <h3 className="text-lg font-semibold text-gray-800">{title}</h3>}
      <div className="p-4 bg-white rounded-lg border-2 border-gray-200">
        <QRCodeSVG value={value} size={size} level="H" />
      </div>
      <p className="text-sm text-gray-600 text-center max-w-xs">
        Présentez ce code QR lors de la récupération
      </p>
    </div>
  );
};
