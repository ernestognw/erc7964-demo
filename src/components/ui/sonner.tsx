import { Toaster as SonnerToaster } from 'sonner';

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast:
            'group border bg-popover text-popover-foreground shadow-lg [&_[data-button]]:bg-primary [&_[data-button]]:text-primary-foreground',
        },
      }}
    />
  );
}
