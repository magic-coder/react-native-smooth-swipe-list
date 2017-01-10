import React, { PropTypes } from 'react';
import { StyleSheet, View, ListView, TouchableWithoutFeedback } from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';

import {
    OPEN_POSITION_THRESHOLD_FACTOR
} from '../constants';
import SwipeRow from './SwipeRow';
import {
    getWidth,
    getHeight
} from '../util/layout';


const SwipeList = React.createClass({

    propsTypes: {
        rowData: PropTypes.array,
        style: View.propTypes.style,
        rowStyle: View.propTypes.style,
        scrollEnabled: PropTypes.bool,
        onScrollStateChange: PropTypes.bool,
        gestureTensionParams: PropTypes.shape({
            length: PropTypes.number,
            stretch: PropTypes.number,
            resistanceStrength: PropTypes.number
        }),
        swipeRowProps: PropTypes.object
    },

    getDefaultProps() {
        return {
            scrollEnabled: true,
            onScrollStateChange: () => {}
        };
    },

    getInitialState() {
        let ds = new ListView.DataSource({ rowHasChanged: (prevData, nextData) => prevData !== nextData });
        ds = this.props.rowData ? ds.cloneWithRows(this.props.rowData) : ds;

        return {
            scrollEnabled: this.props.scrollEnabled,
            dataSource: ds
        };
    },

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState);
    },

    componentWillReceiveProps(nextProps) {
        if (this.props.rowData !== nextProps.rowData) {
            this.openRowRef = null;
            this.setState({
                dataSource: this.state.dataSource.cloneWithRows(nextProps.rowData)
            });
        }
    },

    handleSwipeStart(row, e, g) {
        this.tryCloseLastOpenRow(row);
        this.listView && this.listView.setNativeProps({ scrollEnabled: false });
        this.props.onScrollStateChange(false);
    },

    handleSwipeEnd(row, e, g) {
        this.listView && this.listView.setNativeProps({ scrollEnabled: true });
        this.props.onScrollStateChange(true);
    },

    handleRowOpen(row) {
        this.openRowRef = row;
    },

    tryCloseLastOpenRow(row) {
        if (this.openRowRef && this.openRowRef !== row) {
            this.openRowRef.close();
            this.openRowRef = null;
        }
    },

    shouldRowCaptureEvents(row) {
        return !!(this.openRowRef && this.openRowRef !== row);
    },

    handleScroll() {
        if (this.openRowRef && this.openRowRef.isOpen()) {
            this.openRowRef.close();
        }
    },

    setListViewRef(component) {
        if (component) {
            this.listView = component;
        }
    },

    render() {
        return (
            <ListView {...this.props} ref={this.setListViewRef}
                                      style={[styles.listView, this.props.style]}
                                      scrollEnabled={this.state.scrollEnabled && this.props.scrollEnabled}
                                      onScroll={this.handleScroll}
                                      enableEmptySections
                                      dataSource={this.state.dataSource}
                                      renderRow={this.renderSwipeListItem} />
        );
    },

    renderSwipeListItem(rowData, sectionId, rowId) {
        return (
            <SwipeRow key={rowData.key || `${sectionId}:${rowId}`}
                      leftSubView={rowData.leftSubView}
                      rightSubView={rowData.rightSubView}
                      leftSubViewOptions={rowData.leftSubViewOptions}
                      rightSubViewOptions={rowData.rightSubViewOptions}
                      gestureTensionParams={this.props.gestureTensionParams}
                      blockChildEventsWhenOpen={rowData.blockChildEventsWhenOpen}
                      shouldRowCaptureEvents={this.shouldRowCaptureEvents}
                      style={[this.props.rowStyle, rowData.style]}
                      onSwipeStart={this.handleSwipeStart}
                      onSwipeEnd={this.handleSwipeEnd}
                      onOpen={this.handleRowOpen}
                      {...this.props.swipeRowProps}
                      {...rowData.props}>
                {rowData.rowView}
            </SwipeRow>
        );
    }
});


const styles = StyleSheet.create({
    container: {
        alignSelf: 'stretch'
    },
    listView: {
        alignSelf: 'stretch',
        backgroundColor: 'rgb(111, 111, 111)'
    }
});


export default SwipeList