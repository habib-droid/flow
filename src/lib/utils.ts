import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Robustly copies text to the clipboard with a fallback for restricted environments.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  // 1. Try modern Clipboard API
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API failed, trying fallback:', err);
  }

  // 2. Fallback for non-secure contexts or when API is blocked by policy
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure the textarea is not visible but part of the DOM
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    textArea.style.opacity = "0";
    textArea.setAttribute('readonly', ''); // Prevent keyboard on mobile
    
    document.body.appendChild(textArea);
    
    // Select the text
    textArea.focus();
    textArea.select();
    textArea.setSelectionRange(0, 99999); // For mobile devices
    
    // Execute copy command
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error('Fallback copy failed:', err);
    return false;
  }
}
