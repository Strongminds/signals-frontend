// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2023 Gemeente Amsterdam
import { useCallback, useEffect, useMemo } from 'react'

import { Column, Row } from '@amsterdam/asc-ui'
import { yupResolver } from '@hookform/resolvers/yup'
import isEmpty from 'lodash/isEmpty'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import * as yup from 'yup'

import BackLink from 'components/BackLink'
import Button from 'components/Button'
import Checkbox from 'components/Checkbox'
import GlobalError from 'components/GlobalError'
import Input from 'components/Input'
import Label from 'components/Label'
import LoadingIndicator from 'components/LoadingIndicator'
import PageHeader from 'components/PageHeader'
import RadioButtonList from 'components/RadioButtonList'
import { useConfirm } from 'hooks/useConfirm'
import useFetch from 'hooks/useFetch'
import configuration from 'shared/services/configuration/configuration'
import { changeStatusOptionList } from 'signals/incident-management/definitions/statusList'

import {
  Form,
  GlobalErrorWrapper,
  Grid,
  LeftSection,
  RightSection,
  StyledFormFooter,
  StyledLabel,
  StyledTextArea,
} from './styled'
import type { StandardTextDetailData, StandardTextForm } from './types'
import { createPatch, createPost } from './utils'
import useFetchResponseNotification from '../../../../../settings/hooks/useFetchResponseNotification'
import { SelectedSubcategories } from '../SelectedSubcategories'
import Subcategories from '../Subcategories'
import i18n from 'i18n'

interface Option {
  key: string
  value: string
}

const schema = yup.object({
  categories: yup
    .array()
    .min(1, i18n.t('vul-de-subcategorie-en-in'))
    .required(i18n.t('vul-de-subcategorie-en-in-0')),
  title: yup.string().required(i18n.t('vul-een-titel-in')),
  text: yup.string().required(i18n.t('vul-een-omschrijving-in')),
})

