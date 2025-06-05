import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Network {
  name: string;
  chainId: string;
  rpcUrl: string;
  explorer: string;
}

interface AccountInfoCardProps {
  account: string;
  balance: string;
  isRefreshing: boolean;
  refreshBalance: () => Promise<void>;
  disconnectWallet: () => void;
  currentNetwork: string;
  supportedNetworks: { [key: string]: Network };
  switchNetwork: (chainId: string) => Promise<void>;
}

const AccountInfoCard: React.FC<AccountInfoCardProps> = ({
  account,
  balance,
  isRefreshing,
  refreshBalance,
  disconnectWallet,
  currentNetwork,
  supportedNetworks,
  switchNetwork,
}) => {
  return (
    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Account Details</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={disconnectWallet}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            Disconnect
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label className="text-gray-400">Wallet Address</Label>
          <p className="font-mono text-sm bg-gray-800/50 p-2 rounded break-all">
            {account}
          </p>
        </div>
        <div>
          <Label className="text-gray-400 flex items-center gap-2">
            ETH Balance
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshBalance}
              disabled={isRefreshing}
              className="h-6 w-6 p-0"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </Label>
          <p className="text-2xl font-bold text-green-400">
            {parseFloat(balance).toFixed(4)} ETH
          </p>
        </div>
        <div>
          <Label className="text-gray-400">Network</Label>
          <Select value={currentNetwork} onValueChange={switchNetwork}>
            <SelectTrigger className="bg-gray-800/50 border-gray-600 text-white">
              <SelectValue placeholder="Select Network" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(supportedNetworks).map(([chainId, { name }]) => (
                <SelectItem key={chainId} value={chainId}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountInfoCard;