import { Send, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface SendTransactionCardProps {
  recipientAddress: string;
  setRecipientAddress: (address: string) => void;
  sendAmount: string;
  setSendAmount: (amount: string) => void;
  isSending: boolean;
  sendTransaction: () => Promise<void>;
}

const SendTransactionCard: React.FC<SendTransactionCardProps> = ({
  recipientAddress,
  setRecipientAddress,
  sendAmount,
  setSendAmount,
  isSending,
  sendTransaction,
}) => {
  return (
    <Card className="bg-black/20 backdrop-blur-lg border-purple-500/20 text-white">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5" />
          Send ETH
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="recipient">Recipient Address</Label>
          <Input
            id="recipient"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>
        <div>
          <Label htmlFor="amount">Amount (ETH)</Label>
          <Input
            id="amount"
            type="number"
            step="0.001"
            value={sendAmount}
            onChange={(e) => setSendAmount(e.target.value)}
            placeholder="0.1"
            className="bg-gray-800/50 border-gray-600 text-white"
          />
        </div>
        <Button
          onClick={sendTransaction}
          disabled={isSending || !recipientAddress || !sendAmount}
          className="w-full bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
        >
          {isSending ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send Transaction
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default SendTransactionCard;