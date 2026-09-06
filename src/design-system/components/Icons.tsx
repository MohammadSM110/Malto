import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Search,
  Heart,
  Bell,
  Home,
  Compass,
  Plus,
  MessageSquare,
  User,
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  SlidersHorizontal,
  Share2,
  ShieldCheck,
  Store,
  Clock,
  MapPin,
  Tag,
  Filter,
  Eye,
  Camera,
  Trash2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Layers,
  Smartphone,
  Package,
  Sliders,
  RefreshCw,
} from 'lucide-react';

export interface DirectionalIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
}

/**
 * Directional icon that respects RTL/LTR layout context.
 * In RTL, forward is Left. In LTR, forward is Right.
 */
export const ChevronForward: React.FC<DirectionalIconProps> = ({
  size = 18,
  className = '',
  ...props
}) => {
  return (
    <ChevronRight
      size={size}
      className={`rtl:rotate-180 transition-transform ${className}`}
      {...props}
    />
  );
};

export const ChevronBackward: React.FC<DirectionalIconProps> = ({
  size = 18,
  className = '',
  ...props
}) => {
  return (
    <ChevronLeft
      size={size}
      className={`rtl:rotate-180 transition-transform ${className}`}
      {...props}
    />
  );
};

export const ArrowForward: React.FC<DirectionalIconProps> = ({
  size = 18,
  className = '',
  ...props
}) => {
  return (
    <ArrowRight
      size={size}
      className={`rtl:rotate-180 transition-transform ${className}`}
      {...props}
    />
  );
};

export const ArrowBackward: React.FC<DirectionalIconProps> = ({
  size = 18,
  className = '',
  ...props
}) => {
  return (
    <ArrowLeft
      size={size}
      className={`rtl:rotate-180 transition-transform ${className}`}
      {...props}
    />
  );
};

export {
  Search,
  Heart,
  Bell,
  Home,
  Compass,
  Plus,
  MessageSquare,
  User,
  Check,
  AlertCircle,
  AlertTriangle,
  Info,
  X,
  SlidersHorizontal,
  Share2,
  ShieldCheck,
  Store,
  Clock,
  MapPin,
  Tag,
  Filter,
  Eye,
  Camera,
  Trash2,
  ExternalLink,
  ChevronDown,
  Sparkles,
  Layers,
  Smartphone,
  Package,
  Sliders,
  RefreshCw,
};
