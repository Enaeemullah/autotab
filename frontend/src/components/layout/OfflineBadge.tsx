import { SignalSlashIcon } from '@heroicons/react/24/outline';

export function OfflineBadge() {
  return (
    <div className="flex items-center gap-2 bg-amber-600/20 px-6 py-2 text-sm text-amber-200">
      <SignalSlashIcon className="h-5 w-5" />
      Working offline. Changes will sync automatically once connection is restored.
    </div>
  );
}
