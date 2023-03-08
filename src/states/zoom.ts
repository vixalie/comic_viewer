import { createStoreHook } from '../utils/store_creator';

interface ZoomState {
  lock: boolean;
  autoFit: boolean;
  currentZoom: number;
  viewMode: 'single' | 'double' | 'continuation';
}

const initialState: ZoomState = {
  lock: true,
  autoFit: false,
  currentZoom: 100,
  viewMode: 'continuation'
};

export const useZoomState = createStoreHook<ZoomState>(set => ({
  ...initialState
}));
