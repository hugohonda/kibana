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

import { ColorSchemas } from '../color_maps';
import { Rotates } from './collections';

export interface ColorSchemaParams {
  colorSchema: ColorSchemas;
  invertColors: boolean;
}

export interface Labels {
  color?: string;
  filter?: boolean;
  overwriteColor?: boolean;
  rotate?: Rotates;
  show: boolean;
  truncate?: number | null;
  // modified by HHonda interface Labels
  hideDecimals: boolean | undefined;
  styleConfig: string | undefined;
  concatTag: string | undefined;
  // modified by Edmar Moretti interface Labels
  styleValuesConfig: string | undefined;
  styleTitleConfig: string | undefined;
  titlePosStart: boolean | undefined;
}

export interface Style {
  bgFill: string;
  bgColor: boolean;
  labelColor: boolean;
  subText: string;
  fontSize: number;
}
