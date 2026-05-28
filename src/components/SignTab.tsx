import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HexBlock } from '@/components/HexBlock';
import { StructsArrayTable } from '@/components/StructsArrayTable';
import { APP_ADDRESSES, APP_NAME, APP_VERSION, TARGET_NETWORKS } from '@/constants';
import { useCrossChainSign, type CrossChainSignResult } from '@/hooks/useCrossChainSign';

type Props = {
  value: string;
  onBack: () => void;
  onSigned: (r: CrossChainSignResult) => void;
};

export function SignTab({ value, onBack, onSigned }: Props) {
  const { sign, result, error, isSigning } = useCrossChainSign();

  const valueBigInt = (() => {
    try {
      return BigInt(value);
    } catch {
      return 0n;
    }
  })();

  const previewTypedData = {
    domain: { name: APP_NAME, version: APP_VERSION },
    primaryType: 'SetValue',
    types: {
      SetValue: [{ name: 'operations', type: 'ChainOperation[]' }],
      ChainOperation: [
        { name: 'domain', type: 'EIP712ChainDomain' },
        { name: 'value', type: 'uint256' },
      ],
      EIP712ChainDomain: [
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
    },
    message: {
      operations: TARGET_NETWORKS.map((n) => ({
        domain: {
          chainId: n.chainId,
          verifyingContract: APP_ADDRESSES[n.chainId],
        },
        value: value || '0',
      })),
    },
  };

  const onSignClick = async () => {
    try {
      const r = await sign({ value: valueBigInt, appAddresses: APP_ADDRESSES });
      toast.success('Signature collected');
      onSigned(r);
    } catch (e) {
      toast.error('Signing failed', {
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>2. Sign once</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="info">
            <AlertTitle>Domain omits chainId</AlertTitle>
            <AlertDescription>
              The top-level EIP-712 <code>domain</code> only carries
              <code className="mx-1 rounded bg-muted px-1 py-0.5">name</code> +
              <code className="mx-1 rounded bg-muted px-1 py-0.5">version</code>.
              Per-chain <code>chainId</code>s move into each <code>ChainOperation</code>.
              That is the load-bearing trick of ERC-7964: one signature, valid on every listed chain.
            </AlertDescription>
          </Alert>

          <Accordion type="single" collapsible defaultValue="preview">
            <AccordionItem value="preview">
              <AccordionTrigger>Typed-data preview (what your wallet will display)</AccordionTrigger>
              <AccordionContent>
                <pre className="overflow-auto rounded-md border bg-muted/30 p-3 text-[11px] leading-snug font-mono">
                  {JSON.stringify(
                    previewTypedData,
                    (_k, v) => (typeof v === 'bigint' ? v.toString() : v),
                    2,
                  )}
                </pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onBack} disabled={isSigning}>
              Back
            </Button>
            <Button onClick={onSignClick} disabled={isSigning || valueBigInt < 0n}>
              {isSigning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Awaiting wallet
                </>
              ) : (
                'Sign typed data'
              )}
            </Button>
            {result ? (
              <Button onClick={() => onSigned(result)} variant="secondary">
                Continue to submit
              </Button>
            ) : null}
          </div>
          {error ? <div className="text-sm text-destructive">{error.message}</div> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result ? (
            <>
              <HexBlock value={result.crossChainSignature} label="crossChainSignature (65 bytes)" />
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                  structsArray (computed locally via viem.hashStruct)
                </div>
                <StructsArrayTable structsArray={result.structsArray} />
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Sign to see the resulting <code>crossChainSignature</code> and the per-chain struct hashes.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
