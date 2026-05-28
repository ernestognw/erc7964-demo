import { ArrowLeftRight } from 'lucide-react';

import { ChainCard } from '@/components/ChainCard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TARGET_NETWORKS } from '@/constants';
import { useChainSubmit } from '@/hooks/useChainSubmit';
import type { CrossChainSignResult } from '@/hooks/useCrossChainSign';

type Props = {
  signResult: CrossChainSignResult;
  onBack: () => void;
};

export function SubmitTab({ signResult, onBack }: Props) {
  const { submit, statusByChain, markConfirmed } = useChainSubmit();

  const globallyBusy = Object.values(statusByChain).some(
    (s) => s.kind === 'switching' || s.kind === 'pending',
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <CardTitle>3. Submit on each chain</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                One signature, three on-chain submissions. Each chain reuses the same{' '}
                <code className="font-mono">crossChainSignature</code> and{' '}
                <code className="font-mono">structsArray</code>; only the
                32-byte header differs.
              </p>
            </div>
            <Button variant="ghost" onClick={onBack}>
              Back to sign
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Alert variant="info">
            <ArrowLeftRight className="h-4 w-4" />
            <AlertTitle>Diff legend</AlertTitle>
            <AlertDescription>
              <div className="mt-1 grid gap-1 sm:grid-cols-2">
                <div>
                  <span className="font-semibold">Identical across chains:</span>{' '}
                  magic, fields, structsArray, crossChainSignature.
                </div>
                <div>
                  <span className="font-semibold">Differs per chain:</span>{' '}
                  structIndex (0/1/2), application address, and therefore the full erc7964Signature blob.
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
        {TARGET_NETWORKS.map((network, i) => (
          <ChainCard
            key={network.chainId}
            network={network}
            structIndex={i}
            structsArray={signResult.structsArray}
            crossChainSignature={signResult.crossChainSignature}
            signer={signResult.signer}
            value={signResult.value}
            status={statusByChain[network.chainId] ?? { kind: 'idle' }}
            submit={submit}
            markConfirmed={markConfirmed}
            globallyBusy={globallyBusy}
          />
        ))}
      </div>
    </div>
  );
}
