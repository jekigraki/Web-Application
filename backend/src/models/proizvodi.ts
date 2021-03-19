import mongoose from 'mongoose';
import { Komentar } from './komentar.model';

const Schema = mongoose.Schema;

let Proizvodi = new Schema({
    naziv: {
        type: String
    },
    proizvodjac: {
        type: String
    },
    min: {
        type: String
    },
    max: {
        type: String
    },
    napredak: {
        type: String
    },
    rasadnik: {
        type: String
    },
    kolicina: {
        type: String
    },
    tip: {
        type: String
    },
    narucen: {
        type: String
    },
    uputstvo: {
        type: String
    },
    komentari: {
        type: Array<Komentar>()
    },
    narucivan: {
        type: Array<String>()
    },
    cena: {
        type: String
    },
    ocena: {
        type: String
    }

});

export default mongoose.model('Proizvodi', Proizvodi);