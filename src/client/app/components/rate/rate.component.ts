import { UserService } from './../../services/user.service';
import { Component, OnInit } from '@angular/core';
import { Rate } from '../../shared/models/rate';

@Component({
  selector: 'app-rate',
  templateUrl: './rate.component.html',
  styleUrls: ['./rate.component.scss']
})
export class RateComponent implements OnInit {

  rates: Rate[];

  constructor(
    private readonly userService: UserService
  ) { }

  ngOnInit() {
      this.userService.getData<Rate[]>('rates/all')
      .subscribe(data => {
        console.log('data :', data);
        this.rates = data;
      });
  } 
}
