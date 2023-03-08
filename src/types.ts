/**
 * 不需要任何参数即可以生成指定类型对象的工厂函数类型。
 */
export type Factory<T> = () => T;

/**
 * 接受一个参数来生成一个指定类型的新对象的工厂函数类型。
 */
export type MapFactory<T, P = unknown> = (obj: P) => T;

/**
 * 可能接受一个参数也可以不使用任何参数来生成指定类型新对象的工厂函数类型。
 */
export type MaybeParamFactory<T, P = unknown> = (obj?: P) => T;

/**
 * 可能接受一组任意类型的参数集合来生成指定类型新对象的工厂函数类型。
 */
export type ParamFactory<T, P = unknown> = (...args: P[]) => T;

/**
 * 接受一个对象（默认是字符串）作为参数的回调函数，可以是同步函数也可以是异步函数。
 */
export type ObjectCallback<P = string, T = void> = (obj: P) => T | Promise<T>;

/**
 * 接受一个对象（默认是字符串）作为参数的回调函数，仅可以是同步函数。
 */
export type SyncObjectCallback<P = string, T = void> = (obj: P) => T;

/**
 * 接受一个对象（默认是字符串）作为参数的回调函数，仅可以是异步函数。
 */
export type AsyncObjectCallback<P = string, T = void> = (obj: P) => Promise<T>;

/**
 * 接受一个对象（默认是字符串）或者零个对象作为参数的回调函数，可以是同步函数也可以是异步函数。
 */
export type MaybeObjectCallback<P = string, T = void> = ObjectCallback<P | undefined, T>;

/**
 * 接受一个对象（默认是字符串）或者零个对象作为参数的回调函数，仅可以是同步函数。
 */
export type SyncMaybeObjectCallback<P = string, T = void> = SyncObjectCallback<P | undefined, T>;

/**
 * 接受一个对象（默认是字符串）或者零个对象作为参数的回调函数，仅可以是异步函数。
 */
export type AsyncMaybeObjectCallback<P = string, T = void> = AsyncObjectCallback<P | undefined, T>;

/**
 * 接受一个对象数组（默认是字符串数组）作为参数的回调函数，可以是同步函数也可以是异步函数。
 */
export type ObjectsCallback<P = string, T = void> = ObjectCallback<P[], T>;

/**
 * 接受一个对象数组（默认是字符串数组）作为参数的回调函数，仅可以是同步函数。
 */
export type SyncObjectsCallback<P = string, T = void> = SyncObjectCallback<P[], T>;

/**
 * 接受一个对象数组（默认是字符串数组）作为参数的回调函数，仅可以是异步函数。
 */
export type AsyncObjectsCallback<P = string, T = void> = AsyncObjectCallback<P[], T>;

/**
 * 接收一个对象数组（默认是字符串数组）或者零个对象作为参数的回调函数，可以是同步函数也可以是异步函数。
 */
export type MaybeObjectsCallback<P = string, T = void> = ObjectCallback<P[] | undefined, T>;

/**
 * 接收一个对象数组（默认是字符串数组）或者零个对象作为参数的回调函数，仅可以是同步函数。
 */
export type SyncMaybeObjectsCallback<P = string, T = void> = SyncObjectCallback<P[] | undefined, T>;

/**
 * 接收一个对象数组（默认是字符串数组）或者零个对象作为参数的回调函数，仅可以是异步函数。
 */
export type AsyncMaybeObjectsCallback<P = string, T = void> = AsyncObjectCallback<
  P[] | undefined,
  T
>;

/**
 * 可以接受任意数量任意参数类型的回调函数。
 */
export type ExtendParamCallback<P = unknown, T = void> = (...args: P[]) => T | Promise<T>;

/**
 * 可以接受任意数量任意参数类型的仅支持同步的回调函数。
 */
export type SyncExtendParamCallback<P = unknown, T = void> = (...args: P[]) => T;

/**
 * 可以接受任意数量任意参数类型的仅支持异步的回调函数。
 */
export type AsyncExtendParamCallback<P = unknown, T = void> = (...args: P[]) => Promise<T>;

/**
 * 不接受任何参数内容的回调函数，可以是同步函数也可以是异步函数。
 */
export type Callback<T = void> = () => T | Promise<T>;

/**
 * 不接受任何参数内容的回调函数，仅可以是同步函数。
 */
export type SyncCallback<T = void> = () => T;

/**
 * 不接受任何参数内容的回调函数，仅可以是异步函数。
 */
export type AsyncCallback<T = void> = () => Promise<T>;

/**
 * 用于在Store中定义状态操作Action的无参同步Action类型。
 */
export type SyncAction = SyncCallback<void>;

/**
 * 用于在Store中定义状态操作Action的无参可异步Action类型。
 */
export type AsyncAction = Callback<void>;

/**
 * 用于在Store中定义状态操作Action的单一参数同步Action类型。
 */
export type SyncParamAction<T> = SyncObjectCallback<T, void>;

/**
 * 用于在Store中定义状态操作Action的单一参数异步Action类型。
 */
export type AsyncParamAction<T> = AsyncObjectCallback<T, void>;

/**
 * 用于在Store中定义状态操作Action的不定参同步Action类型。
 */
export type SyncMaybeAction<T> = SyncMaybeObjectCallback<T>;

/**
 * 用于在Store中定义状态操作Action的不定参可异步Action类型。
 */
export type AsyncMaybeAction<T> = AsyncMaybeObjectCallback<T>;

/**
 * 用于在Store中定义状态操作Action的展开参同步Action类型。
 */
export type SyncExtendParamAction<T> = SyncExtendParamCallback<T>;

/**
 * 用于在Store中定义状态操作Action的展开参可异步Action类型。
 */
export type AsyncExtendParamAction<T> = AsyncExtendParamCallback<T>;

/**
 * 用于定义可以接受重置事件的Ref组件。
 */
export interface Resetable {
  /**
   * 组件可以接受的重置方法。
   */
  reset: Callback;
}

/**
 * 用于定义可执行打开动作的Ref组件。
 */
export interface Openable {
  /**
   * 组件可以接受的打开方法。
   */
  open: Callback;
}

/**
 * 用于定义可执行关闭动作的Ref组件。
 */
export interface Closeable {
  /**
   * 组件可以接受的关闭方法。
   */
  close: Callback;
}

/**
 * 用于定义可以执行特定动作的Ref组件。
 * 组件所执行的动作可以接受任意数量的参数，但不会返回任何结果。
 */
export interface Actionable<T = unknown> {
  /**
   * 组件可以接受的执行特定动作的方法。
   */
  action?: ExtendParamCallback<T>;
}

/**
 * 用于记录可以发生修改的脏数据。
 */
export interface DirtyableValue<T> {
  /**
   * 记录数据当前的值。
   */
  value: T;
  /**
   * 记录数据在修改前的全部历史值。
   */
  lastValues: T[];
  /**
   * 记录数据是否发生了更改。
   */
  dirty: boolean;
}

/**
 * 转换一般的数据记录类型成为可记录修改的脏数据类型。
 */
export type Dirtyable<T> = { [P in keyof T]: DirtyableValue<T[P]> };
