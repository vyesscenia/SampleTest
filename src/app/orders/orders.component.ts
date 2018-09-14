import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FlexModalService } from '../shared-components/flex-modal/flex-modal.service';
import { Http } from '@angular/http';

export interface IOrder {
  pid?: string;
  description?: string;
  price?: number;
  inventory?: number;
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
  constructor(
    private router: Router,
    private flexModal: FlexModalService,
    private http: Http
  ) {

  }

  async ngOnInit() {
    this.orderCopy = <Array<IOrder>>await this.readFile();
  }

  // Calculate total and perform input validation
  calculateTotal(orders: Array<IOrder>) {
    const subTotal = orders.reduce((acc: number, item: IOrder, it: number, arr: Array<IOrder>) => {
      acc += item.price * item.quantity;
      return acc;
    }, 0);
    const taxAmount = subTotal * .10;
    const total = subTotal + taxAmount;
    if (this.name && subTotal && total && taxAmount && this.name.indexOf(', ') !== -1) {
      this.router.navigate(['main', {
        subTotal: subTotal,
        total: total,
        taxAmount: taxAmount,
        name: this.name
      }]);
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
    return {
      subTotal: subTotal,
      total: total,
      taxAmount: taxAmount,
      name: this.name
    };
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
        clearedOrder[item] = null;
      });
      return clearedOrder;
    });
  }

  showModal(modalID) {
    this.flexModal.openDialog(modalID);
  }

  // Add items 'P414', 'T208' and 'B101' to list when corresponding button is clicked
  addItem(pid: string) {
    switch (pid) {
      case 'P414':
        this.orders.unshift({
          pid: 'P414',
          description: '1/4 Pipe',
          price: 12.00,
          inventory: 30,
          quantity: 1
        });
        break;
      case 'T208':
        this.orders.unshift({
          pid: 'T208',
          description: '3/8 T Joint',
          price: 64.00,
          inventory: 74,
          quantity: 1
        });
        break;
      case 'B101':
        this.orders.unshift({
          pid: 'B101',
          description: 'Break Disk A',
          price: 85.00,
          inventory: 98,
          quantity: 1
        });
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
