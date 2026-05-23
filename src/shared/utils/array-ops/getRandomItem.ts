export const getRandomItem = <T>({ items }: { items: T[] }) => {
  if (!Array.isArray(items)) return 'getRandomItem ERR: Incorrect arg (should be an Array)'
  const randomIndex = Math.floor(Math.random() * items.length)

  return items[randomIndex]
}
