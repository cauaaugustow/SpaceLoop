import type { JSX } from "react";

export function Marca(): JSX.Element {
  return (
    <span className="brand">
      <span className="brand-mark" aria-hidden="true"><span /></span>
      space<span>loop</span>
    </span>
  );
}
