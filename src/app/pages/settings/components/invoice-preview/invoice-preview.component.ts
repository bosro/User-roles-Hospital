import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { DialogModule } from "primeng/dialog";

@Component({
  selector: 'app-invoice-preview',
  standalone: true,
  imports: [CommonModule, ButtonModule, DialogModule],
  templateUrl: 'invoice-preview.component.html'
})
export class InvoicePreviewComponent {
  @Input() settings: any;
  
  mockData = {
    invoiceNumber: '1001',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    patientName: 'John Doe',
    patientId: 'P123456',
    patientAddress: '123 Main St, Anytown, ST 12345',
    items: [
      {
        description: 'General Consultation',
        code: 'CONS001',
        quantity: 1,
        unitPrice: 150.00
      },
      {
        description: 'Blood Test',
        code: 'LAB001',
        quantity: 2,
        unitPrice: 75.00
      },
      {
        description: 'X-Ray',
        code: 'RAD001',
        quantity: 1,
        unitPrice: 250.00
      }
    ],
    subtotal: 550.00,
    tax: 55.00,
    discount: 25.00,
    total: 580.00,
    notes: 'Patient follow-up scheduled for next month.'
  };
}

