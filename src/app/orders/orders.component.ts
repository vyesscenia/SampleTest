import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlexModalService } from '../shared-components/flex-modal/flex-modal.service';
import { Http } from '@angular/http';

export interface IOrder {
  pid?: string;
  image?: string;
  description?: string;
  price?: number;
  quantity?: number;
}

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})

export class OrdersComponent implements OnInit {
  public name: string;
  public orders: Array<IOrder> = [];
  private orderCopy: Array<IOrder> = [];
  public errorMessage = '';
  public confirmMessage = '';
  constructor(
    private router: Router,
    private flexModal: FlexModalService,
    private http: Http
  ) {

  }

  async ngOnInit() {
    this.orderCopy = <Array<IOrder>>await this.readFile();
  }

  prepareResults(total: number, subTotal: number, taxAmount: number, name: string) {
    let str = '';
    let fullStr = name;
    let commaIndex = fullStr.indexOf(', ');
    let firstName = fullStr.slice(commaIndex + 1, fullStr.length);
    let lastName = fullStr.slice(0, commaIndex);
    str = 'Thank you for your order' + firstName + ' ' + lastName + '.' +
      ' Your subTotal is: $' + subTotal + '. Your tax amount is: $' + taxAmount + '. Your grand total is: $' + total + '.';
    return str;
  }

  // Calculate total and perform input validation
  calculateTotal(orders: Array<IOrder>) {
    const subTotal = orders.reduce((acc: number, item: IOrder) => acc += item.price * item.quantity, 0);
    const taxAmount = subTotal * .10;
    const total = subTotal + taxAmount;
    if (this.name && subTotal && total && taxAmount && this.name.indexOf(', ') !== -1) {
      this.confirmMessage = this.prepareResults(total, subTotal, taxAmount, this.name);
      this.showModal('confirm-modal');
    } else {
      const nameError = !this.name;
      const calcError = !subTotal || !total || !taxAmount;
      switch (true) {
        case nameError && calcError:
          this.errorMessage = 'Name and calculation must be made before moving forward!';
          break;
        case nameError:
          this.errorMessage = 'First Name, Last Name must be defined!';
          break;
        case calcError:
          this.errorMessage = 'Must calculate before submit!';
          break;
        case this.name.indexOf(', ') === -1:
          this.errorMessage = 'Must have a comma and a space in the name!';
          break;
      }
      this.showModal('error-modal');
    }
  }

  display() {
    this.clear();
    this.orders = JSON.parse(JSON.stringify(this.orderCopy));
  }

  // Clear the orders form
  clear() {
    this.orders = this.orders.map((order: IOrder) => {
      const clearedOrder: IOrder = {};
      Object.keys(order).forEach((item) => {
        item != 'image' ? order[item] = null : false;
      });
      return order;
    });
  }

  showModal(modalID) {
    this.flexModal.openDialog(modalID);
  }

  // Add items 'Hot Dog', 'Hamberger' and 'Pizza' to list when corresponding button is clicked
  addItem(pid: string) {
    switch (pid) {
      case '1':
        this.orders.unshift({ pid: '1', image: 'assets/sm_hotdog.jpeg', description: 'Hot Dog', price: 5.00, quantity: 1 });
        break;
      case '2':
        this.orders.unshift({ pid: '2', image: 'assets/sm_hamberger.jpeg', description: 'Hamberger', price: 6.00, quantity: 1 });
        break;
      case '3':
        this.orders.unshift({ pid: '3', image: 'assets/sm_pizza.jpeg', description: 'Large Pizza', price: 12.00, quantity: 1 });
        break;
    }
  }

  // delete line item (order) when delete button is click
  removeItem(index: number) {
    this.orders.splice(index, 1);
  }

  // read in the orders.json file and populate the list table with the initial orders (3)
  readFile() {
    return new Promise((resolve) => {
      this.http.get('assets/orders.json')
        .subscribe((resp) => {
          resolve(resp.json());
        });
    });
  }
}
