import { Container } from 'typedi';
import { model } from 'mongoose';
import { addModelToTypegoose } from '@typegoose/typegoose';
import { ICommandProcessor } from '../Commands/ICommandProcessor';

export class ServicesContainer {
  public static RegisterService<T>(serviceName: string, instance: T): void {
    Container.set(serviceName, instance);
  }

  public static RegisterCollection<T1, T2>(collectionName: string, collectionSchema: T1, collectionClass: T2): void {
    // @ts-ignore
    Container.set(collectionName, addModelToTypegoose(model(collectionName, collectionSchema), collectionClass));
  }

  public static RegisterCommandProcessors(commandProcessors: ICommandProcessor[]): void {
    Container.set('CommandProcessors', commandProcessors);
  }

  static GetService<T>(serviceName: string): T {
    const requestedServiceObject = Container.get(serviceName);
    const requestedService = requestedServiceObject as T;

    if (requestedService === null || requestedService === undefined) throw new Error('Requested service is was not registered');

    return requestedService;
  }
}
