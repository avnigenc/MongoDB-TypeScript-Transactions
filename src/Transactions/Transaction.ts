import { ICommand } from '../Commands/ICommand';
import { TransactionStatus } from './TransactionStatus';
import { Entity } from '../Mongo/Entity';
import { Guid } from '../Utils/Guid';
import { prop } from '@typegoose/typegoose';

export class Transaction extends Entity {
    @prop()
    public TransactionId: string;

    @prop()
    public TimeStamp: number;

    @prop()
    public Status: TransactionStatus;

    @prop()
    public Commands?: ICommand[];

    constructor() {
        super();
        this.TransactionId = Guid.NewGuid();
        this.TimeStamp = Date.now();
        this.Status = TransactionStatus.Pending;
    }
}

