import type { Hex } from 'viem';

import { TARGET_NETWORKS } from '@/constants';
import { cn, truncateHex } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type Props = {
  structsArray: Hex[];
  highlightIndex?: number;
};

export function StructsArrayTable({ structsArray, highlightIndex }: Props) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">#</TableHead>
          <TableHead>Chain</TableHead>
          <TableHead>structsArray[i]</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {structsArray.map((hash, i) => {
          const network = TARGET_NETWORKS[i];
          const active = i === highlightIndex;
          return (
            <TableRow
              key={i}
              className={cn(
                active && 'bg-rose-500/10 border-l-4 border-l-rose-500',
              )}
            >
              <TableCell className="font-mono">{i}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span className="font-medium">{network?.name}</span>
                  <span className="text-xs text-muted-foreground">
                    chainId: {network?.chainId}
                  </span>
                </div>
              </TableCell>
              <TableCell className="font-mono text-xs">
                <span title={hash}>{truncateHex(hash, 14, 10)}</span>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
