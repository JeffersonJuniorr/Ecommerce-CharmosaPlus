import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-custom-snack-bar',
  standalone: true,
  imports: [MatProgressBarModule, CommonModule, MatIconModule],
  templateUrl: './custom-snack-bar.component.html',
  styleUrls: ['./custom-snack-bar.component.css']
})
export class CustomSnackBarComponent implements OnInit {
  data = inject(MAT_SNACK_BAR_DATA);
  snackBarRef = inject(MatSnackBarRef);
  progressValue = 100;
  message: string = this.data.message || '';
  type: 'success' | 'error' = this.data.type || 'success';

  ngOnInit() {
    const startTime = Date.now();
    const duration = 4500;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      this.progressValue = Math.max(0, 100 - (elapsed / duration * 100));
      
      if (this.progressValue > 0) {
        requestAnimationFrame(updateProgress);
      } else {
        this.snackBarRef.dismiss();
      }
    };

    updateProgress();
  }
  
  dismiss(): void {
    this.snackBarRef.dismiss();
  }
}