import { fromJS } from 'immutable';
import { connect } from 'react-redux';
import InfiniteList from './InfiniteList';

export const lists = {};

const buildMapStateToProps = (collections, name, immutable) => {
  const buildProps = (state) => {
    const { statePath } = collections[name];
    let listState;
    let items;

    if (immutable) {
      return {
        listState: state.getIn(['infiniteList', name]),
        items: state.getIn(statePath)
      };
    }

    return {
      listState: state['infiniteList'][name],
      items: statePath.reduce((_, item) => state[item], [])
    };
  };

  return (state) => {
    const { items, listState } = buildProps(state);
    return {
      name,
      items,
      listState,
      immutable,
    };
  };
};

export const reducerBuilder = ({ collections, payloadGetter = (payload) => payload, immutable = false }) => {
  Object.keys(collections).forEach(name => {

    const mapStateToProps = buildMapStateToProps(collections, name, immutable);

    lists[name] = connect(mapStateToProps)(InfiniteList);
  });

  const actionHandlers = Object.keys(collections).reduce((acc, name) => {
    const { action } = collections[name];

    const regularHandler = (state, payload) => {
      let newState = {...state};

      if (!payloadGetter(payload).length) {
        newState[name].finish = true;
      }
      newState[name].page += 1;

      return newState;
    }

    const immutableHandler = (state, payload) => {
      let newState = state;

      if (!payloadGetter(payload).length) {
        newState = newState.setIn([name, 'finish'], true);
      }
      newState = newState.updateIn([name, 'page'], (page) => page + 1);

      return newState;
    };

    const handler = (state, payload) => immutable ? immutableHandler(state, payload) : regularHandler(state, payload);

    return { ...acc, [action]: handler };
  }, {});

  let defaultState = Object.keys(collections).reduce((acc, name) => (
    { ...acc, [name]: { page: 0, finish: false } }
  ), {});

  if (immutable) {
    defaultState = fromJS(defaultState);
  }

  return (state = defaultState, { type, payload }) => {
    if (type in actionHandlers) {
      return actionHandlers[type](state, payload);
    }

    return state;
  };
};
