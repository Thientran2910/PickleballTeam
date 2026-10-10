import { useEffect, useRef } from 'react';

/**
 * Opens a <dialog> as a modal on mount and hands focus back to the opener on unmount.
 * `opener` is passed explicitly because Safari does not focus a clicked button, so
 * activeElement alone is unreliable.
 */
export function useModalDialog(opener?: HTMLElement | null) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return undefined;
    // React detaches the <dialog> before this cleanup runs, so the browser cannot restore focus itself.
    const returnTo = opener ?? document.activeElement;
    if (typeof dialog.showModal === 'function') {
      if (!dialog.open) dialog.showModal();
    } else {
      dialog.setAttribute('open', '');
    }
    return () => {
      if (typeof dialog.close === 'function' && dialog.open) dialog.close();
      if (returnTo instanceof HTMLElement && returnTo.isConnected) returnTo.focus();
    };
  }, [opener]);

  return ref;
}
