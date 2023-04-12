// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2023 Gemeente Amsterdam
import { useEffect, useState, useMemo } from 'react'

import { useDispatch } from 'react-redux'
import vegaEmbed from 'vega-embed'

import LoadingIndicator from 'components/LoadingIndicator'
import { showGlobalNotification } from 'containers/App/actions'
import { VARIANT_ERROR, TYPE_LOCAL } from 'containers/Notification/constants'
import { useFetchAll } from 'hooks'

import { Wrapper } from './styled'
import type { RawData } from './types'
import {
  getMaxDomain,
  getQueryList,
  getTotalNrOfIncidents,
  formatData,
} from './utils'
import { getBarChartSpecs } from '../../charts'
import type { BarChartValue } from '../../charts'
import { ModuleTitle } from '../ModuleTitle'

interface Props {
  queryString: string
}

export const BarChart = ({ queryString }: Props) => {
  const [data, setData] = useState<BarChartValue[]>()
  const [total, setTotal] = useState<number>()
  const queryList = useMemo(() => getQueryList(queryString), [queryString])
  const dispatch = useDispatch()

  const {
    data: rawData,
    error,
    isLoading,
    get: getBarChart,
  } = useFetchAll<RawData>()

  useEffect(() => {
    getBarChart(queryList)
  }, [getBarChart, queryList])

  useEffect(() => {
    if (rawData) {
      const formattedData = formatData(rawData)
      const totalIncidents = getTotalNrOfIncidents(rawData)
      setTotal(totalIncidents)
      setData(formattedData)
    }
  }, [rawData])

  useEffect(() => {
    if (error) {
      dispatch(
        showGlobalNotification({
          title: 'De data kon niet worden opgehaald',
          variant: VARIANT_ERROR,
          type: TYPE_LOCAL,
        })
      )
    }
  }, [error, dispatch])

  if (isLoading) {
    return <LoadingIndicator />
  }

  if (data) {
    const maxDomain = getMaxDomain(data)
    const barChartSpecs = getBarChartSpecs(data, maxDomain)

    vegaEmbed('#bar-chart', barChartSpecs, { actions: false })
  }

  return (
    <Wrapper>
      <ModuleTitle
        title="Openstaande meldingen tot en met vandaag"
        amount={total?.toString()}
      />
      <div data-testid="bar-chart" id="bar-chart" />
    </Wrapper>
  )
}