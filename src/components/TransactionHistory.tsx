import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  hash: string;
  to: string;
  value: string;
  timeStamp: string;
}

interface TransactionHistoryProps {
  account: string;
  currentNetwork: string;
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ account, currentNetwork }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Map chainId to Etherscan API endpoints
  const explorerApis: { [key: string]: string } = {
    '1': 'https://api.etherscan.io',
    '11155111': 'https://api-sepolia.etherscan.io',
    '59141': 'https://api.lineascan.build', // Linea Sepolia
  };

  // Map chainId to explorer URLs
  const explorerUrls: { [key: string]: string } = {
    '1': 'https://etherscan.io',
    '11155111': 'https://sepolia.etherscan.io',
    '59141': 'https://linea-sepolia.etherscan.io',
  };

  const fetchTransactionHistory = async () => {
    if (!account || !currentNetwork) return;
    
    setIsLoading(true);
    try {
      const apiUrl = explorerApis[currentNetwork];
      if (!apiUrl) {
        throw new Error('Unsupported network');
      }

      // Using Etherscan/Lineascan API to fetch transactions
      const response = await fetch(
        `${apiUrl}/api?module=account&action=txlist&address=${account}&sort=desc&apikey=INMCIP45SGTPUMXREPQC1FGN61DZMD1GFK`
      );
      const data = await response.json();
      
      if (data.status === '1') {
        const formattedTxs = data.result.slice(0, 5).map((tx: any) => ({
          hash: tx.hash,
          to: tx.to,
          value: ethers.formatEther(tx.value),
          timeStamp: new Date(parseInt(tx.timeStamp) * 1000).toLocaleString(),
        }));
        setTransactions(formattedTxs);
      } else {
        throw new Error(data.message || 'Failed to fetch transactions');
      }
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch transaction history',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactionHistory();
  }, [account, currentNetwork]);

  return (
    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Transaction History
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchTransactionHistory}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-300"
          >
            Refresh
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-gray-400">Loading transactions...</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400">No transactions found</p>
        ) : (
          <div className="space-y-4">
            {transactions.map((tx) => (
              <div key={tx.hash} className="flex justify-between items-center border-b border-gray-700 pb-2">
                <div>
                  <p className="font-mono text-sm">
                    To: {tx.to.slice(0, 6)}...{tx.to.slice(-4)}
                  </p>
                  <p className="text-gray-400 text-sm">{tx.timeStamp}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-400">{parseFloat(tx.value).toFixed(4)} ETH</p>
                  <a
                    href={`${explorerUrls[currentNetwork]}/tx/${tx.hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
                  >
                    View <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionHistory;