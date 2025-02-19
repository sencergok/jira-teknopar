import { ToasterProps } from 'sonner';

export interface ChartContextProps {
  width: number;
  height: number;
}

export interface TooltipProps {
  active?: boolean;
  payload?: unknown[];
  label?: string;
}

export type ToastProps = ToasterProps & {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
}

export interface ChartDataItem {
  name: string;
  value: number;
  color?: string;
}

export interface ChartConfig {
  width?: number;
  height?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
} 