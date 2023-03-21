//@ts-nocheck
import { invoke } from '@tauri-apps/api';
import { useDirTreeStore } from '../states/dirs';

export async function loadDrives() {
  try {
    const drives = await invoke('show_drives');
    const { getState } = useDirTreeStore;
    getState().updateDrives(drives);
  } catch (e) {
    console.error('[error]fetch drives', e);
    throw e;
  }
}

export async function loadSubDirectories(target: DirItem) {
  try {
    const directories = await invoke('scan_for_child_dirs', { target: target.path });
    const { getState } = useDirTreeStore;
    getState().saveDirectories(directories, target.id);
  } catch (e) {
    console.error('[error]fetch subdirs', e);
    throw e;
  }
}
