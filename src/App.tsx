import { useState } from 'react';

import { ConfigureTab } from '@/components/ConfigureTab';
import { SignTab } from '@/components/SignTab';
import { SubmitTab } from '@/components/SubmitTab';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { CrossChainSignResult } from '@/hooks/useCrossChainSign';

export function App() {
  const [tab, setTab] = useState<'configure' | 'sign' | 'submit'>('configure');
  const [value, setValue] = useState('42');
  const [signResult, setSignResult] = useState<CrossChainSignResult | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="container flex items-center justify-between py-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              ERC-7964 Cross-Chain Signature Demo
            </h1>
            <p className="text-xs text-muted-foreground">
              One signature, three chains. Wallet + network catalog via{' '}
              <code>@openzeppelin/adapter-evm</code>.
            </p>
          </div>
          <a
            href="https://eips.ethereum.org/EIPS/eip-7964"
            target="_blank"
            rel="noreferrer"
            className="text-sm text-muted-foreground hover:underline"
          >
            Read the ERC →
          </a>
        </div>
      </header>

      <main className="container py-8">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList>
            <TabsTrigger value="configure">Configure</TabsTrigger>
            <TabsTrigger value="sign">Sign</TabsTrigger>
            <TabsTrigger value="submit" disabled={!signResult}>
              Submit
            </TabsTrigger>
          </TabsList>

          <TabsContent value="configure">
            <ConfigureTab
              value={value}
              onValueChange={setValue}
              onNext={() => setTab('sign')}
            />
          </TabsContent>

          <TabsContent value="sign">
            <SignTab
              value={value}
              onBack={() => setTab('configure')}
              onSigned={(r) => {
                setSignResult(r);
                setTab('submit');
              }}
            />
          </TabsContent>

          <TabsContent value="submit">
            {signResult ? (
              <SubmitTab signResult={signResult} onBack={() => setTab('sign')} />
            ) : null}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
