// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2019 - 2021 Gemeente Amsterdam
import { createSelector } from 'reselect'
import { initialState } from './reducer'
import i18n from 'i18n'

/**
 * Direct selector to the roles state domain
 */
const selectRolesDomain = (state) => state.roles || initialState

/**
 * Other specific selectors
 */
const rolesInputOptions = (state) => [
  ...state
    .get('list')
    .toJS()
    .map((role) => ({
      key: String(role.id),
      name: role.name,
      value: role.name,
    })),
]

export const inputSelectRolesSelector = createSelector(
  selectRolesDomain,
  (state) => [
    { key: 'all', name: i18n.t('alles'), value: '*' },
    ...rolesInputOptions(state),
  ]
)

export const inputCheckboxRolesSelector = createSelector(
  selectRolesDomain,
  (state) => rolesInputOptions(state)
)

/**
 * Default selector used by roles
 */
export const rolesModelSelector = createSelector(selectRolesDomain, (state) =>
  state.toJS()
)
