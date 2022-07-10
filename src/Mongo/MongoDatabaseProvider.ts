import { connect } from 'mongoose';
import MongoUrlBuilder, { MongoUriBuilderConfig } from 'mongo-uri-builder';
import { buildSchema } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';

export class MongoDatabaseProvider {
  private readonly connectionString: Partial<MongoUriBuilderConfig> | undefined;

  constructor(_connectionString: Partial<MongoUriBuilderConfig>) {
    this.connectionString = _connectionString;
  }

  public async Init() {
    const mongoUrl = MongoUrlBuilder({ database: this.connectionString?.database });
    return connect(mongoUrl);
  }

  public async GetMongoCollection<T extends AnyParamConstructor<T>>(collectionClass: T) {
    return buildSchema(collectionClass);
  }
}
