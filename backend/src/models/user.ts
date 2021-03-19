import mongoose from 'mongoose';
import { Poslovanje } from './poslovanje.model';

const Schema = mongoose.Schema;

let User = new Schema({
    ime: {
        type: String
    },
    prezime: {
        type: String
    },
    username: {
        type: String
    },
    password: {
        type: String
    },
    rodjendan: {
        type: String
    },
    mesto: {
        type: String
    },
    telefon: {
        type: String
    },
    mail: {
        type: String
    },
    approved: {
        type: String
    },
    kuriri: {
        type: Array<boolean>()
    },
    poslovanje : {
        type: Array<Poslovanje>()
    }
});

export default mongoose.model('User', User);