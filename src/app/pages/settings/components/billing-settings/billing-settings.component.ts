import { Component, OnInit } from "@angular/core";
import { DialogModule } from 'primeng/dialog';
import { InvoicePreviewComponent } from '../invoice-preview/invoice-preview.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { MessageService } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { DropdownModule } from "primeng/dropdown";
import { FileUploadModule } from "primeng/fileupload";
import { InputNumberModule } from "primeng/inputnumber";
import { InputSwitchModule } from "primeng/inputswitch";
import { InputTextModule } from "primeng/inputtext";
import { ToastModule } from "primeng/toast";
import { SettingsService } from "../../services/settings.service";
import { Editor } from 'primeng/editor';

@Component({
  selector: 'app-billing-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    InputSwitchModule,
    DropdownModule,
    Editor,
    FileUploadModule,
    ToastModule,
    DialogModule,
    InvoicePreviewComponent
  ],
  templateUrl: 'billing-settings.component.html'
})
export class BillingSettingsComponent implements OnInit {
  paymentForm!: FormGroup;
  invoiceForm!: FormGroup;
  showPreview = false;
  savingPayment = false;
  savingInvoice = false;

  logoPreview: string | null = null;

  paypalEnvironments = [
    { label: 'Sandbox', value: 'sandbox' },
    { label: 'Production', value: 'production' }
  ];

  currencies = [
    { label: 'USD ($)', value: 'USD' },
    { label: 'EUR (€)', value: 'EUR' },
    { label: 'GBP (£)', value: 'GBP' },
    { label: 'JPY (¥)', value: 'JPY' }
  ];

  constructor(
    private fb: FormBuilder,
    private settingsService: SettingsService,
    private messageService: MessageService
  ) {
    this.initializeForms();
  }

  ngOnInit() {
    this.loadSettings();
  }

  private initializeForms() {
    this.paymentForm = this.fb.group({
      // Online payment gateways
      stripeEnabled: [false],
      stripe: this.fb.group({
        publicKey: [''],
        secretKey: [''],
        webhookSecret: ['']
      }),
      paypalEnabled: [false],
      paypal: this.fb.group({
        clientId: [''],
        secretKey: [''],
        environment: ['sandbox']
      }),
      // Offline methods
      cashEnabled: [true],
      bankTransferEnabled: [true]
    });

    this.invoiceForm = this.fb.group({
      prefix: ['INV'],
      startingNumber: [1000],
      defaultDueDays: [30],
      defaultCurrency: ['USD'],
      taxName: ['VAT'],
      defaultTaxRate: [0],
      taxEnabled: [true],
      headerText: [''],
      footerText: [''],
      terms: [''],
      emailSubject: ['Invoice #{invoice_number} from {hospital_name}'],
      emailBody: ['']
    });
  }

  private loadSettings() {
    this.settingsService.getBillingSettings().subscribe({
      next: (settings) => {
        if (settings.payment) {
          this.paymentForm.patchValue(settings.payment);
        }
        if (settings.invoice) {
          this.invoiceForm.patchValue(settings.invoice);
        }
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load billing settings'
        });
      }
    });
  }


 onLogoUpload(event: any) {
    const file = event.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.logoPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }


  savePaymentSettings() {
    if (this.paymentForm.invalid) return;

    this.savingPayment = true;
    this.settingsService.updateBillingSettings({
      payment: this.paymentForm.value
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Payment settings updated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update payment settings'
        });
      },
      complete: () => {
        this.savingPayment = false;
      }
    });
  }

  saveInvoiceSettings() {
    if (this.invoiceForm.invalid) return;

    this.savingInvoice = true;
    this.settingsService.updateBillingSettings({
      invoice: this.invoiceForm.value
    }).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Invoice settings updated successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update invoice settings'
        });
      },
      complete: () => {
        this.savingInvoice = false;
      }
    });
  }

  previewTemplate() {
    this.showPreview = true;
  }

  getPreviewSettings() {
    return {
      ...this.invoiceForm.value,
      hospitalName: 'Sample Hospital Name',
      logo: this.logoPreview,
      address: {
        street: '123 Hospital Street',
        city: 'Medical City',
        state: 'HC',
        postalCode: '12345',
        country: 'United States'
      },
      bankDetails: {
        bankName: 'Medical Bank',
        accountNumber: 'XXXX-XXXX-XXXX-1234'
      }
    };
  }

  downloadPreview() {
    // Implement PDF download functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Download',
      detail: 'Downloading invoice template preview...'
    });

    // Here you would call your service to generate and download PDF
  }

  sendTestEmail() {
    // Implement test email functionality
    this.messageService.add({
      severity: 'info',
      summary: 'Test Email',
      detail: 'Sending test invoice email...'
    });

    // Here you would call your service to send a test email
    this.settingsService.sendTestInvoiceEmail().subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Test invoice email sent successfully'
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to send test invoice email'
        });
      }
    });
  }
}