export const Detail = () => {
  const { isConfirmed } = useConfirm()

  const navigate = useNavigate()
  const params = useParams()
  const { get, data, isLoading, patch, del, post, isSuccess, error, type } =
    useFetch<StandardTextDetailData>()

  const title = params.id
    ? i18n.t('standaardtekst-wijzigen')
    : i18n.t('standaardtekst-toevoegen')

  useFetchResponseNotification({
    entityName: i18n.t('standaard-tekst'),
    error,
    isLoading,
    isSuccess,
    redirectURL: '../',
    requestType: type,
  })

  const defaultValues: StandardTextForm | null = useMemo(() => {
    return {
      categories: data?.categories ?? [],
      state: data?.state ?? 'm',
      title: data?.title ?? '',
      text: data?.text ?? '',
      active: data?.active ?? true,
    }
  }, [data])

  const options = changeStatusOptionList.map((option) => ({
    key: option.key,
    value: option.value,
  }))

  const formMethods = useForm<StandardTextForm>({
    resolver: yupResolver(schema),
    defaultValues: { ...defaultValues },
  })

  const { handleSubmit, formState, reset, getValues } = formMethods

  const onSubmit = useCallback(() => {
    const hasDirtyFields = Object.keys(formState.dirtyFields).length > 0

    if (params.id && hasDirtyFields) {
      patch(
        `${configuration.STANDARD_TEXTS_ENDPOINT}${params.id}`,
        createPatch(getValues(), formState.dirtyFields)
      )
    } else if (hasDirtyFields) {
      post(`${configuration.STANDARD_TEXTS_ENDPOINT}`, createPost(getValues()))
    } else {
      navigate(-1)
    }
  }, [formState.dirtyFields, params.id, patch, getValues, post, navigate])

  const handleOnCancel = () => {
    navigate(-1)
  }

  const handleOnDelete = async () => {
    const confirmed = await isConfirmed(
      i18n.t('let-op-je-verwijdert-de-standaardtekst'),
      i18n.t('er-is-geen-back-up-beschikbaar')
    )
    if (confirmed) {
      del(`${configuration.STANDARD_TEXTS_ENDPOINT}${params.id}`)
    }
  }

  useEffect(() => {
    if (params.id && !data && !isLoading && !error) {
      get(`${configuration.STANDARD_TEXTS_ENDPOINT}${params.id}`)
    }
  }, [data, get, params, isLoading, error])

  useEffect(() => {
    defaultValues && reset(defaultValues)
  }, [defaultValues, reset])

  return (
    <FormProvider {...formMethods}>
      <Routes>
        <Route
          path="subcategories"
          element={
            <Controller
              name="categories"
              render={({ field: { onChange, value } }) => (
                <Subcategories
                  defaultText={data?.title}
                  onChange={onChange}
                  value={value}
                />
              )}
            />
          }
        />
        <Route
          path={'/'}
          element={
            <>
              <Row>
                <Column span={12}>
                  {!isEmpty(formState?.errors) && (
                    <GlobalErrorWrapper>
                      <GlobalError
                        meta={{
                          label: i18n.t('de-standaardtekst-kan-niet-worden-opgeslagen'),
                        }}
                      />
                    </GlobalErrorWrapper>
                  )}
                </Column>
              </Row>
              <Row>
                <PageHeader
                  dataTestId={'defaulttextadmin-page-header'}
                  title={title}
                  BackLink={
                    <BackLink to={'../../'}>{i18n.t('terug-naar-overzicht')}</BackLink>
                  }
                />
              </Row>
              {isLoading && <LoadingIndicator />}
              <Row>
                <Column span={12}>
                  <Form onSubmit={handleSubmit(onSubmit)}>
                    <Grid>
                      <LeftSection>
                        <Controller
                          name="categories"
                          render={({
                            field: { name, onChange, value },
                            fieldState: { error },
                          }) => (
                            <SelectedSubcategories
                              name={name}
                              error={error}
                              onChange={onChange}
                              value={value}
                            />
                          )}
                        />
                        <Controller
                          name="state"
                          render={({ field: { value, onChange } }) => {
                            const handleOnchange = (
                              _groupName: string,
                              option: Option
                            ) => {
                              onChange(option.key)
                            }
                            return (
                              <>
                                <Label as="span">{i18n.t('status')}</Label>
                                <RadioButtonList
                                  groupName="Status"
                                  hasEmptySelectionButton={false}
                                  defaultValue={value}
                                  options={options}
                                  onChange={handleOnchange}
                                />
                              </>
                            )
                          }}
                        />
                      </LeftSection>

                      <RightSection>
                        <Controller
                          name="title"
                          render={({
                            field: { name, value = '', onChange },
                            fieldState: { error },
                          }) => (
                            <Input
                              id={name}
                              name={name}
                              value={value}
                              onChange={onChange}
                              placeholder={i18n.t('titel')}
                              error={error?.message}
                            />
                          )}
                        />
                        <Controller
                          name="text"
                          render={({
                            field: { name, value, onChange },
                            fieldState: { error },
                          }) => (
                            <StyledTextArea
                              showError={Boolean(error)}
                              id={name}
                              name={name}
                              value={value}
                              onChange={onChange}
                              placeholder={i18n.t('tekst')}
                              errorMessage={error?.message}
                            />
                          )}
                        />
                        <Controller
                          name="active"
                          render={({ field: { name, value, onChange } }) => (
                            <div>
                              <StyledLabel htmlFor={name} label={i18n.t('actief')}>
                                <Checkbox
                                  name={name}
                                  checked={value}
                                  id={name}
                                  onChange={onChange}
                                />
                              </StyledLabel>
                            </div>
                          )}
                        />

                        {params.id && (
                          <Button
                            variant="secondary"
                            onClick={handleOnDelete}
                            type="button"
                          >
                            {i18n.t('verwijderen')}
                          </Button>
                        )}
                      </RightSection>
                    </Grid>

                    <StyledFormFooter
                      cancelBtnLabel={i18n.t('annuleer')}
                      onCancel={handleOnCancel}
                      submitBtnLabel={i18n.t('opslaan')}
                    />
                  </Form>
                </Column>
              </Row>
            </>
          }
        />
      </Routes>
    </FormProvider>
  )
}
