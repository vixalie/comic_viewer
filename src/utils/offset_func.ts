import { and, gt, lt } from 'ramda';

export function withinRange(
  itemStart: number,
  itemEnd: number,
  offsetStart: number,
  offsetEnd: number
): boolean {
  return and(lt(itemStart, offsetEnd), gt(itemEnd, offsetStart));
}
