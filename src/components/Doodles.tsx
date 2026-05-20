import type { SVGProps } from "react";

type DoodleProps = SVGProps<SVGSVGElement>;

export function SquiggleLine(props: DoodleProps) {
  return (
    <svg
      viewBox="0 0 200 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="none"
      {...props}
    >
      <path
        d="M2 3 Q 15 0 30 3 T 60 3 T 90 3 T 120 3 T 150 3 T 180 3 T 198 3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function ArrowRight(props: DoodleProps) {
  return (
    <svg
      viewBox="0 0 24 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2 6 L 22 6 M 17 1.5 L 22 6 L 17 10.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
