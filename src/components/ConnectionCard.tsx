import { AlertCircle, ExternalLink, RefreshCw, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConnectionCardProps {
  isMetaMaskInstalled: () => boolean;
  isConnecting: boolean;
  connectWallet: () => Promise<void>;
}

const ConnectionCard: React.FC<ConnectionCardProps> = ({ isMetaMaskInstalled, isConnecting, connectWallet }) => {
  return (
    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 text-white">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl mb-4">Connect Your Wallet</CardTitle>
        <p className="text-gray-400">
          Connect your MetaMask wallet to start using the application
        </p>
      </CardHeader>
      <CardContent className="text-center">
        {!isMetaMaskInstalled() ? (
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 text-yellow-500 mx-auto" />
            <p className="text-yellow-400">MetaMask is not installed</p>
            <Button
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={() => window.open('https://metamask.io/', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Install MetaMask
            </Button>
          </div>
        ) : (
          <Button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-3 text-lg"
          >
            {isConnecting ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="h-5 w-5 mr-2" />
                Connect MetaMask
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectionCard;