/**
 * Sets a value in a nested object using a dot-separated string path.
 * @param {object} arg Argument
 * @param {string} arg.target The object to modify
 * @param {string} arg.path Target path to prop for mutation
 * @param {string} arg.value Target value
 * @param {void} value The value to set
 */
export const setNestedValue = <TObjectFormat, TValueFormat>({ target, path, value }: {
  target: TObjectFormat;
  path: string;
  value: TValueFormat;
}) => {
  // Split the path string into an array of keys
  const keys = path.split('.');

  // Traverse the object until the second-to-last key
  // to find the parent object
  // TODO: По возможности типизировать корректно
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let current: any = target;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i] as string;
    // If the current property doesn't exist or is not an object, create a new object
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  // Set the value on the final, parent object using the last key
  const lastKey = keys[keys.length - 1];
  current[lastKey] = value;
}

// --- Example Usage ---
// const myObject = {
//   user: {
//     name: 'Alice',
//     address: {
//       city: 'New York'
//     }
//   }
// };

// console.log('Before:', JSON.stringify(myObject));

// // Set a nested value that already exists
// setNestedValue(myObject, 'user.address.city', 'San Francisco');
// console.log('After existing path:', JSON.stringify(myObject));

// // Set a value for a new path, creating intermediate objects
// setNestedValue(myObject, 'user.address.zipCode.primary', 94105);
// console.log('After new path:', JSON.stringify(myObject));
