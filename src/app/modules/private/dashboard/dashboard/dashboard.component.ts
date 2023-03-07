import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  constructor(private activatedRoute: ActivatedRoute, private router: Router) { }
  gotoCalculator() {
    this.activatedRoute.params.subscribe((params) => {
      this.router.navigate(['private/calculator'], { queryParams: params, queryParamsHandling: 'preserve' })
    })
  }
}
