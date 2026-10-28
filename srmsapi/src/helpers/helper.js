/**
 * Extract values of a given key from an array of objects.
 * If the array contains primitive values (not objects), return it as-is.
 *
 * @param {Array} items - Array of objects or primitive values
 * @param {String} key - Property name to extract (if items are objects)
 * @returns {Array} Array of extracted values or the original array
 */
function getKeysFromArray(items = [], key = "") {
  if (!Array.isArray(items)) return [];

  // If array contains NON-OBJECTS (primitives), return as-is
  const allPrimitives = items.every(
    (i) => i === null || i === undefined || typeof i !== "object"
  );
  if (allPrimitives) return items;

  // If key is not provided, do nothing
  if (!key) return [];

  // Extract values if elements are objects
  return items
    .map((obj) => obj?._id ?? obj?.id ?? obj?.[key])
    .filter((v) => v !== undefined && v !== null);
}

module.exports = {
  getKeysFromArray,
};
