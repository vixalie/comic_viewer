import { SyncObjectCallback } from '../types';
import { createStoreHook } from '../utils/store_creator';

interface ZoomState {
  lock: boolean;
  autoFit: boolean;
  currentZoom: number;
  viewMode: 'single' | 'double' | 'continuation';
  viewHeight: number;
}

type ZoomActions = {
  zoom: SyncObjectCallback<number>;
  updateViewHeight: SyncObjectCallback<number>;
};

const initialState: ZoomState = {
  lock: true,
  autoFit: false,
  currentZoom: 80,
  viewMode: 'continuation',
  viewHeight: 0
};

export const useZoomState = createStoreHook<ZoomState & ZoomActions>(set => ({
  ...initialState,
  zoom(ratio) {
    set(df => {
      df.currentZoom = ratio;
    });
  },
  updateViewHeight(height) {
    set(df => {
      df.viewHeight = height;
    });
  }
}));
