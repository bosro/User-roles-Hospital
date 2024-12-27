import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { TreeNode } from "primeng/api";
import { ButtonModule } from "primeng/button";
import { ToastModule } from "primeng/toast";
import { CommonModule } from "@angular/common";
import { TreeTableModule } from 'primeng/treetable';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';

interface PermissionNode extends TreeNode {
  data: {
    [key: string]: boolean;
  };
  children?: PermissionNode[];
  parent?: PermissionNode;
}

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    TreeTableModule,
    CheckboxModule,
    ButtonModule,
    CardModule,
    ToastModule,
    DialogModule,
    FormsModule
  ],
  templateUrl: 'permission-management.component.html'
})
export class PermissionManagementComponent {
  permissionNodes: PermissionNode[] = [
    {
      label: 'Patient Management',
      data: { admin: true, doctor: true, nurse: true },
      children: [
        {
          label: 'View Patients',
          data: { admin: true, doctor: true, nurse: true }
        },
        {
          label: 'Add/Edit Patients',
          data: { admin: true, doctor: true, nurse: false }
        }
      ]
    }
  ];

  roles: string[] = ['admin', 'doctor', 'nurse', 'staff'];
  saving = false;
  displayAddRoleDialog = false;

  constructor(private messageService: MessageService) {}

  showAddRoleDialog() {
    this.displayAddRoleDialog = true;
  }

  savePermissions() {
    this.saving = true;
    // Implement your save logic here
    setTimeout(() => {
      this.saving = false;
      this.messageService.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Permissions saved successfully'
      });
    }, 1000);
  }

  onPermissionChange(node: PermissionNode, role: string) {
    this.updateChildPermissions(node, role);
    if (node.parent) {
      this.updateParentPermissions(node.parent, role);
    }
  }

  private updateChildPermissions(node: PermissionNode, role: string) {
    if (node.children) {
      node.children.forEach(child => {
        child.data[role] = node.data[role];
        this.updateChildPermissions(child, role);
      });
    }
  }

  private updateParentPermissions(node: PermissionNode, role: string) {
    if (!node) return;
    
    if (node.children) {
      node.data[role] = node.children.every(child => child.data[role]);
    }
    
    if (node.parent) {
      this.updateParentPermissions(node.parent, role);
    }
  }
}