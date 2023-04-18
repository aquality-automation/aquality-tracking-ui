import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Project } from '../../../shared/models/project';
import { User } from '../../../shared/models/user';
import { CustomerService } from 'src/app/services/customer/customer.service';
import { ProjectService } from 'src/app/services/project/project.service';
import { NotificationsService } from 'angular2-notifications';

@Component({
  templateUrl: './create-project.component.html',
})
export class CreateProjectComponent implements OnInit {
  customers: User[];
  newProject: Project = { name: '', ai_resolutions: 0 };

  constructor(
    public customerService: CustomerService,
    private projectService: ProjectService,
    private notification: NotificationsService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.customers = await this.customerService.getCustomer();
  }

  async processProjectCreation() {
    await this.projectService.createProjects(this.newProject);
    await this.router.navigate(['/project/']);
    this.notification.success('Created', `${this.newProject.name} project is created!`);
  }
}
