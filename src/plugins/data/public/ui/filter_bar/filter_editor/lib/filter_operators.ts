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
import { FILTERS } from '../../../../../common/es_query/filters';

export interface Operator {
  message: string;
  type: FILTERS;
  negate: boolean;
  fieldTypes?: string[];
}

export const isOperator = {
  message: i18n.translate('data.filter.filterEditor.isOperatorOptionLabel', {
    // modified by HHonda Tradução
    // defaultMessage: 'is',
    defaultMessage: 'é',
  }),
  type: FILTERS.PHRASE,
  negate: false,
};

export const isNotOperator = {
  message: i18n.translate('data.filter.filterEditor.isNotOperatorOptionLabel', {
    // modified by HHonda Tradução
    // defaultMessage: 'is not',
    defaultMessage: 'não é',
  }),
  type: FILTERS.PHRASE,
  negate: true,
};

export const isOneOfOperator = {
  message: i18n.translate('data.filter.filterEditor.isOneOfOperatorOptionLabel', {
    // modified by HHonda Tradução
    // defaultMessage: 'is one of',
    defaultMessage: 'é um dos',
  }),
  type: FILTERS.PHRASES,
  negate: false,
  fieldTypes: ['string', 'number', 'date', 'ip', 'geo_point', 'geo_shape'],
};

export const isNotOneOfOperator = {
  message: i18n.translate('data.filter.filterEditor.isNotOneOfOperatorOptionLabel', {
    // modified by HHonda Tradução
    // defaultMessage: 'is not one of',
    defaultMessage: 'não é um dos',
  }),
  type: FILTERS.PHRASES,
  negate: true,
  fieldTypes: ['string', 'number', 'date', 'ip', 'geo_point', 'geo_shape'],
};

export const isBetweenOperator = {
  message: i18n.translate('data.filter.filterEditor.isBetweenOperatorOptionLabel', {
    // modified by HHonda Tradução
    // defaultMessage: 'is between',
    defaultMessage: 'está entre',
  }),
  type: FILTERS.RANGE,
  negate: false,
  fieldTypes: ['number', 'date', 'ip'],
};

export const isNotBetweenOperator = {
  message: i18n.translate('data.filter.filterEditor.isNotBetweenOperatorOptionLabel', {
    // modified by HHonda Tradução
    // defaultMessage: 'is not between',
    defaultMessage: 'não está entre',
  }),
  type: FILTERS.RANGE,
  negate: true,
  fieldTypes: ['number', 'date', 'ip'],
};

export const existsOperator = {
  message: i18n.translate('data.filter.filterEditor.existsOperatorOptionLabel', {
    // modified by HHonda Tradução
    // defaultMessage: 'exists',
    defaultMessage: 'existe',
  }),
  type: FILTERS.EXISTS,
  negate: false,
};

export const doesNotExistOperator = {
  message: i18n.translate('data.filter.filterEditor.doesNotExistOperatorOptionLabel', {
    // modified by HHonda Tradução
    // defaultMessage: 'does not exist',
    defaultMessage: 'não existe',
  }),
  type: FILTERS.EXISTS,
  negate: true,
};

export const FILTER_OPERATORS: Operator[] = [
  isOperator,
  isNotOperator,
  isOneOfOperator,
  isNotOneOfOperator,
  isBetweenOperator,
  isNotBetweenOperator,
  existsOperator,
  doesNotExistOperator,
];
