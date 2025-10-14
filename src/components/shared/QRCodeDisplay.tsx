import { QRCodeSVG } from 'qrcode.react';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  title?: string;
}

export const QRCodeDisplay = ({ value, size = 300, title }: QRCodeDisplayProps) => {
  return (
    <div className="flex flex-col items-center gap-6 p-8 bg-white rounded-2xl border-2 border-gray-100 shadow-lg">
      {title && (
        <div className="text-center">
          <h3 className="text-2xl font-bold text-black mb-2 flex items-center justify-center gap-2">
            <span>📱</span>
            <span>{title}</span>
          </h3>
          <p className="text-sm text-gray-600">Pour vos retraits en magasin</p>
        </div>
      )}
      <div className="p-6 bg-gradient-to-br from-gray-50 to-white rounded-2xl border-2 border-gray-200 shadow-inner">
        <QRCodeSVG value={value} size={size} level="H" />
      </div>
      <div className="w-full p-4 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl border-2 border-primary-100">
        <p className="text-sm text-gray-700 text-center font-medium flex items-center justify-center gap-2">
          <span>👆</span>
          <span>Présentez ce code au commerçant</span>
        </p>
      </div>
    </div>
  );
};
