//initial state of data
export const initialState = {
    user: null,
};

//used to change data
//state - state of data
//action - action to take
const reducer = (state, action) => {
    switch (action.type) {
        case "SET_USER":
            return {
                ...state,           //what user is currently set as
                user: action.user,  //change user to new user
            };
        default:
            return state;
    }
};

export default reducer;
