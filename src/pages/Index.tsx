import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import ConnectionCard from '@/components/ConnectionCard';
import AccountInfoCard from '@/components/AccountInfoCard';
import SendTransactionCard from '@/components/SendTransactionCard';
import TransactionHistory from '@/components/TransactionHistory';

// Define supported networks with their chain IDs and details
const SUPPORTED_NETWORKS = {
  '1': { name: 'Ethereum Mainnet', chainId: '0x1', rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY', explorer: 'https://etherscan.io' },
  '11155111': { name: 'Sepolia', chainId: '0xaa36a7', rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY', explorer: 'https://sepolia.etherscan.io' },
  '59141': { name: 'Linea Sepolia', chainId: '0xE705', rpcUrl: 'https://linea-sepolia.infura.io/v3/YOUR_INFURA_KEY', explorer: 'https:///linea-sepolia.etherscan.io' },
};

const Index = () => {
  const [account, setAccount] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [currentNetwork, setCurrentNetwork] = useState<string>('1');
  const { toast } = useToast();

  const isMetaMaskInstalled = (): boolean => {
    return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
  };

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

  const fetchBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(address);
      setBalance(ethers.formatEther(balance));
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

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

      await tx.wait();
      
      toast({
        title: "Transaction Confirmed",
        description: "Your transaction has been confirmed on the blockchain",
      });

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

  const disconnectWallet = () => {
    setAccount('');
    setBalance('0');
    setRecipientAddress('');
    setSendAmount('');
    setCurrentNetwork('1');
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from MetaMask",
    });
  };

  async function switchNetwork(chainId: string) {
    if (!isMetaMaskInstalled()) {
      toast({
        title: 'MetaMask Not Found',
        description: 'Please install MetaMask to switch networks',
        variant: 'destructive',
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SUPPORTED_NETWORKS[chainId].chainId }],
      });
      setCurrentNetwork(chainId);
      toast({
        title: 'Network Switched',
        description: `Successfully switched to ${SUPPORTED_NETWORKS[chainId].name}`,
      });
      if (account) {
        await fetchBalance(account);
      }
    } catch (error: any) {
      if (error.code === 4902) {
        await addNetwork(chainId);
      } else {
        console.error('Error switching network:', error);
        toast({
          title: 'Network Switch Failed',
          description: 'Failed to switch network',
          variant: 'destructive',
        });
      }
    }
  }

  async function addNetwork(chainId: string) {
    const network = SUPPORTED_NETWORKS[chainId];
    if (!network) {
      toast({
        title: 'Invalid Network',
        description: 'Selected network is not supported',
        variant: 'destructive',
      });
      return;
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: network.chainId,
            chainName: network.name,
            rpcUrls: [network.rpcUrl],
            blockExplorerUrls: [network.explorer],
            nativeCurrency: {
              name: 'Ether',
              symbol: 'ETH',
              decimals: 18,
            },
          },
        ],
      });
      setCurrentNetwork(chainId);
      toast({
        title: 'Network Added',
        description: `Added and switched to ${network.name}`,
      });
      if (account) {
        await fetchBalance(account);
      }
    } catch (error) {
      console.error('Error adding network:', error);
      toast({
        title: 'Failed to Add Network',
        description: 'Could not add the network to MetaMask',
        variant: 'destructive',
      });
    }
  }

  async function checkCurrentNetwork() {
    if (!isMetaMaskInstalled()) return;
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const network = await provider.getNetwork();
      const chainId = network.chainId.toString();
      if (SUPPORTED_NETWORKS[chainId]) {
        setCurrentNetwork(chainId);
      } else {
        setCurrentNetwork('');
        toast({
          title: 'Unsupported Network',
          description: 'Please switch to a supported network (Mainnet, Sepolia, or Goerli)',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error checking network:', error);
    }
  }

  useEffect(() => {
    if (isMetaMaskInstalled()) {
      checkCurrentNetwork();
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          setAccount(accounts[0]);
          fetchBalance(accounts[0]);
        }
      });

      window.ethereum.on('chainChanged', (chainId: string) => {
        const newChainId = parseInt(chainId, 16).toString();
        if (SUPPORTED_NETWORKS[newChainId]) {
          setCurrentNetwork(newChainId);
          toast({
            title: 'Network Changed',
            description: `Now connected to ${SUPPORTED_NETWORKS[newChainId].name}`,
          });
          if (account) {
            fetchBalance(account);
          }
        } else {
          setCurrentNetwork('');
          toast({
            title: 'Unsupported Network',
            description: 'Please switch to a supported network',
            variant: 'destructive',
          });
        }
      });

      return () => {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      };
    }
  }, [account]);

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
    <div className="container mx-auto px-4 py-8">
      <Header />
      <div className="max-w-4xl mx-auto">
        {!account ? (
          <ConnectionCard 
            isMetaMaskInstalled={isMetaMaskInstalled} 
            isConnecting={isConnecting} 
            connectWallet={connectWallet} 
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <AccountInfoCard 
                account={account}
                balance={balance}
                isRefreshing={isRefreshing}
                refreshBalance={refreshBalance}
                disconnectWallet={disconnectWallet}
                currentNetwork={currentNetwork}
                supportedNetworks={SUPPORTED_NETWORKS}
                switchNetwork={switchNetwork}
              />
              <TransactionHistory 
                account={account}
                currentNetwork={currentNetwork}
              />
            </div>
            <SendTransactionCard 
              recipientAddress={recipientAddress}
              setRecipientAddress={setRecipientAddress}
              sendAmount={sendAmount}
              setSendAmount={setSendAmount}
              isSending={isSending}
              sendTransaction={sendTransaction}
            />
          </div>
        )}
      </div>  
      <div className="text-center mt-12 text-gray-500">
        <p>Built with Ethereum & MetaMask integration</p>
      </div>
    </div>
  </div>
);
};

export default Index;