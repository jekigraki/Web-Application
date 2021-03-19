import mongoose from 'mongoose';
import { Proizvod } from './proizvod.model';

const Schema = mongoose.Schema;

let Narudzbina = new Schema({
    proizvod: {
        type: Array<Proizvod>()
    },
    kupac: {
        type: Object
    },
    
    datum: {
        type: Date
    },
    naCekanju: {
        type: Array<String>()
    },
    rasadnik: {
        type : Object
    }
});

export default mongoose.model('Narudzbina', Narudzbina);