@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400;1,700&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-serif: "Playfair Display", serif;
  
  --color-primary: #8B4513;
  --color-secondary: #D2691E;
  --color-accent: #FFD700;
  --color-warm-bg: #FDF5E6;
}

@layer base {
  body {
    @apply bg-warm-bg text-[#4A3728] font-sans;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-serif;
  }
}

.prose-brown {
  --tw-prose-body: #5D4037;
  --tw-prose-headings: #8B4513;
  --tw-prose-links: #D2691E;
  --tw-prose-bold: #4A3728;
  --tw-prose-counters: #8B4513;
  --tw-prose-bullets: #D2691E;
  --tw-prose-hr: #D2B48C;
  --tw-prose-quotes: #8B4513;
  --tw-prose-quote-borders: #D2B48C;
  --tw-prose-captions: #8B4513;
  --tw-prose-code: #8B4513;
  --tw-prose-pre-code: #FFF8DC;
  --tw-prose-pre-bg: #4A3728;
  --tw-prose-th-borders: #D2B48C;
  --tw-prose-td-borders: #D2B48C;
}
