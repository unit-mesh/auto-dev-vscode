import { type interfaces, LazyServiceIdentifer } from 'inversify';

export type Newable<T> = interfaces.Newable<T>;

export type ServiceIdentifier<T> = interfaces.ServiceIdentifier<T>;

export type FactoryFunction<T> = () => interfaces.ServiceIdentifier<T>;

export type ServiceDescriptor<T> = T | LazyServiceIdentifer<T> | FactoryFunction<T>;

export { LazyServiceIdentifer };

export interface ServicesAccessor {
	get<T>(id: ServiceIdentifier<T>): T;
}

const _registry: [ServiceIdentifier<unknown>, ServiceDescriptor<unknown>][] = [];

export function registerSingleton<T>(id: ServiceIdentifier<T>, useValue: T | LazyServiceIdentifer<T>): void;
export function registerSingleton<T>(id: ServiceIdentifier<T>, useFactory: FactoryFunction<T>): void;
export function registerSingleton<T>(
	id: ServiceIdentifier<T>,
	useClass: Newable<T>,
	supportsDelayedInstantiation: true,
): void;
export function registerSingleton<T>(
	id: ServiceIdentifier<T>,
	ctorOrDescriptor: T | LazyServiceIdentifer<T> | Newable<T> | FactoryFunction<T>,
	supportsDelayedInstantiation?: boolean,
): void {
	if (ctorOrDescriptor instanceof LazyServiceIdentifer) {
		_registry.push([id, ctorOrDescriptor]);
		return;
	}

	if (typeof ctorOrDescriptor === 'function' && supportsDelayedInstantiation) {
		_registry.push([id, new LazyServiceIdentifer<T>(() => ctorOrDescriptor as Newable<T>)]);
		return;
	}

	_registry.push([id, ctorOrDescriptor]);
}

export function getSingletonServiceDescriptors(): [ServiceIdentifier<unknown>, ServiceDescriptor<unknown>][] {
	return _registry;
}
