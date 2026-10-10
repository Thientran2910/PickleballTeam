import { afterEach, beforeEach } from 'vitest';

/**
 * jsdom has no modal <dialog>. This emulates the browser behaviour that matters for focus:
 * `showModal()` remembers the focused element and `close()` hands focus back to it, but only
 * while the dialog is still attached to the document.
 */
export function useBrowserLikeDialog() {
  const proto = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
  const original = { showModal: proto.showModal, close: proto.close };
  const previous = new WeakMap<HTMLDialogElement, Element | null>();

  beforeEach(() => {
    proto.showModal = function showModal(this: HTMLDialogElement) {
      previous.set(this, document.activeElement);
      this.setAttribute('open', '');
      this.querySelector<HTMLElement>('button')?.focus();
    };
    proto.close = function close(this: HTMLDialogElement) {
      if (!this.hasAttribute('open')) return;
      this.removeAttribute('open');
      const target = previous.get(this);
      if (this.isConnected && target instanceof HTMLElement && target.isConnected) target.focus();
    };
  });

  afterEach(() => {
    proto.showModal = original.showModal;
    proto.close = original.close;
  });
}
