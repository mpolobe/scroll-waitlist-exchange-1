import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Coins, Clock, TrendingUp, Loader2, AlertCircle } from 'lucide-react';
import { LOCK_PERIODS } from '@/services/stakingService';

interface StakeModalProps {
  open: boolean;
  onClose: () => void;
  onStake: (amount: string, lockPeriod: number) => Promise<void>;
  availableBalance: string;
  lockPeriods: typeof LOCK_PERIODS;
  lockPeriodLabels: Record<number, string>;
  apyRates: Record<number, number>;
  isLoading: boolean;
}

export function StakeModal({
  open,
  onClose,
  onStake,
  availableBalance,
  lockPeriods,
  lockPeriodLabels,
  apyRates,
  isLoading,
}: StakeModalProps) {
  const [amount, setAmount] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<number>(lockPeriods.THREE_MONTHS);
  const [error, setError] = useState('');

  const handleStake = async () => {
    setError('');
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    if (numAmount > parseFloat(availableBalance)) {
      setError('Insufficient balance');
      return;
    }

    try {
      await onStake(amount, selectedPeriod);
      setAmount('');
      setSelectedPeriod(lockPeriods.THREE_MONTHS);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Staking failed');
    }
  };

  const setMaxAmount = () => {
    setAmount(availableBalance);
  };

  const estimatedRewards = () => {
    const numAmount = parseFloat(amount) || 0;
    const apy = apyRates[selectedPeriod] / 100;
    const periodInYears = selectedPeriod / (365 * 24 * 60 * 60);
    return (numAmount * apy * periodInYears).toFixed(2);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Coins className="w-5 h-5 text-orange-500" />
            Stake wAFC
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Lock your tokens to earn rewards and support railway development
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Amount Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="amount" className="text-gray-300">Amount</Label>
              <span className="text-sm text-gray-500">
                Available: {parseFloat(availableBalance).toLocaleString()} wAFC
              </span>
            </div>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-slate-800 border-slate-600 text-white pr-16"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={setMaxAmount}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-orange-400 hover:text-orange-300 h-7 px-2"
              >
                MAX
              </Button>
            </div>
          </div>

          {/* Lock Period Selection */}
          <div className="space-y-3">
            <Label className="text-gray-300">Lock Period</Label>
            <RadioGroup
              value={selectedPeriod.toString()}
              onValueChange={(v) => setSelectedPeriod(parseInt(v))}
              className="space-y-2"
            >
              {Object.entries(lockPeriods).map(([key, period]) => (
                <label
                  key={key}
                  className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPeriod === period
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={period.toString()} className="border-orange-500" />
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">{lockPeriodLabels[period]}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="font-semibold">{apyRates[period]}% APY</span>
                  </div>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Estimated Rewards */}
          {parseFloat(amount) > 0 && (
            <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Estimated Rewards</span>
                <span className="text-green-400 font-medium">
                  +{estimatedRewards()} wAFC
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-400">Total at Unlock</span>
                <span className="text-white font-medium">
                  {(parseFloat(amount) + parseFloat(estimatedRewards())).toLocaleString()} wAFC
                </span>
              </div>
            </div>
          )}

          {/* Early Unstake Warning */}
          <div className="flex items-start gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-yellow-200">
              Early unstaking incurs a 10% penalty. Rewards are forfeited if you unstake before the lock period ends.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 border-slate-600 text-gray-300 hover:bg-slate-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleStake}
              disabled={isLoading || !amount || parseFloat(amount) <= 0}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Staking...
                </>
              ) : (
                <>
                  <Coins className="w-4 h-4 mr-2" />
                  Stake
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
