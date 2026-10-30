import { Board, BoardSlot } from "./Board";
import { CardView } from "./CardView";

export const dragState: {
  draggingCardView?: CardView;
  sourceSlot?: BoardSlot;
  sourceBoard?: Board;
  targetBoard?: Board;
  displaceCardView?: CardView;
  previewSlot?: BoardSlot;
  dragStartPosition?: { x: number; y: number };
} = {};

export function isDragging() {
  return dragState.draggingCardView !== undefined;
}

export function getDragStartPosition() {
  return dragState.dragStartPosition;
}

export function resetDragState() {
  dragState.draggingCardView = undefined;
  dragState.sourceSlot = undefined;
  dragState.displaceCardView = undefined;
  dragState.previewSlot = undefined;
  dragState.dragStartPosition = undefined;
  dragState.sourceBoard = undefined;
  dragState.targetBoard = undefined;
}

export function swapPreview() {
  const sourcePos = dragState.dragStartPosition;
  if (sourcePos) dragState.displaceCardView?.moveTo(sourcePos.x, sourcePos.y);
}

export function resetSwap() {
  if (!dragState.dragStartPosition || !dragState.draggingCardView) return;
  dragState.draggingCardView.moveTo(
    dragState.dragStartPosition?.x,
    dragState.dragStartPosition?.y,
  );
  dragState.displaceCardView?.moveTo(
    dragState.displaceCardView.getBoardSlot().getGameObject().getWorldPoint().x,
    dragState.displaceCardView.getBoardSlot().getGameObject().getWorldPoint().y,
  );
  dragState.displaceCardView = undefined;
  dragState.previewSlot = undefined;
}
