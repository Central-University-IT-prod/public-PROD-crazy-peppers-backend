export function coincidenceCount(arr1: string[], arr2: string[]) {
  return arr1.reduce((cnt, cur_val) => {
    if (arr2.indexOf(cur_val) >= 0) return cnt + 1;
    else return cnt;
  }, 0);
}

export function TagsComp(arr1: string[], arr2: string[], wanted: string[]) {
  const val1 = coincidenceCount(arr1, wanted);
  const val2 = coincidenceCount(arr2, wanted);
  if (val1 > val2) return -1;
  if (val1 < val2) return 1;
  return 0;
}
