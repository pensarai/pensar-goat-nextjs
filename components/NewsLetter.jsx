'use client';

import React, { useRef, useEffect } from 'react';

export function RichTextDisplay({ content }) {
  return (
    <div 
      style={{ padding: '20px', border: '2px solid red', margin: '10px' }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

export function NewsletterPreview({ htmlContent }) {
  const previewRef = useRef(null);

  useEffect(() => {
    if (previewRef.current && htmlContent) {
      previewRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent]);

  return (
    <div 
      ref={previewRef}
      style={{ padding: '20px', border: '2px solid red', margin: '10px' }}
    />
  );
}

export function LegacyContentRenderer({ scriptContent }) {
  useEffect(() => {
    if (scriptContent) {
      document.write(scriptContent);
    }
  }, [scriptContent]);

  return <div>Legacy content will appear above this component</div>;
}