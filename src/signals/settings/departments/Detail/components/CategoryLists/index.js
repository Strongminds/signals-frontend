// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2020 - 2022 Gemeente Amsterdam
import { useContext, useCallback, useMemo, useReducer } from 'react'

import { Row, themeSpacing } from '@amsterdam/asc-ui'
import isEqual from 'lodash/isEqual'
import PropTypes from 'prop-types'
import styled from 'styled-components'

import FormFooter from 'components/FormFooter'
import Label from 'components/Label'
import {
  ControlsWrapper,
  Fieldset,
  Form,
} from 'signals/incident-management/components/FilterForm/styled'

import { setCanView, setIsResponsible } from './actions'
import reducer from './reducer'
import DepartmentDetailContext from '../../context'
import CategoryGroups from '../CategoryGroups'
import { incoming, outgoing } from '../mapCategories'
import i18n from 'i18n'

const StyledFieldset = styled(Fieldset)`
  padding-top: ${themeSpacing(2)};
  padding-bottom: ${themeSpacing(10)};
  & > .Label {
    margin-bottom: ${themeSpacing(4)};
  }
`

/**
 * Component that renders two columns of checkboxes from the value of the `subCategories` prop. Categories are grouped
 * by their parent category.
 * Checkboxes in the `is_responsible` column have a one-on-one relation with the checkboxes in the `can_view` column,
 * meaning that when a `is_responsible` checkbox is ticked, the corresponding checkbox in the `can_view` column is also
 * ticked and disabled. This doesn't go the other way around.
 *
 * The tick logic is handled by the component's reducer function.
 */
const CategoryLists = ({ onCancel, onSubmit }) => {
  const { categories, department, subCategories } = useContext(
    DepartmentDetailContext
  )

  const categoriesMapped = useMemo(
    () => incoming(department.categories, subCategories),
    [department.categories, subCategories]
  )
  const [state, dispatch] = useReducer(reducer, categoriesMapped)

  const onSubmitForm = useCallback(
    (event) => {
      event.preventDefault()
      const formData = outgoing(state)

      onSubmit(formData)
    },
    [onSubmit, state]
  )

  const onCancelForm = useCallback(() => {
    const isPristine = isEqual(outgoing(categoriesMapped), outgoing(state))

    onCancel(isPristine)
  }, [categoriesMapped, onCancel, state])

  const onChangeCanViewCategories = useCallback(
    (slug, selectedSubCategories) => {
      dispatch(setCanView({ slug, subCategories: selectedSubCategories }))
    },
    [dispatch]
  )

  const onChangeIsResponsibleCategories = useCallback(
    (slug, selectedSubCategories) => {
      dispatch(setIsResponsible({ slug, subCategories: selectedSubCategories }))
    },
    [dispatch]
  )

  const onCanViewMainCategoryToggle = useCallback(
    (slug, isToggled) => {
      const selectedSubCategories = isToggled ? categories[slug].sub : []
      dispatch(setCanView({ slug, subCategories: selectedSubCategories }))
    },
    [categories, dispatch]
  )

  const onIsResponsibleMainCategoryToggle = useCallback(
    (slug, isToggled) => {
      const selectedSubCategories = isToggled ? categories[slug].sub : []
      dispatch(setIsResponsible({ slug, subCategories: selectedSubCategories }))
    },
    [categories, dispatch]
  )
  return (
    <Row data-testid="category-lists">
      <Form>
        <ControlsWrapper>
          <StyledFieldset style={{ paddingTop: 0, marginTop: 8 }}>
            <Label as="span" isGroupHeader>
              {i18n.t('verantwoordelijk-voor-categorie')}
            </Label>

            {categories && (
              <CategoryGroups
                boxWrapperKeyPrefix="is_responsible"
                onChange={onChangeIsResponsibleCategories}
                onToggle={onIsResponsibleMainCategoryToggle}
                state={state.is_responsible}
              />
            )}
          </StyledFieldset>
        </ControlsWrapper>

        <ControlsWrapper>
          <StyledFieldset>
            <Label as="span" isGroupHeader>
              {i18n.t('toegang-tot-categorie')}
            </Label>

            {categories && (
              <CategoryGroups
                boxWrapperKeyPrefix="can_view"
                onChange={onChangeCanViewCategories}
                onToggle={onCanViewMainCategoryToggle}
                state={state.can_view}
              />
            )}
          </StyledFieldset>
        </ControlsWrapper>

        <FormFooter
          cancelBtnLabel={i18n.t('annuleer')}
          onCancel={onCancelForm}
          onSubmitForm={onSubmitForm}
          submitBtnLabel={i18n.t('opslaan')}
        />
      </Form>
    </Row>
  )
}

CategoryLists.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
}

export default CategoryLists
