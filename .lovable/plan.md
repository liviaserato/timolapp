

## Problem

The node positions are correct and fixed — the issue is **only with the SVG connector lines**. Currently:

- Lines start at `y = ROOT_Y + ROOT_H` (90px) and end at `y = CHILD_Y` (98px) — only 8px gap
- This causes lines to overlap with the qualification text and ▼ arrow at the bottom of each node
- The same problem repeats between children and grandchildren

The nodes themselves must NOT be moved.

## Plan

**File: `src/components/app/rede/BinaryTreeLayout.tsx`** — adjust connector Y coordinates only

1. **Increase GAP** from 8px to ~20px so connectors have breathing room
2. Recalculate `CHILD_Y` and `GRAND_Y` accordingly (nodes move down slightly to accommodate the gap, but their internal structure stays identical)
3. Update `TREE_H` to match
4. Connector start Y = node top + node height (unchanged logic, just benefits from bigger gap)
5. Optionally offset connector start by a few px down and connector end by a few px down to avoid clipping the ▼ arrow at exit and land just above the circle at arrival

Concrete values:
- `GAP = 20` (was 8)
- `CHILD_Y = 90 + 20 = 110`
- `GRAND_Y = 110 + 80 + 20 = 210`
- `TREE_H = 210 + 80 = 290`
- Connector exit: `nodeTop + nodeHeight` (same as before — bottom of container)
- Connector arrival: `childTop` (same — top of child container, which is where the circle starts)

This change is confined to `BinaryTreeLayout.tsx` only. No changes to `BinaryTreeNode.tsx` or `BinaryTab.tsx`.

