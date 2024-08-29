import { Schema, model } from 'mongoose';
import { IUser } from './../../interfaces';


const schema = new Schema<IUser>({
    name: { type: String, required: true },
    password: { type: String, required: true }
});

const UserModel = model<IUser>('User', schema);

export default {
    UserModel: UserModel,
    async saveUser(data: IUser) {
        let update = await UserModel.findOneAndUpdate(
            { name: data.name },
            { password: data.password },
            { upsert: true, new: true }
        );
        update ?? update.save();
    },

    async getUser(name: string, password: string): Promise<IUser | null> {
        let user = await UserModel.findOne({ name: name, password: password }).lean().exec();

        if (user) {
            return user as IUser;
        }
        return null;
    },

    async getUsers(): Promise<IUser[]> {
        let users = await UserModel.find().lean().exec();

        return users;
    }
}