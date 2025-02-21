import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

@Component({
  // CustomSnackBarComponent
  selector: 'app-custom-snack-bar',
  imports: [MatProgressBarModule],
  templateUrl: './custom-snack-bar.component.html',
  styleUrl: './custom-snack-bar.component.css'
})
export class CustomSnackBarComponent implements OnInit {
  data = inject(MAT_SNACK_BAR_DATA);
  progressValue = 100;
  
  ngOnInit() {
    const startTime = Date.now();
    const duration = 4500;

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      this.progressValue = Math.max(0, 100 - (elapsed / duration * 100));
      
      if (this.progressValue > 0) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }
}