type CompareValues = (value1: unknown, value2: unknown) => boolean

const compareValues: CompareValues = (value1, value2) => {
    if (
        value1 !== value2 && // Values are different
        (!value1 !== !value2 || // Values are not "falsy" (e.g. '' and null) or...
            value1 === 0 || // At least one value is equal to 0
            value2 === 0)
    ) {
        return false
    }

    return true
}

type ShallowCompare = (
    object1: Record<string, unknown>,
    object2: Record<string, unknown>,
    keys?: string[]
) => boolean

export const shallowCompare: ShallowCompare = (object1, object2, keys) => {
    if (!keys) {
        const keys1 = Object.keys(object1)
        const keys2 = Object.keys(object2)
        keys = Array.from(new Set([...keys1, ...keys2]))
    }

    for (const key of keys) {
        if (!compareValues(object1[key], object2[key])) {
            return false
        }
    }

    return true
}

type ShallowArrayCompare = (array1: unknown[], array2: unknown[]) => boolean

export const shallowArrayCompare: ShallowArrayCompare = (array1, array2) => {
    if (array1.length !== array2.length) return false

    for (let i = 0; i < array1.length; i++) {
        if (!compareValues(array1[i], array2[i])) {
            return false
        }
    }

    return true
}
