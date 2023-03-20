import {
  addIndex,
  append,
  compose,
  equals,
  filter,
  find,
  includes,
  isNil,
  map,
  mergeLeft,
  not,
  propEq,
  reduce,
  uniq
} from 'ramda';
import { DirItem } from '../models';
import { SyncAction, SyncObjectCallback, SyncParamAction } from '../types';
import { createStoreHook } from '../utils/store_creator';

interface DirsStates {
  drives: DirItem[];
  directories: DirItem[];
  focused?: DirItem;
  selected?: DirItem;
  expanded: string[];
}

type DirsActions = {
  updateDrives: (dirs: Omit<DirItem, 'sort' | 'parent'>[]) => void;
  saveDirectories: (dirs: Omit<DirItem, 'sort' | 'parent'>[], parent: string) => void;
  focus: SyncParamAction<string>;
  unfocus: SyncAction;
  selectDirectory: SyncParamAction<string>;
  unselectDirectory: SyncAction;
  expandDir: SyncParamAction<string>;
  foldDir: SyncParamAction<string>;
};

const initialState: DirsStates = {
  drives: [],
  directories: [],
  focused: undefined,
  selected: undefined,
  expanded: []
};

export const useDirTreeStore = createStoreHook<DirsStates & DirsActions>((set, get) => ({
  ...initialState,
  updateDrives(dirs) {
    set(df => {
      df.drives = addIndex<Omit<DirItem, 'sort' | 'paraent'>, DirItem>(map)(
        (item, index) => mergeLeft({ sort: index * 10, path: item.path, parent: undefined }, item),
        dirs
      );
    });
  },
  saveDirectories(dirs, parent) {
    const convertedDirs = addIndex<Omit<DirItem, 'sort' | 'parent'>, DirItem>(map)(
      (item, index) => mergeLeft({ sort: index * 10, path: item.path, parent }, item),
      dirs
    );
    const premerged = reduce(
      (acc, elem) => {
        const dir = find(propEq('id', elem.id), convertedDirs);
        if (not(isNil(dir))) {
          acc = append(mergeLeft(dir, elem), acc);
        } else {
          acc = append(elem, acc);
        }
        return acc;
      },
      [],
      get().directories
    );
    const afterMerged = reduce(
      (acc, elem) => {
        const dir = find(propEq('id', elem.id), acc);
        if (isNil(dir)) {
          return append(elem, acc);
        } else {
          return acc;
        }
      },
      premerged,
      convertedDirs
    );
    set(df => {
      df.directories = afterMerged;
    });
  },
  focus(specifiedDirId) {
    const requestedDir = find(propEq('id', specifiedDirId), get().directories);
    if (not(isNil(requestedDir))) {
      set(df => {
        df.focused = requestedDir;
      });
    }
  },
  unfocus() {
    set(df => {
      df.focus = undefined;
    });
  },
  selectDirectory(dirId) {
    set(df => {
      df.selected = dirId;
    });
  },
  unselectDirectory() {
    set(df => {
      df.selected = undefined;
    });
  },
  expandDir(dirId) {
    set(df => {
      df.expanded = uniq(append(dirId, df.expanded));
    });
  },
  foldDir(dirId) {
    set(df => {
      df.expanded = filter(compose(not, equals(dirId)), df.expanded);
    });
  }
}));

export function currentRootsSelector(): SyncObjectCallback<DirsStates, DirItem[]> {
  return state => (isNil(state.focused) ? state.drives : [state.focused]);
}

export function selectDirectories(parent: string): SyncObjectCallback<DirItem[], DirItem[]> {
  return dirs => filter(propEq('parent', parent), dirs) ?? [];
}

export function subDirectoriesSelector(parent: string): SyncObjectCallback<DirsStates, DirItem[]> {
  return state => filter(propEq('parent', parent), state.directories) ?? [];
}

export function isExpandedSelector(dirId: string): SyncObjectCallback<DirsStates, bool> {
  return state => includes(dirId, state.expanded);
}
