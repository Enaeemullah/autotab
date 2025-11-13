import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../api/client';

interface Setting {
  id: string;
  key: string;
  value: unknown;
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: async () => {
      const { data } = await apiClient.get<Setting[]>('/settings');
      return data;
    }
  });
  const [businessName, setBusinessName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [invoiceFooter, setInvoiceFooter] = useState('Thank you for shopping with us.');

  useEffect(() => {
    if (!settings) return;
    const nameSetting = settings.find((setting) => setting.key === 'business.name');
    const currencySetting = settings.find((setting) => setting.key === 'business.currency');
    const footerSetting = settings.find((setting) => setting.key === 'invoice.footer');
    if (nameSetting?.value) setBusinessName(nameSetting.value as string);
    if (currencySetting?.value) setCurrency(currencySetting.value as string);
    if (footerSetting?.value) setInvoiceFooter(footerSetting.value as string);
  }, [settings]);

  const mutation = useMutation({
    mutationFn: async (payload: { key: string; value: unknown }) => {
      await apiClient.post('/settings', payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    }
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    mutation.mutate({ key: 'business.name', value: businessName });
    mutation.mutate({ key: 'business.currency', value: currency });
    mutation.mutate({ key: 'invoice.footer', value: invoiceFooter });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-100">Settings</h1>
        <p className="text-sm text-slate-400">
          Configure business information, taxes, and synchronization preferences.
        </p>
      </header>
      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-xl border border-slate-800 bg-slate-900/60 p-6 md:grid-cols-2"
      >
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Business Name</label>
          <input
            type="text"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">Currency</label>
          <input
            type="text"
            value={currency}
            onChange={(event) => setCurrency(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium text-slate-300">Invoice Footer</label>
          <textarea
            value={invoiceFooter}
            onChange={(event) => setInvoiceFooter(event.target.value)}
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:border-primary focus:outline-none"
          />
        </div>
        <div className="md:col-span-2 flex items-center justify-end">
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80"
          >
            Save Settings
          </button>
        </div>
      </form>
      <section className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
        <h2 className="text-lg font-semibold text-slate-100">Synchronization</h2>
        <p className="mt-2 text-sm text-slate-400">
          Autotab automatically queues all offline actions and synchronizes them once the central server
          becomes available. You can trigger a manual sync from the Sync Service or monitor logs in the
          admin console.
        </p>
      </section>
    </div>
  );
}
