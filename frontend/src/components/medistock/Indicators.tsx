import { Badge } from '@/src/components/ui/Base';

export const StockIndicator = ({ stock, minStock }: { stock: number; minStock: number }) => {
  if (stock === 0) return <Badge variant="danger">Sin Stock</Badge>;
  if (stock <= minStock) return <Badge variant="warning">Stock Crítico ({stock})</Badge>;
  return <Badge variant="success">Disponible ({stock})</Badge>;
};

export const UrgencyBadge = ({ level }: { level: 'low' | 'medium' | 'high' | 'critical' }) => {
  const levels = {
    low: { variant: 'info', label: 'Baja', extra: '' },
    medium: { variant: 'warning', label: 'Media', extra: '' },
    high: { variant: 'danger', label: 'Alta', extra: '' },
    critical: { variant: 'danger', label: 'CRÍTICA', extra: 'animate-pulse font-bold' },
  } as const;

  const config = levels[level];
  return (
    <div className={config.extra}>
      <Badge variant={config.variant as any}>{config.label}</Badge>
    </div>
  );
};
