import { useGetWalletAddresses, useUpdateWallet, Wallet } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { getGetWalletAddressesQueryKey } from "@workspace/api-client-react";
import { useState, useEffect } from "react";

export default function AdminWallets() {
  const { data: walletData, isLoading } = useGetWalletAddresses();
  const updateWallet = useUpdateWallet();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [addresses, setAddresses] = useState<Record<string, { id: number, address: string }>>({});

  useEffect(() => {
    if (walletData?.wallets) {
      const newAddresses: Record<string, { id: number, address: string }> = {};
      walletData.wallets.forEach(w => {
        newAddresses[w.chain] = { id: w.id, address: w.address };
      });
      setAddresses(newAddresses);
    }
  }, [walletData]);

  const handleSave = (chain: string) => {
    const data = addresses[chain];
    if (!data) return;

    updateWallet.mutate({ 
      id: data.id, 
      data: { address: data.address, chain } 
    }, {
      onSuccess: () => {
        toast({ title: "Wallet updated", description: `${chain} receiving address updated successfully.` });
        queryClient.invalidateQueries({ queryKey: getGetWalletAddressesQueryKey() });
      }
    });
  };

  const handleChange = (chain: string, value: string) => {
    setAddresses(prev => ({
      ...prev,
      [chain]: { ...prev[chain], address: value }
    }));
  };

  const chains = [
    { id: 'USDT_TRC20', label: 'TRON (TRC20)' },
    { id: 'USDT_BEP20', label: 'BNB Smart Chain (BEP20)' },
    { id: 'USDT_TON', label: 'TON Network' }
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Wallet Settings</h1>
        <p className="text-muted-foreground mt-1">Configure receiving addresses for user payments.</p>
      </div>

      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>USDT Receiving Addresses</CardTitle>
          <CardDescription>All payments will be directed to these addresses. Ensure they are correct.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {isLoading ? (
            <div className="space-y-4">
              <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              <div className="h-10 bg-muted animate-pulse rounded-md"></div>
              <div className="h-10 bg-muted animate-pulse rounded-md"></div>
            </div>
          ) : (
            chains.map(chain => (
              <div key={chain.id} className="space-y-2">
                <Label>{chain.label}</Label>
                <div className="flex gap-4">
                  <Input 
                    className="flex-1 bg-background" 
                    value={addresses[chain.id]?.address || ''} 
                    onChange={(e) => handleChange(chain.id, e.target.value)}
                    placeholder={`Enter ${chain.label} address`}
                  />
                  <Button 
                    onClick={() => handleSave(chain.id)}
                    disabled={updateWallet.isPending || !addresses[chain.id]?.address || addresses[chain.id]?.address === walletData?.wallets.find(w => w.chain === chain.id)?.address}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
