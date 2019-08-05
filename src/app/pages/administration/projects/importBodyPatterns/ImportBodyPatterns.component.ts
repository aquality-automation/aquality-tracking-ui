import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../../../../services/project.service';
import { SimpleRequester } from '../../../../services/simple-requester';
import { Project, ImportBodyPattern } from '../../../../shared/models/project';

@Component({
    templateUrl: 'ImportBodyPatterns.component.html',
    providers: [
        ProjectService,
        SimpleRequester
    ]
})
export class ImportBodyPatternsComponent implements OnInit {
    constructor(
        private projectService: ProjectService
    ) { }

    hideModal = true;
    removeModalTitle: string;
    removeModalMessage: string;
    projects: Project[];
    private selectedProject: Project;
    bodyPatterns: ImportBodyPattern[];
    private patternToRemove: ImportBodyPattern;
    private tableColumns = [
        { name: 'Name', property: 'name', filter: true, sorting: true, type: 'text', editable: true },
    ];

    ngOnInit() {
        this.projectService.getProjects({}).subscribe(res => {
            this.projects = res;
            if (this.projects.length > 0) { this.selectedProject = this.projects[0]; }
            this.loadBodyPatterns();
        });
    }

    onProjectChange($event) {
        this.selectedProject = $event;
        this.loadBodyPatterns();
    }

    loadBodyPatterns() {
        if (this.selectedProject) {
            this.projectService.getImportBodyPatterns({ project_id: this.selectedProject.id }).subscribe(res => {
                this.bodyPatterns = res;
            });
        }
    }

    handleAction($event) {
        if ($event.action === 'create') {
            this.createPattern($event.entity);
        } else if ($event.action === 'remove') {
            this.deletePattern($event.entity);
        }
    }

    deletePattern(entity) {
        this.patternToRemove = entity;
        this.removeModalTitle = `Remove Unique Body Pattern: ${entity.name}`;
        this.removeModalMessage =
            `Are you sure that you want to delete the '${entity.name}' Unique Body Pattern? This action cannot be undone.`;
        this.hideModal = false;
    }

    createPattern(bodyPattern: ImportBodyPattern) {
        bodyPattern.project_id = this.selectedProject.id;
        this.updateBodyPattern(bodyPattern, `Unique Body Pattern '${bodyPattern.name}' successfully created.`);
        delete bodyPattern['name'];
    }

    updatePattern(bodyPattern: ImportBodyPattern) {
        this.updateBodyPattern(bodyPattern, `Unique Body Pattern '${bodyPattern.name}' successfully updated.`);
    }

    updateBodyPattern(bodyPattern: ImportBodyPattern, message: string) {
        bodyPattern.project_id = this.selectedProject.id;
        this.projectService.createImportBodyPattern(bodyPattern).subscribe(res => {
            this.projectService.handleSuccess(message);
            this.loadBodyPatterns();
        }, () => { this.loadBodyPatterns(); });
    }

    async execute($event) {
        if (await $event) {
            this.projectService.removeImportBodyPattern(this.patternToRemove).subscribe(res => {
                this.loadBodyPatterns();
            });
        }
        this.hideModal = true;
    }

    wasClosed($event) {
        this.hideModal = $event;
    }
}
