import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [MenuModule],
  template: `
    <div class="w-64 bg-white shadow-sm h-[calc(100vh-4rem)]">
      <div class="p-4">
        <p-menu [model]="menuItems" [styleClass]="'w-full border-none'"></p-menu>
      </div>
    </div>
  `
})
export class SidenavComponent {
  @Input() menuItems: MenuItem[] = [];
}