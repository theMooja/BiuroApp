import User from './Model/User';
import March from './Model/March';
import Client from './Model/Client';
import Stopper from './Model/Stopper';


export default {
    User: { ...User },
    March: { ...March },
    Client: { ...Client },
    Stopper: { ...Stopper }
}