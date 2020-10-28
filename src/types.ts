export type Dictionary<K extends string | number | symbol, V> = Partial<
  Record<K, V>
>

export interface SelectOption<T extends string = string> {
  label: string
  value: T
}

export interface AsyncReady<T> {
  status: 'ready'
  value: T
}

export interface AsyncPending {
  status: 'pending'
}

export interface AsyncError<T = string> {
  status: 'error'
  error: T
}

export type AsyncValue<T, E = string> =
  | AsyncPending
  | AsyncError<E>
  | AsyncReady<T>
