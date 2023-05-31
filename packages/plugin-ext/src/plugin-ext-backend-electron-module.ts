// *****************************************************************************
// Copyright (C) 2018 Red Hat, Inc. and others.
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

import { ContainerModule } from '@theia/core/shared/inversify';
import { bindElectronBackend } from './hosted/node-electron/plugin-ext-hosted-electron-backend-module';
import { bindMainBackend } from './main/node/plugin-ext-backend-module';

export default new ContainerModule((bind, unbind, isBound, rebind) => {
    bindMainBackend(bind, unbind, isBound, rebind);
    bindElectronBackend(bind);
});
