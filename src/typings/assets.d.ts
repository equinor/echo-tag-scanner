/**
 * Ambient module declarations for static asset and CSS module imports.
 *
 * TypeScript and webpack operate independently: webpack loaders (css-loader,
 * file-loader, etc.) transform these file types at build time, but TypeScript
 * has no knowledge of that. Without these declarations, TypeScript would error
 * on any import of a non-JS/TS file (e.g. "Cannot find module './logo.png'").
 *
 * These declarations were previously provided by @equinor/echo-scripts, a thin
 * wrapper package that only contained this file. Inlining them here removes an
 * unnecessary external dependency.
 */

declare module '*.avif' {
  const src: string;
  export default src;
}

declare module '*.bmp' {
  const src: string;
  export default src;
}

declare module '*.gif' {
  const src: string;
  export default src;
}

declare module '*.jpg' {
  const src: string;
  export default src;
}

declare module '*.jpeg' {
  const src: string;
  export default src;
}

declare module '*.png' {
  const src: string;
  export default src;
}

declare module '*.webp' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  const src: string;
  export default src;
}

declare module '*.module.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.scss' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.module.sass' {
  const classes: { readonly [key: string]: string };
  export default classes;
}

declare module '*.css' {
  const classes: { readonly [key: string]: string };
  export default classes;
}
