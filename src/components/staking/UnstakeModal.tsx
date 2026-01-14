import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Stake } from '@/services/stakingService';
import { 
  Unlock, 
  AlertTriangle, 
  Clock, 
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface UnstakeModalProps {
  open: boolean;
  onClose: () => void;
  onUnstake: () => Promise<void>;
  stake: Stake | null;
  formatAmount: (amount: bigint) => string;
  isUnlocked: boolean;
  penalty: string;
  timeRemaining: { days: number; hours: number; minutes: number };
  isLoading: boolean;
}

export function UnstakeModal({
  open,
  onClose,
  onUnstake,
  stake,
  formatAmount,
  isUnlocked,
  penalty,
  timeRemaining,
  isLoading,
}: UnstakeModalProps) {
  if (!stake) return null;

  const stakedAmount = formatAmount(stake.amount);
  const penaltyAmount = parseFloat(penalty);
  const receiveAmount = isUnlocked 
    ? parseFloat(stakedAmount) 
    : parseFloat(stakedAmount) - penaltyAmount;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 border-slate-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Unlock className="w-5 h-5 text-orange-500" />
            Unstake wAFC
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {isUnlocked 
              ? 'Your stake is unlocked and ready to withdraw'
              : 'Early unstaking will incur a penalty'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Stake Status */}
          <div className={`p-4 rounded-lg border ${
            isUnlocked 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-yellow-500/10 border-yellow-500/30'
          }`}>
            <div className="flex items-center gap-2 mb-2">
              {isUnlocked ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="font-medium text-green-400">Stake Unlocked</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-yellow-500" />
                  <span className="font-medium text-yellow-400">Still Locked</span>
                </>
              )}
            </div>
            {!isUnlocked && (
              <p className="text-sm text-gray-400">
                Time remaining: {timeRemaining.days}d {timeRemaining.hours}h {timeRemaining.minutes}m
              </p>
            )}
          </div>

          {/* Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
              <span className="text-gray-400">Staked Amount</span>
              <span className="text-white font-medium">
                {parseFloat(stakedAmount).toLocaleString()} wAFC
              </span>
            </div>

            {!isUnlocked && (
              <div className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  <span className="text-red-400">Early Unstake Penalty (10%)</span>
                </div>
                <span className="text-red-400 font-medium">
                  -{penaltyAmount.toLocaleString()} wAFC
                </span>
              </div>
            )}

            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700">
              <span className="text-gray-300 font-medium">You Will Receive</span>
              <span className="text-xl font-bold text-white">
                {receiveAmount.toLocaleString()} wAFC
              </span>
            </div>
          </div>

          {/* Warning for early unstake */}
          {!isUnlocked && (
            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-400 font-medium">Early Unstake Warning</p>
                <p className="text-sm text-red-300/80 mt-1">
                  You will lose {penaltyAmount.toLocaleString()} wAFC ({(penaltyAmount / parseFloat(stakedAmount) * 100).toFixed(0)}% of your stake) 
                  if you unstake now. Consider waiting until the lock period ends.
                </p>
              </div>
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
              onClick={onUnstake}
              disabled={isLoading}
              className={`flex-1 ${
                isUnlocked 
                  ? 'bg-green-600 hover:bg-green-700' 
                  : 'bg-red-600 hover:bg-red-700'
              } text-white`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 mr-2" />
                  {isUnlocked ? 'Unstake' : 'Unstake Anyway'}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
