import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dashboard } from "./Admin/dashboard/dashboard";
import { Home } from "./pages/home/home";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Dashboard, Home],
  templateUrl: './app.html',
  styleUrl: './app.css',
  
})
export class App {
  protected title = 'Advisora';
}
