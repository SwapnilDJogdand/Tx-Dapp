
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, Send, RefreshCw, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

  // Connect to MetaMask wallet
  const connectWallet = async () => {
    if (!isMetaMaskInstalled()) {
      toast({
        title: "MetaMask Not Found",
        description: "Please install MetaMask to continue",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      
      setAccount(address);
      await fetchBalance(address);
      
      toast({
        title: "Wallet Connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Fetch wallet balance
  const fetchBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Refresh balance
  const refreshBalance = async () => {
    if (!account) return;
    setIsRefreshing(true);
    await fetchBalance(account);
    setIsRefreshing(false);
    toast({
      title: "Balance Refreshed",
      description: "Your balance has been updated",
    });
  };

  // Send ETH transaction
  const sendTransaction = async () => {
    if (!account || !recipientAddress || !sendAmount) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      
      const tx = await signer.sendTransaction({
        to: recipientAddress,
        value: ethers.parseEther(sendAmount),
      });

      toast({
        title: "Transaction Sent",
        description: `Transaction hash: ${tx.hash.slice(0, 10)}...`,
      });

      // Wait for transaction confirmation
      await tx.wait();
      
      toast({
        title: "Transaction Confirmed",
        description: "Your transaction has been confirmed on the blockchain",
      });

      // Refresh balance and clear form
      await fetchBalance(account);
      setRecipientAddress('');
      setSendAmount('');
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast({
        title: "Transaction Failed",
        description: "Failed to send transaction",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount('');
    setBalance('0');
    setRecipientAddress('');
    setSendAmount('');
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from MetaMask",
    });
  };

  // Check for account changes
  useEffect(() => {
    if (isMetaMaskInstalled()) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          fetchBalance(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    return () => {
      if (isMetaMaskInstalled()) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
              <Wallet className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Web3 Wallet</h1>
          <p className="text-gray-400 text-lg">Connect, manage, and transact with Ethereum</p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {!account ? (
            /* Connection Card */
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
          ) : (
            /* Wallet Dashboard */
            <div className="grid gap-6 md:grid-cols-2">
              {/* Account Info Card */}
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
                </CardContent>
              </Card>

              {/* Send Transaction Card */}
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
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>Built with Ethereum & MetaMask integration</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
