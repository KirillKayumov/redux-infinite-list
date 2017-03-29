import React, { PropTypes } from 'react';
import Waypoint from 'react-waypoint';

class InfiniteList extends React.Component {
  handleEnter = (event) => {
    const { listState, immutable } = this.props;
    const page = immutable ? listState.get('page') : listState.page;

    this.props.onEndReach(page + 1, event);
  }

  renderList() {
    return this.props.items.map(item => this.props.itemComponent(item));
  }

  renderWaypoint() {
    const { immutable, listState, waypointProps } = this.props;
    const finish = immutable ? listState.get('finish') : listState.finish;

    if (!finish) {
      return (
        <Waypoint onEnter={this.handleEnter} {...waypointProps} />
      );
    }
  }

  renderPlaceholder() {
    const { immutable, placeholder, listState } = this.props;
    const finish = immutable ? listState.get('finish') : listState.finish;

    if (!finish) {
      return placeholder();
    }
  }

  render() {
    return (
      <div className={this.props.className}>
        {this.renderList()}
        {this.renderWaypoint()}
        {this.renderPlaceholder()}
      </div>
    );
  }
}

InfiniteList.propTypes = {
  className: PropTypes.string,
  immutable: PropTypes.bool,
  itemComponent: PropTypes.func.isRequired,
  items: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.object,
  ]).isRequired,
  listState: PropTypes.object.isRequired,
  onEndReach: PropTypes.func.isRequired,
  placeholder: PropTypes.func.isRequired,
  waypointProps: PropTypes.object,
};

InfiniteList.defaultProps = {
  className: '',
  waypointProps: {},
};

export default InfiniteList;
