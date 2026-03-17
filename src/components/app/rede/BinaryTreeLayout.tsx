import { BinaryTreeNode } from "./BinaryTreeNode";
import { NetworkMember } from "./mock-data";

/**
 * Fixed-coordinate tree layout.
 * All nodes are absolutely positioned; connectors are drawn
 * in a single SVG overlay from exact exit → arrival points.
 *
 * Geometry (all values in px):
 *   - Tree width:  260
 *   - Root height:  90   Child/Grand height: 80
 *   - Gap between rows: 8  (connector travels through this gap)
 *
 * Y positions:
 *   ROOT_Y  = 0        → bottom = 90
 *   CHILD_Y = 98       → bottom = 178
 *   GRAND_Y = 186      → bottom = 266
 *
 * X centers:
 *   Root: 130
 *   Left child: 65    Right child: 195
 *   LL: 32  LR: 98   RL: 162  RR: 228
 */

const TREE_W = 260;
const ROOT_H = 90;
const CHILD_H = 80;
const GAP = 36;

const ROOT_Y = 0;
const CHILD_Y = ROOT_H + GAP;            // 110
const GRAND_Y = CHILD_Y + CHILD_H + GAP; // 210
const TREE_H = GRAND_Y + CHILD_H;        // 290

const ROOT_X = 130;
const L_X = 65;
const R_X = 195;
const LL_X = 32;
const LR_X = 98;
const RL_X = 162;
const RR_X = 228;

interface Props {
  root: NetworkMember;
  treeRoot: NetworkMember;
  onSelect: (member: NetworkMember) => void;
}

export function BinaryTreeLayout({ root, treeRoot, onSelect }: Props) {
  const myDocument = treeRoot.document;
  const isMe = root.id === treeRoot.id;

  // Shorthand
  const lc = root.left ?? null;
  const rc = root.right ?? null;
  const ll = lc?.left ?? null;
  const lr = lc?.right ?? null;
  const rl = rc?.left ?? null;
  const rr = rc?.right ?? null;

  // Connector lines: [x1, y1, x2, y2]
  // Start 6px below the node bottom (after the ▼ arrow)
  const EXIT_OFFSET = 6;
  const connectors: [number, number, number, number][] = [
    // Root → children
    [ROOT_X, ROOT_Y + ROOT_H + EXIT_OFFSET, L_X, CHILD_Y],
    [ROOT_X, ROOT_Y + ROOT_H + EXIT_OFFSET, R_X, CHILD_Y],
    // Left child → grandchildren
    [L_X, CHILD_Y + CHILD_H + EXIT_OFFSET, LL_X, GRAND_Y],
    [L_X, CHILD_Y + CHILD_H + EXIT_OFFSET, LR_X, GRAND_Y],
    // Right child → grandchildren
    [R_X, CHILD_Y + CHILD_H + EXIT_OFFSET, RL_X, GRAND_Y],
    [R_X, CHILD_Y + CHILD_H + EXIT_OFFSET, RR_X, GRAND_Y],
  ];

  return (
    <div className="relative mx-auto" style={{ width: TREE_W, height: TREE_H }}>
      {/* ── Single SVG overlay for ALL connectors ── */}
      <svg
        className="absolute inset-0 pointer-events-none"
        width={TREE_W}
        height={TREE_H}
      >
        {connectors.map(([x1, y1, x2, y2], i) => (
          <line
            key={i}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="hsl(var(--border))"
            strokeWidth={i < 2 ? 1.5 : 1}
          />
        ))}
      </svg>

      {/* ── Absolutely positioned nodes ── */}

      {/* Root */}
      <div
        className="absolute"
        style={{ left: ROOT_X, top: ROOT_Y, transform: "translateX(-50%)" }}
      >
        <BinaryTreeNode
          node={root}
          onSelect={onSelect}
          isRoot
          isMe={isMe}
          isMineAlt={!isMe && root.document === myDocument}
          hasChildren={!!(lc || rc)}
        />
      </div>

      {/* Left child */}
      <div
        className="absolute"
        style={{ left: L_X, top: CHILD_Y, transform: "translateX(-50%)" }}
      >
        <BinaryTreeNode
          node={lc}
          side="left"
          onSelect={onSelect}
          isMineAlt={lc?.document === myDocument}
          hasChildren={!!(ll || lr)}
        />
      </div>

      {/* Right child */}
      <div
        className="absolute"
        style={{ left: R_X, top: CHILD_Y, transform: "translateX(-50%)" }}
      >
        <BinaryTreeNode
          node={rc}
          side="right"
          onSelect={onSelect}
          isMineAlt={rc?.document === myDocument}
          hasChildren={!!(rl || rr)}
        />
      </div>

      {/* Grandchild LL */}
      <div
        className="absolute"
        style={{ left: LL_X, top: GRAND_Y, transform: "translateX(-50%)" }}
      >
        <BinaryTreeNode
          node={ll}
          side="left"
          onSelect={onSelect}
          isMineAlt={ll?.document === myDocument}
          hasChildren={!!(ll?.left || ll?.right)}
        />
      </div>

      {/* Grandchild LR */}
      <div
        className="absolute"
        style={{ left: LR_X, top: GRAND_Y, transform: "translateX(-50%)" }}
      >
        <BinaryTreeNode
          node={lr}
          side="right"
          onSelect={onSelect}
          isMineAlt={lr?.document === myDocument}
          hasChildren={!!(lr?.left || lr?.right)}
        />
      </div>

      {/* Grandchild RL */}
      <div
        className="absolute"
        style={{ left: RL_X, top: GRAND_Y, transform: "translateX(-50%)" }}
      >
        <BinaryTreeNode
          node={rl}
          side="left"
          onSelect={onSelect}
          isMineAlt={rl?.document === myDocument}
          hasChildren={!!(rl?.left || rl?.right)}
        />
      </div>

      {/* Grandchild RR */}
      <div
        className="absolute"
        style={{ left: RR_X, top: GRAND_Y, transform: "translateX(-50%)" }}
      >
        <BinaryTreeNode
          node={rr}
          side="right"
          onSelect={onSelect}
          isMineAlt={rr?.document === myDocument}
          hasChildren={!!(rr?.left || rr?.right)}
        />
      </div>
    </div>
  );
}
