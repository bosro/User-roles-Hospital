// terms.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ButtonModule,
    CardModule,
    DividerModule,
    ScrollPanelModule
  ],
  templateUrl: 'terms-component.component.html',
})
export class TermsComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    // Any initialization logic
  }

  acceptTerms() {
    // Handle terms acceptance
    // Could emit an event, store in localStorage, or make an API call
    this.router.navigate(['/auth/register']);
  }

  // Method to handle printing if needed
  printTerms() {
    window.print();
  }
}