import { useEffect, useState } from 'react';
import { CheckCircle2, ExternalLink, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { Address, Hex } from 'viem';
import { useAccount, usePublicClient, useWaitForTransactionReceipt } from 'wagmi';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HeaderByteStrip } from '@/components/HeaderByteStrip';
import { HexBlock } from '@/components/HexBlock';
import { StructsArrayTable } from '@/components/StructsArrayTable';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { FIELDS, getAppAddress, isAppDeployed, type TargetNetwork } from '@/constants';
import { useChainSubmit, type SubmitStatus } from '@/hooks/useChainSubmit';
import { buildPerChainSignature, encodeERC7964Header } from '@/lib/eip7964';
import { cn, truncateHex } from '@/lib/utils';

type Props = {
  network: TargetNetwork;
  structIndex: number;
  structsArray: Hex[];
  crossChainSignature: Hex;
  signer: Address;
  value: bigint;
  status: SubmitStatus;
  submit: ReturnType<typeof useChainSubmit>['submit'];
  markConfirmed: ReturnType<typeof useChainSubmit>['markConfirmed'];
  globallyBusy: boolean;
};

export function ChainCard({
  network,
  structIndex,
  structsArray,
  crossChainSignature,
  signer,
  value,
  status,
  submit,
  markConfirmed,
  globallyBusy,
}: Props) {
  const Icon = network.iconComponent;
  const { chainId: connectedChainId } = useAccount();
  const deployed = isAppDeployed(network.chainId);
  const application = deployed ? getAppAddress(network.chainId) : null;

  const header = application
    ? encodeERC7964Header(FIELDS, structIndex, application)
    : '0x'.padEnd(66, '0') as Hex;

  const fullSignature = application
    ? buildPerChainSignature({
        fields: FIELDS,
        structIndex,
        application,
        structsArray,
        crossChainSignature,
      })
    : ('0x' as Hex);

  const [balanceLow, setBalanceLow] = useState(false);
  const publicClient = usePublicClient({ chainId: network.chainId });
  useEffect(() => {
    if (!publicClient || !signer) return;
    let cancelled = false;
    publicClient
      .getBalance({ address: signer })
      .then((b) => !cancelled && setBalanceLow(b < 1_000_000_000_000_000n /* 0.001 ETH */))
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [publicClient, signer]);

  const pendingHash = status.kind === 'pending' ? status.hash : undefined;
  const receipt = useWaitForTransactionReceipt({
    hash: pendingHash,
    chainId: network.chainId,
  });

  useEffect(() => {
    if (status.kind === 'pending' && receipt.data) {
      markConfirmed(network.chainId, status.hash, receipt.data.blockNumber);
    }
  }, [receipt.data, status, markConfirmed, network.chainId]);

  const onSubmit = async () => {
    try {
      await submit({
        chainId: network.chainId,
        structIndex,
        structsArray,
        crossChainSignature,
        signer,
        value,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Submission failed';
      toast.error(`${network.name} submit failed`, { description: msg });
    }
  };

  const explorerTxUrl = (hash: Hex) => `${network.explorerUrl}/tx/${hash}`;
  const isOnThisChain = connectedChainId === network.chainId;

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            {Icon ? <Icon className="h-5 w-5" /> : null}
            <span>{network.name}</span>
          </CardTitle>
          <Badge variant="outline" className="font-mono">
            chainId: {network.chainId}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1">
          <span>
            structIndex: <span className="font-mono text-rose-400">{structIndex}</span>
          </span>
          {application ? (
            <span>
              app: <span className="font-mono">{truncateHex(application)}</span>
            </span>
          ) : (
            <Badge variant="destructive">Not deployed — set VITE_APP_* env var</Badge>
          )}
          {balanceLow ? (
            <Badge variant="destructive">Low balance — get faucet ETH</Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            32-byte header
          </div>
          <HeaderByteStrip header={header} />
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            structsArray (shared; highlighted row = this chain)
          </div>
          <StructsArrayTable structsArray={structsArray} highlightIndex={structIndex} />
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="signature">
            <AccordionTrigger>
              crossChainSignature (identical across chains)
            </AccordionTrigger>
            <AccordionContent>
              <HexBlock value={crossChainSignature} label="crossChainSignature (65 bytes)" />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="encoded">
            <AccordionTrigger>
              Full erc7964Signature passed to setValue (this chain)
            </AccordionTrigger>
            <AccordionContent>
              <HexBlock value={fullSignature} label="erc7964Signature" />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="mt-auto flex flex-col gap-2">
          <Button
            disabled={!deployed || globallyBusy || status.kind === 'confirmed'}
            onClick={onSubmit}
            className={cn(isOnThisChain ? '' : 'opacity-90')}
          >
            {status.kind === 'switching' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Switching to {network.name}
              </>
            ) : status.kind === 'pending' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Waiting for receipt
              </>
            ) : status.kind === 'confirmed' ? (
              <>
                <CheckCircle2 className="h-4 w-4" /> Confirmed in block #{Number(status.blockNumber)}
              </>
            ) : isOnThisChain ? (
              `Submit setValue(${value}) on ${network.name}`
            ) : (
              `Switch to ${network.name} & submit`
            )}
          </Button>

          {status.kind === 'pending' || status.kind === 'confirmed' ? (
            <a
              href={explorerTxUrl(status.hash)}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              <span className="font-mono">{truncateHex(status.hash, 8, 6)}</span> on {network.name}
            </a>
          ) : null}
          {status.kind === 'failed' ? (
            <div className="text-xs text-destructive">{status.error.message}</div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
