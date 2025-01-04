import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { CardModule } from "primeng/card";
import { TabViewModule } from "primeng/tabview";
import { TagModule } from "primeng/tag";
import { TimelineModule } from "primeng/timeline";
import { User, UserActivity } from "../../models/user.model";
import { UserService } from "../../services/user.service";
import { AvatarModule } from 'primeng/avatar';

@Component({
  selector: 'app-user-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TabViewModule,
    TimelineModule,
    TagModule,
    CardModule,
    ButtonModule,
    AvatarModule
  ],
  templateUrl:'user-view.component.html'
})
export class UserViewComponent {
  @Input() user: User | null = null;
  userActivity: UserActivity[] = [];

  constructor(private userService: UserService) {}

  ngOnInit() {
    if (this.user) {
      this.loadUserActivity();
    }
  }

  private loadUserActivity() {
    if (this.user?.id) {
      this.userService.getUserActivity(this.user.id).subscribe(activities => {
        this.userActivity = activities;
      });
    }
  }

  getUserInitials(): string {
    if (!this.user) return '';
    return `${this.user.firstName.charAt(0)}${this.user.lastName.charAt(0)}`;
  }

  getRoleClass(role?: string): string {
    const classes: { [key: string]: string } = {
      'admin': 'bg-purple-100 text-purple-800',
      'doctor': 'bg-blue-100 text-blue-800',
      'nurse': 'bg-green-100 text-green-800',
      'staff': 'bg-orange-100 text-orange-800',
      'receptionist': 'bg-gray-100 text-gray-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${role ? classes[role] || '' : ''}`;
  }

  getStatusClass(status?: string): string {
    const classes: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'pending': 'bg-yellow-100 text-yellow-800',
      'blocked': 'bg-red-100 text-red-800'
    };
    return `px-2 py-1 rounded-full text-xs font-medium ${status ? classes[status] || '' : ''}`;
  }
}