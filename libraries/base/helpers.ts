import {Raw} from "typeorm";

export const isObject = (a: any) => (!!a && a.constructor === Object) || (!!a && typeof a === 'object');

export const clone = (obj: any) => JSON.parse(JSON.stringify(obj));

export const isEmpty = (a: any) => Object.keys(a).length === 0;

export const recurseWithAsyncValueFunction = async (obj: any, valueFunction: (obj: any, key: string, inputValue: any) => Promise<any>): Promise<any> => {
	if (Array.isArray(obj)) {
		return Promise.all(obj.map(async (val) => recurseWithAsyncValueFunction(val, valueFunction)));
	} else if (obj) {
		for (const [key, value] of Object.entries(obj)) {
			if (value) {
				if (Array.isArray(value)) {
					obj[key] = await value.reduce(async (arr, val) => {
						if (isObject(val)) {
							return [...(await arr), await recurseWithAsyncValueFunction(val, valueFunction)];
						} else {
							return [...(await arr), await valueFunction(obj, key, val)];
						}
					}, Promise.resolve([]));
				} else if (isObject(value)) {
					obj[key] = await recurseWithAsyncValueFunction(clone(value), valueFunction);
				} else {
					obj[key] = await valueFunction(obj, key, value);
				}
			}
		}
	}
	return obj;
};

export const recurseWithValueFunction = (obj: any, valueFunction: (obj: any, key: string, inputValue: any) => any): any => {
	if (Array.isArray(obj)) {
		return obj.map((val) => recurseWithValueFunction(val, valueFunction));
	} else if (obj) {
		for (const [key, value] of Object.entries(obj)) {
			if (value) {
				if (Array.isArray(value)) {
					obj[key] = value.reduce((arr, val) => {
						if (isObject(val)) {
							return [...arr, recurseWithValueFunction(val, valueFunction)];
						} else {
							return [...arr, valueFunction(obj, key, val)];
						}
					}, []);
				} else if (isObject(clone(value))) {
					obj[key] = recurseWithValueFunction(value, valueFunction);
				} else {
					obj[key] = valueFunction(obj, key, value);
				}
			}
		}
	}
	return obj;
};

export const recurseWithKeyValueFunction = (obj: any, keyValueFunction: (obj: any, key: string, value: any) => any): any => {
	if (Array.isArray(obj)) {
		return obj.map((val) => recurseWithKeyValueFunction(val, keyValueFunction));
	} else if (obj) {
		for (const [key, value] of Object.entries(obj)) {
			if (value) {
				if (Array.isArray(value)) {
					obj[key] = value.reduce((arr, val) => {
						if (isObject(val)) {
							return [...arr, recurseWithKeyValueFunction(val, keyValueFunction)];
						} else {
							return [...arr, keyValueFunction(obj, key, val)];
						}
					}, []);
				} else if (isObject(clone(value))) {
					obj[key] = recurseWithKeyValueFunction(value, keyValueFunction);
				} else {
					obj[key] = keyValueFunction(obj, key, value);
				}
			}
		}
	}
	return obj;
};

export const recurseWithAsyncKeyValueFunction = async (obj: any, keyValueFunction: (key: string, value: any) => Promise<any>): Promise<any> => {
	if (Array.isArray(obj)) {
		return await Promise.all(obj.map(async (val) => await recurseWithAsyncKeyValueFunction(val, keyValueFunction)));
	} else if (obj) {
		for (const [key, value] of Object.entries(obj)) {
			if (value) {
				if (Array.isArray(value)) {
					obj[key] = await value.reduce(async (arr, val) => {
						if (isObject(val)) {
							return [...(await arr), await recurseWithAsyncKeyValueFunction(val, keyValueFunction)];
						} else {
							return [...(await arr), await keyValueFunction(key, val)];
						}
					}, Promise.resolve([]));
				} else if (isObject(value)) {
					obj[key] = await recurseWithAsyncKeyValueFunction(value, keyValueFunction);
				} else {
					obj[key] = await keyValueFunction(key, value);
				}
			}
		}
	}
	return obj;
};

export const recurseWithObjFunction = (obj: any, objCheckFunction: (obj: any) => boolean, objFunction: (obj: any) => any): any => {
	if (Array.isArray(obj)) {
		return obj.map((val) => recurseWithObjFunction(val, objCheckFunction, objFunction));
	} else if (isObject(obj)) {
		obj = Object.entries(obj).reduce((acc, [key, value]) => {
			if (Array.isArray(value)) {
				return { ...acc, [key]: value.map((val) => recurseWithObjFunction(val, objCheckFunction, objFunction)) };
			} else if (isObject(value)) {
				if (objCheckFunction(value)) {
					return { ...acc, [key]: objFunction(value) };
				}
				return {
					...acc,
					[key]: recurseWithObjFunction(value, objCheckFunction, objFunction)
				};
			} else {
				return { ...acc, [key]: value };
			}
		}, {});
	} else {
		return obj;
	}
	return obj;
};

export const JsonbWhere = (
	path: string | string[],
	operator: '=' | '!=' | 'LIKE' | 'ILIKE' | '>' | '<' | '>=' | '<=' = '=',
	value: any,
	castTo?: 'int' | 'float' | 'bool' | 'text'
) => {
	const pathExpr =
		Array.isArray(path) && path.length > 1
			? path.map((p, i, arr) => (i === arr.length - 1 ? `->>'${p}'` : `->'${p}'`)).join('')
			: typeof path === 'string'
				? `->>'${path}'`
				: '';

	const cast = castTo ? `::${castTo}` : '';

	return Raw((alias) => `${alias}${pathExpr}${cast} ${operator} :value`, { value });
};
