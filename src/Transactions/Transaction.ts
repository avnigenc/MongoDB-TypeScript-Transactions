import { prop } from '@typegoose/typegoose';
import { Types } from 'mongoose';
import { ICommand } from '../Commands/ICommand';
import { TransactionStatus } from './TransactionStatus';
import { Entity } from '../Mongo/Entity';
import { Guid } from '../Utils/Guid';

export class Transaction extends Entity {
  @prop()
  public TransactionId: string;

  @prop()
  public TransactionActionDate: Date;

  @prop()
  public Status: TransactionStatus;

  @prop()
  public Commands?: ICommand[];

  constructor() {
    super();
    this._id = new Types.ObjectId();
    this.TransactionId = Guid.NewGuid();
    this.TransactionActionDate = new Date();
    this.Status = TransactionStatus.Pending;
  }
}
