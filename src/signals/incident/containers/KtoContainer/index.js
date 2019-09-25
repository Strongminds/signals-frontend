import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';
import { compose, bindActionCreators } from 'redux';
import { Row, Column } from '@datapunt/asc-ui';

import injectSaga from 'utils/injectSaga';
import injectReducer from 'utils/injectReducer';
import makeSelectKtoContainer from './selectors';
import reducer from './reducer';
import saga from './saga';
import './style.scss';

import { updateKto, requestKtoAnswers, checkKto, storeKto } from './actions';
import KtoForm from './components/KtoForm';

export class KtoContainer extends React.Component {
  componentWillMount() {
    this.props.requestKtoAnswers(this.props.yesNo === 'ja');
    this.props.checkKto(this.props.uuid);
  }

  static renderHeader(type) {
    switch (type) {
      case 'ja':
        return <h1>Ja, ik ben tevreden met de behandeling van mijn melding</h1>;

      case 'nee':
        return (
          <h1>Nee, ik ben niet tevreden met de behandeling van mijn melding</h1>
        );

      case 'finished':
        return (
          <header>
            <h1>Bedankt voor uw feedback!</h1>
            <p>We zijn voortdurend bezig onze dienstverlening te verbeteren.</p>
          </header>
        );

      case 'too late':
        return (
          <header>
            <h1>Helaas, de mogelijkheid om feedback te geven is verlopen</h1>
            <p>
              Na het afhandelend van uw melding heeft u 2 weken de gelegenheid
              om feedback te geven.
            </p>
          </header>
        );

      case 'filled out':
        return (
          <header>
            <h1>Er is al feedback gegeven voor deze melding</h1>
            <p>
              Nogmaals bedankt voor uw feedback. We zijn voortdurend bezig onze
              dienstverlening te verbeteren.
            </p>
          </header>
        );
      default:
        return null;
    }
  }

  render() {
    const { ktoContainer, onUpdateKto, onStoreKto, yesNo } = this.props;

    if (ktoContainer.statusError) {
      return (
        <Row>
          <Column span={12}>
            {KtoContainer.renderHeader(ktoContainer.statusError)}
          </Column>
        </Row>
      );
    }

    if (ktoContainer.ktoFinished) {
      return (
        <Row>
          <Column span={12}>{KtoContainer.renderHeader('finished')}</Column>
        </Row>
      );
    }

    return (
      <Fragment>
        <Row>
          <Column span={12}>{KtoContainer.renderHeader(yesNo)}</Column>
        </Row>

        <Row>
          <Column span={{ small: 2, medium: 2, big: 8, large: 8, xLarge: 8 }}>
            <KtoForm
              ktoContainer={ktoContainer}
              onUpdateKto={onUpdateKto}
              onStoreKto={onStoreKto}
            />
          </Column>
        </Row>
      </Fragment>
    );
  }
}

KtoContainer.defaultProps = {
  ktoContainer: {
    statusError: false,
    form: {},
    answers: {},
  },
};

KtoContainer.propTypes = {
  uuid: PropTypes.string.isRequired,
  yesNo: PropTypes.string.isRequired,
  ktoContainer: PropTypes.object,

  onUpdateKto: PropTypes.func.isRequired,
  onStoreKto: PropTypes.func.isRequired,
  requestKtoAnswers: PropTypes.func.isRequired,
  checkKto: PropTypes.func.isRequired,
};

const mapStateToProps = createStructuredSelector({
  ktoContainer: makeSelectKtoContainer(),
});

export const mapDispatchToProps = (dispatch) =>
  bindActionCreators(
    {
      onUpdateKto: updateKto,
      onStoreKto: storeKto,
      requestKtoAnswers,
      checkKto,
    },
    dispatch,
  );

const withConnect = connect(
  mapStateToProps,
  mapDispatchToProps,
);

const withReducer = injectReducer({ key: 'ktoContainer', reducer });
const withSaga = injectSaga({ key: 'ktoContainer', saga });

export default compose(
  withReducer,
  withSaga,
  withConnect,
)(KtoContainer);