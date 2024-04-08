import { Schema, model } from 'mongoose';

interface IUser {
    name: string;
}

const userSchema = new Schema<IUser>({
    name: { type: String, required: true }
});

const User = model<IUser>('User', userSchema);

export default {
    testData(name: string): string {
        const user = new User({
            name: name
        });
        user.save();

        return 'dbTestData';
    }
}