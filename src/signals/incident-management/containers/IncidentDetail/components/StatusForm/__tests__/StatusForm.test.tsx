// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2018 - 2021 Gemeente Amsterdam
import { render, screen } from '@testing-library/react'
import { ThemeProvider } from '@amsterdam/asc-ui'

import incidentJSON from 'utils/__tests__/fixtures/incident.json'
import {
  changeStatusOptionList,
  GEMELD,
  INGEPLAND,
  AFGEHANDELD,
  GEANNULEERD,
  REACTIE_GEVRAAGD,
  HEROPEND,
  AFWACHTING,
} from 'signals/incident-management/definitions/statusList'
import {
  StatusCode,
  Status,
} from 'signals/incident-management/definitions/types'

import type { Incident } from 'types/api/incident'

import userEvent from '@testing-library/user-event'
import { PATCH_TYPE_STATUS } from '../../../constants'
import IncidentDetailContext from '../../../context'
import StatusForm from '..'
import {
  MELDING_CHECKBOX_DESCRIPTION,
  DEELMELDING_EXPLANATION,
  DEELMELDINGEN_STILL_OPEN_HEADING,
  DEELMELDINGEN_STILL_OPEN_CONTENT,
  DEFAULT_TEXT_LABEL,
  DEFAULT_TEXT_MAX_LENGTH,
} from '../constants'

import type { IncidentChild } from '../../../types'

const incidentFixture = incidentJSON as unknown as Incident
const defaultTexts = [
  {
    state: StatusCode.Ingepland,
    templates: [
      { title: 'Ingepland', text: 'Over 1 dag' },
      { title: 'Ingepland', text: 'Over 2 dagen' },
      { title: '', text: '' },
    ],
  },
  {
    state: StatusCode.Afgehandeld,
    templates: [
      { title: 'Niet opgelost', text: 'Geen probleem gevonden' },
      { title: 'Niet opgelost', text: 'Niet voor regio Amsterdam' },
      { title: 'Opgelost', text: 'Lamp vervangen' },
      { title: 'Opgelost', text: 'Lantaarnpaal vervangen' },
    ],
  },
]

const close = jest.fn()
const update = jest.fn()

const renderWithContext = (
  incident = incidentFixture,
  childIncidents: IncidentChild[] = []
) => (
  <IncidentDetailContext.Provider value={{ incident, update, close }}>
    <ThemeProvider>
      <StatusForm defaultTexts={defaultTexts} childIncidents={childIncidents} />
    </ThemeProvider>
  </IncidentDetailContext.Provider>
)

const statusSendsEmailWhenSet = AFGEHANDELD

const statusDoesNotSendEmailWhenSet = changeStatusOptionList.filter(
  ({ email_sent_when_set }) => !email_sent_when_set
)[0]

const getChildIncidents = (statuses: Status[]) => {
  const category = incidentFixture.category || {
    sub: '',
    sub_slug: '',
    departments: '',
    main: '',
    main_slug: '',
  }

  const childIncidents = statuses.map(({ key }) => ({
    _links: incidentFixture._links,
    id: incidentFixture.id,
    category: {
      sub: category.sub,
      sub_slug: category.sub_slug,
      departments: category.departments,
      main: category.main,
      main_slug: category.main_slug,
    },
    status: { state: key, state_display: key },
    can_view_signal: true,
  }))

  return childIncidents
}

