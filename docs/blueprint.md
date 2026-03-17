# **App Name**: PaletteFlow

## Core Features:

- Dynamic Palette Generation: Generate diverse color palettes using the spacebar, displaying 5 customizable color columns by default, each with Hex, RGB, and HSL values. Users can lock colors to preserve them during generation, and display up to 10 colors in a palette.
- Intuitive Color Refinement: Precisely edit individual colors via an editor panel featuring hex input, RGB/HSL sliders, and a hue adjuster. Preview related shades and tints, and see live WCAG contrast results with black and white text.
- Versatile Palette Output: Effortlessly copy individual color codes or the full palette as a hex list. Export palettes in various developer-friendly formats (CSS, SCSS, JSON, Tailwind, PNG) and share unique palettes via a generated URL.
- Image Color Extractor Tool: Upload an image and use our AI-powered tool to automatically extract its dominant colors, generating a new palette that can be imported directly into the generator.
- AI-Powered Palette Assistant Tool: Generate palettes by simply typing natural language prompts, such as 'luxury skincare palette' or 'warm coffee shop palette.' The AI tool suggests palettes with a brief reasoning.
- Community Palette Discovery: Browse and discover public color palettes submitted by other users in a grid layout. Users can interact by liking or saving interesting palettes to their personal collections.
- Personalized Palette Management: Securely sign up and sign in to save your custom palettes, organize them into collections, and keep them synced across devices for easy access. This requires a Supabase or Firebase backend for authentication and data storage.

## Style Guidelines:

- Dark mode default. Background color: A neutral, dark gray with a subtle cool undertone (#19161E), promoting strong color visibility as the primary focus.
- Primary color: A rich, refined blue-violet (#8B68D1), providing a premium feel and good contrast against the dark background. It conveys creativity and digital precision.
- Accent color: A clean, slightly muted blue (#406CBF), used for interactive elements and subtle highlights, offering a harmonious yet contrasting visual balance with the primary color.
- Body and headline font: 'Inter' (sans-serif) for its modern, clean, and highly readable characteristics, suitable for both concise labels and longer text blocks within a minimal interface.
- Utilize sleek, modern line icons from Lucide React to maintain a minimal, premium aesthetic that complements the clean typography and spacious layout.
- Adopt a spacious, full-screen layout for the generator. Elements will utilize 'rounded-xl' or 'rounded-2xl' for soft, contemporary card aesthetics. The design is mobile-responsive, stacking color columns vertically for thumb-friendly interaction on smaller screens.
- Leverage Framer Motion for elegant transitions during palette generation, smooth color editing, and responsive hover effects, enhancing the premium feel without being distracting.