import React from 'react';

interface FlavorBannerProps {
  text: string;
  variant?: 'default' | 'success' | 'danger' | 'shop';
}

export const FlavorBanner: React.FC<FlavorBannerProps> = ({ text, variant = 'default' }) => {
  if (!text) return null;

  const variantStyles = {
    default: 'bg-gray-900/90 border-gray-700 text-gray-300',
    success: 'bg-green-900/90 border-green-700 text-green-300',
    danger: 'bg-red-900/90 border-red-700 text-red-300',
    shop: 'bg-yellow-900/90 border-yellow-700 text-yellow-300',
  };

  return (
    <div
      className={`border-2 rounded-lg p-3 text-center font-mono text-sm md:text-base italic ${variantStyles[variant]}`}
    >
      {text}
    </div>
  );
};
