import { convertFileSrc } from '@tauri-apps/api/tauri';
import { addIndex, map, mergeLeft } from 'ramda';
import { FileItem } from '../models';
import { SyncObjectCallback } from '../types';
import { createStoreHook } from '../utils/store_creator';

interface FileListState {
  files: FileItem[];
  actives: string[];
}

type FileListActions = {
  updateFiles: SyncObjectCallback<Omit<FileItem, 'sort'>[]>;
  updateActiveFiles: SyncObjectCallback<string[]>;
};

const initialState: FileListState = {
  files: [],
  actives: []
};

export const useFileListStore = createStoreHook<FileListState & FileListActions>(set => ({
  ...initialState,
  updateFiles(files) {
    set(df => {
      df.files = addIndex<Omit<FileItem, 'sort'>, FileItem>(map)(
        (item, index) => mergeLeft({ sort: index * 10, path: convertFileSrc(item.path) }, item),
        files
      );
    });
  },
  updateActiveFiles(filenames) {
    set(df => {
      df.actives = filenames;
    });
  }
}));
