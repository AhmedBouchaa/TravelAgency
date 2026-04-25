import { User } from '@/lib/types';
import { useState } from 'react';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export function Avatar({ user, size = 'md', className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
    '2xl': 'w-48 h-48 text-3xl',
  };

  const initials = `${user.firstName?.charAt(0).toUpperCase() || ''}${user.lastName?.charAt(0).toUpperCase() || ''}`;

  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500`}>
      {user.imageUrl && !imageError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={user.imageUrl} 
          alt={`${user.firstName} ${user.lastName}`}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="text-white font-bold">
          {initials}
        </span>
      )}
    </div>
  );
}
