// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2018 - 2022 Gemeente Amsterdam
import type { ReactNode } from 'react'
import { Fragment } from 'react'

import { themeSpacing, themeColor } from '@amsterdam/asc-ui'
import styled from 'styled-components'

import ErrorMessage, { ErrorWrapper } from 'components/ErrorMessage'
import Label from 'components/Label'
import type {
  ReactiveFormMeta,
  FormMeta,
  FormOptions,
} from 'types/reactive-form'
import i18n from 'i18n'

const StyledErrorWrapper = styled(ErrorWrapper) <{ invalid: boolean }>`
  display: flex;
  flex-direction: column;

  & > :last-child:not(& > :first-child) {
    margin-top: ${themeSpacing(3)};
  }
`

const StyledLabel = styled(Label)`
  width: 100%;
  margin-bottom: 0;
`

const FieldSet = styled.fieldset`
  border: 0;
  padding: 0;
  margin-bottom: 0;

  & > :last-child {
    margin-top: ${themeSpacing(3)};
  }
`

const Optional = styled.span`
  font-weight: 400;
  margin-left: ${themeSpacing(2)};
`

const SubTitle = styled.p`
  color: ${themeColor('tint', 'level5')};
  margin-top: 0;
  margin-bottom: 0;
  font-weight: 300;
`

const InputWrapper = styled.div<{ width?: string }>`
  width: ${({ width }) => width || '100%'};
`

type PickedProps = 'hasError' | 'getError'
export interface FormFieldProps extends Pick<ReactiveFormMeta, PickedProps> {
  className?: string
  meta: FormMeta
  options?: FormOptions
  isFieldSet?: boolean
  children?: ReactNode
}

const FormField = ({
  isFieldSet,
  className,
  meta,
  options,
  hasError,
  getError,
  children,
}: FormFieldProps) => {
  const containsErrors: boolean =
    hasError('required') ||
    hasError('email') ||
    hasError('max') ||
    hasError('min') ||
    hasError('custom')

  const isOptional = !options?.validators?.some((validator: any) => {
    // Check if validator is a function with the name 'required'
    // If so, it also isn't optional
    if (validator.name === 'required') return true

    return ['required', 'min'].includes(validator)
  })

  const FieldSetWrapper = isFieldSet ? FieldSet : Fragment

  return (
    <StyledErrorWrapper className={className} invalid={containsErrors}>
      <FieldSetWrapper>
        {meta?.label && (
          <StyledLabel
            {...(isFieldSet ? { as: 'legend' } : { htmlFor: meta.name })}
          >
            <Fragment>
              {meta.label}
              {isOptional && <Optional>{i18n.t('niet-verplicht')}</Optional>}
            </Fragment>
          </StyledLabel>
        )}

        {meta?.subtitle && (
          <SubTitle id={`subtitle-${meta.name}`}>{meta.subtitle}</SubTitle>
        )}

        <div role="status">
          {containsErrors && (
            <Fragment>
              {(hasError('required') || hasError('min')) && (
                <ErrorMessage
                  data-testid={`${meta.name}-required`}
                  message={
                    getError('required') || getError('min')
                      ? i18n.t('dit-is-een-verplicht-veld')
                      : (getError('required') as string)
                  }
                />
              )}

              {hasError('email') && (
                <ErrorMessage
                  data-testid="invalid-mail"
                  message={i18n.t('vul-een-geldig-e-mailadres-in-met-een-en-een-domei')}
                />
              )}

              {hasError('max') && (
                <ErrorMessage
                  message={i18n.t('u-heeft-meer-dan-de-maximale-string-geterror-max-a', { requiredLength: getError('max') })}
                />
              )}

              {hasError('custom') && (
                <ErrorMessage message={getError('custom') as string} />
              )}
            </Fragment>
          )}
        </div>

        <InputWrapper width={meta?.width}>{children}</InputWrapper>
      </FieldSetWrapper>
    </StyledErrorWrapper>
  )
}

export default FormField
