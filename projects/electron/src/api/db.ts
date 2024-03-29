import { Schema, model } from 'mongoose';

interface IUser {
    name: string;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true }
});

const User = model<IUser>('User', userSchema);

export default {
    testData(): string {
        const user = new User({
            name: 'testowy'
        });
        user.save();

        return 'dbTestData';
    }
}