import { Wallet } from 'lucide-react';

const Header = () => {
  return (
    <div className="text-center mb-12">
      <div className="flex items-center justify-center mb-4">
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-3 rounded-full">
          <Wallet className="h-8 w-8 text-white" />
        </div>
      </div>
      <h1 className="text-4xl font-bold text-white mb-2">Web3 Wallet</h1>
      <p className="text-gray-400 text-lg">Connect, manage, and transact with Ethereum</p>
    </div>
  );
};

export default Header;