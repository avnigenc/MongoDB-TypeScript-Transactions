import { Entity } from '../Mongo/Entity';
import { OrderStatus } from './OrderStatus';
import { OrderedProduct } from '../Products/OrderedProduct';
import { Guid } from '../Utils/Guid';
import { prop } from '@typegoose/typegoose';


export class Order extends Entity {
    @prop()
    public OrderId: string;

    @prop()
    public CustomerId?: string;

    @prop()
    public ProductsAndQuantity?: OrderedProduct[];

    @prop()
    public Transactions: string[];

    @prop()
    public Status: OrderStatus;

    constructor(customerId?: string, products?: OrderedProduct[]) {
        super();
        this.OrderId = Guid.NewGuid();
        this.Status = OrderStatus.Pending;
        this.Transactions = [];
        this.CustomerId = customerId;
        this.ProductsAndQuantity = products;
    }
}
