import { Component } from '@angular/core';
import { Project } from '../../../shared/models/project';
import { SimpleRequester } from '../../../services/simple-requester';
import { ProjectService } from '../../../services/project.service';
import { UserService } from '../../../services/user.services';
import { Router } from '@angular/router';

@Component({
  templateUrl: './administration.component.html',
  styleUrls: ['administration.component.css'],
  providers: [
    ProjectService,
    SimpleRequester,
    UserService,
  ]
})
export class AdministrationComponent {
  projects: Project[];
  project: Project;

  constructor(
    private projectService: ProjectService,
    public userService: UserService,
    private router: Router
  ) {
    this.projectService.getProjects(this.project).subscribe(result => {
      this.projects = result;
    }, error => this.projectService.handleError(error));
    this.redirect();
  }

  IsAdmin(): boolean {
    return this.userService.IsAdmin();
  }

  redirect() {
    if (this.userService.IsAdmin()) {
      this.router.navigate(['administration/global/users']);
      return true;
    } else if (this.userService.IsManager() || this.userService.AnyLocalAdmin() || this.userService.AnyLocalManager()) {
      this.router.navigate(['administration/project/permissions']);
      return true;
    }
  }
}
