// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2018 - 2021 Gemeente Amsterdam
import configuration from 'shared/services/configuration/configuration'
import FormComponents from '../components/form'
import IncidentNavigation from '../components/IncidentNavigation'
import i18n from 'i18n'

export default {
  label: 'Fout',
  previousButtonLabel: 'Vorige',
  previousButtonClass: 'action startagain',
  formAction: 'UPDATE_INCIDENT',
  form: {
    controls: {
      text: {
        meta: {
          className: 'col-sm-12 col-md-6',
          label:
            'Momenteel zijn er problemen met deze website en kan uw melding niet verwerkt worden.',
          type: 'bedankt',
          value: `
Probeert u het later nogmaals.

${configuration.language?.urgentContactInfo}`,
        },
        render: FormComponents.PlainText,
      },
      $field_0: {
        isStatic: false,
        render: IncidentNavigation,
      },
      help_text: {
        meta: {
          label: i18n.t("Lukt het niet om een melding te doen? Bel het telefoonnummer +4500000000"),
          value: i18n.t("Wij zijn bereikbaar van maandag tot en met vrijdag van 08.00 tot 18.00 uur."),
        },
        render: FormComponents.PlainText,
      },
    },
  },
}
