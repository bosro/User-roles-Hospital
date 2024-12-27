import { Component, EventEmitter, Input, Output } from "@angular/core";
import { User } from "../../models/user.model";
import { ButtonModule } from "primeng/button";
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ConfirmationService } from "primeng/api";

@Component({
  selector: 'app-bulk-actions',
  standalone: true,
  imports: [
    ButtonModule,
    SelectModule,
    DialogModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: 'bulk-actions.component.html'
})
export class BulkActionsComponent {
  @Input() selectedUsers: User[] = [];
  @Output() actionComplete = new EventEmitter<void>();

  statuses = [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
    { label: 'Pending', value: 'pending' },
    { label: 'Blocked', value: 'blocked' }
  ];

  roles = [
    { label: 'Admin', value: 'admin' },
    { label: 'Doctor', value: 'doctor' },
    { label: 'Nurse', value: 'nurse' },
    { label: 'Staff', value: 'staff' }
  ];

  departments = [
    { label: 'Cardiology', value: 'cardiology' },
    { label: 'Neurology', value: 'neurology' },
    { label: 'Pediatrics', value: 'pediatrics' },
    { label: 'Orthopedics', value: 'orthopedics' }
  ];

  bulkActions = [
    { label: 'Change Status', value: 'status' },
    { label: 'Change Role', value: 'role' },
    { label: 'Change Department', value: 'department' },
    { label: 'Delete Users', value: 'delete' },
    { label: 'Export Selected', value: 'export' }
  ];

  selectedAction: string | null = null;
  showBulkEditDialog = false;
  bulkEditData: any = {};

  constructor(private confirmationService: ConfirmationService) {}

  getBulkActionHeader(): string {
    switch (this.selectedAction) {
      case 'status': return 'Change Status';
      case 'role': return 'Change Role';
      case 'department': return 'Change Department';
      default: return 'Bulk Edit';
    }
  }

  confirmBulkEdit() {
    if (!this.bulkEditData[this.selectedAction!]) return;
    
    const userIds = this.selectedUsers.map(user => user.id);
    this.showBulkEditDialog = false;
    this.actionComplete.emit();
  }

  applyBulkAction() {
    if (!this.selectedAction) return;

    switch (this.selectedAction) {
      case 'delete':
        this.confirmBulkDelete();
        break;
      case 'export':
        this.exportUsers();
        break;
      default:
        this.showBulkEditDialog = true;
    }
  }

  private confirmBulkDelete() {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${this.selectedUsers.length} users?`,
      accept: () => {
        this.actionComplete.emit();
      }
    });
  }

  private exportUsers() {
    this.actionComplete.emit();
  }
}