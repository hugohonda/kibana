/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { i18n } from '@kbn/i18n';

/** @internal */
export const DEFAULT_APP_CATEGORIES = Object.freeze({
  kibana: {
    id: 'kibana',
    label: i18n.translate('core.ui.kibanaNavList.label', {
      defaultMessage: 'Kibana',
    }),
    euiIconType: 'logoKibana',
    order: 1000,
  },
  observability: {
    id: 'observability',
    label: i18n.translate('core.ui.observabilityNavList.label', {
      // modified by HHonda
      // defaultMessage: 'Observability',
      defaultMessage: 'Observabilidade',
    }),
    euiIconType: 'logoObservability',
    order: 2000,
  },
  security: {
    id: 'security',
    label: i18n.translate('core.ui.securityNavList.label', {
      // modified by HHonda
      // defaultMessage: 'Security',
      defaultMessage: 'Segurança',
    }),
    order: 3000,
    euiIconType: 'logoSecurity',
  },
  management: {
    id: 'management',
    label: i18n.translate('core.ui.managementNavList.label', {
      // modified by HHonda
      // defaultMessage: 'Management',
      defaultMessage: 'Gestão',
    }),
    order: 5000,
  },
});
