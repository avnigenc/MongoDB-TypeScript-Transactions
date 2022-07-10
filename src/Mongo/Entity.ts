import { Types } from 'mongoose';
import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { modelOptions } from '@typegoose/typegoose';

@modelOptions({
  schemaOptions: {
    timestamps: {
      createdAt: 'CreatedAt',
      updatedAt: 'UpdatedAt',
    },
    toJSON: {
      virtuals: true,
    },
    versionKey: false,
  },
})
export class Entity extends TimeStamps implements Base {
  _id!: Types.ObjectId;

  id!: string;
}
