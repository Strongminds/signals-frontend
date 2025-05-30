// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2019 - 2023 Gemeente Amsterdam
import { useCallback, useMemo } from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { createStructuredSelector } from 'reselect'

import PageHeader from 'components/PageHeader'
import { makeSelectSearchQuery } from 'containers/App/selectors'
import * as types from 'shared/types'
import {
  makeSelectActiveFilter,
  makeSelectIncidentsCount,
  makeSelectOrdering,
} from 'signals/incident-management/selectors'

import { SubTitle, StyledLink, RefreshIcon, StyledSpan } from './styled'
import { sortOptionsList } from '../../contants'
import i18n from 'i18n'

const getSortInformation = (ordering) => {
  const sort = sortOptionsList.find((sortOption) => {
    return sortOption.asc === ordering || sortOption.desc === ordering
  })

  if (sort.asc === ordering)
    return `${sort.label.toLowerCase()} ${sort.asc_label}`
  if (sort.desc === ordering)
    return `${sort.label.toLowerCase()} ${sort.desc_label}`
}

export const IncidentOverviewTitle = ({
  filter,
  incidentsCount,
  query,
  ordering,
  orderingChangedAction,
  showsMap,
}) => {
  const headerTitle = useMemo(() => {
    let title = filter.name || i18n.t('meldingen')
    const hasCount = incidentsCount !== null && incidentsCount >= 0
    title += hasCount ? ` (${incidentsCount.toLocaleString('nl-NL')})` : ''

    return filter.refresh ? (
      <div>
        <RefreshIcon
          data-testid="refresh-icon"
          role="img"
          aria-label="Ververst automatisch"
        />{' '}
        {title}
      </div>
    ) : (
      title
    )
  }, [filter, incidentsCount])

  const resetSorting = useCallback(() => {
    orderingChangedAction('')
  }, [orderingChangedAction])

  const subTitleSearch = useMemo(
    () => query && `Zoekresultaten voor "${query}"`,
    [query]
  )

  const subTitleSort = useMemo(() => {
    const sortInformation = ordering && getSortInformation(ordering)
    return sortInformation && i18n.t('sorteer-op-sortinformation', { sortInformation })
  }, [ordering])

  return (
    <PageHeader title={headerTitle}>
      {subTitleSearch && <SubTitle>{subTitleSearch}</SubTitle>}
      {subTitleSort && !showsMap && (
        <>
          <StyledSpan>{subTitleSort}</StyledSpan>
          <StyledLink onClick={resetSorting}>{i18n.t('wis-sortering')}</StyledLink>
        </>
      )}
    </PageHeader>
  )
}

IncidentOverviewTitle.defaultProps = {
  children: null,
  ordering: '',
}

IncidentOverviewTitle.propTypes = {
  filter: types.filterType,
  children: PropTypes.node,
  incidentsCount: PropTypes.number,
  query: PropTypes.string,
  ordering: PropTypes.string.isRequired,
  orderingChangedAction: PropTypes.func.isRequired,
  showsMap: PropTypes.bool.isRequired,
}

const mapStateToProps = createStructuredSelector({
  filter: makeSelectActiveFilter,
  incidentsCount: makeSelectIncidentsCount,
  query: makeSelectSearchQuery,
  ordering: makeSelectOrdering,
})

const withConnect = connect(mapStateToProps)

export default compose(withConnect)(IncidentOverviewTitle)
