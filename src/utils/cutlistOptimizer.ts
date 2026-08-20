import {
  CutListPanel,
  CutListStock,
  CutListOptions,
  CutListPlacedPanel,
  CutListWasteRect,
  CutListCutLine,
  CutListSheetLayout,
  CutListResult
} from '../types';

interface FreeRect {
  x: number;
  y: number;
  width: number;
  length: number;
}

interface ItemToPack {
  panelId: string;
  name: string;
  length: number;
  width: number;
  material: string;
  canRotate: boolean;
  edgeBending: {
    top: boolean;
    bottom: boolean;
    left: boolean;
    right: boolean;
  };
  color: string;
  area: number;
}

const PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899',
  '#06b6d4', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
  '#d946ef', '#0ea5e9', '#e11d48', '#22c55e', '#a855f7'
];

/**
 * 2D Guillotine Sheet Packing Optimizer (CutList Optimizer Engine)
 */
export function optimizeCutList(
  panels: CutListPanel[],
  stocks: CutListStock[],
  options: CutListOptions
): CutListResult {
  const kerf = Math.max(0, options.kerfThickness || 0);
  const trim = Math.max(0, options.trimMargin || 0);
  const allowRotation = options.allowRotation !== false;

  // Flatten panels by quantity and assign colors
  const items: ItemToPack[] = [];
  let colorIdx = 0;
  panels.forEach((p) => {
    const color = p.color || PALETTE[colorIdx % PALETTE.length];
    colorIdx++;
    for (let i = 0; i < p.quantity; i++) {
      items.push({
        panelId: `${p.id}-${i}`,
        name: p.name,
        length: p.length,
        width: p.width,
        material: p.material || 'Default',
        canRotate: p.canRotate !== undefined ? p.canRotate : allowRotation,
        edgeBending: p.edgeBending || { top: false, bottom: false, left: false, right: false },
        color,
        area: p.length * p.width
      });
    }
  });

  const totalPanelsRequested = items.length;

  // Sort items: Largest Area First, then longest dimension
  items.sort((a, b) => b.area - a.area || Math.max(b.length, b.width) - Math.max(a.length, a.width));

  const sheetLayouts: CutListSheetLayout[] = [];
  const remainingItems = [...items];
  let sheetNumber = 1;

  // Pick first available stock sheet (or create default 96x48 if empty)
  const defaultStock: CutListStock = stocks.length > 0
    ? stocks[0]
    : { id: 'def-stock', name: 'Standard 8x4 Sheet', length: 96, width: 48, quantity: 999, material: '18mm PLB', costPerSheet: 1500 };

  while (remainingItems.length > 0 && sheetNumber <= 50) {
    const stockSheet = stocks[Math.min(sheetNumber - 1, stocks.length - 1)] || defaultStock;
    
    // Effective usable dimensions inside trim margins
    const usableLength = stockSheet.length - trim * 2;
    const usableWidth = stockSheet.width - trim * 2;

    if (usableLength <= 0 || usableWidth <= 0) break;

    const freeRects: FreeRect[] = [{ x: trim, y: trim, length: usableLength, width: usableWidth }];
    const placedPanels: CutListPlacedPanel[] = [];
    const cutLines: CutListCutLine[] = [];
    let cutCounter = 1;

    let placedAnyInPass = true;
    while (placedAnyInPass && remainingItems.length > 0) {
      placedAnyInPass = false;
      let bestItemIdx = -1;
      let bestRectIdx = -1;
      let bestRotated = false;
      let bestScore = Number.MAX_VALUE;

      for (let i = 0; i < remainingItems.length; i++) {
        const item = remainingItems[i];

        for (let r = 0; r < freeRects.length; r++) {
          const rect = freeRects[r];

          // Fit without rotation (length in X/length, width in Y/width)
          if (item.length <= rect.length && item.width <= rect.width) {
            const leftoverArea = rect.length * rect.width - item.length * item.width;
            const shortSideDiff = Math.min(rect.length - item.length, rect.width - item.width);
            const score = leftoverArea * 1000 + shortSideDiff;
            if (score < bestScore) {
              bestScore = score;
              bestItemIdx = i;
              bestRectIdx = r;
              bestRotated = false;
            }
          }

          // Fit with rotation if allowed
          if (item.canRotate && item.width <= rect.length && item.length <= rect.width) {
            const leftoverArea = rect.length * rect.width - item.width * item.length;
            const shortSideDiff = Math.min(rect.length - item.width, rect.width - item.length);
            const score = leftoverArea * 1000 + shortSideDiff + 5; // slight penalty for rotation to preserve alignment
            if (score < bestScore) {
              bestScore = score;
              bestItemIdx = i;
              bestRectIdx = r;
              bestRotated = true;
            }
          }
        }

        // If we found a perfect fit, break early
        if (bestScore === 0) break;
      }

      if (bestItemIdx >= 0 && bestRectIdx >= 0) {
        const item = remainingItems.splice(bestItemIdx, 1)[0];
        const rect = freeRects.splice(bestRectIdx, 1)[0];
        const pLength = bestRotated ? item.width : item.length;
        const pWidth = bestRotated ? item.length : item.width;

        placedPanels.push({
          panelId: item.panelId,
          name: item.name,
          x: Number(rect.x.toFixed(2)),
          y: Number(rect.y.toFixed(2)),
          length: pLength,
          width: pWidth,
          rotated: bestRotated,
          material: item.material,
          color: item.color,
          edgeBending: bestRotated
            ? {
                top: item.edgeBending.left,
                bottom: item.edgeBending.right,
                left: item.edgeBending.bottom,
                right: item.edgeBending.top
              }
            : item.edgeBending
        });

        // Guillotine split of remaining rectangle with kerf deduction
        const remLength = rect.length - pLength - kerf;
        const remWidth = rect.width - pWidth - kerf;

        // Split strategy: Guillotine cut across length or width
        if (options.cutPreference === 'guillotine_width' || (remWidth > remLength && options.cutPreference !== 'guillotine_length')) {
          // Horizontal cut line
          if (remWidth > 0) {
            freeRects.push({
              x: rect.x,
              y: rect.y + pWidth + kerf,
              length: rect.length,
              width: remWidth
            });
            cutLines.push({
              x1: rect.x,
              y1: rect.y + pWidth,
              x2: rect.x + rect.length,
              y2: rect.y + pWidth,
              cutIndex: cutCounter++,
              isGuillotine: true
            });
          }
          if (remLength > 0) {
            freeRects.push({
              x: rect.x + pLength + kerf,
              y: rect.y,
              length: remLength,
              width: pWidth
            });
            cutLines.push({
              x1: rect.x + pLength,
              y1: rect.y,
              x2: rect.x + pLength,
              y2: rect.y + pWidth,
              cutIndex: cutCounter++,
              isGuillotine: true
            });
          }
        } else {
          // Vertical cut line
          if (remLength > 0) {
            freeRects.push({
              x: rect.x + pLength + kerf,
              y: rect.y,
              length: remLength,
              width: rect.width
            });
            cutLines.push({
              x1: rect.x + pLength,
              y1: rect.y,
              x2: rect.x + pLength,
              y2: rect.y + rect.width,
              cutIndex: cutCounter++,
              isGuillotine: true
            });
          }
          if (remWidth > 0) {
            freeRects.push({
              x: rect.x,
              y: rect.y + pWidth + kerf,
              length: pLength,
              width: remWidth
            });
            cutLines.push({
              x1: rect.x,
              y1: rect.y + pWidth,
              x2: rect.x + pLength,
              y2: rect.y + pWidth,
              cutIndex: cutCounter++,
              isGuillotine: true
            });
          }
        }

        placedAnyInPass = true;
      }
    }

    // Filter waste rectangles (minimum usable size > 1 sq.in)
    const wasteRectangles: CutListWasteRect[] = freeRects
      .filter((r) => r.length > 0.5 && r.width > 0.5)
      .map((r) => ({
        x: Number(r.x.toFixed(2)),
        y: Number(r.y.toFixed(2)),
        length: Number(r.length.toFixed(2)),
        width: Number(r.width.toFixed(2)),
        area: Number(((r.length * r.width) / 144).toFixed(2))
      }));

    const sheetTotalArea = (stockSheet.length * stockSheet.width) / 144;
    const usedArea = placedPanels.reduce((sum, p) => sum + (p.length * p.width) / 144, 0);
    const wasteArea = Math.max(0, sheetTotalArea - usedArea);
    const efficiencyPercent = sheetTotalArea > 0 ? Number(((usedArea / sheetTotalArea) * 100).toFixed(1)) : 0;

    sheetLayouts.push({
      sheetIndex: sheetNumber,
      stockSheet,
      placedPanels,
      wasteRectangles,
      cutLines,
      usedArea: Number(usedArea.toFixed(2)),
      wasteArea: Number(wasteArea.toFixed(2)),
      efficiencyPercent,
      totalCutsCount: cutLines.length
    });

    sheetNumber++;
  }

  // Count unplaced panels
  const unplacedMap = new Map<string, { name: string; width: number; length: number; count: number }>();
  remainingItems.forEach((item) => {
    const key = `${item.name}-${item.length}x${item.width}`;
    const existing = unplacedMap.get(key);
    if (existing) {
      existing.count++;
    } else {
      unplacedMap.set(key, { name: item.name, width: item.width, length: item.length, count: 1 });
    }
  });

  const unplacedPanels = Array.from(unplacedMap.values());
  const totalPlacedPanels = totalPanelsRequested - remainingItems.length;
  const totalStockSheetsUsed = sheetLayouts.length;
  const totalUsedAreaSqft = Number(sheetLayouts.reduce((sum, s) => sum + s.usedArea, 0).toFixed(2));
  const totalWasteAreaSqft = Number(sheetLayouts.reduce((sum, s) => sum + s.wasteArea, 0).toFixed(2));
  const totalSheetArea = sheetLayouts.reduce((sum, s) => sum + (s.stockSheet.length * s.stockSheet.width) / 144, 0);
  const overallEfficiencyPercent = totalSheetArea > 0 ? Number(((totalUsedAreaSqft / totalSheetArea) * 100).toFixed(1)) : 0;
  const totalCutsCount = sheetLayouts.reduce((sum, s) => sum + s.totalCutsCount, 0);
  const totalSheetCost = sheetLayouts.reduce((sum, s) => sum + (s.stockSheet.costPerSheet || 0), 0);

  return {
    totalStockSheetsUsed,
    totalPlacedPanels,
    totalPanelsRequested,
    unplacedPanels,
    overallEfficiencyPercent,
    totalUsedAreaSqft,
    totalWasteAreaSqft,
    totalCutsCount,
    totalSheetCost,
    sheetLayouts,
    calculatedAt: new Date().toISOString()
  };
}
