import { Component, OnInit } from '@angular/core';
import { Project, ImportBodyPattern } from '../../../../shared/models/project';
import { ProjectService } from 'src/app/services/project/project.service';

@Component({
    templateUrl: 'ImportBodyPatterns.component.html',
})
export class ImportBodyPatternsComponent implements OnInit {
    constructor(
        private projectService: ProjectService
    ) { }

    hideModal = true;
    removeModalTitle: string;
    removeModalMessage: string;
    projects: Project[];
    selectedProject: Project;
    bodyPatterns: ImportBodyPattern[];
    patternToRemove: ImportBodyPattern;
    tableColumns = [
        {
            name: 'Name', property: 'name', filter: true, sorting: true, type: 'text', editable: true,
            creation: {
                required: true
            }
        },
    ];

    async ngOnInit() {
        this.projects = await this.projectService.getProjects({});
        if (this.projects.length > 0) { this.selectedProject = this.projects[0]; }
        this.loadBodyPatterns();
    }

    onProjectChange($event) {
        this.selectedProject = $event;
        this.loadBodyPatterns();
    }

    async loadBodyPatterns() {
        if (this.selectedProject) {
            this.bodyPatterns = await this.projectService.getImportBodyPatterns({ project_id: this.selectedProject.id });
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

    async updateBodyPattern(bodyPattern: ImportBodyPattern, message: string) {
        bodyPattern.project_id = this.selectedProject.id;
        try {
            await this.projectService.createImportBodyPattern(bodyPattern);
            this.projectService.handleSuccess(message);
        } finally {
            this.loadBodyPatterns();
        }

    }

    async execute($event) {
        if (await $event) {
            await this.projectService.removeImportBodyPattern(this.patternToRemove);
            this.loadBodyPatterns();
        }
        this.hideModal = true;
    }

    wasClosed() {
        this.hideModal = true;
    }
}
