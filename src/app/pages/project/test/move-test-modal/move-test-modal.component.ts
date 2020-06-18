import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Test } from '../../../../shared/models/test';
import { faPlus, faArrowRight, faArrowDown, faMinus } from '@fortawesome/free-solid-svg-icons';
import { ModalComponent } from 'src/app/elements/modals/modal.component';
import { TestService } from 'src/app/services/test/test.service';

@Component({
    selector: 'move-test-modal',
    templateUrl: 'move-test-modal.component.html',
    styleUrls: ['move-test-modal.component.scss']
})
export class MoveTestModalComponent extends ModalComponent implements OnInit {
    @Input() title: string;
    @Input() type = '';
    @Input() buttons: any[];
    @Input() testMoveFrom: Test;
    @Input() testMoveTo: Test;
    @Input() tests: Test[] = [];
    @Output() closed = new EventEmitter();
    @Output() execute = new EventEmitter();
    @Output() testMovedTo = new EventEmitter();
    pairsToMove: { from: Test, to: Test }[] = [];
    icons = { faPlus, faMinus, faArrowRight, faArrowDown };

    constructor(
        private testService: TestService
    ) {
        super();
    }

    ngOnInit() {
        this.pairsToMove.push({ from: this.testMoveFrom, to: this.testMoveTo });
    }

    async onClick(event) {
        const bar = new Promise(async (resolve) => {
            for (let i = 0; i < this.pairsToMove.length; i++) {
                const pair = this.pairsToMove[i];
                await this.testService.moveTest(pair.from, pair.to, true, pair.from.project_id);
                if (i === this.pairsToMove.length - 1) {
                    resolve();
                }
            }
        });

        await bar;
        this.testMovedTo.emit(this.pairsToMove[0].to);
        this.execute.emit(event);
        this.pairsToMove = [];
        this.pairsToMove.push({ from: this.testMoveFrom, to: this.testMoveTo });
        this.hideModal();
    }

    validatePairs(event) {
        if (event) {
            const bar = new Promise((resolve, reject) => {
                this.pairsToMove.forEach(pair => {
                    if (!pair.from || !pair.to) {
                        this.testService.handleSimpleError(
                            'Empty Pair', 'Some Pairs are not valid, \'From\' and \'To\' fields should be filled!');
                        reject(false);
                    }
                    if (pair.from.id === pair.to.id) {
                        this.testService.handleSimpleError(
                            'Invalid Pair', `You are trying to move test into itself: '${pair.from.name}'!`);
                        reject(false);
                    }
                });
                resolve(true);
            });

            bar.then(result => {
                if (result) {
                    this.onClick(event);
                }
            });
        } else {
            this.pairsToMove = [];
            this.pairsToMove.push({ from: this.testMoveFrom, to: this.testMoveTo });
            this.hideModal();
        }
    }

    remove(index: number) {
        this.pairsToMove.splice(index, 1);
    }

    addRow() {
        this.pairsToMove.push({ from: undefined, to: undefined });
    }
}