describe('signals/incident-management/containers/IncidentDetail/components/StatusForm', () => {
  afterEach(() => {
    close.mockReset()
    update.mockReset()
  })

  it('renders correctly', () => {
    render(renderWithContext())

    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Opslaan' })).toBeInTheDocument()
    expect(screen.getByTestId('statusFormCancelButton')).toBeInTheDocument()

    Object.values(changeStatusOptionList).forEach(({ value }) => {
      expect(screen.getByLabelText(value)).toBeInTheDocument()
    })

    expect(screen.getByTestId('sendEmailCheckbox')).toBeInTheDocument()
    expect(screen.getByText(MELDING_CHECKBOX_DESCRIPTION)).toBeInTheDocument()
  })

  it('renders a disabled checkbox', () => {
    // render component with incident status that will disable the checkbox
    const withSendEmailStatus = { ...incidentFixture }
    if (withSendEmailStatus?.status?.state) {
      withSendEmailStatus.status.state = statusSendsEmailWhenSet.key
    }

    render(renderWithContext(withSendEmailStatus))

    // verify that checkbox is checked and disabled
    const checkbox = screen.getByTestId('sendEmailCheckbox')
    expect(checkbox).toBeChecked()
    expect(checkbox).toBeDisabled()

    // verify that the label '(niet verplicht)' is not in the document
    expect(screen.queryByText('(niet verplicht)')).not.toBeInTheDocument()

    // select a status that will not disable the checkbox
    userEvent.click(screen.getByRole('radio', { name: GEMELD.value }))

    // verify that checkbox is NOT checked and NOT disabled
    expect(checkbox).not.toBeChecked()
    expect(checkbox).not.toBeDisabled()

    // verify that the label '(niet verplicht)' is in the document
    expect(screen.queryByText('(niet verplicht)')).toBeInTheDocument()
  })

  it('renders a disabled checkbox when changing from verzoek tot heropenen to afgehandeld', () => {
    const withHeropenenStatus = { ...incidentFixture }
    if (withHeropenenStatus?.status?.state) {
      withHeropenenStatus.status.state = StatusCode.VerzoekTotHeropenen
    }

    // render status verzoek tot heropenen
    render(renderWithContext(withHeropenenStatus))

    userEvent.click(screen.getByText('Heropend'))

    const checkbox = screen.getByTestId('sendEmailCheckbox')

    expect(checkbox).toBeChecked()
    expect(checkbox).toBeDisabled()

    userEvent.click(screen.getByText('Afgehandeld'))

    expect(checkbox).not.toBeChecked()
    expect(checkbox).not.toBeDisabled()
  })

  it('requires a text value when the checkbox is selected', async () => {
    const withSendEmailStatus = { ...incidentFixture }
    if (withSendEmailStatus?.status?.state) {
      withSendEmailStatus.status.state = statusSendsEmailWhenSet.key
    }
    // render component with incident status that will disable the checkbox
    render(renderWithContext(withSendEmailStatus))

    // verify that checkbox is checked and disabled
    const checkbox = screen.getByTestId('sendEmailCheckbox')
    expect(checkbox).toBeChecked()
    expect(checkbox).toBeDisabled()

    // submit the form
    userEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    await screen.findByTestId('statusForm')

    // verify that an error message is shown
    expect(screen.queryByText('Dit veld is verplicht')).toBeInTheDocument()

    // verify that 'update' and 'close' have NOT been called
    expect(update).not.toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()

    // type text in textarea
    const textarea = screen.getByRole('textbox')
    const value = 'Foo bar baz'
    userEvent.type(textarea, value)

    // verify that an error message is NOT shown
    expect(screen.queryByText('Dit veld is verplicht')).not.toBeInTheDocument()

    // submit the form
    userEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    await screen.findByTestId('statusForm')

    // verify that 'update' and 'close' have been called
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PATCH_TYPE_STATUS,
        patch: {
          status: expect.objectContaining({ text: value }),
        },
      })
    )
    expect(close).toHaveBeenCalled()
  })

  it('toggles the requirement for the text field', () => {
    const withNotSendEmailStatus = { ...incidentFixture }
    if (withNotSendEmailStatus?.status?.state) {
      withNotSendEmailStatus.status.state = statusDoesNotSendEmailWhenSet.key
    }
    // render component
    render(renderWithContext(withNotSendEmailStatus))

    const checkbox = screen.getByTestId('sendEmailCheckbox')

    expect(checkbox).not.toBeChecked()

    // verify that the label '(niet verplicht)' is in the document
    expect(screen.getByText('(niet verplicht)')).toBeInTheDocument()

    // check the box
    userEvent.click(checkbox)

    expect(checkbox).toBeChecked()

    // verify that the label '(niet verplicht)' is not in the document
    expect(screen.queryByText('(niet verplicht)')).not.toBeInTheDocument()

    // toggle the box
    userEvent.click(checkbox)

    // verify that the label '(niet verplicht)' is in the document
    expect(screen.getByText('(niet verplicht)')).toBeInTheDocument()
  })

  it('clears the text field when a default text is selected', () => {
    const texts = defaultTexts[0]
    const withDefaultTextsSelectedState = { ...incidentFixture }
    if (withDefaultTextsSelectedState?.status?.state) {
      withDefaultTextsSelectedState.status.state = texts.state
    }
    // render component with incident status that will render default texts
    render(renderWithContext(withDefaultTextsSelectedState))

    // verify that there are default texts visible
    expect(screen.getByTestId('defaultTextsTitle')).toBeInTheDocument()

    // verify that the text field is empty
    expect(screen.getByRole('textbox')).toHaveTextContent('')

    // click a default text link
    const link = screen.getAllByTestId('defaultTextsItemButton')[0]
    const { textContent } = screen.getAllByTestId(
      'defaultTextsItemText'
    )[0] as HTMLElement

    userEvent.click(link)

    // verify that the text field is NOT empty
    expect(screen.getByRole('textbox')).toHaveTextContent(textContent || '')

    // select another status
    userEvent.click(screen.getByRole('radio', { name: GEMELD.value }))

    // verify that the text field is empty again
    expect(screen.getByRole('textbox')).toHaveTextContent('')
  })

  it('does not clear the text field when text has been entered manually', () => {
    // render component
    render(renderWithContext())

    // verify that the text field is empty
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveTextContent('')

    // type in textarea
    const value = 'Foo bar baz'
    userEvent.type(textarea, value)

    // verify that the text field is NOT empty
    expect(textarea).toHaveTextContent(value)

    // select another status
    userEvent.click(screen.getByRole('radio', { name: AFWACHTING.value }))

    // verify that the text field is NOT empty
    expect(textarea).toHaveTextContent(value)
  })

  it('shows an error when typing too many characters in the text field', async () => {
    render(renderWithContext())

    const textarea = screen.getByRole('textbox')

    userEvent.type(textarea, 'A'.repeat(DEFAULT_TEXT_MAX_LENGTH + 1))

    userEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    expect(screen.getByRole('alert').textContent).toBe(
      `Je hebt meer dan de maximale ${DEFAULT_TEXT_MAX_LENGTH} tekens ingevoerd.`
    )
  })

  it('shows an error when the text field contains specific characters', async () => {
    // render component
    render(renderWithContext())

    // type in textarea with special characters '{{' and '}}'
    const textarea = screen.getByRole('textbox')
    const valueWithBrackets = 'Foo {{bar}} baz'
    userEvent.type(textarea, valueWithBrackets)

    // verify that an error message is NOT shown
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    // submit the form
    userEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    await screen.findByTestId('statusForm')

    // verify that an error message is shown
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // verify that 'update' and 'close' have NOT been called
    expect(update).not.toHaveBeenCalled()
    expect(close).not.toHaveBeenCalled()

    // clear textarea
    const clearText = '{selectall}{backspace}'
    userEvent.type(textarea, clearText)

    // verify that an error message is NOT shown
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    const valueWithUnderscores = 'Foo __bar__ baz'
    userEvent.type(textarea, valueWithUnderscores)

    userEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    // verify that an error message is shown
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // clear textarea
    userEvent.type(textarea, clearText)

    // type in textarea
    const validValue = 'Foo bar baz'
    userEvent.type(textarea, validValue)

    // submit the form
    userEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    await screen.findByTestId('statusForm')

    // verify that 'update' and 'close' have been called
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        type: PATCH_TYPE_STATUS,
        patch: {
          status: expect.objectContaining({ text: validValue }),
        },
      })
    )
    expect(close).toHaveBeenCalled()
  })

  it('clears the error message when another status is selected', async () => {
    render(renderWithContext())

    // verify that an error message is NOT shown
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('radio', { name: AFGEHANDELD.value }))

    // submit the form
    userEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    await screen.findByTestId('statusForm')

    // verify that an error message is shown
    expect(screen.queryByText('Dit veld is verplicht')).toBeInTheDocument()

    // select another status
    const otherStatus = screen.getByRole('radio', {
      name: REACTIE_GEVRAAGD.value,
    })
    userEvent.click(otherStatus)

    // verify that an error message is NOT shown
    expect(screen.queryByText('Dit veld is verplicht')).not.toBeInTheDocument()
  })

  it('shows a warning that is specific to certain statuses', async () => {
    render(renderWithContext())

    expect(screen.queryByTestId('end-status-warning')).not.toBeInTheDocument()
    userEvent.click(screen.getByRole('radio', { name: AFGEHANDELD.value }))
    expect(screen.getByTestId('end-status-warning')).toBeInTheDocument()
  })

  it('shows a warning when user has no email', () => {
    const withoutReporterEmail = { ...incidentFixture }
    if (withoutReporterEmail?.reporter?.email) {
      withoutReporterEmail.reporter.email = ''
    }
    render(renderWithContext(withoutReporterEmail))

    userEvent.click(screen.getByRole('radio', { name: AFGEHANDELD.value }))
    expect(screen.getByTestId('no-email-warning')).toBeInTheDocument()
  })

  it('shows a warning when switching to reply status user has no email', () => {
    const withoutReporterEmail = { ...incidentFixture }
    if (withoutReporterEmail?.reporter?.email) {
      withoutReporterEmail.reporter.email = ''
    }
    render(renderWithContext(withoutReporterEmail))

    userEvent.click(screen.getByRole('radio', { name: REACTIE_GEVRAAGD.value }))
    expect(screen.getByTestId('has-no-email-reply-warning')).toBeInTheDocument()
  })

  it('shows an explanation text when email will be sent', () => {
    render(renderWithContext())

    userEvent.click(screen.getByText('Afgehandeld'))

    expect(screen.queryByText(DEFAULT_TEXT_LABEL)).toBeInTheDocument()
  })

  it('is not required to provide text when new status is not an end state of a split incident', () => {
    const deelmelding = {
      ...incidentFixture,
      _links: {
        ...incidentFixture._links,
        'sia:parent': {
          href: 'https://acc.api.data.amsterdam.nl/signals/v1/private/categories/106',
          public:
            'https://acc.api.data.amsterdam.nl/signals/v1/public/terms/categories/civiele-constructies',
        },
      },
    }

    // render component with incident that has a parent
    const { container } = render(renderWithContext(deelmelding))

    userEvent.click(
      container.querySelector('input[value="i"]') as HTMLInputElement
    )
    userEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    expect(screen.queryByText('Dit veld is verplicht')).not.toBeInTheDocument()
  })

  it('is required to provide text new status is an end state of a split incident', () => {
    const deelmelding = {
      ...incidentFixture,
      _links: {
        ...incidentFixture._links,
        'sia:parent': {
          href: 'https://acc.api.data.amsterdam.nl/signals/v1/private/categories/106',
          public:
            'https://acc.api.data.amsterdam.nl/signals/v1/public/terms/categories/civiele-constructies',
        },
      },
    }

    // render component with incident that has a parent
    const { container } = render(renderWithContext(deelmelding))

    userEvent.click(
      container.querySelector('input[value="o"]') as HTMLInputElement
    )
    userEvent.click(screen.getByRole('button', { name: 'Opslaan' }))

    expect(screen.getByText('Dit veld is verplicht')).toBeInTheDocument()
  })

  it('shows a warning that is specific to a deelmelding', () => {
    const deelmelding = {
      ...incidentFixture,
      _links: {
        ...incidentFixture._links,
        'sia:parent': {
          href: 'https://acc.api.data.amsterdam.nl/signals/v1/private/categories/106',
          public:
            'https://acc.api.data.amsterdam.nl/signals/v1/public/terms/categories/civiele-constructies',
        },
      },
    }

    // render component with incident that has a parent
    render(renderWithContext(deelmelding))

    // verify that warning with text DEELMELDING_EXPLANATION is visible
    expect(screen.getByTestId('split-incident-warning').textContent).toEqual(
      DEELMELDING_EXPLANATION
    )

    // select a status that will show a warning
    userEvent.click(screen.getByRole('radio', { name: HEROPEND.value }))

    // verify that explanation with text DEELMELDING_EXPLANATION is visible
    expect(screen.getByTestId('split-incident-warning').textContent).toEqual(
      DEELMELDING_EXPLANATION
    )

    userEvent.click(screen.getByText(REACTIE_GEVRAAGD.value))
    expect(
      screen.getByTestId('split-incident-reply-warning')
    ).toBeInTheDocument()
  })

  it('shows a warning when there are child incidents still open', async () => {
    const childIncidents = getChildIncidents([GEMELD, INGEPLAND])
    render(renderWithContext(incidentFixture, childIncidents))

    expect(
      screen.queryByTestId('has-open-child-incidents-warning')
    ).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('radio', { name: AFGEHANDELD.value }))

    expect(
      screen.getByTestId('has-open-child-incidents-warning').textContent
    ).toContain(DEELMELDINGEN_STILL_OPEN_HEADING)
    expect(
      screen.getByTestId('has-open-child-incidents-warning').textContent
    ).toContain(DEELMELDINGEN_STILL_OPEN_CONTENT)

    userEvent.click(screen.getByRole('radio', { name: INGEPLAND.value }))

    expect(
      screen.queryByTestId('has-open-child-incidents-warning')
    ).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('radio', { name: GEANNULEERD.value }))
    expect(
      screen.getByTestId('has-open-child-incidents-warning').textContent
    ).toContain(DEELMELDINGEN_STILL_OPEN_CONTENT)
    expect(
      screen.getByTestId('has-open-child-incidents-warning').textContent
    ).toContain(DEELMELDINGEN_STILL_OPEN_HEADING)
  })

  it('shows NO warning when the child incidents are closed', async () => {
    const childIncidents = getChildIncidents([AFGEHANDELD, GEANNULEERD])

    render(renderWithContext(incidentFixture, childIncidents))

    expect(
      screen.queryByTestId('statusHasChildrenOpen')
    ).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('radio', { name: AFGEHANDELD.value }))

    expect(
      screen.queryByTestId('statusHasChildrenOpen')
    ).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('radio', { name: INGEPLAND.value }))

    expect(
      screen.queryByTestId('statusHasChildrenOpen')
    ).not.toBeInTheDocument()

    userEvent.click(screen.getByRole('radio', { name: GEANNULEERD.value }))

    expect(
      screen.queryByTestId('statusHasChildrenOpen')
    ).not.toBeInTheDocument()
  })

  it('is not possible to submit a status when an notification has level "error"', () => {
    const withoutReporterEmail = { ...incidentFixture }
    if (withoutReporterEmail?.reporter?.email) {
      withoutReporterEmail.reporter.email = ''
    }

    render(renderWithContext(withoutReporterEmail))

    const submitButton = screen.getByRole('button', { name: 'Opslaan' })

    expect(submitButton).not.toBeDisabled()
    userEvent.click(screen.getByRole('radio', { name: REACTIE_GEVRAAGD.value }))
    expect(submitButton).toBeDisabled()
  })
})