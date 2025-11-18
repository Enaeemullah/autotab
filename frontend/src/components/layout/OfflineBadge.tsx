import { SignalSlashIcon } from '@heroicons/react/24/outline';

export function OfflineBadge() {
  return (
    <div className="flex items-center gap-3 border-l-4 border-amber-400/70 bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent px-6 py-3 text-sm text-amber-100">
      <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-200">
        <SignalSlashIcon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-sm font-medium">Offline mode</p>
        <p className="text-xs text-amber-200/80">
          Working offline. Changes will sync automatically once connection is restored.
        </p>
      </div>
    </div>
  );
}
