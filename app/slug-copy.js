'use client';

import { useEffect, useState } from 'react';

export default function SlugCopyEnhancer() {
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const enhance = root => {
      root.querySelectorAll?.('.detail-grid dl > div').forEach(row => {
        const label = row.querySelector('dt')?.textContent?.trim().toLowerCase();
        if (label !== 'venice slug' && label !== 'morpheus slug') return;

        const value = row.querySelector('dd');
        if (!value || value.dataset.slugEnhanced === 'true') return;

        const raw = value.textContent?.trim();
        if (!raw || raw === '—') return;

        const ids = raw.split(',').map(id => id.trim()).filter(Boolean);
        value.dataset.slugEnhanced = 'true';
        value.classList.add('slug-list');
        value.textContent = '';

        ids.forEach(id => {
          const button = document.createElement('button');
          button.type = 'button';
          button.className = 'copyable-slug';
          button.dataset.slug = id;
          button.textContent = id;
          button.setAttribute('aria-label', `Copy ${label}: ${id}`);
          button.setAttribute('title', 'Copy API model slug');
          value.appendChild(button);
        });
      });
    };

    enhance(document);
    const observer = new MutationObserver(records => {
      records.forEach(record => record.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE) enhance(node);
      }));
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const copy = async button => {
      const text = button.dataset.slug?.trim();
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
        setCopied(text);
        window.setTimeout(() => setCopied(current => current === text ? '' : current), 1400);
      } catch {
        const range = document.createRange();
        range.selectNodeContents(button);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
      }
    };

    const onClick = event => {
      const button = event.target.closest?.('button.copyable-slug');
      if (button) copy(button);
    };

    document.addEventListener('click', onClick);
    return () => {
      observer.disconnect();
      document.removeEventListener('click', onClick);
    };
  }, []);

  return copied ? <div className="slug-copy-toast" role="status">Copied <code>{copied}</code></div> : null;
}
