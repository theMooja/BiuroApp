import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export default {
    restoreIds(col: Array<mongoose.Document>) {
        for (let val of col) {
            val._id = val.id;
        }
    }
}