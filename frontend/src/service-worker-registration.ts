import { Workbox } from 'workbox-window';

export function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      try {
        const wb = new Workbox('/sw.js');
        await wb.register();
      } catch (error) {
        console.error('Service worker registration failed', error);
      }
    });
  }
}
