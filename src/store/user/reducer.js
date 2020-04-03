import {
  GET_USER,
  GET_USER_PENDING,
  GET_USER_ERROR,
  CHANGE_USER_AVATAR
} from '@/store/constants.js';

const INITIAL_STATE = {
  user: {},
  status: 'done' // done/pending/error
};

const userReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case GET_USER:
      return {
        user: action.user,
        status: 'done'
      };
    case GET_USER_PENDING:
      return {
        ...state,
        status: 'pending'
      };
    case GET_USER_ERROR:
      return {
        ...state,
        status: 'error'
      };
    case CHANGE_USER_AVATAR:
      return {
        ...state,
        user: { ...state.user, avatar: action.value }
      };
    default:
      return state;
  }
};

export default userReducer;

