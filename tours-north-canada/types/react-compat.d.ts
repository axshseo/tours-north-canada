// Compatibility shims for this repo's current TS setup.
// Note: Next/React types should normally come from @types/react + next.
// If they're missing, these declarations prevent editor/type errors.

declare module 'next/link' {
  import * as React from 'react';
  export type LinkProps = {
    href: string;
    className?: string;
    children?: React.ReactNode;
  };
  export default function Link(props: LinkProps): React.ReactElement | null;
}



declare module 'lucide-react' {
  const anyIcon: any;
  export const ChevronRight: any;
  export const Home: any;
  export const Search: any;
  export const Crosshair: anyIcon;
  export const MapPin: anyIcon;
  export const Calendar: anyIcon;
  export const Activity: anyIcon;
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}

