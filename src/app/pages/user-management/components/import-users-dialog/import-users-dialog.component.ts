import { CommonModule } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { ButtonModule } from "primeng/button";
import { FileUpload, FileUploadModule } from "primeng/fileupload";
import { ProgressBarModule } from "primeng/progressbar";
import { ImportResult, UserService } from "../../services/user.service";
import { Message } from 'primeng/message';

@Component({
  selector: 'app-import-users-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FileUploadModule,
    ButtonModule,
    ProgressBarModule,
    Message
  ],
  templateUrl: 'import-users-dialog.component.html'
})
export class ImportUsersDialogComponent {
  @ViewChild('fileUpload') fileUpload!: FileUpload;
  
  uploadProgress = 0;
  errorMessage = '';
  importResults: ImportResult | null = null;

  constructor(private userService: UserService) {}

  onFileUpload(event: any) {
    const file = event.files[0];
    this.uploadProgress = 0;
    this.errorMessage = '';
    this.importResults = null;

    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      // this.processCSV(reader.result as string);
    };
  }

  // private processCSV(csv: string) {
  //   this.userService.importUsers(csv).subscribe({
  //     next: (results) => {
  //       this.importResults = results;
  //       this.uploadProgress = 100;
  //       this.fileUpload.clear();
  //     },
  //     error: (error) => {
  //       this.errorMessage = error.message;
  //       this.uploadProgress = 0;
  //     }
  //   });
  // }

  downloadTemplate(event: Event) {
    event.preventDefault();
    // Generate and download CSV template
  }
}