import { createSlice } from '@reduxjs/toolkit';

const urlPath = 'https://nrl.bexschools.com/api/';

const initialState = {
  Authorization:
    'eyJhbGciOiJIUzI1NiIsInR5cGUiOiJKV1QifQ.eyJzdWIiOiJCZXhAMTIzIiwibmFtZSI6IkJleCIsImFkbWluIjp0cnVlLCJleHAiOjE2Njk5ODQzNDl9.uxE3r3X4lqV_WKrRKRPXd-Jub9BnVcCXqCtLL4I0fpU',

  loginUrl: urlPath + 'MobileLController.php',
};

export const getUrlSlice = createSlice({
  name: 'globalurl',
  initialState,
  reducers: {},
});

export default getUrlSlice.reducer;
