export const when = <T extends object>(condition: boolean, value: T): T | object => {
  return condition ? value : {}
}