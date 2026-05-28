import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

type Segment = {
  label: string;
  description: string;
  startByte: number;
  endByte: number;
  className: string;
  shared: boolean;
};

const SEGMENTS: Segment[] = [
  {
    label: 'magic',
    description: '9 bytes: 0x796479647964796479 — identifies the blob as an ERC-7964 envelope.',
    startByte: 0,
    endByte: 8,
    className: 'bg-zinc-500/70',
    shared: true,
  },
  {
    label: 'fields',
    description:
      '1 byte (ERC-5267): which EIP-712 domain fields the application advertises. 0x03 = name + version present.',
    startByte: 9,
    endByte: 9,
    className: 'bg-sky-500/80',
    shared: true,
  },
  {
    label: 'structIndex',
    description:
      '2 bytes (uint16, big-endian): the index of THIS chain\'s operation inside structsArray. Differs per chain.',
    startByte: 10,
    endByte: 11,
    className: 'bg-rose-500 animate-pulse',
    shared: false,
  },
  {
    label: 'application',
    description:
      '20 bytes: address of the ERC-5267 contract on the current chain. Differs per chain when the app is deployed at different addresses.',
    startByte: 12,
    endByte: 31,
    className: 'bg-purple-500/80',
    shared: false,
  },
];

function segmentForByte(byte: number): Segment {
  return SEGMENTS.find((s) => byte >= s.startByte && byte <= s.endByte)!;
}

export function HeaderByteStrip({ header }: { header: string }) {
  // header is a 0x-prefixed 32-byte hex string => 64 hex chars after 0x.
  const raw = header.startsWith('0x') ? header.slice(2) : header;
  const bytes: string[] = [];
  for (let i = 0; i < 32; i++) {
    bytes.push(raw.slice(i * 2, i * 2 + 2).padStart(2, '0').toUpperCase());
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-[2px]">
        {bytes.map((b, i) => {
          const seg = segmentForByte(i);
          return (
            <Tooltip key={i} delayDuration={120}>
              <TooltipTrigger asChild>
                <div
                  className={cn(
                    'h-6 w-6 flex items-center justify-center rounded-[3px] text-[10px] font-mono text-white/90 cursor-default',
                    seg.className,
                  )}
                >
                  {b}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-background">
                <div className="font-semibold">
                  {seg.label}{' '}
                  <span className="text-muted-foreground font-normal">
                    (byte {seg.startByte === seg.endByte ? seg.startByte : `${seg.startByte}–${seg.endByte}`})
                  </span>
                </div>
                <div className="mt-1 text-muted-foreground">{seg.description}</div>
                <div className="mt-1 text-muted-foreground">
                  This byte: <span className="font-mono">0x{b}</span> ({seg.shared ? 'shared' : 'differs per chain'})
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {SEGMENTS.map((s) => (
          <span key={s.label} className="inline-flex items-center gap-1.5">
            <span className={cn('h-2.5 w-2.5 rounded-sm', s.className)} />
            <span className="font-mono">{s.label}</span>
            <span className="text-muted-foreground">
              {s.shared ? '(shared)' : '(differs)'}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
