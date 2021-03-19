import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import User from './models/user';
import Rasadnici from './models/rasadnici';
import Proizvod from './models/proizvodi';
import Narudzbina from './models/narudzbina';
import narudzbina from './models/narudzbina';
import request from 'request';

const app = express();

app.use(cors());
app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/users');

const connection = mongoose.connection;

connection.once('open', () => {
    console.log('mongo open');
})

const router = express.Router();

setInterval(() => {
    Rasadnici.find({}, (err, res) => {
        if (err) console.log(err);
        else {
            let rasadnici: any;
            rasadnici = res;
            for (let i = 0; i < rasadnici.length; i++) {
                let voda = parseInt(rasadnici[i].voda) - 1;
                let temperatura = parseInt(rasadnici[i].temperatura) - 0.5;
                let naziv = rasadnici[i].naziv;
                Rasadnici.updateOne({ 'naziv': naziv }, { $set: { 'voda': voda, 'temperatura': temperatura } }, (err, doc) => {
                    if (err) console.log(err);
                });
            }
        }
    })
}, 3600 * 1000);


setInterval(() => {
    Rasadnici.find({}, (err, res) => {
        if (err) console.log(err);
        else {
            let rasadnici: any;
            rasadnici = res;
            var i = 0;
            while (rasadnici[i]) {
                for (let j = 0; j < rasadnici[i].sadnice.length; j++) {
                    for (let k = 0; k < rasadnici[i].sadnice[j].length; k++) {
                        if (rasadnici[i].sadnice[j][k] != null) {
                            rasadnici[i].sadnice[j][k].max = parseInt(rasadnici[i].sadnice[j][k].max) + 1;
                        }
                    }
                }
                let naziv = rasadnici[i].naziv;
                let sadnice = rasadnici[i].sadnice;
                Rasadnici.updateOne({ 'naziv': naziv }, { $set: { 'sadnice': sadnice } }, (err, doc) => {
                    if (err) console.log(err);
                });
                i = i + 1;
            }
        }
    })
}, 24 * 3600 * 1000);


router.route('/changepass').post((req, res) => {
    User.updateOne({ 'username': req.body.username }, { $set: { 'password': req.body.newpass } }, (err, user) => {
        if (err) console.log(err);
        else {
            res.json({ 'user': 'ok' });
        }
    });
})

router.route('/preduzece/poslovanje').post((req, res) => {
    let username = req.body.username;
    let poslovanje = req.body.poslovanje;
    User.updateOne({ 'username': username }, { $set: { 'poslovanje': poslovanje } }, (err, user) => {
        if (err) console.log(err);
        else {
            res.json({ 'user': 'ok' });
        }
    });
})

router.route('/login').post((req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    User.find({ 'username': username, 'password': password }, (err, user) => {
        if (err) console.log(err);
        else res.json(user);
    })
}
);

router.route('/registracija').post(
    (req, res) => {
        let username = req.body.username;
        User.find({ 'username': username }, (err, user) => {
            if (err) console.log(err);
            else {
                if (user[0]) {
                    res.json({ 'poruka': 'korisnicko ime postoji' });
                }
                else {
                    let newuser = new User(req.body);
                    newuser.save().
                        then(user => {
                            res.status(200).json({ 'poruka': 'ok' });
                        }).catch(err => {
                            res.status(400).json({ 'poruka': 'no' });
                        })
                }
            }
        })
    });

