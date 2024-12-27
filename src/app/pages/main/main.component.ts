import { Component } from '@angular/core';
import { HeaderComponent } from "../../components/header/header.component";
import { SidenavComponent } from "../../components/sidenav/sidenav.component";
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [HeaderComponent, SidenavComponent, RouterOutlet, CommonModule],
  template: `
    <div class="min-h-screen bg-gray-50">
      <app-header></app-header>
      <div class="flex">
        <app-sidenav></app-sidenav>
        <main class="flex-1 p-4">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styleUrl: './main.component.scss'
})
export class MainComponent {


}
