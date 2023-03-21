//@ts-nocheck
import { SyncObjectCallback } from '../types';
import { createStoreHook } from '../utils/store_creator';

interface ZoomState {
  autoFit: boolean;
  currentZoom: number;
  viewMode: 'single' | 'continuation';
  viewHeight: number;
  viewWidth: number;
}

type ZoomActions = {
  zoom: SyncObjectCallback<number>;
  updateViewHeight: SyncObjectCallback<number>;
  updateViewWidth: SyncObjectCallback<number>;
  switchViewMode: SyncObjectCallback<'single' | 'continuation'>;
};

const initialState: ZoomState = {
  autoFit: false,
  currentZoom: 80,
  viewMode: 'continuation',
  viewHeight: 0,
  viewWidth: 0
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
  },
  updateViewWidth(width) {
    set(df => {
      df.viewWidth = width;
    });
  },
  switchViewMode(mode) {
    set(df => {
      df.viewMode = mode;
    });
  }
}));
