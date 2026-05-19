import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useState } from 'react';

interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
}

const iconMap = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const classMap = {
  success: 'alert-success',
  error: 'alert-error',
  warning: 'alert-warning',
  info: 'alert-info',
};

export default function Alert({
  type,
  title,
  message,
  dismissible = true,
  onDismiss,
}: AlertProps) {
  const [show, setShow] = useState(true);
  const Icon = iconMap[type];

  if (!show) return null;

  const handleDismiss = () => {
    setShow(false);
    onDismiss?.();
  };

  return (
    <div className={`alert ${classMap[type]} animate-slideUp`}>
      <Icon size={20} className="flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-semibold">{title}</p>
        {message && <p className="text-sm mt-1 opacity-90">{message}</p>}
      </div>
      {dismissible && (
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 hover:opacity-75 transition-opacity"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
