// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2022 - 2023 Vereniging van Nederlandse Gemeenten, Gemeente Amsterdam
import isEmpty from 'lodash/isEmpty'
import { useFormContext } from 'react-hook-form'

import { StyledErrorAlert } from './styled'
import type { Meta } from '../../signals/incident/components/form/MapSelectors/types'
import i18n from 'i18n'

type Props = {
  meta?: Partial<Meta>
}

const GlobalError = ({ meta }: Props) => {
  const { formState } = useFormContext()
  let label = meta?.label
  const message: any = Object.values(formState.errors || {})[0]?.message
  if (meta && message?.globalMessage) {
    label = message?.globalMessage
  }

  const invalid =
    formState.errors?.dateTime?.type === i18n.t('custom') ? i18n.t('(juist)') + ' ' : ''

  return !isEmpty(formState?.errors) ? (
    <StyledErrorAlert>
      {label || i18n.t('U hebt niet alle vragen {{Invalid}}beantwoord. Vul hieronder aan alstublieft.', { Invalid: invalid }) }
    </StyledErrorAlert>
  ) : null
}

export default GlobalError
