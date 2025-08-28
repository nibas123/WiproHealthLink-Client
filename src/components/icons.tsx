import type { SVGProps } from "react";

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 22v-5l-3-1-1 4-4-2 1-4-3-1v-5l3-1-1-4 4 2 1-4 3 1v5l3 1 1-4 4 2-1 4 3 1v5l-3 1 1 4-4-2-1 4z" />
      <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    </svg>
  );
}
