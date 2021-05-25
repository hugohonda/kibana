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

export interface LegendItem {
  label: string;
  values: any[];
}

export const CUSTOM_LEGEND_VIS_TYPES = ['heatmap', 'gauge'];

export const legendColors: string[] = [
  '#3F6833', // A1
  '#967302', // B1
  '#2F575E', // C1
  '#99440A', // D1
  '#58140C', // E1
  '#052B51', // F1
  '#511749', // G1
  '#3F2B5B', // 6 H1
  '#252525', // I1 adicionado
  '#01665e', // J1 adicionado
  '#e5c494', // K1 adicionado
  '#0c2c84', // adicionado
  '#508642',
  '#CCA300',
  '#447EBC',
  '#C15C17',
  '#890F02',
  '#0A437C',
  '#6D1F62',
  '#584477', // 2
  '#525252', // adicionado
  '#5ab4ac', // adicionado
  '#ffd92f', // adicionado
  '#225ea8', // adicionado
  '#629E51',
  '#E5AC0E',
  '#64B0C8',
  '#E0752D',
  '#BF1B00',
  '#0A50A1',
  '#962D82',
  '#614D93', // 4
  '#737373', // adicionado
  '#c7eae5', // adicionado
  '#a6d854', // adicionado
  '#1d91c0', // adicionado
  '#7EB26D',
  '#EAB839',
  '#6ED0E0',
  '#EF843C',
  '#E24D42',
  '#1F78C1',
  '#BA43A9',
  '#705DA0', // Normal
  '#969696', // adicionado
  '#f5f5f5', // adicionado
  '#e78ac3', // adicionado
  '#41b6c4', // adicionado
  '#9AC48A',
  '#F2C96D',
  '#65C5DB',
  '#F9934E',
  '#EA6460',
  '#5195CE',
  '#D683CE',
  '#806EB7', // 5
  '#bdbdbd', // adicionado
  '#f6e8c3', // adicionado
  '#8da0cb', // adicionado
  '#7fcdbb', // adicionado
  '#B7DBAB',
  '#F4D598',
  '#70DBED',
  '#F9BA8F',
  '#F29191',
  '#82B5D8',
  '#E5A8E2',
  '#AEA2E0', // 3
  '#d9d9d9', // adicionado
  '#d8b365', // adicionado
  '#fc8d62', // adicionado
  '#c7e9b4', // adicionado
  '#E0F9D7',
  '#FCEACA',
  '#CFFAFF',
  '#F9E2D2',
  '#FCE2DE',
  '#BADFF4',
  '#F9D9F9',
  '#DEDAF7', // 7
  '#f7f7f7', // adicionado
  '#8c510a', // adicionado
  '#66c2a5', // adicionado
  '#ffffcc', // adicionado
];
