import { useState } from 'react';

const getCardType = (number) => {
  const first = number.replace(/\s/g, '')[0];
  if (first === '4') return 'visa';
  if (first === '5') return 'mastercard';
  return 'unknown';
};

export const CreditCard3D = ({ number, name, expiry, isFlipped }) => {
  const displayNumber = number || '**** **** **** ****';
  const displayName = name || 'NOMBRE APELLIDO';
  const displayExpiry = expiry || 'MM/AA';
  const cardType = getCardType(number);

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto" style={{ perspective: '1000px' }}>
      <div
        className={`relative w-full h-48 rounded-xl transition-transform duration-700 ease-in-out transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div
          className="absolute inset-0 rounded-xl p-6 flex flex-col justify-between backface-hidden"
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #0d9488)',
            backfaceVisibility: 'hidden',
          }}
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-7 rounded bg-yellow-400/80" />
            <div className="flex gap-1">
              {cardType === 'visa' && (
                <span className="text-white text-xs font-bold bg-blue-600/40 px-2 py-1 rounded">VISA</span>
              )}
              {cardType === 'mastercard' && (
                <span className="text-white text-xs font-bold bg-orange-600/40 px-2 py-1 rounded">MC</span>
              )}
            </div>
          </div>

          <div>
            <p className="text-white text-lg tracking-widest font-mono">
              {displayNumber}
            </p>
            <div className="flex justify-between mt-2">
              <div>
                <p className="text-white/60 text-xs uppercase">Titular</p>
                <p className="text-white text-sm font-medium truncate">{displayName}</p>
              </div>
              <div>
                <p className="text-white/60 text-xs uppercase">Vence</p>
                <p className="text-white text-sm font-medium">{displayExpiry}</p>
              </div>
            </div>
          </div>
        </div>

        <div
          className="absolute inset-0 rounded-xl bg-gray-800 p-6 rotate-y-180 backface-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="h-10 bg-black/40 -mx-6 mt-4 mb-6" />
          <div className="flex justify-end">
            <div className="bg-white/20 px-4 py-2 rounded">
              <p className="text-white/60 text-xs text-right">CVV</p>
              <p className="text-white text-lg font-mono tracking-widest text-right">***</p>
            </div>
          </div>
          <p className="text-white/40 text-[10px] mt-6 text-center">
            Esta tarjeta es una simulación visual
          </p>
        </div>
      </div>
    </div>
  );
};
