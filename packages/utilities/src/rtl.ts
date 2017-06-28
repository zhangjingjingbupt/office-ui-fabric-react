import { KeyCodes } from './KeyCodes';
import { getDocument } from './dom';

// Default to undefined so that we initialize on first read.
let _isRTL: boolean;

/**
 * Gets the rtl state of the page (returns true if in rtl.)
 */
export function getRTL(): boolean {
  if (_isRTL === undefined) {
    setRTL(_isRTL);
  }

  return _isRTL;
}

/**
 * Sets the rtl state of the page (by adjusting the dir attribute of the html element.)
 */
export function setRTL(isRTL: boolean) {
  let doc = getDocument();

  if (doc) {
    doc.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
  }

  _isRTL = isRTL;
}

/**
 * Returns the given key, but flips right/left arrows if necessary.
 */
export function getRTLSafeKeyCode(key: number): number {
  if (getRTL()) {
    if (key === KeyCodes.left) {
      key = KeyCodes.right;
    } else if (key === KeyCodes.right) {
      key = KeyCodes.left;
    }
  }

  return key;
}
