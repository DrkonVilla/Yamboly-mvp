import React from 'react';

const getCardType = (number) => {
  const first = (number || '').replace(/\s/g, '')[0];
  if (first === '4') return 'visa';
  if (first === '5') return 'mastercard';
  return 'unknown';
};

export const CreditCard3D = ({ number, name, expiry, cvv, isFlipped }) => {
  const displayName = name || 'NOMBRE APELLIDO';
  const displayExpiry = expiry || 'MM/AA';
  const displayCvv = cvv || '***';
  const cardType = getCardType(number);

  // Format the number on the card as **** **** **** 1234
  const getMaskedNumber = (num) => {
    const clean = (num || '').replace(/\s/g, '');
    if (!clean) return '**** **** **** ****';
    
    // Mask first digits, leaving up to the last 4 visible
    const visibleLength = Math.max(0, clean.length - 12);
    const visiblePart = clean.slice(12);
    return `**** **** **** ${visiblePart.padEnd(4, '*')}`;
  };

  const formattedNumber = getMaskedNumber(number);

  return (
    <div className="perspective-1000 w-full max-w-sm mx-auto my-4" style={{ perspective: '1000px' }}>
      <div
        className={`relative w-full h-48 rounded-2xl shadow-xl transition-transform duration-700 ease-in-out transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front side */}
        <div
          className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between backface-hidden text-white"
          style={{
            background: 'linear-gradient(135deg, #4B2E83, #29B6E8)',
            backfaceVisibility: 'hidden',
          }}
        >
          {/* Card header: Chip and Brand Logo */}
          <div className="flex justify-between items-center">
            {/* Simulated Gold Chip */}
            <div className="w-11 h-8 rounded bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 p-[2px] shadow-md relative overflow-hidden">
              <div className="w-full h-full border border-amber-700/20 rounded-sm flex flex-wrap opacity-70">
                <div className="w-1/2 h-1/2 border-r border-b border-amber-700/20"></div>
                <div className="w-1/2 h-1/2 border-b border-amber-700/20"></div>
                <div className="w-1/2 h-1/2 border-r border-amber-700/20"></div>
                <div className="w-1/2 h-1/2"></div>
              </div>
            </div>
            {/* Brand Logo (Visa/Mastercard) */}
            <div className="h-8 flex items-center">
              {cardType === 'visa' && (
                <img
                  src="https://cdn.simpleicons.org/visa/ffffff"
                  alt="Visa"
                  className="h-7 object-contain"
                />
              )}
              {cardType === 'mastercard' && (
                <img
                  src="https://cdn.simpleicons.org/mastercard/ffffff"
                  alt="Mastercard"
                  className="h-7 object-contain"
                />
              )}
              {cardType === 'unknown' && (
                <div className="w-8 h-6 border-2 border-white/40 rounded flex items-center justify-center">
                  <span className="text-[10px] text-white/50 font-bold">CARD</span>
                </div>
              )}
            </div>
          </div>

          {/* Card number */}
          <div className="mt-4">
            <p className="text-lg md:text-xl tracking-widest font-mono font-medium drop-shadow-md">
              {formattedNumber}
            </p>
          </div>

          {/* Card footer: Cardholder Name and Expiration Date */}
          <div className="flex justify-between items-end mt-2">
            <div className="max-w-[70%]">
              <p className="text-white/60 text-[9px] uppercase tracking-wider">Titular</p>
              <p className="text-sm font-semibold tracking-wide truncate uppercase drop-shadow-sm">
                {displayName}
              </p>
            </div>
            <div>
              <p className="text-white/60 text-[9px] uppercase tracking-wider text-right">Vence</p>
              <p className="text-sm font-semibold tracking-wide font-mono drop-shadow-sm">
                {displayExpiry}
              </p>
            </div>
          </div>
        </div>

        {/* Back side */}
        <div
          className="absolute inset-0 rounded-2xl p-6 rotate-y-180 backface-hidden flex flex-col justify-between text-white"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'linear-gradient(135deg, #1f1235, #112d38)',
          }}
        >
          {/* Black magnetic stripe */}
          <div className="h-10 bg-black/80 -mx-6 mt-2" />

          {/* Signature field and CVV */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              {/* Simulated Signature strip */}
              <div className="bg-white/85 h-8 flex-1 rounded px-3 flex items-center justify-start overflow-hidden">
                <span className="text-gray-400 font-mono text-[9px] tracking-wider select-none opacity-60">
                  Yámboly Premium Cardholder Signature
                </span>
              </div>
              {/* CVV display */}
              <div className="bg-yellow-400 text-gray-900 font-mono font-bold px-3 py-1.5 rounded text-sm min-w-[50px] text-center shadow-sm">
                {displayCvv}
              </div>
            </div>
            
            {/* Simulation text */}
            <p className="text-white/40 text-[9px] text-center leading-tight">
              Esta tarjeta es ficticia y se muestra con fines de demostración en la tienda de Yámboly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
