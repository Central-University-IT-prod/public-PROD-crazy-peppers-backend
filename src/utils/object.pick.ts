export function ObjectPick<TSource, TProp extends keyof TSource>(
  source: TSource,
  props: TProp[],
): Pick<TSource, TProp> {
  const result: Pick<TSource, TProp> = {} as Pick<TSource, TProp>;
  for (const prop of props) ({ [prop]: result[prop] } = source);
  return result;
}
