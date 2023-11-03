import { includes } from 'ramda';
import { findById } from '../domain/stixObjectOrStixRelationship';
import { ABSTRACT_STIX_CORE_RELATIONSHIP, } from '../schema/general';
import { onlyStableStixIds } from '../database/stix';
import { isInferredIndex } from '../database/utils';
import { STIX_SIGHTING_RELATIONSHIP } from '../schema/stixSightingRelationship';
import { stixObjectOrStixRelationshipOptions } from '../schema/stixObjectOrStixRelationship';
import { STIX_REF_RELATIONSHIP_TYPES } from '../schema/stixRefRelationship';

const stixObjectOrStixRelationshipResolvers = {
  Query: {
    stixObjectOrStixRelationship: (_, { id }, context) => findById(context, context.user, id),
    stixCoreObjectOrStixCoreRelationship: (_, { id }, context) => findById(context, context.user, id),
  },
  StixObject: {
    is_inferred: (object) => isInferredIndex(object._index),
    x_opencti_stix_ids: (object) => onlyStableStixIds(object.x_opencti_stix_ids || []),
  },
  StixRelationship: {
    is_inferred: (object) => isInferredIndex(object._index),
    x_opencti_stix_ids: (object) => onlyStableStixIds(object.x_opencti_stix_ids || []),
  },
  StixObjectOrStixRelationshipsFilter: stixObjectOrStixRelationshipOptions.StixObjectOrStixRelationshipsFilter,
  StixObjectOrStixRelationship: {
    // eslint-disable-next-line
    __resolveType(obj) {
      if (STIX_REF_RELATIONSHIP_TYPES.some((type) => obj.parent_types.includes(type))) {
        return 'StixRefRelationship';
      }
      if (includes(ABSTRACT_STIX_CORE_RELATIONSHIP, obj.parent_types)) {
        return 'StixCoreRelationship';
      }
      if (STIX_SIGHTING_RELATIONSHIP === obj.entity_type) {
        return 'StixSightingRelationship';
      }
      if (obj.entity_type) {
        return obj.entity_type.replace(/(?:^|-|_)(\w)/g, (matches, letter) => letter.toUpperCase());
      }
      /* istanbul ignore next */
      return 'Unknown';
    },
  },
};

export default stixObjectOrStixRelationshipResolvers;
