const fs = require('fs');
const path = require('path');

const openapiPath = path.join(__dirname, 'openapi.json');

if (!fs.existsSync(openapiPath)) {
  console.error('openapi.json not found');
  process.exit(1);
}

const spec = JSON.parse(fs.readFileSync(openapiPath, 'utf8'));

function hasEmptyRef(obj) {
  if (obj && typeof obj === 'object') {
    if ('$ref' in obj) {
      const ref = obj.$ref;
      return !ref || ref === '#/components/schemas/' || ref.endsWith('/');
    }
    if ('allOf' in obj && Array.isArray(obj.allOf)) {
      return obj.allOf.every(item => hasEmptyRef(item));
    }
  }
  return false;
}

function cleanRefs(obj, isProperty = false) {
  if (Array.isArray(obj)) {
    return obj.map(item => cleanRefs(item, isProperty)).filter(item => !hasEmptyRef(item) && item !== undefined);
  } else if (obj && typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      // Skip properties with empty $ref or empty allOf
      if (hasEmptyRef(value)) {
        continue;
      }
      // Clean allOf arrays
      if (key === 'allOf' && Array.isArray(value)) {
        const cleanedAllOf = cleanRefs(value, isProperty).filter(item => !hasEmptyRef(item) && item !== undefined);
        if (cleanedAllOf.length > 0) {
          cleaned[key] = cleanedAllOf;
        }
        // If allOf becomes empty, skip this property entirely
      } else {
        const cleanedValue = cleanRefs(value, key === 'properties');
        if (cleanedValue !== undefined) {
          cleaned[key] = cleanedValue;
        }
      }
    }
    // Final check: if object is an array type, ensure it has items
    if (cleaned.type === 'array' && !cleaned.items) {
      // Remove invalid array definitions (especially in properties)
      if (isProperty) {
        return undefined;
      }
      // For top-level schemas, we might want to keep it but Orval will error, so remove it
      return undefined;
    }
    return cleaned;
  }
  return obj;
}

const cleaned = cleanRefs(spec);

// Orval tag mode emits one block per tag; duplicate tags duplicate exports in the same file.
for (const methods of Object.values(cleaned.paths ?? {})) {
  for (const operation of Object.values(methods)) {
    if (!operation || typeof operation !== 'object' || !Array.isArray(operation.tags)) {
      continue;
    }
    operation.tags = [...new Set(operation.tags)];
  }
}

fs.writeFileSync(openapiPath, JSON.stringify(cleaned, null, 2));
console.log('✅ Cleaned openapi.json - removed empty $ref values and deduplicated tags');

