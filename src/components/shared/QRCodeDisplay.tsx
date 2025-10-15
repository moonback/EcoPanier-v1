import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
}

export const QRCodeDisplay = ({ value, size = 300, title }: QRCodeDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-2 p-2 bg-white rounded-2xl border-2 border-gray-100 shadow-lg">
      {title && (
        <div className="text-center"><span className="text-sm text-gray-600">Invendu :</span>
          <h3 className="text-2xl font-bold text-black mb-2 flex items-center justify-center gap-2">
            <span>{title}</span>
          </h3>
        </div>
      )}
      <div className="p-2 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 shadow-inner">
        <QRCodeSVG value={value} size={size} level="H" />
      </div>
      
    </div>
  );
};
