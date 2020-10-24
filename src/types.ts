export type Dictionary<K extends string | number | symbol, V> = Partial<Record<K, V>>

export interface SelectOption<T extends string = string> {
  label: string
  value: T
}
