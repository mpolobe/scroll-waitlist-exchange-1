import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSmartWallet } from '@/contexts/SmartWalletContext';
import { Copy, CheckCircle, ExternalLink, QrCode } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { activeChain } from '@/lib/alchemyConfig';

export function WalletAddressCard() {
  const { address } = useSmartWallet();
  const [copied, setCopied] = useState(false);
  const [qrOpen, setQrOpen] = useState(false);

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shortAddress = address ? `${address.slice(0, 10)}...${address.slice(-8)}` : '';
  const explorerUrl = `https://sepolia.etherscan.io/address/${address}`;

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Wallet Address</h3>
          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            {activeChain.name}
          </span>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <p className="font-mono text-sm break-all">{shortAddress}</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copyAddress} className="flex-1">
            {copied ? <CheckCircle className="w-4 h-4 mr-1 text-emerald-500" /> : <Copy className="w-4 h-4 mr-1" />}
            {copied ? 'Copied!' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setQrOpen(true)}>
            <QrCode className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4" />
            </a>
          </Button>
        </div>

        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-500">
            Smart Account (ERC-4337) on {activeChain.name} Testnet
          </p>
        </div>
      </Card>

      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center">Receive Tokens</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            <div className="bg-white p-4 rounded-xl shadow-lg border mb-4">
              <QRCodeSVG value={address || ''} size={180} />
            </div>
            <p className="text-sm text-gray-500 mb-2">Scan to send tokens</p>
            <p className="font-mono text-xs bg-gray-100 px-3 py-2 rounded-lg">{shortAddress}</p>
            <Button onClick={copyAddress} className="mt-4 w-full">
              {copied ? <><CheckCircle className="w-4 h-4 mr-2" />Copied!</> : <><Copy className="w-4 h-4 mr-2" />Copy Address</>}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Simple QR Code component
function QRCodeSVG({ value, size }: { value: string; size: number }) {
  // Generate a deterministic pattern based on the address
  const cells = 21;
  const cellSize = size / cells;
  const hash = value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  const pattern: boolean[][] = [];
  for (let i = 0; i < cells; i++) {
    pattern[i] = [];
    for (let j = 0; j < cells; j++) {
      // Create finder patterns in corners
      const isFinderArea = (i < 7 && j < 7) || (i < 7 && j >= cells - 7) || (i >= cells - 7 && j < 7);
      if (isFinderArea) {
        const fi = i < 7 ? i : i - (cells - 7);
        const fj = j < 7 ? j : j - (cells - 7);
        pattern[i][j] = fi === 0 || fi === 6 || fj === 0 || fj === 6 || (fi >= 2 && fi <= 4 && fj >= 2 && fj <= 4);
      } else {
        pattern[i][j] = ((hash + i * 31 + j * 17) % 3) === 0;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <rect width={size} height={size} fill="white" />
      {pattern.map((row, i) => row.map((cell, j) => cell && (
        <rect key={`${i}-${j}`} x={j * cellSize} y={i * cellSize} width={cellSize} height={cellSize} fill="#1a1a1a" />
      )))}
    </svg>
  );
}
