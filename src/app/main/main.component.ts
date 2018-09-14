import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.css']
})
export class MainComponent implements OnInit {
  output: object;
  welcomeText: string;
  constructor(private activatedRoute: ActivatedRoute) {
    // use angular's activated route to get params from Orders page
    this.activatedRoute.params.subscribe((params) => {
      this.output = params;
      if (params.name) {
        this.convertNameToDisplay(params.name);
      }
    });
  }

  ngOnInit() {

  }

  // convert name passed from the Orders page to <First Name> <Last Name> and display text
  convertNameToDisplay(name: string) {
    const commaIndex = name.indexOf(', ') !== -1 ? name.indexOf(', ') : null;
    let lastName = '';
    let firstName = '';

    if (commaIndex) {
      lastName = name.slice(0, commaIndex);
      firstName = name.slice(commaIndex + 1, name.length);
      this.welcomeText = `Welcome ${firstName} ${lastName}. Here is your order details!`;
      return this.welcomeText;
    }
  }

}
