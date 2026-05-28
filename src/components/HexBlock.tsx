import { Copy } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Props = {
  value: string;
  label?: string;
  className?: string;
};

export function HexBlock({ value, label, className }: Props) {
  const onCopy = () => {
    void navigator.clipboard.writeText(value);
    toast.success(`Copied ${label ?? 'hex'} to clipboard`);
  };
  return (
    <div className={cn('relative rounded-md border bg-muted/30 p-3 font-mono text-xs', className)}>
      {label ? (
        <div className="mb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </div>
      ) : null}
      <div className="break-all pr-9">{value}</div>
      <Button
        size="icon"
        variant="ghost"
        className="absolute right-1 top-1 h-7 w-7"
        onClick={onCopy}
        title="Copy"
      >
        <Copy className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
