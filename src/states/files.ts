import { addIndex, map, mergeRight } from 'ramda';
import { FileItem } from '../models';
import { SyncObjectCallback } from '../types';
import { createStoreHook } from '../utils/store_creator';

interface FileListState {
  files: FileItem[];
}

type FileListActions = {
  updateFiles: SyncObjectCallback<Omit<FileItem, 'sort'>[]>;
};

const initialState: FileListState = {
  files: []
};

export const useFileListStore = createStoreHook<FileListState & FileListActions>(set => ({
  ...initialState,
  updateFiles(files) {
    set(df => {
      df.files = addIndex<Omit<FileItem, 'sort'>, FileItem>(map)(
        (item, index) => mergeRight({ sort: index * 10 }, item),
        files
      );
    });
  }
}));
