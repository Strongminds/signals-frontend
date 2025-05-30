// SPDX-License-Identifier: MPL-2.0
// Copyright (C) 2019 - 2023 Gemeente Amsterdam
import { useEffect, useState } from 'react'

import { Logout as LogoutIcon } from '@amsterdam/asc-assets'
import { MenuItem } from '@amsterdam/asc-ui'
import { NavLink, useLocation } from 'react-router-dom'

import SearchBar from 'containers/SearchBar'
import { getIsAuthenticated } from 'shared/services/auth/auth'
import configuration from 'shared/services/configuration/configuration'

import type { ShowItems } from './SiteHeader'
import { SearchBarMenuItem, StyledMenuButton } from './styled'
import i18n from 'i18n'

interface Props {
  onLinkClick?: () => void
  onLogOut?: () => void
  showItems: ShowItems
}

export const MenuItems = ({ onLogOut, showItems, onLinkClick }: Props) => {
  const location = useLocation()
  const isAuthenticated = getIsAuthenticated()
  const [activeMenuItem, setActiveMenuItem] = useState('/manage/incidents')

  useEffect(() => {
    setActiveMenuItem(location.pathname)
  }, [location.pathname])

  return (
    <>
      {isAuthenticated && (
        <>
          <SearchBarMenuItem>
            <SearchBar />
          </SearchBarMenuItem>

          <MenuItem>
            <StyledMenuButton
              onClick={onLinkClick}
              forwardedAs={NavLink}
              to="/manage/incidents"
              $active={activeMenuItem.includes('/manage/incidents')}
            >
              {i18n.t('overzicht')}
            </StyledMenuButton>
          </MenuItem>
        </>
      )}

      <MenuItem>
        {/* Full page load to trigger refresh of incident form data */}
        <StyledMenuButton
          onClick={onLinkClick}
          forwardedAs="a"
          href="/incident/beschrijf"
          $active={activeMenuItem.includes('/incident/beschrijf')}
        >
          {i18n.t('melden')}
        </StyledMenuButton>
      </MenuItem>

      {isAuthenticated && (
        <MenuItem>
          <StyledMenuButton
            onClick={onLinkClick}
            forwardedAs={NavLink}
            to="/manage/signalering"
            $active={activeMenuItem.includes('/manage/signalering')}
          >
            {i18n.t('signalering')}
          </StyledMenuButton>
        </MenuItem>
      )}

      {configuration.featureFlags.showStandardTextAdminV1 &&
        showItems.defaultTexts && (
          <MenuItem>
            <StyledMenuButton
              onClick={onLinkClick}
              forwardedAs={NavLink}
              to="/manage/v1/standaardteksten"
              $active={activeMenuItem.includes('/manage/v1/standaardteksten')}
            >
              {i18n.t('standaard-teksten')}
              {configuration.featureFlags.showStandardTextAdminV2 && ' (v1)'}
            </StyledMenuButton>
          </MenuItem>
        )}

      {configuration.featureFlags.showStandardTextAdminV2 &&
        showItems.defaultTexts && (
          <MenuItem>
            <StyledMenuButton
              onClick={onLinkClick}
              forwardedAs={NavLink}
              to="/manage/v2/standaardteksten"
              $active={activeMenuItem.includes('/manage/v2/standaardteksten')}
            >
              {i18n.t('standaard-teksten')}
              {configuration.featureFlags.showStandardTextAdminV1 && ' (v2)'}
            </StyledMenuButton>
          </MenuItem>
        )}

      {showItems.settings && (
        <MenuItem>
          <StyledMenuButton
            onClick={onLinkClick}
            forwardedAs={NavLink}
            to="/instellingen/"
            $active={activeMenuItem.includes('/instellingen/')}
          >
            {i18n.t('instellingen')}
          </StyledMenuButton>
        </MenuItem>
      )}

      {isAuthenticated && (
        <>
          {configuration.links?.help && (
            <MenuItem>
              <StyledMenuButton
                onClick={onLinkClick}
                forwardedAs="a"
                href={configuration.links?.help}
                target="_blank"
              >
                {i18n.t('help')}
              </StyledMenuButton>
            </MenuItem>
          )}
          <MenuItem
            data-testid="logout-button"
            onClick={() => {
              onLinkClick && onLinkClick()
              onLogOut && onLogOut()
            }}
          >
            <StyledMenuButton
              iconSize={16}
              iconLeft={<LogoutIcon focusable="false" />}
            >
              {i18n.t('uitloggen')}
            </StyledMenuButton>
          </MenuItem>
        </>
      )}
    </>
  )
}
