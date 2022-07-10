import { Types } from 'mongoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';

export class Entity extends TimeStamps implements Base {
    _id!: Types.ObjectId

    id!: string
}
