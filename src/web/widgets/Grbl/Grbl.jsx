import _ from 'lodash';
import React, { Component, PropTypes } from 'react';
import shallowCompare from 'react-addons-shallow-compare';
import { ProgressBar } from 'react-bootstrap';
import mapGCodeToText from '../../lib/gcode-text';
import i18n from '../../lib/i18n';
import Panel from '../../components/Panel';
import Toggler from '../../components/Toggler';
import Toolbar from './Toolbar';
import Overrides from './Overrides';
import styles from './index.styl';

class Grbl extends Component {
    static propTypes = {
        state: PropTypes.object,
        actions: PropTypes.object
    };

    // https://github.com/grbl/grbl/wiki/Interfacing-with-Grbl
    // Grbl v0.9: BLOCK_BUFFER_SIZE (18), RX_BUFFER_SIZE (128)
    // Grbl v1.1: BLOCK_BUFFER_SIZE (16), RX_BUFFER_SIZE (128)
    plannerBufferMax = 0;
    plannerBufferMin = 0;
    receiveBufferMax = 128;
    receiveBufferMin = 0;

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    }
    render() {
        const { state, actions } = this.props;
        const none = '–';
        const panel = state.panel;
        const controllerState = state.controller.state || {};
        const parserState = _.get(controllerState, 'parserstate', {});
        const activeState = _.get(controllerState, 'status.activeState') || none;
        const feedrate = _.get(controllerState, 'status.feedrate', parserState.feedrate);
        const spindleSpeed = _.get(controllerState, 'status.spindle', parserState.spindle);
        const buf = _.get(controllerState, 'status.buf', {});
        const ov = _.get(controllerState, 'status.ov', {});
        const toolNumber = parserState.tool;
        const modal = _.mapValues(parserState.modal || {}, (word, group) => mapGCodeToText(word));

        this.plannerBufferMax = Math.max(this.plannerBufferMax, buf.planner) || this.plannerBufferMax;
        this.receiveBufferMax = Math.max(this.receiveBufferMax, buf.rx) || this.receiveBufferMax;

        return (
            <div>
                <Toolbar state={state} actions={actions} />
                {!_.isEmpty(ov) &&
                <Overrides state={state} actions={actions} />
                }
                {!_.isEmpty(buf) &&
                <Panel className={styles.panel}>
                    <Panel.Heading className={styles['panel-heading']}>
                        <Toggler
                            className="clearfix"
                            onToggle={actions.toggleQueueReports}
                            title={panel.queueReports.expanded ? i18n._('Hide') : i18n._('Show')}
                        >
                            <div className="pull-left">{i18n._('Queue Reports')}</div>
                            <Toggler.Icon
                                className="pull-right"
                                expanded={panel.queueReports.expanded}
                            />
                        </Toggler>
                    </Panel.Heading>
                    {panel.queueReports.expanded &&
                    <Panel.Body>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Planner Buffer')}
                            </div>
                            <div className="col col-xs-8">
                                <ProgressBar
                                    style={{ marginBottom: 0 }}
                                    bsStyle="info"
                                    min={this.plannerBufferMin}
                                    max={this.plannerBufferMax}
                                    now={buf.planner}
                                    label={
                                        <span className={styles.progressbarLabel}>
                                            {buf.planner}
                                        </span>
                                    }
                                />
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Receive Buffer')}
                            </div>
                            <div className="col col-xs-8">
                                <ProgressBar
                                    style={{ marginBottom: 0 }}
                                    bsStyle="info"
                                    min={this.receiveBufferMin}
                                    max={this.receiveBufferMax}
                                    now={buf.rx}
                                    label={
                                        <span className={styles.progressbarLabel}>
                                            {buf.rx}
                                        </span>
                                    }
                                />
                            </div>
                        </div>
                    </Panel.Body>
                    }
                </Panel>
                }
                <Panel className={styles.panel}>
                    <Panel.Heading className={styles['panel-heading']}>
                        <Toggler
                            className="clearfix"
                            onToggle={() => {
                                actions.toggleStatusReports();
                            }}
                            title={panel.statusReports.expanded ? i18n._('Hide') : i18n._('Show')}
                        >
                            <div className="pull-left">{i18n._('Status Reports')}</div>
                            <Toggler.Icon
                                className="pull-right"
                                expanded={panel.statusReports.expanded}
                            />
                        </Toggler>
                    </Panel.Heading>
                    {panel.statusReports.expanded &&
                    <Panel.Body>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('State')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well}>
                                    {activeState}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Feed Rate')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well}>
                                    {feedrate}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Spindle')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well}>
                                    {spindleSpeed}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Tool Number')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well}>
                                    {toolNumber}
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                    }
                </Panel>
                <Panel className={styles.panel}>
                    <Panel.Heading className={styles['panel-heading']}>
                        <Toggler
                            className="clearfix"
                            onToggle={() => {
                                actions.toggleModalGroups();
                            }}
                            title={panel.modalGroups.expanded ? i18n._('Hide') : i18n._('Show')}
                        >
                            <div className="pull-left">{i18n._('Modal Groups')}</div>
                            <Toggler.Icon
                                className="pull-right"
                                expanded={panel.modalGroups.expanded}
                            />
                        </Toggler>
                    </Panel.Heading>
                    {panel.modalGroups.expanded &&
                    <Panel.Body>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Motion')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well} title={modal.motion}>
                                    {modal.motion || none}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Coordinate')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well} title={modal.coordinate}>
                                    {modal.coordinate || none}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Plane')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well} title={modal.plane}>
                                    {modal.plane || none}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Distance')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well} title={modal.distance}>
                                    {modal.distance || none}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Feed Rate')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well} title={modal.feedrate}>
                                    {modal.feedrate || none}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Units')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well} title={modal.units}>
                                    {modal.units || none}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Program')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well} title={modal.program}>
                                    {modal.program || none}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Spindle')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well} title={modal.spindle}>
                                    {modal.spindle || none}
                                </div>
                            </div>
                        </div>
                        <div className="row no-gutters">
                            <div className="col col-xs-4">
                                {i18n._('Coolant')}
                            </div>
                            <div className="col col-xs-8">
                                <div className={styles.well} title={modal.coolant}>
                                    {modal.coolant || none}
                                </div>
                            </div>
                        </div>
                    </Panel.Body>
                    }
                </Panel>
            </div>
        );
    }
}

export default Grbl;
