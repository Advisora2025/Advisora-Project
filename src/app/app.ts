import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from "./Admin/dashboard/dashboard";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Dashboard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected title = 'Advisora';
}
