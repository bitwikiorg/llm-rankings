'use client';

import { useEffect, useState } from 'react';

function isSlugField(element) {
  const row = element?.closest?.('dl > div');
  if (!row) return false;
  const label = row.querySelector('dt')?.textContent?.trim().toLowerCase();
  return label === 'venice slug' || label === 'morpheus slug';
}

export default function SlugCopyEnhancer() {
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const enhance = root => {
      root.querySelectorAll?.('.detail-grid dl > div').forEach(row => {
        const label = row.querySelector('dt')?.textContent?.trim().toLowerCase();
        if (label !== 'venice slug' && label !== 'morpheus slug') return;
        const value = row.querySelector('dd');
        if (!value || value.textContent?.trim() === '—') return;
        value.classList.add('copyable-slug');
        value.tabIndex = 0;
        value.setAttribute('role', 'button');
        value.setAttribute('aria-label', `Copy ${label}`);
        value.setAttribute('title', 'Click to copy API model slug');
      });
    };

    enhance(document);
    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) enhance(node);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const copy = async target => {
      if (!isSlugField(target)) return;
      const value = target.closest('dd');
      const text = value?.textContent?.trim();
      if (!text || text === '—') return;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(text);
        window.setTimeout(() => setCopied(current => current === text ? '' : current), 1400);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(value);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    };

    const onClick = event => {
      const value = event.target.closest?.('dd.copyable-slug');
      if (value) copy(value);
    };
    const onKeyDown = event => {
      const value = event.target.closest?.('dd.copyable-slug');
      if (value && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        copy(value);
      }
    };

    document.addEventListener('click', onClick);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      observer.disconnect();
      document.removeEventListener('click', onClick);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return copied ? <div className="slug-copy-toast" role="status">Copied <code>{copied}</code></div> : null;
}
