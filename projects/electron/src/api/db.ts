import User from './Model/User';
import March from './Model/March';
import Client from './Model/Client.ts';

export default {
    User: { ...User },
    March: { ...March },
    Client: { ...Client }
}