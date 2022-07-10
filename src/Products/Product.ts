import { prop } from '@typegoose/typegoose';
import { Entity } from '../Mongo/Entity';
import { Guid } from '../Utils/Guid';

export class Product extends Entity {
  @prop()
  public ProductId: string;

  @prop()
  public Name?: string;

  @prop()
  public Description?: string;

  @prop()
  public InStockAmount?: number;

  @prop()
  public Transactions: string[];

  constructor() {
    super();
    this.ProductId = Guid.NewGuid();
    this.Transactions = [];
  }
}
