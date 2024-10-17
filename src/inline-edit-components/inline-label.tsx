import { AsteriskIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const InlineLabel = ({
  required,
  children,
  pad = true,
}: {
  required?: boolean;
  children: React.ReactNode;
  pad?: boolean;
}) => {
  return (
    <div
      className={cn(
        'flex items-center gap-1 text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground',
        pad ? 'px-3' : ''
      )}
    >
      {children}
      {required && (
        <span className="text-red-600">
          <AsteriskIcon className="w-4 h-4" />
        </span>
      )}
    </div>
  );
};
