import { kiddyAnimals } from './animals'

export const kiddyItems = [
  ...kiddyAnimals.map((animal) => ({
    ...animal,
    category: 'animals',
  })),
]