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

import React, { useCallback, useMemo } from 'react';

import { EuiTitle, EuiFlexGroup, EuiFlexItem, EuiSpacer } from '@elastic/eui';
import { i18n } from '@kbn/i18n';
import { FormattedMessage } from '@kbn/i18n/react';

import { Axis } from '../../../types';
import { TruncateLabelsOption } from '../../common';
import { getRotateOptions } from '../../../utils/collections';
// modified by HHonda
// import { SelectOption, SwitchOption } from '../../../../../charts/public';
import { TextInputOption, SelectOption, SwitchOption } from '../../../../../charts/public';

export type SetAxisLabel = <T extends keyof Axis['labels']>(
  paramName: T,
  value: Axis['labels'][T]
) => void;
export interface LabelOptionsProps {
  axisLabels: Axis['labels'];
  axisFilterCheckboxName: string;
  setAxisLabel: SetAxisLabel;
}

function LabelOptions({ axisLabels, axisFilterCheckboxName, setAxisLabel }: LabelOptionsProps) {
  const setAxisLabelRotate = useCallback(
    (paramName: 'rotate', value: Axis['labels']['rotate']) => {
      setAxisLabel(paramName, Number(value));
    },
    [setAxisLabel]
  );

  const rotateOptions = useMemo(getRotateOptions, []);

  return (
    <>
      <EuiSpacer size="m" />
      <EuiTitle size="xxs">
        <h3>
          <FormattedMessage
            id="visTypeVislib.controls.pointSeries.categoryAxis.labelsTitle"
            defaultMessage="Labels"
          />
        </h3>
      </EuiTitle>
      <EuiSpacer size="s" />

      <SwitchOption
        label={i18n.translate('visTypeVislib.controls.pointSeries.categoryAxis.showLabelsLabel', {
          defaultMessage: 'Show labels',
        })}
        paramName="show"
        value={axisLabels.show}
        setValue={setAxisLabel}
      />

      {/* modified by HHonda Esconder decimal zero */}
      <SwitchOption
        disabled={!axisLabels.show}
        label="Esconder decimal zero"
        paramName="hideDecimals"
        value={axisLabels.hideDecimals}
        setValue={setAxisLabel}
      />

      {/* modified by HHonda Texto adicional à direita */}
      <TextInputOption
        disabled={!axisLabels.show}
        label="Texto adicional à direita"
        paramName="concatTag"
        value={axisLabels.concatTag}
        setValue={setAxisLabel}
      />

      {/* modified by HHonda + Edmar Moretti Estilo dos valores (SVG) */}
      <TextInputOption
        label="Estilo dos valores (SVG)"
        paramName="styleValuesConfig"
        value={axisLabels.styleValuesConfig}
        setValue={setAxisLabel}
      />
      {/* modified by HHonda + Edmar Moretti Estilo do título (SVG) */}
      <TextInputOption
        label="Estilo do título (SVG)"
        paramName="styleTitleConfig"
        value={axisLabels.styleTitleConfig}
        setValue={setAxisLabel}
      />
      {/* modified by HHonda + Edmar Moretti Posicionar o título no início do eixo */}
      <SwitchOption
        label="Posicionar o título no início do eixo"
        paramName="titlePosStart"
        value={axisLabels.titlePosStart}
        setValue={setAxisLabel}
      />
      {/* modified by HHonda + Edmar Moretti Estilo da linha do eixo (SVG) */}
      <TextInputOption
        label="Estilo da linha do eixo (SVG)"
        paramName="styleLineConfig"
        value={axisLabels.styleLineConfig}
        setValue={setAxisLabel}
      />
      {/* modified by HHonda + Edmar Moretti Estilo dos ticks do eixo (SVG) */}
      <TextInputOption
        label="Estilo dos ticks do eixo (SVG)"
        paramName="styleTickConfig"
        value={axisLabels.styleTickConfig}
        setValue={setAxisLabel}
      />

      <SwitchOption
        data-test-subj={axisFilterCheckboxName}
        disabled={!axisLabels.show}
        label={i18n.translate('visTypeVislib.controls.pointSeries.categoryAxis.filterLabelsLabel', {
          defaultMessage: 'Filter labels',
        })}
        paramName="filter"
        value={axisLabels.filter}
        setValue={setAxisLabel}
      />

      {/* Edmar Moretti manter último valor */}
      <SwitchOption
        data-test-subj={axisFilterCheckboxName}
        disabled={!axisLabels.show}
        label="Mantem o último valor ao filtrar as etiquetas"
        paramName="keepLastValue"
        value={axisLabels.keepLastValue}
        setValue={setAxisLabel}
      />
      <EuiSpacer size="m" />

      <EuiFlexGroup gutterSize="s">
        <EuiFlexItem>
          <SelectOption
            disabled={!axisLabels.show}
            label={i18n.translate('visTypeVislib.controls.pointSeries.categoryAxis.alignLabel', {
              defaultMessage: 'Align',
            })}
            options={rotateOptions}
            paramName="rotate"
            value={axisLabels.rotate}
            setValue={setAxisLabelRotate}
          />
        </EuiFlexItem>
        <EuiFlexItem>
          <TruncateLabelsOption
            disabled={!axisLabels.show}
            value={axisLabels.truncate}
            setValue={setAxisLabel}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
    </>
  );
}

export { LabelOptions };
