import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Client } from '../../services/client';
import { ClientService } from '../../services/client.service';


@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './users.html',
  styleUrl: './users.css',
  
})
export class Users implements OnInit {
  clients: Client[] = [];

  constructor(private clientService: ClientService) {}

  ngOnInit(): void {
    this.clientService.getClients().subscribe((data) => {
      this.clients = data;
    });
  }

   fetchClients(): void {
    this.clientService.getClients().subscribe((data) => {
      this.clients = data;
    });
  }
  deleteClient(id: number): void {
    const confirmDelete = confirm('Are you sure you want to delete this client?');
    if (confirmDelete) {
      this.clientService.deleteClient(id).subscribe(() => {
        // Remove from UI
        this.clients = this.clients.filter(client => client.id !== id);
      });
    }
  }

}
