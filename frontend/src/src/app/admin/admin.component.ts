import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '../users.service';
import { User } from '../user.model';
import { Poslovanje } from '../poslovanje.model';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {

  constructor(private router: Router, private service: UsersService) { }

  ngOnInit() {
    this.listaZahteva();
    this.listaKorisnika();
  }

  mojizahtevi: any;
  mojikorisnici: any;

  messagePassword: String;

  ime: String;
  prezime: String;
  username: String;
  password: String;
  rodjendan: String;
  mesto: String;
  telefon: String;
  mail: String;
  approved: String;
  potvrda: String;

  messageUser: String;
  porukaPotvrda: String;

  listaZahteva(): void {
    this.service.listaZahteva().subscribe(data => {
      this.mojizahtevi = data;
    })
  }

  listaKorisnika(): void {
    this.service.listaKorisnika().subscribe(data => {
      this.mojikorisnici = data;
    })
  }

  obrisiKorisnika(username: string): void {
    this.service.obrisiKorisnika(username).subscribe(res => {
      if (res['user'] == 'ok') {
        alert("Korisnik uspešno obrisan.");
        window.location.reload(true);
      }
    })
  }

  dodajKorisnika(username: string): void {
    this.service.dodajKorisnika(username).subscribe(res => {
      if (res['user'] == 'ok') {
        alert("Korisnik uspešno dodat.");
        window.location.reload(true);
      }
    })
  }

  azurirajKorisnika(user: User): void {
    if (!user.password.match(/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{7,}$/)) {
      this.messagePassword = "Pogrešan format lozinke.";
    }
    else {
      this.service.azurirajKorisnika(user).subscribe(res => {
        if (res['poruka'] == 'ok') {
          alert("Uspešno ažurirano.");
          window.location.reload(true);
        }
      })
    }
  }

  kuriri : any;
  registrujKorisnika(): void {
    if (this.password != this.potvrda) {
      this.porukaPotvrda = "Potvrda lozinke se mora poklapati sa samom lozinkom. Pokušajte ponovo."
    }
    else {
      this.approved = 'ok';
      if(this.telefon){
        this.kuriri=new Array<boolean>(5);
        for(let i=0;i<this.kuriri.length;i++)
        {
          this.kuriri[i]=true;
        }
      }
      let p = new Array<Poslovanje>();
      this.service.registracija(this.ime, this.prezime, this.username, this.password, this.rodjendan, this.mesto, this.telefon, this.mail,  this.kuriri,p, this.approved).subscribe(
        poruka => {
          if (poruka['poruka'] == 'korisnicko ime postoji') this.messageUser = "Korisnik sa datim korisničkim imenom već postoji.";
          else if (poruka['poruka'] == 'ok') {
            alert("Korisnik registrovan.");
            window.location.reload(true);
          }
        })
    }
  }


}
