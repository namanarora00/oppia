// Copyright 2014 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Frontend validator for customization args and rules of
 * the interaction.
 */

oppia.filter('oppiaInteractiveGraphInputValidator', [
    'WARNING_TYPES', 'baseInteractionValidationService',
    function(WARNING_TYPES, baseInteractionValidationService) {
  // Returns a list of warnings.
  return function(stateName, customizationArgs, answerGroups, defaultOutcome) {
    var VERTICES_LIMIT = 50;
    var ISOMORPHISM_VERTICES_LIMIT = 10;

    var warningsList = [];

    baseInteractionValidationService.requireCustomizationArguments(
      customizationArgs, ['graph', 'canEditEdgeWeight', 'canEditVertexLabel']);

    var exceedsVerticesLimit = false;
    var exceedsIsomorphismVerticesLimit = false;

    if (customizationArgs.graph.value.vertices.length > VERTICES_LIMIT) {
      exceedsVerticeLimit = true;
    }

    if (!customizationArgs.graph.value.isWeighted &&
        customizationArgs.canEditEdgeWeight.value) {
      warningsList.push({
        type: WARNING_TYPES.CRITICAL,
        message: 'The learner cannot edit edge weights for an unweighted graph.'
      });
    }

    if (!customizationArgs.graph.value.isLabeled &&
        customizationArgs.canEditVertexLabel.value) {
      warningsList.push({
        type: WARNING_TYPES.CRITICAL,
        message: 'The learner cannot edit vertex labels for an unlabeled graph.'
      });
    }

    warningsList = warningsList.concat(
      baseInteractionValidationService.getAllOutcomeWarnings(
        answerGroups, defaultOutcome, stateName));
    for (var i = 0; i < answerGroups.length; i++) {
      var ruleSpecs = answerGroups[i].rule_specs;
      for (var j = 0; j < ruleSpecs.length; j++) {
        var ruleSpec = ruleSpecs[j];
        try {
          if (ruleSpec.rule_type === 'IsIsomorphicTo' &&
              ruleSpec.inputs.g.vertices.length > ISOMORPHISM_VERTICES_LIMIT) {
            exceedsIsomorphismVerticesLimit = true;
          }

          if (ruleSpec.inputs.g.vertices.length > VERTICES_LIMIT) {
            exceedsVerticesLimit = true;
          }
        } catch (e) {
          warningsList.push({
            type: WARNING_TYPES.CRITICAL,
            message: (
              'The rule ' + String(j + 1) +
              ' in group ' + String(i + 1) + ' is invalid.')
          });
        }
      }
    }

    if (exceedsIsomorphismVerticesLimit) {
      warningsList.push({
        type: WARNING_TYPES.CRITICAL,
        message: 'Note that only graphs with at most ' +
                  String(ISOMORPHISM_VERTICES_LIMIT) +
                  ' nodes are supported for isomorphism check.'
      });
    }

    if (exceedsVerticesLimit) {
      warningsList.push({
        type: WARNING_TYPES.CRITICAL,
        message: 'Note that only graphs with at most ' +
                  String(VERTICES_LIMIT) + ' nodes are supported.'
      });
    }

    return warningsList;
  };
}]);
