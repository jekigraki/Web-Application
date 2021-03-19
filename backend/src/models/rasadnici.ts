import mongoose from 'mongoose';
import { Proizvod } from './proizvod.model';

const Schema = mongoose.Schema;

let Rasadnici = new Schema({
    naziv: {
        type: String
    },
    mesto: {
        type: String
    },
    duzina: {
        type: String
    },
    sirina: {
        type: String
    },
    sadnice: {
        type: Array<Array<Proizvod>>()
    },
    zasadjene: {
        type: String
    },
    slobodno: {
        type: String
    },
    voda: {
        type: String
    },
    temperatura: {
        type: String
    },
    vlasnik: {
        type: String
    },
    proizvodi: {
        type: Array<Proizvod>()
    }
});

export default mongoose.model('Rasadnici', Rasadnici);