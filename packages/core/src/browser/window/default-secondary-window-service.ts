// *****************************************************************************
// Copyright (C) 2022 STMicroelectronics, Ericsson, ARM, EclipseSource and others.
//
// This program and the accompanying materials are made available under the
// terms of the Eclipse Public License v. 2.0 which is available at
// http://www.eclipse.org/legal/epl-2.0.
//
// This Source Code may also be made available under the following Secondary
// Licenses when the conditions for such availability set forth in the Eclipse
// Public License v. 2.0 are satisfied: GNU General Public License, version 2
// with the GNU Classpath Exception which is available at
// https://www.gnu.org/software/classpath/license.html.
//
// SPDX-License-Identifier: EPL-2.0 OR GPL-2.0-with-classpath-exception
// *****************************************************************************
import { inject, injectable, postConstruct } from 'inversify';
import { SecondaryWindowService } from './secondary-window-service';
import { WindowService } from './window-service';

@injectable()
export class DefaultSecondaryWindowService implements SecondaryWindowService {
    // secondary-window.html is part of Theia's generated code. It is generated by dev-packages/application-manager/src/generator/frontend-generator.ts
    protected static SECONDARY_WINDOW_URL = 'secondary-window.html';

    /**
     * Randomized prefix to be included in opened windows' ids.
     * This avoids conflicts when creating sub-windows from multiple theia instances (e.g. by opening Theia multiple times in the same browser)
     */
    protected readonly prefix = crypto.getRandomValues(new Uint32Array(1))[0];
    /** Unique id. Increase after every access. */
    private nextId = 0;

    protected secondaryWindows: Window[] = [];

    @inject(WindowService)
    protected readonly windowService: WindowService;

    @postConstruct()
    init(): void {
        // Close all open windows when the main window is closed.
        this.windowService.onUnload(() => {
            // Iterate backwards because calling window.close might remove the window from the array
            for (let i = this.secondaryWindows.length - 1; i >= 0; i--) {
                this.secondaryWindows[i].close();
            }
        });
    }

    createSecondaryWindow(onClose?: (closedWin: Window) => void): Window | undefined {
        const win = this.doCreateSecondaryWindow(onClose);
        if (win) {
            this.secondaryWindows.push(win);
        }
        return win;
    }

    protected doCreateSecondaryWindow(onClose?: (closedWin: Window) => void): Window | undefined {
        const win = window.open(DefaultSecondaryWindowService.SECONDARY_WINDOW_URL, this.nextWindowId(), 'popup');
        if (win) {
            // Add the unload listener after the dom content was loaded because otherwise the unload listener is called already on open in some browsers (e.g. Chrome).
            win.addEventListener('DOMContentLoaded', () => {
                win.addEventListener('unload', () => {
                    this.handleWindowClosed(win, onClose);
                });
            });
        }
        return win ?? undefined;
    }

    protected handleWindowClosed(win: Window, onClose?: (closedWin: Window) => void): void {
        const extIndex = this.secondaryWindows.indexOf(win);
        if (extIndex > -1) {
            this.secondaryWindows.splice(extIndex, 1);
        };
        onClose?.(win);
    }

    focus(win: Window): void {
        win.focus();
    }

    protected nextWindowId(): string {
        return `${this.prefix}-secondaryWindow-${this.nextId++}`;
    }
}
