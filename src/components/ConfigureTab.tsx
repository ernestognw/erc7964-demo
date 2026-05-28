import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { TARGET_NETWORKS, isAppDeployed } from '@/constants';
import { Button } from '@/components/ui/button';

type Props = {
  value: string;
  onValueChange: (v: string) => void;
  onNext: () => void;
};

export function ConfigureTab({ value, onValueChange, onNext }: Props) {
  const { isConnected } = useAccount();
  const allDeployed = TARGET_NETWORKS.every((n) => isAppDeployed(n.chainId));
  const numeric = /^\d+$/.test(value);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>1. Configure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Wallet</label>
            <div>
              <ConnectButton chainStatus="none" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="value-input">
              Value (uint256)
            </label>
            <Input
              id="value-input"
              inputMode="numeric"
              value={value}
              onChange={(e) => onValueChange(e.target.value)}
              placeholder="42"
            />
            <p className="text-xs text-muted-foreground">
              This is the single message field. CrossChainAppMock will store this on each chain.
            </p>
          </div>
          <Button onClick={onNext} disabled={!isConnected || !numeric || !allDeployed}>
            Continue to sign
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Target chains</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {TARGET_NETWORKS.map((n) => {
            const deployed = isAppDeployed(n.chainId);
            const Icon = n.iconComponent;
            return (
              <div
                key={n.chainId}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-2">
                  {Icon ? <Icon className="h-5 w-5" /> : null}
                  <div>
                    <div className="font-medium">{n.name}</div>
                    <div className="text-xs text-muted-foreground">
                      chainId: <span className="font-mono">{n.chainId}</span>
                    </div>
                  </div>
                </div>
                {deployed ? (
                  <Badge variant="success">Deployed</Badge>
                ) : (
                  <Badge variant="destructive">Address missing</Badge>
                )}
              </div>
            );
          })}
          {!allDeployed ? (
            <Alert variant="destructive">
              <AlertTitle>Mock not deployed on every chain</AlertTitle>
              <AlertDescription>
                Run the Foundry script (see README) and set the resulting addresses in
                <code className="mx-1 rounded bg-muted px-1 py-0.5">.env</code>.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="info">
              <AlertTitle>Chain catalog</AlertTitle>
              <AlertDescription>
                Network metadata (RPC, explorer, icon) comes from
                <code className="mx-1 rounded bg-muted px-1 py-0.5">@openzeppelin/adapter-evm</code>.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
