export type FileItem = {
  sort: number;
  id: string;
  filename: string;
  path: string;
  width: number;
  height: number;
};

export type DirItem = {
  sort: number;
  parent?: string;
  id: string;
  dirname: string;
  path: string;
  root: boolean;
  expanded: boolean;
};
