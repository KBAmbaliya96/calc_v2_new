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
      console.log(params);
    })
    // let param = {
    //   c_name: 'marinetest',
    //   o_name: 'INVICTUS 370 GT (B)',
    //   price: 403040,
    //   obj_id: '',
    //   style: '',
    //   activesale: 'yes',
    //   saveLoginSession: 1,
    //   loggedin: ''
    // }
    // this.routerService.navigate(['calculator', param]);
  }
}
