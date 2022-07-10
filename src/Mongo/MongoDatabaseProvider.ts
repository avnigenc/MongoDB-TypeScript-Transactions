import { connect } from 'mongoose';
import MongoUrlBuilder, { MongoUriBuilderConfig } from 'mongo-uri-builder';
import { buildSchema } from '@typegoose/typegoose';
import { AnyParamConstructor } from '@typegoose/typegoose/lib/types';

export class MongoDatabaseProvider {

    private readonly _connectionString: Partial<MongoUriBuilderConfig> | undefined;

    constructor(connectionString: Partial<MongoUriBuilderConfig>) {
        this._connectionString = connectionString;
    }

    public async Init() {
        const mongoUrl = MongoUrlBuilder({ database: this._connectionString?.database });
        const mongoose = await connect(mongoUrl);
        return mongoose;
    }

    public async GetMongoCollection<T extends AnyParamConstructor<T>>(collectionClass: T) {
        return buildSchema(collectionClass);
        // return getModelForClass(collectionClass);
    }
}
