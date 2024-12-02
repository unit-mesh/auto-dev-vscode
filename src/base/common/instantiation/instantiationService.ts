import { Container, type interfaces, LazyServiceIdentifier } from 'inversify';



import { isDisposable } from '../lifecycle';
import { getSingletonServiceDescriptors, type ServiceIdentifier } from './instantiation';


export const providerContainer = new Container();

export class InstantiationService {
	private readonly _services = new Set<ServiceIdentifier<unknown>>();
	private _isDisposed: boolean = false;

	constructor() {
		for (const [identifier, descriptor] of getSingletonServiceDescriptors()) {
			const binding = providerContainer.bind(identifier);

			if (descriptor instanceof LazyServiceIdentifier) {
				binding.toDynamicValue(() => descriptor.unwrap()).inSingletonScope();
			} else {
				binding.toConstantValue(descriptor);
			}
		}
	}

	registerInstance<T>(id: ServiceIdentifier<T>, value: T): T {
		this._throwIfDisposed();

		if (providerContainer.isBound(id)) {
			throw new Error(`[registerInstance] service '${id.toString()}' already registered`);
		}

		const binding = providerContainer.bind(id);

		binding.toConstantValue(value);

		this._services.add(id);

		return value;
	}

	registerSingleton<T>(id: interfaces.ServiceIdentifier<T>, value: T): T;
	registerSingleton<T>(id: interfaces.Newable<T>): T;
	registerSingleton<T>(id: ServiceIdentifier<T>, ctor: interfaces.Newable<T>): T;
	registerSingleton<T>(id: ServiceIdentifier<T> | interfaces.Newable<T>, ctor?: interfaces.Newable<T>): T {
		this._throwIfDisposed();
		return this._getOrCreateInstance(id, ctor);
	}

	get<T>(id: ServiceIdentifier<T>): T {
		this._throwIfDisposed();

		const result = providerContainer.get(id);

		if (!result) {
			throw new Error(`[get] unknown service '${id.toString()}'`);
		}

		return result;
	}

	dispose(): void {
		if (this._isDisposed) {
			return;
		}
		this._isDisposed = true;

		const services = this._services;

		// Dispose all services that are disposable
		services.forEach(service => {
			const instance = providerContainer.get(service);
			if (isDisposable(instance)) {
				instance.dispose();
			}
		});

		services.clear();
		providerContainer.unbindAll();
	}

	private _getOrCreateInstance<T>(id: ServiceIdentifier<T> | interfaces.Newable<T>, ctor?: interfaces.Newable<T>) {
		if (providerContainer.isBound(id)) {
			return providerContainer.get(id);
		}

		const binding = providerContainer.bind(id);

		this._services.add(id);

		if (ctor) {
			if (typeof ctor === 'function') {
				binding.to(ctor).inSingletonScope();
			} else {
				binding.toConstantValue(ctor);
			}
		} else {
			binding.toSelf().inSingletonScope();
		}

		return providerContainer.get(id);
	}

	private _throwIfDisposed(): void {
		if (this._isDisposed) {
			throw new Error('InstantiationService has been disposed');
		}
	}
}