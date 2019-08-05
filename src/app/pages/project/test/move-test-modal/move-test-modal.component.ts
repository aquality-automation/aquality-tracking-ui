import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { BasePopupComponent } from '../../../../elements/modals/basePopup.component';
import { Test } from '../../../../shared/models/test';
import { TestService } from '../../../../services/test.service';
import { SimpleRequester } from '../../../../services/simple-requester';

@Component({
    selector: 'move-test-modal',
    templateUrl: 'move-test-modal.component.html',
    styleUrls: ['move-test-modal.component.css'],
    providers: [
        SimpleRequester
    ]
})
export class MoveTestModalComponent extends BasePopupComponent implements OnInit {
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

    constructor(
        private testService: TestService,
        private simpleRequester: SimpleRequester
    ) {
        super();
    }

    ngOnInit() {
        this.pairsToMove.push({ from: this.testMoveFrom, to: this.testMoveTo });
    }

    onClick(event) {
        const bar = new Promise((resolve) => {
            for (let i = 0; i < this.pairsToMove.length; i++) {
                const pair = this.pairsToMove[i];
                this.testService.moveTest(pair.from, pair.to, true, pair.from.project_id).subscribe(() => {
                    if (i === this.pairsToMove.length - 1) {
                        resolve();
                    }
                });
            }
        });
        bar.then(() => {
            this.testMovedTo.emit(this.pairsToMove[0].to);
            this.execute.emit(event);
            this.pairsToMove = [];
            this.pairsToMove.push({ from: this.testMoveFrom, to: this.testMoveTo });
            this.hideModal();
        });
    }

    validatePairs(event) {
        if (event) {
            const bar = new Promise((resolve, reject) => {
                this.pairsToMove.forEach(pair => {
                    if (!pair.from || !pair.to) {
                        this.simpleRequester.handleSimpleError(
                            'Empty Pair', 'Some Pairs are not valid, \'From\' and \'To\' fields should be filled!');
                        reject(false);
                    }
                    if (pair.from.id === pair.to.id) {
                        this.simpleRequester.handleSimpleError(
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
