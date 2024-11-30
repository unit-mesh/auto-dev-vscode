import { type interfaces, LazyServiceIdentifier } from 'inversify';

export type Newable<T> = interfaces.Newable<T>;

export type ServiceIdentifier<T> = interfaces.ServiceIdentifier<T>;

export type FactoryFunction<T> = () => interfaces.ServiceIdentifier<T>;

export type ServiceDescriptor<T> = T | LazyServiceIdentifier<T> | FactoryFunction<T>;

export { LazyServiceIdentifier };

export interface ServicesAccessor {
	get<T>(id: ServiceIdentifier<T>): T;
}

const _registry: [ServiceIdentifier<unknown>, ServiceDescriptor<unknown>][] = [];

export function registerSingleton<T>(id: ServiceIdentifier<T>, useValue: T | LazyServiceIdentifier<T>): void;
export function registerSingleton<T>(id: ServiceIdentifier<T>, useFactory: FactoryFunction<T>): void;
export function registerSingleton<T>(
	id: ServiceIdentifier<T>,
	useClass: Newable<T>,
	supportsDelayedInstantiation: true,
): void;
export function registerSingleton<T>(
	id: ServiceIdentifier<T>,
	ctorOrDescriptor: T | LazyServiceIdentifier<T> | Newable<T> | FactoryFunction<T>,
	supportsDelayedInstantiation?: boolean,
): void {
	if (ctorOrDescriptor instanceof LazyServiceIdentifier) {
		_registry.push([id, ctorOrDescriptor]);
		return;
	}

	if (typeof ctorOrDescriptor === 'function' && supportsDelayedInstantiation) {
		_registry.push([id, new LazyServiceIdentifier<T>(() => ctorOrDescriptor as Newable<T>)]);
		return;
	}

	_registry.push([id, ctorOrDescriptor]);
}

export function getSingletonServiceDescriptors(): [ServiceIdentifier<unknown>, ServiceDescriptor<unknown>][] {
	return _registry;
}