router.route('/registracija1').post(
    (req, res) => {

        if (req.body.recaptcha == undefined || req.body.recaptcha == null || req.body.recaptcha == "") {
            return res.json({ 'request': 'recaptcha empty' })
        }

        const secretKey = "6Ld37a8ZAAAAABF9IjGls9-2iE3tXs6IG6vYpaOB";

        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.recaptcha}&remoteip=${req.connection.remoteAddress}`;

        request(verifyUrl, (err, response, body) => {
            body = JSON.parse(body);
            if (body.success !== undefined && !body.success) {
                return res.json({ 'request': 'recaptcha failed' })
            }
            let username = req.body.username;
            User.find({ 'username': username }, (err, user) => {
                if (err) console.log(err);
                else {
                    if (user[0]) {
                        res.json({ 'poruka': 'korisnicko ime postoji' });
                    }
                    else {
                        let newuser = new User(req.body);
                        newuser.save().
                            then(user => {
                                res.status(200).json({ 'poruka': 'ok' });
                            }).catch(err => {
                                res.status(400).json({ 'poruka': 'no' });
                            })
                    }
                }
            })
        })
    });



router.route('/listaKorisnika').get((req, res) => {
    User.find({ 'approved': 'ok' }, (err, user) => {
        if (err) console.log(err);
        else {
            res.json(user);
        }
    })
});

router.route('/listaZahteva').get((req, res) => {
    User.find({ 'approved': "" }, (err, user) => {
        if (err) console.log(err);
        else {
            res.json(user);
        }
    })
});

router.route('/obrisiKorisnika').post((req, res) => {
    let username = req.body.username;
    User.findOneAndDelete({ 'username': username }, (err, user) => {
        if (err) console.log(err);
        else {
            res.json({ 'user': 'ok' });
        }
    });
});

router.route('/dodajKorisnika').post((req, res) => {
    let username = req.body.username;
    User.updateOne({ 'username': username }, { $set: { 'approved': 'ok' } }, (err, user) => {
        if (err) console.log(err);
        else {
            res.json({ 'user': 'ok' });
        }
    });
});

router.route('/shop/narucivan').post((req, res) => {
    let narucivan = req.body.proizvod.narucivan;
    let naziv = req.body.proizvod.naziv;
    let proizvodjac = req.body.proizvod.proizvodjac;
    Proizvod.updateOne({ 'naziv': naziv, 'proizvodjac': proizvodjac }, { $set: { 'narucivan': narucivan } }, (err, user) => {
        if (err) console.log(err);
        else {
            res.json({ 'user': 'ok' });
        }
    });
});

router.route('/azurirajKorisnika').post((req, res) => {
    let username = req.body.user.username;
    User.updateOne({ 'username': username },
        {
            $set: {
                'ime': req.body.user.ime,
                'prezime': req.body.user.prezime,
                'password': req.body.user.password,
                'rodjendan': req.body.user.rodjendan,
                'mesto': req.body.user.mesto,
                'telefon': req.body.user.telefon,
                'mail': req.body.user.mail
            }
        },
        (err, user) => {
            if (err)
                console.log(err);
            else {
                res.json({ 'poruka': 'ok' });
            }
        }
    );
});

router.route('/poljoprivrednik/listaRasadnika').get((req, res) => {
    Rasadnici.find((err, doc) => {
        if (err) console.log(err);
        else {
            res.json(doc);
        }
    })
});

router.route('/poljoprivrednik/dodajRasadnik').post((req, res) => {
    let rasadnik = new Rasadnici(req.body);
    rasadnik.save().
        then(rasadnik => {
            res.status(200).json({ 'poruka': 'ok' });
        }).catch(err => {
            res.status(400).json({ 'poruka': 'no' });
        })
});

router.route('/poljoprivrednik/dodajVodu').post((req, res) => {
    let naziv = req.body.rasadnik.naziv;
    let voda = parseInt(req.body.rasadnik.voda) + 1;
    Rasadnici.updateOne({ 'naziv': naziv }, { $set: { 'voda': voda } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    });
});

router.route('/poljoprivrednik/oduzmiVodu').post((req, res) => {
    let naziv = req.body.rasadnik.naziv;
    let voda = parseInt(req.body.rasadnik.voda) - 1;
    Rasadnici.updateOne({ 'naziv': naziv }, { $set: { 'voda': voda } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    });
});

router.route('/poljoprivrednik/povecajTemp').post((req, res) => {
    let naziv = req.body.rasadnik.naziv;
    let temperatura = parseInt(req.body.rasadnik.temperatura) + 1;
    Rasadnici.updateOne({ 'naziv': naziv }, { $set: { 'temperatura': temperatura } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    });
});

router.route('/poljoprivrednik/smanjiTemp').post((req, res) => {
    let naziv = req.body.rasadnik.naziv;
    let temperatura = parseInt(req.body.rasadnik.temperatura) - 1;
    Rasadnici.updateOne({ 'naziv': naziv }, { $set: { 'temperatura': temperatura } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    });
});

router.route('/poljoprivrednik/infoSadnica').post((req, res) => {
    let rasadnik = req.body.rasadnik;
    Proizvod.find({ 'rasadnik': rasadnik }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json(doc);
        }
    })
});


router.route('/poljoprivrednik/dodajProizvod').post((req, res) => {
    let sadnice = req.body.sadnice;
    let naziv = req.body.rasadnik.naziv;
    let zasadjene = req.body.rasadnik.zasadjene;
    let slobodno = req.body.rasadnik.slobodno;
    Rasadnici.updateOne({ 'naziv': naziv }, { $set: { 'sadnice': sadnice, 'zasadjene': zasadjene, 'slobodno': slobodno } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    })
});

router.route('/poljoprivrednik/otkaziPorudzbinu').post((req, res) => {
    let datum = req.body.narudzbina.datum;
    Narudzbina.findOneAndDelete({ 'datum': datum }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    });
});

router.route('/poljoprivrednik/obrisiProizvod').post((req, res) => {
    let proizvodi = req.body.proizvodi;
    let naziv = req.body.rasadnik.naziv;
    Rasadnici.updateOne({ 'naziv': naziv }, { $set: { 'proizvodi': proizvodi } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    });
});


router.route('/poljoprivrednik/smanjiKolicinu').post((req, res) => {
    let proizvodi = req.body.proizvodi;
    let naziv = req.body.naziv;
    Rasadnici.updateOne({ 'naziv': naziv }, { $set: { 'proizvodi': proizvodi } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    })
});

router.route('/shop/listaProizvoda').get((req, res) => {
    Proizvod.find((err, doc) => {
        if (err) console.log(err);
        else {
            res.json(doc);
        }
    })
});

router.route('/shop/listaNarudzbina').get((req, res) => {
    Narudzbina.find((err, doc) => {
        if (err) console.log(err);
        else {
            res.json(doc);
        }
    })
});


router.route('/komentarisi').post((req, res) => {
    let proizvod = req.body.proizvod;
    let proizvodjac = req.body.proizvodjac;
    let komentar = req.body.komentar;
    let ocena = req.body.ocena;
    Proizvod.updateOne({ 'naziv': proizvod, 'proizvodjac': proizvodjac }, { $set: { 'komentari': komentar, 'ocena': ocena } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    })
});


router.route('/listaKomentara').post((req, res) => {
    let proizvod = req.body.proizvod;
    let proizvodjac = req.body.proizvodjac;
    Proizvod.find({ 'naziv': proizvod, 'proizvodjac': proizvodjac }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json(doc);
        }
    })
});

router.route('/listaRasadnika').post((req, res) => {
    let vlasnik = req.body.vlasnik;
    Rasadnici.find({ 'vlasnik': vlasnik }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json(doc);
        }
    })
});

router.route('/preduzece/dodajProizvod').post((req, res) => {
    let proizvod = new Proizvod(req.body);
    proizvod.save().
        then(proizvod => {
            res.status(200).json({ 'poruka': 'ok' });
        }).catch(err => {
            res.status(400).json({ 'poruka': 'no' });
        })
});

router.route('/preduzece/povuciProizvod').post((req, res) => {
    let naziv = req.body.proizvod.naziv;
    let proizvodjac = req.body.proizvod.proizvodjac;
    Proizvod.findOneAndDelete({ 'naziv': naziv, 'proizvodjac': proizvodjac }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    });
});

router.route('/shop/potvrdiNarudzbinu').post((req, res) => {
    let narudzbina = new Narudzbina(req.body);
    narudzbina.save().
        then(narudzbina => {
            res.status(200).json({ 'poruka': 'ok' });
        }).catch(err => {
            res.status(400).json({ 'poruka': 'no' });
        })
});


router.route('/shop/smanjiKolicinu').post((req, res) => {
    let proizvodjac = req.body.proizvod.proizvodjac;
    let naziv = req.body.proizvod.naziv;
    let kolicina = req.body.proizvod.kolicina;
    //console.log(kolicina);
    Proizvod.updateOne({ 'naziv': naziv, 'proizvodjac': proizvodjac }, { $set: { 'kolicina': kolicina } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    })
});


router.route('/preduzece/odbijNarudzbinu').post((req, res) => {
    let kupac = req.body.proizvod.kupac;
    let datum = req.body.proizvod.datum;
    Narudzbina.findOneAndDelete({ 'kupac': kupac, 'datum': datum }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    });
});


router.route('/preduzece/staviNaCekanje').post((req, res) => {
    let kupac = req.body.narudzbina.kupac;
    let datum = req.body.narudzbina.datum;
    Narudzbina.updateOne({ 'kupac': kupac, 'datum': datum }, { $set: { 'naCekanju': req.body.narudzbina.naCekanju } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    })
});

router.route('/preduzece/zaposliKurira').post((req, res) => {
    let vreme = req.body.vreme;
    let username = req.body.preduzece.username;
    let kuriri = req.body.preduzece.kuriri;
    let i = req.body.i;
    User.updateOne({ 'username': username }, { $set: { 'kuriri': kuriri } }, (err, doc) => {
        if (err) console.log(err);
        else {

            setTimeout(() => {
                User.find({ 'username': username }, (err, rres) => {
                    if (err) console.log(err);
                    else {
                        console.log("timeout")
                        let pred: any;
                        pred = rres;
                        kuriri = pred.kuriri;
                        kuriri[i] = true;
                        console.log("pre update")
                        User.updateOne({ 'username': username }, { $set: { 'kuriri': kuriri } }, (err, doc) => {
                            if (err) console.log(err);
                            else {
                                console.log("kraj");

                            }
                        })
                    }
                })
            }, vreme);
            res.json({ 'doc': 'ok' });
        }
    })


});


router.route('/preduzece/isporuci').post((req, res) => {
    let naziv = req.body.rasadnik.naziv;
    let vlasnik = req.body.rasadnik.vlasnik;
    Rasadnici.updateOne({ 'naziv': naziv, 'vlasnik': vlasnik }, { $set: { 'proizvodi': req.body.rasadnik.proizvodi } }, (err, doc) => {
        if (err) console.log(err);
        else {
            res.json({ 'doc': 'ok' });
        }
    })
});


router.route('/preduzece/nadjiNarudzbinu').post((req, res) => {
    let datum = req.body.datum;
    let proizvod = req.body.narudzbina.proizvod;
    Narudzbina.find({ 'datum': datum }, (err, user) => {
        if (err) console.log(err);
        else {
            let n: any;
            n = user[0];
            var i = 0;
            let max = n.proizvod.length;
            let firma = proizvod[0].proizvodjac;
            let pr = new Array<any>();

            while (i < max) {
                //console.log(i)
                if (n.proizvod[i].proizvodjac != firma) {
                    //console.log(n.proizvod[i].proizvodjac)
                    //pr.splice(i,1);
                    pr.push(n.proizvod[i]);
                }
                i = i + 1;
            }
            n.proizvod = pr;
            //console.log(n.proizvod)
            /* for (let i = 0; i < n.proizvod.length; i++) {
                 for (let j = 0; j < proizvod.length; j++) {
                     console.log("fsffs")
                     console.log(proizvod[j].proizvodjac)
                     if (n.proizvod[i].proizvodjac == proizvod[j].proizvodjac) {                        
                         n.proizvod.splice(i, 1);
                     }
                 }
             }*/
            if (n.proizvod.length == 0) {
                Narudzbina.findOneAndDelete({ 'datum': datum }, (err, cc) => {
                    if (err) console.log(err);
                    else {
                        res.json({ 'cc': 'ok' });
                    }
                });
            } else {
                Narudzbina.updateOne({ 'datum': datum }, { $set: { 'proizvod': n.proizvod } }, (err, doc) => {
                    if (err) console.log(err);
                    else {
                        res.json({ 'doc': 'ok' });
                    }
                })
            }
        }
    })
});


router.route('/shop/dohvatiPreduzece').post((req, res) => {
    let username = req.body.username;
    User.find({ 'username': username }, (err, user) => {
        if (err) console.log(err);
        else {
            res.json(user);
            //console.log(user[0])
        }
    })
}
);



app.use('/', router);
app.listen(4000, () => console.log(`Express server running on port 4000`));