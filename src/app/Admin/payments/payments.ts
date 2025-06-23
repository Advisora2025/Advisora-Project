import { Component, OnInit} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Payment } from '../../services/payment';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payments',
  imports: [CommonModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
  standalone: true
})
export class Payments implements OnInit {
  payments: Payment[] = [];

  constructor(private paymentService: PaymentService) {}

  ngOnInit(): void {
    this.fetchPayments();
  }

  fetchPayments(): void {
    this.paymentService.getPayments().subscribe(
      (data) => {
        this.payments = data;
      },
      (error) => {
        console.error('Error fetching payments:', error);
      }
    );
  }

  deletePayment(id: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this payment?');
    if (confirmDelete) {
      this.paymentService.deletePayment(id).subscribe(
        () => {
          this.payments = this.payments.filter(p => p.id !== id);
        },
        (error) => {
          console.error('Error deleting payment:', error);
        }
      );
    }
  }

}
