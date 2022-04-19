// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2022 Gemeente Amsterdam
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { withAppContext } from 'test/utils'

import { FormBuilder } from 'react-reactive-form'
import type { FormArray } from 'react-reactive-form'

import DefaultTextsForm from './DefaultTextsForm'

const fields = [...new Array(3).keys()].reduce(
  (acc, key) => ({
    ...acc,
    [`item${key}`]: FormBuilder.group({
      title: ['title'],
      text: ['text'],
      is_active: [true],
    }),
  }),
  {}
)

describe('<DefaultTextsForm />', () => {
  const form = FormBuilder.group({
    ...fields,
    categoryUrl: null,
    state: null,
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('renders the form correctly', () => {
    const props = {
      item: 'item0',
      form: form as unknown as FormArray,
      itemsLength: 3,
      index: 0,
      onCheck: jest.fn(),
      changeOrdering: jest.fn(),
    }
    render(withAppContext(<DefaultTextsForm {...props} />))

    expect(
      screen.getByTestId(`defaultTextFormForm${props.index}`)
    ).toBeInTheDocument()
    expect(screen.getByTestId(`title${props.index}`)).toBeInTheDocument()
    expect(screen.getByTestId(`text${props.index}`)).toBeInTheDocument()
    expect(
      screen.getByTestId(`defaultTextFormItemButton${props.index}Up`)
    ).toBeDisabled()
    expect(
      screen.getByTestId(`defaultTextFormItemButton${props.index}Down`)
    ).not.toBeDisabled()
  })

  it('interacts with the form correctly', () => {
    const props = {
      item: 'item1',
      form: form as unknown as FormArray,
      itemsLength: 3,
      index: 1,
      onCheck: jest.fn(),
      changeOrdering: jest.fn(),
    }
    render(withAppContext(<DefaultTextsForm {...props} />))

    expect(
      screen.getByTestId(`defaultTextFormForm${props.index}`)
    ).toBeInTheDocument()

    const checkbox = screen.getByText('Actief')
    userEvent.click(checkbox)
    expect(props.onCheck).toHaveBeenCalledWith(
      props.item,
      props.form.get(`${props.item}.is_active`).value
    )

    userEvent.click(
      screen.getByTestId(`defaultTextFormItemButton${props.index}Up`)
    )
    expect(props.changeOrdering).toHaveBeenCalledTimes(1)

    userEvent.click(
      screen.getByTestId(`defaultTextFormItemButton${props.index}Down`)
    )
    expect(props.changeOrdering).toHaveBeenCalledTimes(2)
  })
})