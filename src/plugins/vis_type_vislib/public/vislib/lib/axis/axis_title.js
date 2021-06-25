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

import d3 from 'd3';
import $ from 'jquery';

export class AxisTitle {
  constructor(axisConfig) {
    this.axisConfig = axisConfig;
    this.elSelector = this.axisConfig
      .get('title.elSelector')
      .replace('{pos}', this.axisConfig.get('position'));
  }

  render() {
    d3.select(this.axisConfig.get('rootEl')).selectAll(this.elSelector).call(this.draw());
  }

  destroy() {
    $(this.axisConfig.get('rootEl')).find(this.elSelector).find('svg').remove();
  }

  draw() {
    const config = this.axisConfig;
    // Editado por Edmar Moretti Opção de posicionar o ttulo no início
    const ts = config._values.labels.titlePosStart;
    return function (selection) {
      selection.each(function () {
        if (!config.get('show') && !config.get('title.show', false)) return;

        const el = this;
        const div = d3.select(el);
        const width = $(el).width();
        const height = $(el).height() + 20;
        const axisPrefix = config.isHorizontal() ? 'x' : 'y';

        const svg = div
          .append('svg')
          .attr('focusable', 'false')
          .attr('width', width)
          .attr('height', height)
          .attr('class', `axis-title ${axisPrefix}-axis-title`);
        const bbox = svg
          .append('text')
          .attr('transform', function () {
            // Editado por Edmar Moretti
            if (config.isHorizontal()) {
              if (ts === false) {
                return `translate(${width / 2},0)`;
              } else {
                return `translate(0,-5)`;
              }
            } else {
              if (ts === false) {
                return `translate(0,${height / 2}) rotate(270)`;
              } else {
                return `translate(0,0) rotate(270)`;
              }
            }
          })
          // Editado por Edmar Moretti
          //.attr('text-anchor', 'middle')
          .attr('text-anchor', function () {
            if (config.isHorizontal()) {
              if (ts === false) {
                return `middle`;
              } else {
                return `start`;
              }
            } else {
              if (ts === false) {
                return `middle`;
              } else {
                return `end`;
              }
            }
          })
          .attr('dominant-baseline', 'hanging')
          // modified by HHonda
          // .text(config.get('title.text'))
          .text(() => {
            const hangingText = config.get('title.text');
            if (hangingText === 'filters') {
              return '';
            }
            // Editado por Edmar Moretti - inclui o título do gráfico junto ao label do eixo
            if (
              config._values.type === 'category' &&
              axisPrefix === 'x' &&
              config.data.data.dontSplitChart === true
            ) {
              return hangingText + ' - ' + config.data.data.columns[0].label;
            }
            if (
              config._values.type === 'value' &&
              axisPrefix === 'x' &&
              config.data.data.dontSplitChart === true
            ) {
              return hangingText + ' - ' + config.data.data.columns[0].label;
            }
            return hangingText;
          })
          // modified by HHonda + Edmar Moretti
          .attr('style', () => {
            return config.get('labels.styleTitleConfig');
          })
          //
          .node()
          .getBBox();

        if (config.isHorizontal()) {
          svg.attr('height', Math.ceil(bbox.height));
        } else {
          svg.attr('width', Math.ceil(bbox.height));
        }
      });
    };
  }
}
